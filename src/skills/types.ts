// OpenClaw Next - Skills Module Types
// Superintelligence Agentic Gateway System
// Defines core types for skills: definitions, requirements, metadata, and execution

import type { AgentConfig } from '../core/types.js';

/**
 * Skill State
 * Represents the current state of a skill in the lifecycle
 */
export type SkillState = 'installed' | 'enabled' | 'disabled' | 'error' | 'loading' | 'uninstalling';

/**
 * Skill Source Type
 * Defines where a skill originates from
 */
export type SkillSource = 'local' | 'remote' | 'bundled' | 'marketplace' | 'builtin';

/**
 * Skill Category
 * Categorization for skill organization
 */
export type SkillCategory =
  | 'development'
  | 'data'
  | 'communication'
  | 'automation'
  | 'analysis'
  | 'creation'
  | 'management'
  | 'integration'
  | 'security'
  | 'testing'
  | 'system';

/**
 * Skill Definition
 * The core blueprint of a skill including its configuration and execution interface
 */
export interface SkillDefinition {
  /**
   * Unique identifier for the skill
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Brief description of what the skill does
   */
  description: string;

  /**
   * Long-form documentation
   */
  longDescription?: string;

  /**
   * Version following semantic versioning (e.g., "1.2.3")
   */
  version: string;

  /**
   * Category for organization and discovery
   */
  category: SkillCategory;

  /**
   * Author or maintainer
   */
  author?: string;

  /**
   * URL to the skill's repository or homepage
   */
  repository?: string;

  /**
   * Documentation URL
   */
  documentation?: string;

  /**
   * License type
   */
  license?: string;

  /**
   * Minimum OpenClaw version required
   */
  minGatewayVersion?: string;

  /**
   * Configuration schema for the skill
   */
  configSchema?: SkillConfigSchema;

  /**
   * Default configuration values
   */
  defaultConfig?: Record<string, unknown>;

  /**
   * Inputs this skill accepts for execution
   */
  inputs?: SkillParameter[];

  /**
   * Outputs this skill produces
   */
  outputs?: SkillParameter[];

  /**
   * Execution handler - how the skill runs
   */
  handler: SkillHandler;

  /**
   * Metadata about the skill
   */
  metadata?: SkillMetadata;

  /**
   * Installation requirements
   */
  requirements?: SkillRequirement[];
}

/**
 * Skill Configuration Schema
 * Defines the structure and validation rules for skill configuration
 */
export interface SkillConfigSchema {
  type: 'object';
  properties: Record<string, SkillConfigProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * Skill Configuration Property
 * Defines a single configuration parameter
 */
export interface SkillConfigProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'enum';
  description?: string;
  default?: unknown;
  enum?: string[];
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  format?: 'email' | 'url' | 'regex' | 'path' | 'date' | 'time';
  pattern?: string;
  items?: SkillConfigProperty;
}

/**
 * Skill Parameter
 * Defines input/output parameters for skill execution
 */
export interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'json';
  description?: string;
  required?: boolean;
  default?: unknown;
  enum?: string[];
}

/**
 * Skill Handler
 * Defines how a skill is executed
 */
export interface SkillHandler {
  /**
   * Execution type
   */
  type: 'function' | 'command' | 'http' | 'docker' | 'script';

  /**
   * For 'function' type: module path and function name
   */
  module?: string;
  function?: string;

  /**
   * For 'command' type: shell command to execute
   */
  command?: string;
  args?: string[];

  /**
   * For 'http' type: HTTP endpoint
   */
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;

  /**
   * For 'docker' type: container configuration
   */
  image?: string;
  dockerOptions?: Record<string, unknown>;

  /**
   * For 'script' type: inline script
   */
  script?: string;
  language?: 'python' | 'javascript' | 'typescript' | 'bash' | 'powershell';
}

/**
 * Skill Requirement
 * Defines dependencies or requirements for a skill
 */
export interface SkillRequirement {
  /**
   * Type of requirement
   */
  type: 'skill' | 'package' | 'apiKey' | 'environment' | 'permission' | 'model';

  /**
   * Identifier (skill ID, package name, key name, etc.)
   */
  id: string;

