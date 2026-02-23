// OpenClaw Next - Skills Manager
// Superintelligence Agentic Gateway System
//
// Manages the complete lifecycle of skills:
// - Installation from various sources
// - Enabling/disabling per agent
// - Version management
// - Dependency tracking
// - State persistence

import type {
  InstalledSkill,
  SkillDefinition,
  SkillRequirement,
  SkillSource,
  InstallOptions,
  UpdateCheckResult,
  SkillLifecycleStatus,
  SkillEvent,
  MarketplaceSkill,
  SkillRequirementStatus,
} from './types.js';

import { SKILL_ERRORS, BUILTIN_SKILLS } from './index.js';
import { nanoid } from 'nanoid';

/**
 * Manager for skill lifecycle operations
 */
export class SkillsManager {
  /**
   * Map of installed skills by instance ID
   */
  private installedSkills: Map<string, InstalledSkill> = new Map();

  /**
   * Map of skill definitions by ID (from loaded/registered skills)
   */
  private skillDefinitions: Map<string, SkillDefinition> = new Map();

  /**
   * Event listeners for skill events
   */
  private eventListeners: Map<string, Array<(event: SkillEvent) => void>> = new Map();

  /**
   * Agent skill configurations
   */
  private agentSkills: Map<string, Set<string>> = new Map();

  /**
   * Loaded skill sources
   */
  private sources: Map<string, SkillSource> = new Map();

  /**
   * Error handlers
   */
  private errorHandlers: Map<string, (error: Error) => void> = new Map();

  /**
   * Install resolver for dependency management
   */
  private readonly installResolver: SkillInstallResolver;

  constructor() {
    this.installResolver = new SkillInstallResolver(this);
  }

  /**
   * Get installed skill by ID
   * @param id Skill ID
   * @returns Installed skill or undefined
   */
  getInstalledSkill(id: string): InstalledSkill | undefined {
    return this.installedSkills.get(id);
  }

  /**
   * Get all installed skills
   * @returns Map of installed skills
   */
  getAllInstalledSkills(): Map<string, InstalledSkill> {
    return this.installedSkills;
  }

  /**
   * Get skill definition by ID
   * @param id Skill ID
   * @returns Skill definition or undefined
   */
  getSkillDefinition(id: string): SkillDefinition | undefined {
    return this.skillDefinitions.get(id);
  }

  /**
   * Register a skill definition
   * @param definition The skill definition to register
   */
  async registerSkill(definition: SkillDefinition): Promise<void> {
    this.skillDefinitions.set(definition.id, definition);
    this.emitEvent({
      type: 'skill_installed',
      timestamp: new Date().toISOString(),
      skillId: definition.id,
      data: definition,
    });
  }

  /**
   * Register multiple skill definitions
   * @param definitions Array of skill definitions
   */
  async registerSkills(definitions: SkillDefinition[]): Promise<void> {
    for (const definition of definitions) {
      await this.registerSkill(definition);
    }
  }

