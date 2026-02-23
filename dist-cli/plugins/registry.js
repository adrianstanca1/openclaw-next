// OpenClaw Next - Plugins Module
// Superintelligence Agentic Gateway System
// Plugin Registry - Manages plugin metadata, storage, and discovery
/**
 * Plugin Registry
 * Central registry for managing plugin metadata, installations, and discovery
 *
 * The registry handles:
 * - Plugin metadata storage and retrieval
 * - Installed plugin instances
 * - Dependency tracking
 * - Plugin discovery and listing
 */
export class PluginRegistry {
    /**
     * Map of plugin definitions by plugin ID
     */
    definitions;
    /**
     * Map of installed plugins by instance ID
     */
    instances;
    /**
     * Map of plugin instances by plugin ID (for multiple versions)
     */
    instancesByPluginId;
    /**
     * Dependency tracking - maps plugin ID to its dependencies
     */
    dependencies;
    /**
     * Reverse dependency tracking - maps plugin ID to plugins that depend on it
     */
    reverseDependencies;
    /**
     * Creates a new plugin registry
     */
    constructor() {
        this.definitions = new Map();
        this.instances = new Map();
        this.instancesByPluginId = new Map();
        this.dependencies = new Map();
        this.reverseDependencies = new Map();
    }
    /**
     * Register a plugin definition
     * @param definition - The plugin definition to register
     * @returns The plugin ID
     */
    registerDefinition(definition) {
        const existing = this.definitions.get(definition.id);
        if (existing) {
            // Update existing definition
            this.definitions.set(definition.id, {
                ...existing,
                ...definition,
                version: definition.version,
                hooks: definition.hooks ?? existing.hooks,
                metadata: definition.metadata ?? existing.metadata,
            });
            return definition.id;
        }
        this.definitions.set(definition.id, definition);
        // Initialize dependency tracking
        if (definition.requires && definition.requires.length > 0) {
            this.dependencies.set(definition.id, new Set(definition.requires.map(d => d.id)));
            for (const dep of definition.requires) {
                const reverse = this.reverseDependencies.get(dep.id) || new Set();
                reverse.add(definition.id);
                this.reverseDependencies.set(dep.id, reverse);
            }
        }
        return definition.id;
    }
    /**
     * Unregister a plugin definition
     * @param pluginId - The plugin ID to unregister
     * @returns True if the definition was unregistered
     */
    unregisterDefinition(pluginId) {
        // Remove any installed instances first
        const instanceSet = this.instancesByPluginId.get(pluginId);
        if (instanceSet) {
            for (const instanceId of instanceSet) {
                this.unregisterInstance(instanceId);
            }
        }
        // Remove dependency tracking
        this.dependencies.delete(pluginId);
        this.reverseDependencies.delete(pluginId);
        return this.definitions.delete(pluginId);
    }
    /**
     * Get a plugin definition by ID
     * @param pluginId - The plugin ID
     * @returns The plugin definition or undefined
     */
    getDefinition(pluginId) {
        return this.definitions.get(pluginId);
    }
    /**
     * Get all plugin definitions
     * @returns Array of all plugin definitions
     */
    getAllDefinitions() {
        return Array.from(this.definitions.values());
    }
    /**
     * Install a plugin instance
     * @param pluginId - The plugin ID to install
     * @param instanceId - Unique instance ID
     * @param source - Source of the installation
     * @param path - Installation path
     * @param config - Initial configuration
     * @returns The installed plugin instance
     */
    installInstance(pluginId, instanceId, source, path, config) {
        const definition = this.definitions.get(pluginId);
        if (!definition) {
            return null;
        }
        const installedPlugin = {
            ...definition,
            instanceId,
            source,
            installPath: path,
            installedAt: new Date().toISOString(),
            config: {
                ...definition.defaultConfig,
                ...config,
            },
            state: 'installed',
            dependenciesSatisfied: false,
            executionCount: 0,
        };
        this.instances.set(instanceId, installedPlugin);
        // Track by plugin ID
        let pluginInstances = this.instancesByPluginId.get(pluginId);
        if (!pluginInstances) {
            pluginInstances = new Set();
            this.instancesByPluginId.set(pluginId, pluginInstances);
        }
        pluginInstances.add(instanceId);
        return installedPlugin;
    }
    /**
     * Unregister a plugin instance
     * @param instanceId - The instance ID to unregister
     * @returns True if the instance was unregistered
     */
    unregisterInstance(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            return false;
        }
        // Remove from by-plugin tracking
        const pluginInstances = this.instancesByPluginId.get(instance.id);
        if (pluginInstances) {
            pluginInstances.delete(instanceId);
            if (pluginInstances.size === 0) {
                this.instancesByPluginId.delete(instance.id);
            }
        }
        // Remove the instance
        return this.instances.delete(instanceId);
    }
    /**
     * Get an installed plugin by instance ID
     * @param instanceId - The instance ID
     * @returns The installed plugin or undefined
     */
    getInstance(instanceId) {
        return this.instances.get(instanceId);
    }
    /**
     * Get an installed plugin by plugin ID (latest version)
     * @param pluginId - The plugin ID
     * @returns The installed plugin or undefined
     */
    getInstanceByPluginId(pluginId) {
        const instances = this.instancesByPluginId.get(pluginId);
        if (!instances || instances.size === 0) {
            return undefined;
        }
        // Return the instance with the highest version
        const instanceArray = Array.from(instances).map(id => this.instances.get(id));
        instanceArray.sort((a, b) => this.compareVersions(b.version, a.version));
        return instanceArray[0];
    }
    /**
     * Get all instances of a plugin
     * @param pluginId - The plugin ID
     * @returns Array of installed plugin instances
     */
    getInstancesByPluginId(pluginId) {
        const instances = this.instancesByPluginId.get(pluginId);
        if (!instances) {
            return [];
        }
        return Array.from(instances).map(id => this.instances.get(id));
    }
    /**
     * Get all installed plugin instances
     * @returns Array of all installed plugin instances
     */
    getAllInstances() {
        return Array.from(this.instances.values());
    }
    /**
     * Get installed instances by state
     * @param state - The state to filter by
     * @returns Array of instances in the specified state
     */
    getInstancesByState(state) {
        return Array.from(this.instances.values()).filter(inst => inst.state === state);
    }
    /**
     * Get enabled instances
     * @returns Array of enabled plugin instances
     */
    getEnabledInstances() {
        return Array.from(this.instances.values()).filter(inst => inst.state === 'enabled');
    }
    /**
     * Get disabled instances
     * @returns Array of disabled plugin instances
     */
    getDisabledInstances() {
        return Array.from(this.instances.values()).filter(inst => inst.state === 'disabled');
    }
    /**
     * Get errored instances
     * @returns Array of errored plugin instances
     */
    getErroredInstances() {
        return Array.from(this.instances.values()).filter(inst => inst.state === 'error');
    }
    /**
     * Update plugin instance state
     * @param instanceId - The instance ID
     * @param newState - The new state
     * @returns True if the state was updated
     */
    updateInstanceState(instanceId, newState) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            return false;
        }
        instance.state = newState;
        instance.updatedAt = new Date().toISOString();
        // Reset dependencies status when state changes
        if (newState !== 'installed' && newState !== 'uninstalling') {
            instance.dependenciesSatisfied = this.checkDependenciesSatisfied(instance);
        }
        this.instances.set(instanceId, instance);
        return true;
    }
    /**
     * Update plugin configuration
     * @param instanceId - The instance ID
     * @param config - Configuration to merge
     * @returns True if configuration was updated
     */
    updateInstanceConfig(instanceId, config) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            return false;
        }
        instance.config = {
            ...instance.config,
            ...config,
        };
        instance.updatedAt = new Date().toISOString();
        this.instances.set(instanceId, instance);
        return true;
    }
    /**
     * Set error for plugin instance
     * @param instanceId - The instance ID
     * @param error - Error information
     */
    setInstanceError(instanceId, error) {
        const instance = this.instances.get(instanceId);
        if (instance) {
            instance.lastError = {
                ...error,
                timestamp: new Date().toISOString(),
            };
            instance.state = 'error';
            this.instances.set(instanceId, instance);
        }
    }
    /**
     * Clear error for plugin instance
     * @param instanceId - The instance ID
     * @returns True if error was cleared
     */
    clearInstanceError(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            return false;
        }
        const hadError = instance.lastError !== undefined;
        instance.lastError = undefined;
        instance.state = hadError ? 'installed' : instance.state;
        this.instances.set(instanceId, instance);
        return hadError;
    }
    /**
     * Increment execution count
     * @param instanceId - The instance ID
     * @returns The new execution count
     */
    incrementExecutionCount(instanceId) {
        const instance = this.instances.get(instanceId);
        if (!instance) {
            return 0;
        }
        instance.executionCount = (instance.executionCount || 0) + 1;
        this.instances.set(instanceId, instance);
        return instance.executionCount;
    }
    /**
     * Check if dependencies are satisfied for a plugin
     * @param instance - The installed plugin instance
     * @returns True if all dependencies are satisfied
     */
    checkDependenciesSatisfied(instance) {
        if (!instance.requires || instance.requires.length === 0) {
            return true;
        }
        for (const dep of instance.requires) {
            // For plugin dependencies, check if required plugin is installed
            if (dep.type === 'plugin') {
                const depInstance = this.getInstanceByPluginId(dep.id);
                if (!depInstance) {
                    return false;
                }
                // Check version constraint if specified
                if (dep.version && !this.satisfiesVersion(depInstance.version, dep.version)) {
                    return false;
                }
            }
            // For package dependencies, this would check if the package is available
            // This is typically done at runtime
        }
        return true;
    }
    /**
     * Check if a version satisfies a version constraint
     * @param version - The version to check
     * @param constraint - The version constraint
     * @returns True if the version satisfies the constraint
     */
    satisfiesVersion(version, constraint) {
        // Simple version constraint parsing
        const cleanConstraint = constraint.replace(/^[~^]/, '');
        if (constraint.startsWith('^')) {
            // Caret constraint: ^1.2.3 := >=1.2.3 <2.0.0
            const [major, minor] = cleanConstraint.split('.').map(Number);
            const [vMajor, vMinor] = version.split('.').map(Number);
            return (vMajor === major &&
                (vMinor > minor || (vMinor === minor && this.getPatchVersion(version) >= this.getPatchVersion(cleanConstraint))));
        }
        else if (constraint.startsWith('~')) {
            // Tilde constraint: ~1.2.3 := >=1.2.3 <1.3.0
            const [major, minor] = cleanConstraint.split('.').map(Number);
            const [vMajor, vMinor] = version.split('.').map(Number);
            return vMajor === major && vMinor === minor;
        }
        else {
            // Exact match
            return version === cleanConstraint;
        }
    }
    /**
     * Get patch version from a version string
     * @param version - The version string
     * @returns The patch version number
     */
    getPatchVersion(version) {
        const parts = version.split('.');
        return parts.length >= 3 ? parseInt(parts[2], 10) || 0 : 0;
    }
    /**
     * Find plugins that depend on the given plugin
     * @param pluginId - The plugin ID
     * @returns Array of plugin IDs that depend on this plugin
     */
    findDependents(pluginId) {
        const dependents = this.reverseDependencies.get(pluginId);
        return dependents ? Array.from(dependents) : [];
    }
    /**
     * Find dependencies of a plugin
     * @param pluginId - The plugin ID
     * @returns Array of dependency plugin IDs
     */
    findDependencies(pluginId) {
        const deps = this.dependencies.get(pluginId);
        return deps ? Array.from(deps) : [];
    }
    /**
     * Get plugins that are missing dependencies
     * @returns Array of installed plugins with unsatisfied dependencies
     */
    getPluginsWithMissingDependencies() {
        return Array.from(this.instances.values()).filter(inst => !this.checkDependenciesSatisfied(inst));
    }
    /**
     * Get plugins by category
     * @param category - The category to filter by
     * @returns Array of plugins in the category
     */
    getPluginsByCategory(category) {
        return Array.from(this.definitions.values()).filter(def => {
            const pluginCategories = def.metadata?.tags || [];
            return pluginCategories.some(tag => tag.toLowerCase() === category.toLowerCase());
        });
    }
    /**
     * Get plugins by source
     * @param source - The source to filter by
     * @returns Array of installed plugins from the source
     */
    getPluginsBySource(source) {
        return Array.from(this.instances.values()).filter(inst => inst.source === source);
    }
    /**
     * Get the count of registered plugins
     * @returns The number of registered plugin definitions
     */
    getDefinitionCount() {
        return this.definitions.size;
    }
    /**
     * Get the count of installed instances
     * @returns The number of installed plugin instances
     */
    getInstanceCount() {
        return this.instances.size;
    }
    /**
     * Clear all registry data
     */
    clear() {
        this.definitions.clear();
        this.instances.clear();
        this.instancesByPluginId.clear();
        this.dependencies.clear();
        this.reverseDependencies.clear();
    }
    /**
     * Compare two version strings
     * @param v1 - First version
     * @param v2 - Second version
     * @returns Negative if v1 < v2, positive if v1 > v2, 0 if equal
     */
    compareVersions(v1, v2) {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const n1 = parts1[i] || 0;
            const n2 = parts2[i] || 0;
            if (n1 !== n2) {
                return n1 - n2;
            }
        }
        return 0;
    }
    /**
     * Generate a summary of the registry state
     * @returns Registry summary object
     */
    getSummary() {
        const enabledCount = this.getEnabledInstances().length;
        const disabledCount = this.getDisabledInstances().length;
        const erroredCount = this.getErroredInstances().length;
        const bySource = {};
        for (const source of ['local', 'remote', 'bundled', 'marketplace', 'builtin']) {
            bySource[source] = this.getPluginsBySource(source).length;
        }
        const byCategory = {};
        for (const def of this.definitions.values()) {
            const tags = def.metadata?.tags || [];
            for (const tag of tags) {
                byCategory[tag] = (byCategory[tag] || 0) + 1;
            }
        }
        return {
            totalDefinitions: this.definitions.size,
            totalInstances: this.instances.size,
            enabledCount,
            disabledCount,
            erroredCount,
            bySource,
            byCategory,
            missingDependencies: this.getPluginsWithMissingDependencies().length,
        };
    }
}
/**
 * Singleton registry instance
 */