  /**
   * Version constraint (e.g., "^1.0.0", ">=2.0.0")
   */
  version?: string;

  /**
   * Whether this is optional
   */
  optional?: boolean;

  /**
   * Human-readable description
   */
  description?: string;

  /**
   * Custom validation logic (for complex requirements)
   */
  validate?: () => Promise<SkillRequirementStatus>;
}

/**
 * Skill Requirement Status
 * Result of requirement validation
 */
export interface SkillRequirementStatus {
  satisfied: boolean;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Skill Metadata
 * Additional information about a skill
 */
export interface SkillMetadata {
  /**
   * Icon/emoji for UI representation
   */
  icon?: string;

  /**
   * Tags for search and filtering
   */
  tags?: string[];

  /**
   * Estimated execution time
   */
  estimatedDuration?: string;

  /**
   * Resource requirements
   */
  resources?: {
    cpu?: number; // millicores
    memory?: number; // MB
    disk?: number; // MB
  };

  /**
   * Cost information
   */
  cost?: {
    perInvocation?: number;
    currency?: string;
    tier?: 'free' | 'basic' | 'pro' | 'enterprise';
  };

  /**
   * Status
   */
  status?: 'stable' | 'beta' | 'experimental' | 'deprecated';

  /**
   * Source of the skill (local, marketplace, remote, etc.)
   */
  source?: SkillSource;

  /**
   * Whether this is a builtin skill
   */
  builtin?: boolean;

  /**
   * Dependencies graph
   */
  dependencies?: string[];
}

/**
 * Installed Skill
 * A skill instance with configuration and runtime state
 */
export interface InstalledSkill extends SkillDefinition {
  /**
   * Unique instance ID
   */
  instanceId: string;

  /**
   * Source of the skill
   */
  source: SkillSource;

  /**
   * Installation path (for local/bundled)
   */
  installPath?: string;

  /**
   * Installation timestamp
   */
  installedAt: string;

  /**
   * Last update timestamp
   */
  updatedAt?: string;

  /**
   * Current configuration
   */
  config: Record<string, unknown>;

  /**
   * Current state
   */
  state: SkillState;

  /**
   * Whether requirements are satisfied
   */
  requirementsSatisfied: boolean;

  /**
   * Dependencies that are installed
   */
  installedDependencies?: string[];

  /**
   * Last execution result
   */
  lastExecution?: SkillExecutionResult;

  /**
   * Total executions count
   */
  executionCount?: number;

  /**
   * Total cost incurred
   */
  totalCost?: number;

  /**
   * Agent associations (which agents have this skill enabled)
   */
  enabledForAgents?: string[];
}

/**
 * Skill Execution Result
 * Result of running a skill
 */
export interface SkillExecutionResult {
  /**
   * Unique execution ID
   */
  executionId: string;

  /**
   * Skill instance ID
   */
  skillInstanceId: string;

  /**
   * Execution timestamp
   */
  timestamp: string;

  /**
   * Duration in milliseconds
   */
  durationMs: number;

  /**
   * Success status
   */
  success: boolean;

  /**
   * Output data
   */
  output?: Record<string, unknown>;

  /**
   * Error information if failed
   */
  error?: SkillExecutionError;

  /**
   * Cost incurred
   */
  cost?: number;

  /**
   * Metadata about execution
   */
  metadata?: SkillExecutionMetadata;
}

/**
 * Skill Execution Error
 */
export interface SkillExecutionError {
  /**
   * Error code
   */
  code: string;

  /**
   * Human-readable message
   */
  message: string;

  /**
   * Stack trace or detailed info
   */
  details?: unknown;

  /**
   * Whether this is a user error
   */
  isUserError?: boolean;
}

/**
 * Skill Execution Metadata
 */
export interface SkillExecutionMetadata {
  /**
   * Agent that triggered execution
   */
  agentId?: string;

  /**
   * Session ID
   */
  sessionId?: string;

  /**
   * Trigger type
   */
  trigger?: 'manual' | 'automatic' | 'scheduled' | 'event';