  /**
   * Install a skill by ID
   * @param skillId The skill identifier
   * @param options Installation options
   */
  async installSkill(skillId: string, options: InstallOptions = {}): Promise<InstalledSkill> {
    const definition = this.skillDefinitions.get(skillId);
    if (!definition) {
      throw new Error(`${SKILL_ERRORS.NOT_FOUND}: Skill "${skillId}" not found`);
    }

    // Merge default options
    const finalOptions: InstallOptions = {
      ...this.getDefaultInstallOptions(options),
      ...options,
    };

    // Check and resolve dependencies
    const dependencies = await this.installResolver.resolveDependencies(definition, finalOptions);

    // Check requirements
    const requirementsStatus = await this.checkRequirements(
      definition.requirements || [],
      finalOptions
    );

    if (!requirementsStatus.satisfied) {
      throw new Error(
        `${SKILL_ERRORS.UNSATISFIED_REQUIREMENT}: ${requirementsStatus.message}`
      );
    }

    // Create installed skill instance
    const instanceId = `${definition.id}_${nanoid(8)}`;
    const installedSkill: InstalledSkill = {
      ...definition,
      instanceId,
      source: finalOptions.source || 'marketplace',
      installPath: finalOptions.installPath,
      installedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      config: {
        ...(definition.defaultConfig || {}),
        ...(finalOptions.config || {}),
      },
      state: 'installed',
      requirementsSatisfied: true,
      installedDependencies: dependencies.map((d) => d.instanceId),
      enabledForAgents: finalOptions.agentId ? [finalOptions.agentId] : [],
    };

    // Store and emit event
    this.installedSkills.set(instanceId, installedSkill);
    this.sources.set(instanceId, installedSkill.source);

    this.emitEvent({
      type: 'skill_installed',
      timestamp: new Date().toISOString(),
      skillInstanceId: instanceId,
      skillId: definition.id,
      data: installedSkill,
    });

    return installedSkill;
  }

  /**
   * Install from a marketplace skill listing
   */
  async installFromMarketplace(
    marketplaceSkill: MarketplaceSkill,
    options: InstallOptions = {}
  ): Promise<InstalledSkill> {
    const definition: SkillDefinition = {
      id: marketplaceSkill.id,
      name: marketplaceSkill.name,
      description: marketplaceSkill.description,
      longDescription: marketplaceSkill.longDescription,
      version: marketplaceSkill.version,
      category: marketplaceSkill.category,
      author: marketplaceSkill.author,
      repository: marketplaceSkill.repository,
      documentation: marketplaceSkill.documentation,
      license: marketplaceSkill.license,
      minGatewayVersion: marketplaceSkill.minGatewayVersion,
      configSchema: marketplaceSkill.configSchema,
      defaultConfig: marketplaceSkill.defaultConfig,
      inputs: marketplaceSkill.inputs,
      outputs: marketplaceSkill.outputs,
      handler: marketplaceSkill.handler,
      metadata: marketplaceSkill.metadata,
      requirements: marketplaceSkill.requirements,
    };

    return this.installSkill(definition.id, {
      ...options,
      version: marketplaceSkill.version,
      source: 'marketplace',
    });
  }

  /**
   * Uninstall a skill by instance ID
   */
  async uninstallSkill(instanceId: string): Promise<void> {
    const skill = this.installedSkills.get(instanceId);
    if (!skill) {
      throw new Error(`${SKILL_ERRORS.NOT_FOUND}: Skill instance "${instanceId}" not found`);
    }

    // Check if still used by any agent
    if (skill.enabledForAgents && skill.enabledForAgents.length > 0) {
      throw new Error(
        `${SKILL_ERRORS.PERMISSION_DENIED}: Skill is still enabled for ${skill.enabledForAgents.length} agent(s)`
      );
    }

    // Update state
    skill.state = 'uninstalling';
    this.installedSkills.delete(instanceId);
    this.sources.delete(instanceId);

    this.emitEvent({
      type: 'skill_uninstalled',
      timestamp: new Date().toISOString(),
      skillInstanceId: instanceId,
      skillId: skill.id,
    });
  }

