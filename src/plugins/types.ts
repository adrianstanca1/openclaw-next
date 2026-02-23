// OpenClaw Next - Plugins Module Types
// Superintelligence Agentic Gateway System
// Defines core types for the plugin system: plugins, hooks, events, and configuration

import type { AgentConfig, GatewayEventType, PluginTrigger } from '../core/types.js';

/**
 * Agent State
 * Represents the current state of an agent
 */
export type AgentState = 'idle' | 'busy' | 'error' | 'paused' | 'stopped';

/**
 * Plugin State
 * Represents the current state of a plugin in its lifecycle
 */
export type PluginState = 'installed' | 'enabled' | 'disabled' | 'error' | 'loading' | 'uninstalling';

/**
 * Plugin Source Type
 * Defines where a plugin originates from
 */
export type PluginSource = 'local' | 'remote' | 'bundled' | 'marketplace' | 'builtin';

/**
 * Plugin Category
 * Categorization for plugin organization
 */
export type PluginCategory =
  | 'monitoring'
  | 'logging'
  | 'analytics'
  | 'security'
  | 'automation'
  | 'integration'
  | 'notification'
  | 'cache'
  | 'storage'
  | 'optimization'
  | 'experimental';

/**
 * Hook Priority Levels
 * Defines the ordering for hook execution
 */
export type HookPriority = -10 | -5 | -1 | 0 | 1 | 5 | 10;

/**
 * Hook Execution Phase
 * Defines when a hook executes relative to its trigger
 */
export type HookPhase = 'before' | 'after' | 'around';

/**
 * Plugin Definition
 * The core blueprint of a plugin including its configuration and capabilities
 */
export interface PluginDefinition {
  /**
   * Unique identifier for the plugin (snake_case recommended)
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Version following semantic versioning (e.g., "1.2.3")
   */
  version: string;

  /**
   * Brief description of what the plugin does
   */
  description: string;

  /**
   * Long-form documentation
   */
  longDescription?: string;

  /**
   * Author or maintainer
   */
  author?: string;

  /**
   * URL to the plugin's repository or homepage
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
   * Minimum gateway version required
   */
  minGatewayVersion?: string;

  /**
   * Configuration schema for the plugin
   */
  configSchema?: PluginConfigSchema;

  /**
   * Default configuration values
   */
  defaultConfig?: Record<string, unknown>;

  /**
   * Hooks this plugin registers
   */
  hooks?: PluginHookDefinition[];

  /**
   * Events this plugin can emit
   */
  events?: PluginEventDefinition[];

  /**
   * Metadata about the plugin
   */
  metadata?: PluginMetadata;

  /**
   * Dependencies required by this plugin
   */
  requires?: PluginDependency[];
}

/**
 * Plugin Configuration Schema
 * Defines the structure and validation rules for plugin configuration
 */
export interface PluginConfigSchema {
  type: 'object';
  properties: Record<string, PluginConfigProperty>;
  required?: string[];
  additionalProperties?: boolean;
  dependencies?: Record<string, string[]>;
}

/**
 * Plugin Configuration Property
 * Defines a single configuration parameter
 */
export interface PluginConfigProperty {
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
  items?: PluginConfigProperty;
  dependsOn?: string; // Property name this field depends on
}

/**
 * Plugin Hook Definition
 * Defines a hook that can be triggered by the plugin system
 */
export interface PluginHookDefinition {
  /**
   * Unique name for the hook
   */
  name: string;

  /**
   * Trigger event that activates the hook
   */
  trigger: PluginTrigger;

  /**
   * Handler function name or reference
   */
  handler: string;

  /**
   * Execution priority (higher executes first)
   */
  priority: HookPriority;

  /**
   * Execution phase
   */
  phase?: HookPhase;

  /**
   * Whether the hook is required
   */
  required?: boolean;

  /**
   * Description of what the hook does
   */
  description?: string;
}

/**
 * Plugin Event Definition
 * Defines an event that can be emitted by the plugin
 */
export interface PluginEventDefinition {
  /**
   * Unique name for the event
   */
  name: string;

  /**
   * Event type string
   */
  type: string;

  /**
   * Schema for event data
   */
  schema?: Record<string, unknown>;

  /**
   * Description
   */
  description?: string;
}

/**
 * Plugin Dependency
 * Defines a dependency this plugin requires
 */
export interface PluginDependency {
  /**
   * Type of dependency
   */
  type: 'plugin' | 'package' | 'permission' | 'environment' | 'gateway';

  /**
   * Identifier (plugin ID, package name, etc.)
   */
  id: string;

  /**
   * Version constraint (e.g., "^1.0.0", ">=2.0.0")
   */
  version?: string;

  /**
   * Whether this dependency is optional
   */
  optional?: boolean;

  /**
   * Human-readable description
   */
  description?: string;

  /**
   * Custom validation function
   */
  validate?: () => Promise<DependencyStatus>;
}

/**
 * Dependency Status
 * Result of dependency validation
 */