  /**
   * Context information
   */
  context?: Record<string, unknown>;
}

/**
 * Marketplace Skill Listing
 * Skill available from a marketplace
 */
export interface MarketplaceSkill extends SkillDefinition {
  /**
   * Marketplace identifier
   */
  marketplaceId: string;

  /**
   * Number of downloads
   */
  downloads: number;

  /**
   * Average rating (1-5)
   */
  rating?: number;

  /**
   * Number of reviews
   */
  reviewCount?: number;

  /**
   * Screenshots or media
   */
  media?: MarketplaceMedia[];

  /**
   * Change log
   */
  changelog?: string;

  /**
   * Supported gateway versions
   */
  supportedGatewayVersions?: string[];

  /**
   * Required dependencies or gateway features
   */
  requires?: string[];

  /**
   * Installation instructions
   */
  installation?: string;
}

/**
 * Marketplace Media
 */
export interface MarketplaceMedia {
  type: 'image' | 'video' | 'gif';
  url: string;
  caption?: string;
}

/**
 * Marketplace Search Results
 */
export interface MarketplaceSearchResults {
  /**
   * Search query
   */
  query: string;

  /**
   * Total results count
   */
  total: number;

  /**
   * Current page
   */
  page: number;

  /**
   * Results per page
   */
  perPage: number;

  /**
   * Skills found
   */
  skills: MarketplaceSkill[];

  /**
   * Facets for filtering
   */
  facets?: MarketplaceFacets;
}

/**
 * Marketplace Facets
 */
export interface MarketplaceFacets {
  categories: FacetValue[];
  authors: FacetValue[];
  tags: FacetValue[];
  ratings: FacetValue[];
}

export interface FacetValue {
  value: string;
  count: number;
}

/**
 * Skill Event Types
 */
export type SkillEventType =
  | 'skill_installed'
  | 'skill_enabled'
  | 'skill_disabled'
  | 'skill_uninstalled'
  | 'skill_updated'
  | 'skill_error'
  | 'execution_started'
  | 'execution_completed'
  | 'execution_failed'
  | 'requirements_changed'
  | 'dependency_installed';

/**
 * Skill Event
 */
export interface SkillEvent {
  type: SkillEventType;
  timestamp: string;
  skillInstanceId?: string;
  skillId?: string;
  data?: unknown;
  error?: string;
}

/**
 * Marketplace API Response
 */
export interface MarketplaceApiResponse<T> {
  success: boolean;
  data?: T;
  error?: MarketplaceError;
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}

export interface MarketplaceError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Installation Options
 */
export interface InstallOptions {
  /**
   * Version to install
   */
  version?: string;

  /**
   * Whether to skip requirements check
   */
  skipRequirements?: boolean;

  /**
   * Configuration to apply
   */
  config?: Record<string, unknown>;

  /**
   * Target agent ID (for agent-specific installation)
   */
  agentId?: string;

  /**
   * Install source
   */
  source?: SkillSource;

  /**
   * Installation path (for local installation)
   */
  installPath?: string;
}

/**
 * Update Check Result
 */
export interface UpdateCheckResult {
  skillId: string;
  installedVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  releaseNotes?: string;
}

/**
 * Skill Dependency Graph
 */
export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface DependencyNode {
  skillId: string;
  instanceId: string;
  version: string;
  status: 'satisfied' | 'missing' | 'unsatisfied';
}

export interface DependencyEdge {
  from: string; // skill instance ID
  to: string; // required skill instance ID
  requirement: SkillRequirement;
}

/**
 * Lifecycle Status
 */
export interface SkillLifecycleStatus {
  available: boolean;
  enabled: boolean;
  ready: boolean;
  message?: string;
  details?: {
    dependencies: string[];
    missingPermissions?: string[];
    configurationIssues?: string[];
  };
}

/**
 * Skill Stats
 */
export interface SkillStats {
  totalExecutions: number;
  successRate: number;
  averageDurationMs: number;
  totalCost: number;
  lastExecuted?: string;
  firstExecuted?: string;
}

/**
 * Skill Template (for creating new skills)
 */
export interface SkillTemplate {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  files: Record<string, string>;
  defaults?: {
    config?: Record<string, unknown>;
    inputs?: SkillParameter[];
    handler?: SkillHandler;
  };
}
