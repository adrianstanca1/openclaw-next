// OpenClaw Next - Plugins Loader
// Superintelligence Agentic Gateway System
// Handles loading, validating, and initializing plugins

import type {
  PluginDefinition,
  PluginLoadOptions,
  InstalledPlugin,
  PluginError,
  PluginState,
  PluginSource,
  PluginConfigUpdate,
  PluginManifest,
} from './types.js';

/**
 * Plugin loading errors
 */
export const PluginLoaderErrors = {
  INVALID_MANIFEST: 'INVALID_MANIFEST',
  MISSING_MAIN: 'MISSING_MAIN',
  INVALID_CONFIG: 'INVALID_CONFIG',
  UNSATISFIED_DEPENDENCIES: 'UNSATISFIED_DEPENDENCIES',
  LOAD_FAILED: 'LOAD_FAILED',
  INVALID_PLUGIN: 'INVALID_PLUGIN',
} as const;

/**
 * Plugin loader configuration
 */
export interface LoaderConfig {
  /**
   * Directory to scan for local plugins
   */
  pluginDirectory?: string;

  /**
   * Maximum load time in milliseconds
   */
  maxLoadTimeMs?: number;

  /**
   * Whether to validate dependencies
   */
  validateDependencies?: boolean;

  /**
   * Whether to auto-enable plugins
   */
  autoEnable?: boolean;
}

/**
 * Load result for a single plugin
 */
export interface LoadResult {
  success: boolean;
  instanceId?: string;
  plugin?: InstalledPlugin;
  error?: PluginError;
  warnings?: string[];
}

/**
 * Plugin Loader - Handles plugin lifecycle from loading to initialization
 */
export class PluginLoader {
  private config: LoaderConfig;
  private loadQueue: Map<string, Promise<LoadResult>> = new Map();
  private loadedPlugins: Map<string, InstalledPlugin> = new Map();
  private errorHandlers: Array<(error: PluginError) => void> = [];

  constructor(config: LoaderConfig = {}) {
    this.config = {
      pluginDirectory: config.pluginDirectory,
      maxLoadTimeMs: config.maxLoadTimeMs ?? 30000,
      validateDependencies: config.validateDependencies ?? true,
      autoEnable: config.autoEnable ?? false,
    };
  }

  /**
   * Load a plugin from a manifest
   */
  async loadFromManifest(
    manifest: PluginManifest,
    source: PluginSource = 'local',
    installPath?: string,
    config?: Record<string, unknown>,
  ): Promise<LoadResult> {
    const loadId = manifest.id;

    if (this.loadQueue.has(loadId)) {
      return this.loadQueue.get(loadId)!;
    }

    const loadPromise = this.executeLoad(manifest, source, installPath, config);
    this.loadQueue.set(loadId, loadPromise);

    try {
      return await loadPromise;
    } finally {
      this.loadQueue.delete(loadId);
    }
  }

  /**
   * Load a plugin from a definition
   */
  async loadFromDefinition(
    definition: PluginDefinition,
    source: PluginSource = 'bundled',
    installPath?: string,
    config?: Record<string, unknown>,
  ): Promise<LoadResult> {
    const loadId = definition.id;

    if (this.loadQueue.has(loadId)) {
      return this.loadQueue.get(loadId)!;
    }

    const loadPromise = this.executeLoad(definition, source, installPath, config);
    this.loadQueue.set(loadId, loadPromise);

    try {
      return await loadPromise;
    } finally {
      this.loadQueue.delete(loadId);
    }
  }

