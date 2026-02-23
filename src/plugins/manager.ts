// OpenClaw Next - Plugins Manager
// Superintelligence Agentic Gateway System
// Manages plugin lifecycle: loading, enabling, disabling, hot-reload

import type {
  PluginDefinition,
  PluginState,
  PluginSource,
  PluginLoadOptions,
  PluginConfigUpdate,
  PluginError,
  PluginGatewayEvent,
  HookRegistry,
  InstalledPlugin,
  HookExecutionContext,
} from './types.js';

import { PluginRegistry, pluginRegistry } from './registry.js';
import { PluginLoader, pluginLoader, type LoadResult } from './loader.js';
import { HookSystem, hookSystem } from './hook-system.js';

import { EventEmitter } from 'events';

/**
 * Plugin Manager - Orchestrates plugin operations
 */
export class PluginManager extends EventEmitter {
  private registry: PluginRegistry;
  private loader: PluginLoader;
  private hookSystem: HookSystem;
  private gatewayEvents: PluginGatewayEvent[] = [];

  constructor(
    registry: PluginRegistry = pluginRegistry,
    loader: PluginLoader = pluginLoader,
    _hookSystem: HookSystem = hookSystem,
  ) {
    super();
    this.registry = registry;
    this.loader = loader;
    this.hookSystem = _hookSystem;
  }

  /**
   * Start the plugin manager
   */
  async start(): Promise<void> {
    // Load all auto-enabled plugins
    const plugins = this.registry.getEnabledInstances();
    for (const plugin of plugins) {
      await this.enablePlugin(plugin.instanceId);
    }
  }

  /**
   * Stop the plugin manager
   */
  async stop(): Promise<void> {
    // Disable all plugins
    const plugins = this.registry.getEnabledInstances();
    for (const plugin of plugins) {
      await this.disablePlugin(plugin.instanceId);
    }
  }

  /**
   * Register a plugin definition
   */
  registerDefinition(definition: PluginDefinition): string {
    return this.registry.registerDefinition(definition);
  }

  /**
   * Install a plugin
   */
  async installPlugin(
    pluginId: string,
    instanceId: string,
    source: PluginSource = 'local',
    path?: string,
    config?: Record<string, unknown>,
    options?: PluginLoadOptions,
  ): Promise<InstalledPlugin | null> {
    const definition = this.registry.getDefinition(pluginId);
    if (!definition) {
      throw new Error(`Plugin definition not found: ${pluginId}`);
    }

    // Install instance
    const instance = this.registry.installInstance(pluginId, instanceId, source, path, config);
    if (!instance) {
      return null;
    }

    // Register hooks
    if (definition.hooks) {
      for (const hookDef of definition.hooks) {
        // Find handler for hook
        const handler = (definition as any)[hookDef.handler];
        if (typeof handler === 'function') {
          this.hookSystem.registerHook(instanceId, hookDef, handler.bind(definition));
        }
      }
    }

    return instance;
  }

  /**
   * Uninstall a plugin
   */
  uninstallPlugin(instanceId: string): boolean {
    // Disable if enabled
    const instance = this.registry.getInstance(instanceId);
    if (instance && instance.state === 'enabled') {
      this.hookSystem.unregisterAllHooks(instanceId);
    }

    // Remove from registry
    return this.registry.unregisterInstance(instanceId);
  }

  /**
   * Enable a plugin
   */
  async enablePlugin(instanceId: string): Promise<boolean> {
    const instance = this.registry.getInstance(instanceId);
    if (!instance) return false;

    if (instance.state === 'enabled') return true;

    // Check dependencies
    if (!this.registry.checkDependenciesSatisfied(instance)) {
      const missing = this.registry.getPluginsWithMissingDependencies();
      if (missing.some(m => m.instanceId === instanceId)) {
        return false;
      }
    }

    // Register hooks
    const definition = this.registry.getDefinition(instance.id);
    if (definition?.hooks) {
      for (const hookDef of definition.hooks) {
        const handler = (definition as any)[hookDef.handler];
        if (typeof handler === 'function') {
          this.hookSystem.registerHook(instanceId, hookDef, handler.bind(definition));
        }
      }
    }

    // Update state
    this.registry.updateInstanceState(instanceId, 'enabled');
    this.registry.incrementExecutionCount(instanceId);

    // Emit gateway event
    this.emitGatewayEvent('plugin_enabled', instanceId, instance.id);

    return true;
  }

  /**
   * Disable a plugin
   */
  async disablePlugin(instanceId: string): Promise<boolean> {
    const instance = this.registry.getInstance(instanceId);
    if (!instance) return false;

    if (instance.state === 'disabled') return true;

    // Unregister hooks
    this.hookSystem.unregisterAllHooks(instanceId);

    // Update state
    this.registry.updateInstanceState(instanceId, 'disabled');

    // Emit gateway event
    this.emitGatewayEvent('plugin_disabled', instanceId, instance.id);

    return true;
  }

  /**
   * Update plugin configuration
   */
  updatePluginConfig(instanceId: string, config: PluginConfigUpdate): boolean {
    const updated = this.registry.updateInstanceConfig(instanceId, config.config || {});
    if (config.enabled !== undefined) {
      if (config.enabled) {
        this.enablePlugin(instanceId);
      } else {
        this.disablePlugin(instanceId);
      }
    }
    return updated;
  }