  /**
   * Enable a skill for an agent
   */
  async enableSkill(instanceId: string, agentId: string): Promise<void> {
    const skill = this.installedSkills.get(instanceId);
    if (!skill) {
      throw new Error(`${SKILL_ERRORS.NOT_FOUND}: Skill instance "${instanceId}" not found`);
    }

    if (skill.state !== 'installed') {
      throw new Error(
        `${SKILL_ERRORS.INVALID_DEFINITION}: Skill must be installed before enabling`
      );
    }

    // Check requirements again on enable
    const requirementsStatus = await this.checkRequirements(skill.requirements || []);
    if (!requirementsStatus.satisfied) {
      skill.state = 'error';
      throw new Error(
        `${SKILL_ERRORS.UNSATISFIED_REQUIREMENT}: ${requirementsStatus.message}`
      );
    }

    // Update skill
    skill.state = 'enabled';
    if (!skill.enabledForAgents) {
      skill.enabledForAgents = [];
    }
    if (!skill.enabledForAgents.includes(agentId)) {
      skill.enabledForAgents.push(agentId);
    }

    // Update agent skills
    if (!this.agentSkills.has(agentId)) {
      this.agentSkills.set(agentId, new Set());
    }
    this.agentSkills.get(agentId)?.add(instanceId);

    this.emitEvent({
      type: 'skill_enabled',
      timestamp: new Date().toISOString(),
      skillInstanceId: instanceId,
      skillId: skill.id,
      data: { agentId },
    });
  }

  /**
   * Disable a skill for an agent
   */
  async disableSkill(instanceId: string, agentId: string): Promise<void> {
    const skill = this.installedSkills.get(instanceId);
    if (!skill) {
      throw new Error(`${SKILL_ERRORS.NOT_FOUND}: Skill instance "${instanceId}" not found`);
    }

    skill.state = 'installed';
    skill.enabledForAgents = skill.enabledForAgents?.filter((id) => id !== agentId);

    // Update agent skills
    const agentSet = this.agentSkills.get(agentId);
    if (agentSet) {
      agentSet.delete(instanceId);
      if (agentSet.size === 0) {
        this.agentSkills.delete(agentId);
      }
    }

    this.emitEvent({
      type: 'skill_disabled',
      timestamp: new Date().toISOString(),
      skillInstanceId: instanceId,
      skillId: skill.id,
      data: { agentId },
    });
  }

  /**
   * Get a skill by instance ID
   */
  getSkill(instanceId: string): InstalledSkill | undefined {
    return this.installedSkills.get(instanceId);
  }

  /**
   * Get all installed skills
   */
  getInstalledSkills(): InstalledSkill[] {
    return Array.from(this.installedSkills.values());
  }

  /**
   * Get skills enabled for an agent
   */
  getAgentSkills(agentId: string): InstalledSkill[] {
    const skillIds = this.agentSkills.get(agentId);
    if (!skillIds) {
      return [];
    }
    return Array.from(skillIds)
      .map((id) => this.installedSkills.get(id))
      .filter((s): s is InstalledSkill => s !== undefined);
  }

  /**
   * List all registered skill definitions
   */
  listSkillDefinitions(): SkillDefinition[] {
    return Array.from(this.skillDefinitions.values());
  }