export interface DependencyStatus {
  satisfied: boolean;
  message?: string;
  details?: Record<string, unknown>;
}

/**
 * Plugin Metadata
 * Additional information about a plugin
 */
export interface PluginMetadata {
  /**
   * Icon/emoji for UI representation
   */
  icon?: string;

  /**
   * Tags for search and filtering
   */
  tags?: string[];

  /**
   * Estimated resource usage
   */
  resources?: {
    cpu?: number; // millicores
    memory?: number; // MB
  };

  /**
   * Status of the plugin
   */
  status?: 'stable' | 'beta' | 'experimental' | 'deprecated';

  /**
   * Changelog entries
   */
  changelog?: Record<string, string>;

  /**
   * Category for organization
   */
  category?: PluginCategory;
}

/**
 * Installed Plugin
 * A plugin instance with configuration and runtime state
 */
export interface InstalledPlugin extends PluginDefinition {
  /**
   * Unique instance ID
   */
  instanceId: string;

  /**
   * Source of the plugin
   */
  source: PluginSource;

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
  state: PluginState;

  /**
   * Whether dependencies are satisfied
   */
  dependenciesSatisfied: boolean;

  /**
   * Dependencies that are installed
   */
  installedDependencies?: string[];

  /**
   * Last error encountered (if any)
   */
  lastError?: PluginError;

  /**
   * Total execution count
   */
  executionCount?: number;

  /**
   * Whether the plugin is hot-reloadable
   */
  hotReloadable?: boolean;
}

/**
 * Plugin Hook Implementation
 * A registered hook handler
 */
export interface PluginHookInstance {
  /**
   * Unique identifier for this hook instance
   */
  id: string;

  /**
   * Plugin instance ID
   */
  pluginInstanceId: string;

  /**
   * Hook definition
   */
  definition: PluginHookDefinition;

  /**
   * The actual handler function
   */
  handler: PluginHookHandler;

  /**
   * Current execution status
   */
  status: 'active' | 'paused' | 'errored';
}

/**
 * Plugin Hook Handler
 * The function that executes when a hook is triggered
 */
export type PluginHookHandler<T = unknown, R = unknown> = (
  payload: T,
  context?: HookExecutionContext
) => R | Promise<R>;

/**
 * Hook Execution Context
 * Additional context passed to hook handlers
 */
export interface HookExecutionContext {
  /**
   * Current gateway timestamp
   */
  timestamp: string;

  /**
   * Current gateway state
   */
  gatewayState?: 'starting' | 'running' | 'stopping' | 'stopped';

  /**
   * Session ID if available
   */
  sessionId?: string;

  /**
   * Agent ID if available
   */
  agentId?: string;

  /**
   * Additional metadata
   */
  metadata?: Record<string, unknown>;
}

/**
 * Plugin Hook Result
 * Result from hook execution
 */
export interface HookResult {
  /**
   * Whether the hook executed successfully
   */
  success: boolean;

  /**
   * Hook instance ID
   */
  hookId: string;

  /**
   * Handler name
   */
  handler: string;

  /**
   * Execution duration in milliseconds
   */
  durationMs: number;

  /**
   * Return value from handler
   */
  output?: unknown;

  /**
   * Error if execution failed
   */
  error?: string;

  /**
   * Whether to continue executing subsequent hooks
   */
  continue: boolean;

  /**
   * Modified payload (for 'around' phase hooks)
   */
  modifiedPayload?: unknown;
}

/**
 * Plugin Event
 * An event emitted by a plugin
 */
export interface PluginEvent {
  /**
   * Event type
   */
  type: GatewayEventType | string;

  /**
   * Event timestamp
   */
  timestamp: string;

  /**
   * Plugin instance ID that emitted the event
   */
  pluginInstanceId?: string;

  /**
   * Plugin ID that emitted the event
   */
  pluginId?: string;

  /**
   * Event data payload
   */
  data: unknown;

  /**
   * Event metadata
   */
  metadata?: PluginEventMetadata;
}

/**
 * Plugin Event Metadata
 * Additional information about an event
 */
export interface PluginEventMetadata {
  /**
   * Event source
   */
  source?: string;

  /**
   * Event severity
   */
  severity?: 'info' | 'warning' | 'error' | 'success';

  /**
   * Context information
   */
  context?: Record<string, unknown>;

  /**
   * Custom properties
   */
  properties?: Record<string, unknown>;
}

/**
 * Plugin Error
 * Error information from plugin execution
 */
export interface PluginError {
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
   * Error timestamp
   */
  timestamp: string;

  /**
   * Whether this is a user error
   */
  isUserError?: boolean;
}

/**
 * Plugin Configuration Update
 * Updates to apply to plugin configuration
 */
export interface PluginConfigUpdate {
  /**
   * Whether to enable/disable the plugin
   */
  enabled?: boolean;

  /**
   * Configuration values to update
   */
  config?: Record<string, unknown>;