export const pluginRegistry = new PluginRegistry();
/**
 * Convenience functions for the global registry
 */
/**
 * Register a plugin definition
 * @param definition - The plugin definition to register
 * @returns The plugin ID
 */
export const registerPlugin = (definition) => {
    return pluginRegistry.registerDefinition(definition);
};
/**
 * Unregister a plugin definition
 * @param pluginId - The plugin ID to unregister
 * @returns True if unregistered
 */
export const unregisterPlugin = (pluginId) => {
    return pluginRegistry.unregisterDefinition(pluginId);
};
/**
 * Get a plugin definition by ID
 * @param pluginId - The plugin ID
 * @returns The plugin definition or undefined
 */
export const getPluginDefinition = (pluginId) => {
    return pluginRegistry.getDefinition(pluginId);
};
/**
 * Install a plugin instance
 * @param pluginId - The plugin ID to install
 * @param instanceId - Unique instance ID
 * @param source - Source of the installation
 * @param path - Installation path
 * @param config - Initial configuration
 * @returns The installed plugin instance or null
 */
export const installPlugin = (pluginId, instanceId, source = 'local', path, config) => {
    return pluginRegistry.installInstance(pluginId, instanceId, source, path, config);
};
/**
 * Get a plugin instance by ID
 * @param instanceId - The instance ID
 * @returns The installed plugin or undefined
 */
export const getPluginInstance = (instanceId) => {
    return pluginRegistry.getInstance(instanceId);
};
/**
 * Get all plugin instances
 * @returns Array of all installed plugin instances
 */
export const getAllPlugins = () => {
    return pluginRegistry.getAllInstances();
};
/**
 * Get plugins with missing dependencies
 * @returns Array of plugins with unsatisfied dependencies
 */
export const getPluginsWithMissingDeps = () => {
    return pluginRegistry.getPluginsWithMissingDependencies();
};
/**
 * Get registry summary
 * @returns Registry summary object
 */
export const getRegistrySummary = () => {
    return pluginRegistry.getSummary();
};
