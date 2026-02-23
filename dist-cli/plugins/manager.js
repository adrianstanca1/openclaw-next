// OpenClaw Next - Plugins Manager
// Superintelligence Agentic Gateway System
// Manages plugin lifecycle: loading, enabling, disabling, hot-reload
import { pluginRegistry } from './registry.js';
import { pluginLoader } from './loader.js';
import { hookSystem } from './hook-system.js';
import { EventEmitter } from 'events';
/**
 * Plugin Manager - Orchestrates plugin operations
 */
export class PluginManager extends EventEmitter {
    registry;
    loader;
    hookSystem;
    gatewayEvents = [];
    constructor(registry = pluginRegistry, loader = pluginLoader, _hookSystem = hookSystem) {
        super();
        this.registry = registry;
        this.loader = loader;
        this.hookSystem = _hookSystem;
    }
    /**
     * Start the plugin manager
     */
    async start() {
        // Load all auto-enabled plugins
        const plugins = this.registry.getEnabledInstances();
        for (const plugin of plugins) {
            await this.enablePlugin(plugin.instanceId);
        }
    }
    /**
     * Stop the plugin manager
     */
    async stop() {
        // Disable all plugins
        const plugins = this.registry.getEnabledInstances();
        for (const plugin of plugins) {
            await this.disablePlugin(plugin.instanceId);
        }
    }
    /**
     * Register a plugin definition
     */
    registerDefinition(definition) {
        return this.registry.registerDefinition(definition);
    }
    /**
     * Install a plugin
     */
    async installPlugin(pluginId, instanceId, source = 'local', path, config, options) {
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
                const handler = definition[hookDef.handler];
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
    uninstallPlugin(instanceId) {
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
    async enablePlugin(instanceId) {
        const instance = this.registry.getInstance(instanceId);
        if (!instance)
            return false;
        if (instance.state === 'enabled')
            return true;
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
                const handler = definition[hookDef.handler];
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
    async disablePlugin(instanceId) {
        const instance = this.registry.getInstance(instanceId);
        if (!instance)
            return false;
        if (instance.state === 'disabled')
            return true;
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
    updatePluginConfig(instanceId, config) {
        const updated = this.registry.updateInstanceConfig(instanceId, config.config || {});
        if (config.enabled !== undefined) {
            if (config.enabled) {
                this.enablePlugin(instanceId);
            }
            else {
                this.disablePlugin(instanceId);
            }
        }
        return updated;
    }
    /**
     * Hot reload a plugin
     */
    async hotReload(instanceId) {
        const instance = this.registry.getInstance(instanceId);
        if (!instance)
            return false;
        // Disable plugin
        await this.disablePlugin(instanceId);
        // Unload plugin (clear handlers, etc.)
        this.loader.unload(instanceId);
        // Reload if source supports it
        const loaded = await this.loader.loadFromDefinition(this.registry.getDefinition(instance.id), instance.source, instance.installPath, instance.config);
        if (loaded.success && loaded.instanceId) {
            // Re-enable plugin
            return this.enablePlugin(loaded.instanceId);
        }
        return false;
    }
    /**
     * Get plugin status
     */
    getPluginStatus(instanceId) {
        const instance = this.registry.getInstance(instanceId);
        return instance?.state;
    }
    /**
     * Get all plugins with status
     */
    getAllPluginStatus() {
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
    getPluginsByCategory(category) {
        return this.registry.getPluginsByCategory(category);
    }
    /**
     * Get plugins by source
     */
    getPluginsBySource(source) {
        return this.registry.getPluginsBySource(source);
    }
    /**
     * Get plugins with errors
     */
    getErroredPlugins() {
        return this.registry.getErroredInstances();
    }
    /**
     * Get plugins with missing dependencies
     */
    getPluginsWithMissingDependencies() {
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
    getGatewayEvents() {
        return this.gatewayEvents;
    }
    /**
     * Clear gateway events
     */
    clearGatewayEvents() {
        this.gatewayEvents = [];
    }
    /**
     * Emit a gateway event
     */
    emitGatewayEvent(type, instanceId, pluginId, data, error) {
        const event = {
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
    getHookRegistry() {
        return this.hookSystem.getHookRegistry();
    }
    /**
     * Trigger a hook
     */
    async triggerHook(hookName, payload, context) {
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
export const registerPluginDefinition = (definition) => pluginManager.registerDefinition(definition);
export const installPlugin = (pluginId, instanceId, source, path, config) => pluginManager.installPlugin(pluginId, instanceId, source, path, config);
export const uninstallPlugin = (instanceId) => pluginManager.uninstallPlugin(instanceId);
export const enablePlugin = (instanceId) => pluginManager.enablePlugin(instanceId);
export const disablePlugin = (instanceId) => pluginManager.disablePlugin(instanceId);
export const updatePluginConfig = (instanceId, config) => pluginManager.updatePluginConfig(instanceId, config);
export const hotReloadPlugin = (instanceId) => pluginManager.hotReload(instanceId);
export const getPluginStatus = (instanceId) => pluginManager.getPluginStatus(instanceId);
export const getAllPluginStatus = () => pluginManager.getAllPluginStatus();
export const getPluginsByCategory = (category) => pluginManager.getPluginsByCategory(category);
export const getPluginsBySource = (source) => pluginManager.getPluginsBySource(source);
export const getErroredPlugins = () => pluginManager.getErroredPlugins();
export const getPluginsWithMissingDeps = () => pluginManager.getPluginsWithMissingDependencies();
export const getPluginSummary = () => pluginManager.getSummary();