  /**
   * Hot reload a plugin
   */
  async hotReload(instanceId: string): Promise<boolean> {
    const instance = this.registry.getInstance(instanceId);
    if (!instance) return false;

    // Disable plugin
    await this.disablePlugin(instanceId);

    // Unload plugin (clear handlers, etc.)
    this.loader.unload(instanceId);

    // Reload if source supports it
    const loaded = await this.loader.loadFromDefinition(
      this.registry.getDefinition(instance.id)!,
      instance.source,
      instance.installPath,
      instance.config,
    );

    if (loaded.success && loaded.instanceId) {
      // Re-enable plugin
      return this.enablePlugin(loaded.instanceId);
    }

    return false;
  }

  /**
   * Get plugin status
   */
  getPluginStatus(instanceId: string): PluginState | undefined {
    const instance = this.registry.getInstance(instanceId);
    return instance?.state;
  }

  /**
   * Get all plugins with status
   */
  getAllPluginStatus(): Array<{
    instanceId: string;
    pluginId: string;
    name: string;
    state: PluginState;
    enabled: boolean;
    version: string;
  }> {
    return this.registry.getAllInstances().map(inst => ({
      instanceId: inst.instanceId,
      pluginId: inst.id,
      name: inst.name,
      state: inst.state,
      enabled: inst.state === 'enabled',
      version: inst.version,
    }));
  }

  /**
   * Get plugins by category
   */
  getPluginsByCategory(category: string): PluginDefinition[] {
    return this.registry.getPluginsByCategory(category);
  }

  /**
   * Get plugins by source
   */
  getPluginsBySource(source: PluginSource): PluginDefinition[] {
    return this.registry.getPluginsBySource(source);
  }

  /**
   * Get plugins with errors
   */
  getErroredPlugins(): PluginDefinition[] {
    return this.registry.getErroredInstances();
  }

  /**
   * Get plugins with missing dependencies
   */
  getPluginsWithMissingDependencies(): PluginDefinition[] {
    return this.registry.getPluginsWithMissingDependencies();
  }

  /**
   * Get registry summary
   */
  getSummary() {
    return this.registry.getSummary();
  }

  /**
   * Get gateway events
   */
  getGatewayEvents(): PluginGatewayEvent[] {
    return this.gatewayEvents;
  }

  /**
   * Clear gateway events
   */
  clearGatewayEvents(): void {
    this.gatewayEvents = [];
  }

  /**
   * Emit a gateway event
   */
  private emitGatewayEvent(
    type: PluginGatewayEvent['type'],
    instanceId: string,
    pluginId: string,
    data?: unknown,
    error?: string,
  ): void {
    const event: PluginGatewayEvent = {
      type,
      timestamp: new Date().toISOString(),
      pluginInstanceId: instanceId,
      pluginId,
      data,
      error,
    };
    this.gatewayEvents.push(event);
    this.emit(type, event);
  }

  /**
   * Get hook registry
   */
  getHookRegistry(): HookRegistry {
    return this.hookSystem.getHookRegistry();
  }

  /**
   * Trigger a hook
   */
  async triggerHook(
    hookName: string,
    payload: unknown,
    context?: HookExecutionContext,
  ): Promise<unknown> {
    return this.hookSystem.triggerHook(hookName, payload, context);
  }
}

/**
 * Default manager instance
 */
export const pluginManager = new PluginManager();

/**
 * Convenience functions
 */
export const registerPluginDefinition = (definition: PluginDefinition): string =>
  pluginManager.registerDefinition(definition);

export const installPlugin = (
  pluginId: string,
  instanceId: string,
  source?: PluginSource,
  path?: string,
  config?: Record<string, unknown>,
): Promise<InstalledPlugin | null> =>
  pluginManager.installPlugin(pluginId, instanceId, source, path, config);

export const uninstallPlugin = (instanceId: string): boolean =>
  pluginManager.uninstallPlugin(instanceId);

export const enablePlugin = (instanceId: string): Promise<boolean> =>
  pluginManager.enablePlugin(instanceId);

export const disablePlugin = (instanceId: string): Promise<boolean> =>
  pluginManager.disablePlugin(instanceId);

export const updatePluginConfig = (instanceId: string, config: PluginConfigUpdate): boolean =>
  pluginManager.updatePluginConfig(instanceId, config);

export const hotReloadPlugin = (instanceId: string): Promise<boolean> =>
  pluginManager.hotReload(instanceId);

export const getPluginStatus = (instanceId: string): PluginState | undefined =>
  pluginManager.getPluginStatus(instanceId);

export const getAllPluginStatus = () => pluginManager.getAllPluginStatus();

export const getPluginsByCategory = (category: string): PluginDefinition[] =>
  pluginManager.getPluginsByCategory(category);

export const getPluginsBySource = (source: PluginSource): PluginDefinition[] =>
  pluginManager.getPluginsBySource(source);

export const getErroredPlugins = (): PluginDefinition[] => pluginManager.getErroredPlugins();

export const getPluginsWithMissingDeps = (): PluginDefinition[] =>
  pluginManager.getPluginsWithMissingDependencies();

export const getPluginSummary = () => pluginManager.getSummary();