  /**
   * Execute the actual plugin load
   */
  private async executeLoad(
    plugin: PluginManifest | PluginDefinition,
    source: PluginSource,
    installPath?: string,
    providedConfig?: Record<string, unknown>,
  ): Promise<LoadResult> {
    const startTime = Date.now();
    const pluginId = 'id' in plugin ? plugin.id : (plugin as PluginManifest).id;

    const result: LoadResult = {
      success: false,
      warnings: [],
    };

    try {
      // Validate manifest/definition
      const validationErrors = this.validatePlugin(plugin);
      if (validationErrors.length > 0) {
        result.error = {
          code: PluginLoaderErrors.INVALID_PLUGIN,
          message: `Plugin validation failed: ${validationErrors.join(', ')}`,
          details: { errors: validationErrors },
          timestamp: new Date().toISOString(),
        };
        return result;
      }

      // Resolve config
      const resolvedConfig = this.resolveConfig(
        'defaultConfig' in plugin ? plugin.defaultConfig : undefined,
        providedConfig,
      );

      // Create installed plugin
      const installedPlugin: InstalledPlugin = {
        ...(plugin as PluginDefinition),
        instanceId: `${pluginId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        source,
        installPath,
        installedAt: new Date().toISOString(),
        config: resolvedConfig,
        state: this.config.autoEnable ? 'enabled' : 'installed',
        dependenciesSatisfied: true,
      };

      // Validate dependencies if configured
      if (this.config.validateDependencies && 'requires' in plugin && plugin.requires) {
        const depResult = await this.validateDependencies(plugin.requires);
        if (!depResult.satisfied) {
          result.error = {
            code: PluginLoaderErrors.UNSATISFIED_DEPENDENCIES,
            message: `Unsatisfied dependencies: ${depResult.missing.join(', ')}`,
            details: { missing: depResult.missing },
            timestamp: new Date().toISOString(),
          };
          return result;
        }
        installedPlugin.installedDependencies = depResult.satisfied ? [] : depResult.missing;
      }

      // Set state
      if (this.config.autoEnable) {
        installedPlugin.state = 'enabled';
      }

      // Track load time
      const loadTime = Date.now() - startTime;
      if (loadTime > (this.config.maxLoadTimeMs ?? 30000)) {
        result.warnings?.push(`Plugin load took ${loadTime}ms, exceeded threshold`);
      }

      // Store and return
      this.loadedPlugins.set(installedPlugin.instanceId, installedPlugin);

      result.success = true;
      result.instanceId = installedPlugin.instanceId;
      result.plugin = installedPlugin;

      return result;
    } catch (error) {
      const err = error as Error;
      const pluginError: PluginError = {
        code: PluginLoaderErrors.LOAD_FAILED,
        message: err.message,
        details: err.stack,
        timestamp: new Date().toISOString(),
      };

      result.error = pluginError;
      this.errorHandlers.forEach((handler) => handler(pluginError));

      return result;
    }
  }

  /**
   * Load all plugins from a directory
   */
  async loadDirectory(directory: string): Promise<LoadResult[]> {
    const results: LoadResult[] = [];

    // In a real implementation, this would:
    // 1. Scan the directory for plugin manifests
    // 2. Parse each manifest
    // 3. Call loadFromManifest for each

    // For now, return empty (stub for documentation)
    return results;
  }

  /**
   * Unload a plugin
   */
  unload(instanceId: string): boolean {
    const plugin = this.loadedPlugins.get(instanceId);
    if (!plugin) return false;

    // Call unload handlers if any
    if (plugin.config.onUnload && typeof plugin.config.onUnload === 'function') {
      try {
        (plugin.config.onUnload as () => void)();
      } catch (error) {
        console.error(`Unload handler for ${instanceId} failed:`, error);
      }
    }

    this.loadedPlugins.delete(instanceId);
    return true;
  }

  /**
   * Unload all plugins
   */
  unloadAll(): void {
    this.loadedPlugins.forEach((_, instanceId) => {
      this.unload(instanceId);
    });
  }

  /**
   * Get a loaded plugin
   */
  getLoaded(instanceId: string): InstalledPlugin | undefined {
    return this.loadedPlugins.get(instanceId);
  }

  /**
   * Get all loaded plugins
   */
  getAllLoaded(): InstalledPlugin[] {
    return Array.from(this.loadedPlugins.values());
  }

  /**
   * Get plugins by source
   */
  getBySource(source: PluginSource): InstalledPlugin[] {
    return this.getAllLoaded().filter((p) => p.source === source);
  }

  /**
   * Get plugins by category
   */
  getByCategory(category: string): InstalledPlugin[] {
    return this.getAllLoaded().filter((p) => p.metadata?.category === category);
  }

  /**
   * Update plugin configuration
   */
  updateConfig(instanceId: string, config: PluginConfigUpdate): boolean {
    const plugin = this.loadedPlugins.get(instanceId);
    if (!plugin) return false;

    if (config.config) {
      plugin.config = { ...plugin.config, ...config.config };
      plugin.updatedAt = new Date().toISOString();
    }

    if (config.enabled !== undefined) {
      plugin.state = config.enabled ? 'enabled' : 'disabled';
    }

    return true;
  }

  /**
   * Validate a plugin manifest/definition
   */
  private validatePlugin(
    plugin: PluginManifest | PluginDefinition,
  ): string[] {
    const errors: string[] = [];

    // Validate required fields
    if (!('id' in plugin) || !plugin.id || typeof plugin.id !== 'string') {
      errors.push('Missing or invalid id');
    }

    if (!('name' in plugin) || !plugin.name || typeof plugin.name !== 'string') {
      errors.push('Missing or invalid name');
    }

    if (!('version' in plugin) || !plugin.version || typeof plugin.version !== 'string') {
      errors.push('Missing or invalid version');
    }

    if (!('description' in plugin) || !plugin.description) {
      errors.push('Missing description');
    }

    // Validate version format (simple semver check)
    if (
      plugin.version &&
      !/^(\d+\.)?(\d+\.)?(\*|\d+)$/.test(plugin.version)
    ) {
      errors.push('Invalid version format (expected semver)');
    }

    // Validate hooks if present
    if ('hooks' in plugin && plugin.hooks) {
      plugin.hooks.forEach((hook, index) => {
        if (!hook.name) {
          errors.push(`Hook ${index}: missing name`);
        }
        if (!hook.handler) {
          errors.push(`Hook ${index}: missing handler`);
        }
      });
    }

    return errors;
  }

  /**
   * Validate plugin dependencies
   */
  private async validateDependencies(
    dependencies: Array<{ type: string; id: string; optional?: boolean }>,
  ): Promise<{ satisfied: boolean; missing: string[] }> {
    const missing: string[] = [];

    for (const dep of dependencies) {
      if (dep.type === 'plugin') {
        // In a real implementation, would check if plugin is loaded
        // For now, assume satisfied
        if (!this.loadedPlugins.has(dep.id)) {
          missing.push(dep.id);
        }
      }
      // Add other dependency type checks here
    }

    return {
      satisfied: missing.length === 0,
      missing,
    };
  }

  /**
   * Resolve plugin configuration (default + provided)
   */
  private resolveConfig(
    defaults: Record<string, unknown> | undefined,
    provided: Record<string, unknown> | undefined,
  ): Record<string, unknown> {
    return { ...defaults, ...provided };
  }

  /**
   * Add an error handler
   */
  onError(handler: (error: PluginError) => void): () => void {
    this.errorHandlers.push(handler);
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Reset the loader state
   */
  reset(): void {
    this.unloadAll();
    this.loadQueue.clear();
  }
}

/**
 * Default loader instance
 */
export const pluginLoader = new PluginLoader();

/**
 * Convenience functions
 */
export const loadPlugin = (
  manifest: PluginManifest,
  source?: PluginSource,
  path?: string,
  config?: Record<string, unknown>,
): Promise<LoadResult> => pluginLoader.loadFromManifest(manifest, source, path, config);

export const loadPluginFromDefinition = (
  definition: PluginDefinition,
  source?: PluginSource,
  path?: string,
  config?: Record<string, unknown>,
): Promise<LoadResult> => pluginLoader.loadFromDefinition(definition, source, path, config);

export const getLoadedPlugin = (instanceId: string): InstalledPlugin | undefined =>
  pluginLoader.getLoaded(instanceId);

export const unloadPlugin = (instanceId: string): boolean => pluginLoader.unload(instanceId);