  /**
   * Hot reload settings
   */
  hotReload?: {
    enabled?: boolean;
    debounceMs?: number;
    watchPaths?: string[];
  };

  /**
   * Hook configuration
   */
  hooks?: {
    [hookName: string]: {
      enabled?: boolean;
      priority?: HookPriority;
    };
  };
}

/**
 * Plugin Manifest
 * Metadata about a plugin package
 */
export interface PluginManifest {
  /**
   * Plugin ID
   */
  id: string;

  /**
   * Plugin version
   */
  version: string;

  /**
   * Plugin name
   */
  name: string;

  /**
   * Entry point file
   */
  main?: string;

  /**
   * Type of entry (module|script)
   */
  type?: 'module' | 'script';

  /**
   * Files included in the plugin
   */
  files?: string[];

  /**
   * Keywords for discovery
   */
  keywords?: string[];

  /**
   * Peer dependencies
   */
  peerDependencies?: Record<string, string>;
}

/**
 * Plugin Loading Options
 * Options for loading a plugin
 */
export interface PluginLoadOptions {
  /**
   * Whether to validate dependencies
   */
  validateDependencies?: boolean;

  /**
   * Whether to load config from storage
   */
  loadConfig?: boolean;

  /**
   * Initial configuration to apply
   */
  initialConfig?: Record<string, unknown>;

  /**
   * Whether to enable after loading
   */
  autoEnable?: boolean;

  /**
   * Hot reload configuration
   */
  hotReload?: {
    enabled: boolean;
    debounceMs: number;
  };
}

/**
 * Plugin Registry Entry
 * Internal registry entry for plugin management
 */
export interface PluginRegistryEntry {
  /**
   * Plugin instance ID
   */
  instanceId: string;

  /**
   * Plugin definition
   */
  definition: PluginDefinition;

  /**
   * Installation info
   */
  installation: {
    source: PluginSource;
    path?: string;
    installedAt: string;
    updatedAt?: string;
  };

  /**
   * Runtime state
   */
  state: {
    enabled: boolean;
    state: PluginState;
    dependenciesSatisfied: boolean;
    lastError?: PluginError;
  };

  /**
   * Configuration
   */
  config: Record<string, unknown>;

  /**
   * Hook instances registered by this plugin
   */
  hooks: Map<string, PluginHookInstance>;

  /**
   * Event listeners registered by this plugin
   */
  eventListeners: PluginEventListener[];

  /**
   * Hot reload support
   */
  hotReload?: {
    enabled: boolean;
    debounceMs: number;
    lastReload?: string;
    watcher?: {
      type: 'fs' | 'poll';
      intervalMs?: number;
    };
  };
}

/**
 * Plugin Event Listener
 * A listener for plugin events
 */
export interface PluginEventListener {
  /**
   * Listener ID
   */
  id: string;

  /**
   * Plugin instance ID
   */
  pluginInstanceId: string;

  /**
   * Event type to listen for
   */
  eventType: string;

  /**
   * Handler function
   */
  handler: (event: PluginEvent) => void | Promise<void>;

  /**
   * Priority for event handling
   */
  priority: number;
}

/**
 * Hot Reload Event
 * Event for hot reload operations
 */
export interface HotReloadEvent {
  /**
   * Plugin instance ID
   */
  pluginInstanceId: string;

  /**
   * Type of reload
   */
  type: 'full' | 'partial' | 'config';

  /**
   * Files that changed
   */
  changedFiles?: string[];

  /**
   * Timestamp of reload
   */
  timestamp: string;
}

/**
 * Plugin Gateway Event
 * Events emitted by the gateway related to plugins
 */
export type PluginGatewayEvent = {
  type: 'plugin_loaded' | 'plugin_enabled' | 'plugin_disabled' | 'plugin_uninstalled' | 'plugin_updated' | 'plugin_error' | 'hot_reload_triggered';
  timestamp: string;
  pluginInstanceId: string;
  pluginId: string;
  data?: unknown;
  error?: string;
};

/**
 * Utility Types
 */

/**
 * Map of plugin definitions by ID
 */
export interface PluginRegistry {
  [pluginId: string]: PluginDefinition;
}

/**
 * Map of installed plugins by instance ID
 */
export interface InstalledPluginRegistry {
  [instanceId: string]: InstalledPlugin;
}

/**
 * Plugin Hook Map
 * Maps hook names to their implementations
 */
export interface HookRegistry {
  [hookName: string]: PluginHookInstance[];
}

/**
 * Event Handler Map
 * Maps event types to their handlers
 */
export interface EventRegistry {
  [eventType: string]: PluginEventListener[];
}

/**
 * Plugin Status Summary
 * Summary of plugin system status
 */
export interface PluginStatusSummary {
  totalPlugins: number;
  enabledPlugins: number;
  disabledPlugins: number;
  erroredPlugins: number;
  totalHooks: number;
  totalEventListeners: number;
  activeHotReloads: number;
  recentEvents: PluginEvent[];
}