  /**
   * Find skills by category
   */
  findSkillsByCategory(category: string): SkillDefinition[] {
    return this.listSkillDefinitions().filter(
      (s) => s.category === category || s.category?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Find skills by tag
   */
  findSkillsByTag(tag: string): SkillDefinition[] {
    return this.listSkillDefinitions().filter((s) => {
      const tags = s.metadata?.tags || [];
      return tags.some((t) => t.toLowerCase() === tag.toLowerCase());
    });
  }

  /**
   * Update skill configuration
   */
  async updateSkillConfig(
    instanceId: string,
    config: Record<string, unknown>
  ): Promise<InstalledSkill> {
    const skill = this.installedSkills.get(instanceId);
    if (!skill) {
      throw new Error(`${SKILL_ERRORS.NOT_FOUND}: Skill instance "${instanceId}" not found`);
    }

    skill.config = {
      ...skill.config,
      ...config,
    };
    skill.updatedAt = new Date().toISOString();

    this.emitEvent({
      type: 'skill_updated',
      timestamp: new Date().toISOString(),
      skillInstanceId: instanceId,
      skillId: skill.id,
      data: { config },
    });

    return skill;
  }

  /**
   * Check lifecycle status of a skill
   */
  async getLifecycleStatus(instanceId: string): Promise<SkillLifecycleStatus> {
    const skill = this.installedSkills.get(instanceId);
    if (!skill) {
      return {
        available: false,
        enabled: false,
        ready: false,
        message: 'Skill not found',
      };
    }

    if (skill.state === 'error') {
      return {
        available: true,
        enabled: false,
        ready: false,
        message: 'Skill in error state',
        details: {
          dependencies: skill.installedDependencies || [],
        },
      };
    }

    // Check dependencies
    const deps = skill.installedDependencies || [];
    const missingDeps = deps.filter((depId) => !this.installedSkills.has(depId));

    return {
      available: true,
      enabled: skill.state === 'enabled',
      ready: skill.state === 'enabled' && missingDeps.length === 0,
      message: missingDeps.length > 0 ? 'Missing dependencies' : undefined,
      details: {
        dependencies: deps,
        missingPermissions: [],
        configurationIssues: [],
      },
    };
  }

  /**
   * Check if a skill is enabled for an agent
   */
  isSkillEnabled(instanceId: string, agentId: string): boolean {
    const skill = this.installedSkills.get(instanceId);
    if (!skill) {
      return false;
    }
    return skill.enabledForAgents?.includes(agentId) ?? false;
  }

  /**
   * Check if a skill has unsatisfied requirements
   */
  async hasUnsatisfiedRequirements(skill: InstalledSkill): Promise<boolean> {
    const result = await this.checkRequirements(skill.requirements || []);
    return !result.satisfied;
  }

  /**
   * Check if a skill has an update available
   */
  async checkForUpdates(skillId: string, installedVersion: string): Promise<UpdateCheckResult> {
    const definition = this.skillDefinitions.get(skillId);
    if (!definition) {
      throw new Error(`${SKILL_ERRORS.NOT_FOUND}: Skill "${skillId}" not found`);
    }

    const hasUpdate = definition.version !== installedVersion;

    return {
      skillId,
      installedVersion,
      latestVersion: definition.version,
      hasUpdate,
      releaseNotes: hasUpdate ? `Updated to version ${definition.version}` : undefined,
    };
  }

  /**
   * Subscribe to skill events
   */
  on(eventType: string, handler: (event: SkillEvent) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)?.push(handler);

    return () => {
      const handlers = this.eventListeners.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Subscribe to all events
   */
  onAll(handler: (event: SkillEvent) => void): () => void {
    return this.on('all', handler);
  }

  /**
   * Emit a skill event
   */
  private emitEvent(event: SkillEvent): void {
    // Emit to specific type listeners
    const typeListeners = this.eventListeners.get(event.type);
    if (typeListeners) {
      for (const listener of typeListeners) {
        listener(event);
      }
    }

    // Emit to all listeners
    const allListeners = this.eventListeners.get('all');
    if (allListeners) {
      for (const listener of allListeners) {
        listener(event);
      }
    }
  }

  /**
   * Check requirements for a skill
   */
  private async checkRequirements(
    requirements: SkillRequirement[],
    options?: InstallOptions
  ): Promise<{ satisfied: boolean; message?: string }> {
    const results = await Promise.all(
      requirements.map(async (req) => {
        if (req.validate) {
          return req.validate();
        }

        // Default validation based on type
        switch (req.type) {
          case 'skill':
            return this.validateSkillRequirement(req, options);
          case 'package':
            return this.validatePackageRequirement(req);
          case 'apiKey':
            return this.validateApiKeyRequirement(req);
          case 'environment':
            return this.validateEnvironmentRequirement(req);
          case 'permission':
            return this.validatePermissionRequirement(req);
          case 'model':
            return this.validateModelRequirement(req);
          default:
            return { satisfied: true };
        }
      })
    );

    const allSatisfied = results.every((r) => r.satisfied);
    const firstError = results.find((r) => !r.satisfied);

    return {
      satisfied: allSatisfied,
      message: firstError?.message,
    };
  }

  /**
   * Validate skill requirement
   */
  private async validateSkillRequirement(
    requirement: SkillRequirement,
    options?: InstallOptions
  ): Promise<SkillRequirementStatus> {
    // For now, just check if it's installed
    // In production, would check version constraints
    return { satisfied: true };
  }

  /**
   * Validate package requirement
   */
  private async validatePackageRequirement(
    requirement: SkillRequirement
  ): Promise<SkillRequirementStatus> {
    // For now, always satisfied
    // In production, would check if npm package is installed
    return { satisfied: true };
  }

  /**
   * Validate API key requirement
   */
  private async validateApiKeyRequirement(
    requirement: SkillRequirement
  ): Promise<SkillRequirementStatus> {
    // For now, always satisfied
    // In production, would check if API key is configured
    return { satisfied: true };
  }

  /**
   * Validate environment requirement
   */
  private async validateEnvironmentRequirement(
    requirement: SkillRequirement
  ): Promise<SkillRequirementStatus> {
    // For now, always satisfied
    // In production, would check if environment variable is set
    return { satisfied: true };
  }

  /**
   * Validate permission requirement
   */
  private async validatePermissionRequirement(
    requirement: SkillRequirement
  ): Promise<SkillRequirementStatus> {
    // For now, always satisfied
    return { satisfied: true };
  }

  /**
   * Validate model requirement
   */
  private async validateModelRequirement(
    requirement: SkillRequirement
  ): Promise<SkillRequirementStatus> {
    // For now, always satisfied
    return { satisfied: true };
  }

  /**
   * Get default install options
   */
  private getDefaultInstallOptions(options?: InstallOptions): InstallOptions {
    return {
      version: undefined,
      skipRequirements: false,
      config: {},
      agentId: undefined,
      source: 'marketplace',
      installPath: undefined,
    };
  }
}

/**
 * Resolver for skill dependencies
 */
class SkillInstallResolver {
  private manager: SkillsManager;
  private visited: Set<string> = new Set();
  private installPath: Map<string, string> = new Map();

  constructor(manager: SkillsManager) {
    this.manager = manager;
  }

  /**
   * Resolve all dependencies for a skill
   */
  async resolveDependencies(
    definition: SkillDefinition,
    options: InstallOptions,
    path: string[] = []
  ): Promise<{ instanceId: string; definition: SkillDefinition }[]> {
    const dependencies: { instanceId: string; definition: SkillDefinition }[] = [];

    const requirements = definition.requirements || [];

    for (const req of requirements) {
      if (req.type === 'skill' && req.version) {
        const depId = req.id;

        // Check for circular dependency
        if (path.includes(depId)) {
          throw new Error(`${SKILL_ERRORS.CIRCULAR_DEPENDENCY}: ${depId}`);
        }

        // Check if already installed
        const existingSkill = Array.from(this.manager.getAllInstalledSkills().values()).find(
          (s) => s.id === depId
        );
        if (existingSkill) {
          dependencies.push({
            instanceId: existingSkill.instanceId,
            definition: existingSkill,
          });
          continue;
        }

        // Check if definition exists
        const depDefinition = this.manager.getSkillDefinition(depId);
        if (!depDefinition) {
          if (!req.optional) {
            throw new Error(`${SKILL_ERRORS.MISSING_REQUIREMENT}: ${depId}`);
          }
          continue;
        }

        // Recursively resolve dependencies
        const subDeps = await this.resolveDependencies(
          depDefinition,
          options,
          path.concat(depId)
        );
        dependencies.push(...subDeps);

        // Install the dependency
        const depInstance = await this.manager.installSkill(depId, {
          ...options,
          agentId: options.agentId,
          source: 'marketplace',
        });
        dependencies.push({
          instanceId: depInstance.instanceId,
          definition: depInstance,
        });
      }
    }

    return dependencies;
  }
}

/**
 * Global skills manager instance
 */
export const skillsManager = new SkillsManager();
