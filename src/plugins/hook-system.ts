// OpenClaw Next - Plugins Module
// Superintelligence Agentic Gateway System
// Hook System - Manages hook registration, execution, and priority ordering

import type {
  PluginHookDefinition,
  PluginHookInstance,
  PluginHookHandler,
  HookExecutionContext,
  HookResult,
  HookPriority,
  HookPhase,
  HookRegistry,
} from './types.js';
import type { PluginTrigger } from '../core/types.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook execution error
 */
export class HookExecutionError extends Error {
  /**
   * Hook ID
   */
  hookId: string;

  /**
   * Creates a new HookExecutionError
   */
  constructor(message: string, hookId: string) {
    super(message);
    this.name = 'HookExecutionError';
    this.hookId = hookId;
  }
}

/**
 * Hook priority ordering function
 */
export const compareHookPriority = (a: number, b: number): number => {
  // Higher priority values execute first
  return b - a;
};

/**
 * Hook Execution Context
 * Provides context for hook execution
 */
export interface HookExecutionOptions {
  /**
   * Whether to continue on hook errors
   */
  continueOnError?: boolean;

  /**
   * Maximum execution time in milliseconds
   */
  timeoutMs?: number;

  /**
   * Additional context to pass to hooks
   */
  context?: HookExecutionContext;
}

/**
 * Hook System
 * Manages hook registration, ordering, and execution
 *
 * Features:
 * - Priority-based hook execution
 * - Hook phases (before, after, around)
 * - Hot-reload support
 * - Performance monitoring
 */
export class HookSystem {
  /**
   * Registered hooks by trigger
   */
  private hooksByTrigger: Map<PluginTrigger, PluginHookInstance[]>;

  /**
   * Registered hooks by name
   */
  private hooksByName: Map<string, PluginHookInstance>;

  /**
   * All hook instances
   */
  private allHooks: Map<string, PluginHookInstance>;

  /**
   * Hook execution statistics
   */
  private stats: Map<string, HookStatistics>;

  /**
   * Creates a new hook system
   */
  constructor() {
    this.hooksByTrigger = new Map<PluginTrigger, PluginHookInstance[]>();
    this.hooksByName = new Map<string, PluginHookInstance>();
    this.allHooks = new Map<string, PluginHookInstance>();
    this.stats = new Map<string, HookStatistics>();
  }

  /**
   * Register a hook with the system
   * @param pluginInstanceId - ID of the plugin instance registering the hook
   * @param definition - Hook definition
   * @param handler - Hook handler function
   * @returns The created hook instance
   */
  registerHook(
    pluginInstanceId: string,
    definition: PluginHookDefinition,
    handler: PluginHookHandler,
  ): PluginHookInstance {
    const hookId = uuidv4();

    const hookInstance: PluginHookInstance = {
      id: hookId,
      pluginInstanceId,
      definition,
      handler,
      status: 'active',
    };

    // Store by all references
    this.allHooks.set(hookId, hookInstance);
    this.hooksByName.set(definition.name, hookInstance);

    // Add to trigger bucket
    const triggerHooks = this.hooksByTrigger.get(definition.trigger) || [];
    triggerHooks.push(hookInstance);
    this.hooksByTrigger.set(definition.trigger, triggerHooks);

    // Initialize statistics
    this.stats.set(hookId, {
      totalExecutions: 0,
      totalDurationMs: 0,
      averageDurationMs: 0,
      successCount: 0,
      errorCount: 0,
      lastExecution: null,
    });

    return hookInstance;
  }

  /**
   * Unregister a hook by ID
   * @param hookId - The hook ID
   * @returns True if the hook was unregistered
   */
  unregisterHook(hookId: string): boolean {
    const hook = this.allHooks.get(hookId);
    if (!hook) {
      return false;
    }

    // Remove from all references
    this.allHooks.delete(hookId);
    this.hooksByName.delete(hook.definition.name);

    // Remove from trigger bucket
    const triggerHooks = this.hooksByTrigger.get(hook.definition.trigger);
    if (triggerHooks) {
      const index = triggerHooks.findIndex(h => h.id === hookId);
      if (index > -1) {
        triggerHooks.splice(index, 1);
        if (triggerHooks.length === 0) {
          this.hooksByTrigger.delete(hook.definition.trigger);
        } else {
          this.hooksByTrigger.set(hook.definition.trigger, triggerHooks);
        }
      }
    }

    // Remove statistics
    this.stats.delete(hookId);

    return true;
  }

  /**
   * Unregister all hooks for a plugin instance
   * @param pluginInstanceId - The plugin instance ID
   * @returns Number of hooks unregistered
   */
  unregisterHooksForPlugin(pluginInstanceId: string): number {
    let count = 0;

    for (const [hookId, hook] of this.allHooks.entries()) {
      if (hook.pluginInstanceId === pluginInstanceId) {
        if (this.unregisterHook(hookId)) {
          count++;
        }
      }
    }

    return count;
  }

  /**
   * Get hooks by trigger
   * @param trigger - The trigger event
   * @returns Array of hook instances sorted by priority
   */
  getHooksByTrigger(trigger: PluginTrigger): PluginHookInstance[] {
    const hooks = this.hooksByTrigger.get(trigger);
    if (!hooks) {
      return [];
    }

    // Sort by priority (higher values first)
    // Within same priority, maintain insertion order
    return [...hooks].sort((a, b) => {
      const priorityDiff = compareHookPriority(a.definition.priority, b.definition.priority);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      // For same priority, 'around' hooks run first, then 'before', then 'after'
      const phaseOrder: Record<HookPhase, number> = { around: 0, before: 1, after: 2 };
      return phaseOrder[a.definition.phase || 'before'] - phaseOrder[b.definition.phase || 'before'];
    });
  }

  /**
   * Get a hook by name
   * @param hookName - The hook name
   * @returns The hook instance or undefined
   */
  getHookByName(hookName: string): PluginHookInstance | undefined {
    return this.hooksByName.get(hookName);
  }

  /**
   * Get all registered hooks
   * @returns Array of all hook instances
   */
  getAllHooks(): PluginHookInstance[] {
    return Array.from(this.allHooks.values());
  }

  /**
   * Get hooks by plugin instance
   * @param pluginInstanceId - The plugin instance ID
   * @returns Array of hooks registered by this plugin
   */
  getHooksByPlugin(pluginInstanceId: string): PluginHookInstance[] {
    return this.getAllHooks().filter(h => h.pluginInstanceId === pluginInstanceId);
  }

  /**
   * Execute a hook
   * @param trigger - The trigger event
   * @param payload - Data to pass to hooks
   * @param options - Execution options
   * @returns Array of hook execution results
   */
  async executeHooks<T = unknown, R = unknown>(
    trigger: PluginTrigger,
    payload: T,
    options: HookExecutionOptions = {}
  ): Promise<HookResult[]> {
    const hooks = this.getHooksByTrigger(trigger);
    const results: HookResult[] = [];
    const context = options.context || {
      timestamp: new Date().toISOString(),
    };

    for (const hook of hooks) {
      if (hook.status !== 'active') {
        continue;
      }

      const startTime = Date.now();
      let result: HookResult;

      try {
        // Execute the hook handler
        const handlerResult = await this.executeWithTimeout(
          () => hook.handler(payload, context),
          options.timeoutMs
        );

        const duration = Date.now() - startTime;
        const statistics = this.stats.get(hook.id);

        if (statistics) {
          statistics.totalExecutions++;
          statistics.totalDurationMs += duration;
          statistics.averageDurationMs = statistics.totalDurationMs / statistics.totalExecutions;
          statistics.successCount++;
          statistics.lastExecution = new Date().toISOString();
        }

        result = {
          success: true,
          hookId: hook.id,
          handler: hook.definition.handler,
          durationMs: duration,
          output: handlerResult,
          continue: true,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        const err = error as Error;
        const statistics = this.stats.get(hook.id);

        if (statistics) {
          statistics.errorCount++;
          statistics.lastExecution = new Date().toISOString();
        }

        result = {
          success: false,
          hookId: hook.id,
          handler: hook.definition.handler,
          durationMs: duration,
          error: err.message,
          continue: options.continueOnError !== false,
        };
      }

      results.push(result);

      // Stop if hook explicitly returned false or continue is false
      if (!result.continue) {
        break;
      }
    }

    return results;
  }

  /**
   * Execute a hook with timeout
   * @param fn - The function to execute
   * @param timeoutMs - Timeout in milliseconds
   * @returns The result of the function
   */
  private async executeWithTimeout<T>(fn: () => T | Promise<T>, timeoutMs?: number): Promise<T> {
    if (!timeoutMs) {
      return fn();
    }

    let timeoutId: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Hook execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    try {
      const result = await Promise.race([fn(), timeoutPromise]);
      return result;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }

  /**
   * Execute a hook phase (before/after/around)
   * @param phase - The phase to execute
   * @param trigger - The trigger event
   * @param payload - Data to pass to hooks
   * @param options - Execution options
   * @returns Array of hook execution results
   */
  async executeByPhase(
    phase: HookPhase,
    trigger: PluginTrigger,
    payload: unknown,
    options?: HookExecutionOptions
  ): Promise<HookResult[]> {
    const hooks = this.getHooksByTrigger(trigger);
    const phaseHooks = hooks.filter(h => h.definition.phase === phase);

    const results: HookResult[] = [];

    for (const hook of phaseHooks) {
      if (hook.status !== 'active') {
        continue;
      }

      const startTime = Date.now();
      let result: HookResult;

      try {
        const handlerResult = await hook.handler(payload, options?.context);
        const duration = Date.now() - startTime;
        const statistics = this.stats.get(hook.id);

        if (statistics) {
          statistics.totalExecutions++;
          statistics.totalDurationMs += duration;
          statistics.averageDurationMs = statistics.totalDurationMs / statistics.totalExecutions;
          statistics.successCount++;
          statistics.lastExecution = new Date().toISOString();
        }

        result = {
          success: true,
          hookId: hook.id,
          handler: hook.definition.handler,
          durationMs: duration,
          output: handlerResult,
          continue: true,
          modifiedPayload: handlerResult as unknown,
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        const err = error as Error;
        const statistics = this.stats.get(hook.id);

        if (statistics) {
          statistics.errorCount++;
        }

        result = {
          success: false,
          hookId: hook.id,
          handler: hook.definition.handler,
          durationMs: duration,
          error: err.message,
          continue: options?.continueOnError !== false,
        };
      }

      results.push(result);

      if (!result.continue) {
        break;
      }
    }

    return results;
  }

  /**
   * Get hook statistics
   * @param hookId - The hook ID (optional)
   * @returns Statistics or statistics map
   */
  getStatistics(hookId?: string): HookStatistics | Map<string, HookStatistics> {
    if (hookId) {
      return this.stats.get(hookId) || {
        totalExecutions: 0,
        totalDurationMs: 0,
        averageDurationMs: 0,
        successCount: 0,
        errorCount: 0,
        lastExecution: null,
      };
    }
    return this.stats;
  }

  /**
   * Clear all hooks and statistics
   */
  clear(): void {
    this.hooksByTrigger.clear();
    this.hooksByName.clear();
    this.allHooks.clear();
    this.stats.clear();
  }

  /**
   * Enable a hook
   * @param hookId - The hook ID
   * @returns True if the hook was enabled
   */
  enableHook(hookId: string): boolean {
    const hook = this.allHooks.get(hookId);
    if (!hook) {
      return false;
    }
    hook.status = 'active';
    return true;
  }

  /**
   * Disable a hook
   * @param hookId - The hook ID
   * @returns True if the hook was disabled
   */
  disableHook(hookId: string): boolean {
    const hook = this.allHooks.get(hookId);
    if (!hook) {
      return false;
    }
    hook.status = 'paused';
    return true;
  }

  /**
   * Update a hook's priority
   * @param hookId - The hook ID
   * @param newPriority - The new priority value
   * @returns True if the priority was updated
   */
  updateHookPriority(hookId: string, newPriority: HookPriority): boolean {
    const hook = this.allHooks.get(hookId);
    if (!hook) {
      return false;
    }
    hook.definition.priority = newPriority;
    return true;
  }

  /**
   * Update a hook's handler
   * @param hookId - The hook ID
   * @param newHandler - The new handler function
   * @returns True if the handler was updated
   */
  updateHookHandler(hookId: string, newHandler: PluginHookHandler): boolean {
    const hook = this.allHooks.get(hookId);
    if (!hook) {
      return false;
    }
    hook.handler = newHandler;
    return true;
  }

  /**
   * Get hook system summary
   * @returns Summary object
   */
  getSummary(): {
    totalHooks: number;
    hooksByTrigger: Record<string, number>;
    enabledHooks: number;
    disabledHooks: number;
  } {
    const hooksByTrigger: Record<string, number> = {};
    let enabledCount = 0;
    let disabledCount = 0;

    for (const hook of this.allHooks.values()) {
      hooksByTrigger[hook.definition.trigger] = (hooksByTrigger[hook.definition.trigger] || 0) + 1;

      if (hook.status === 'active') {
        enabledCount++;
      } else {
        disabledCount++;
      }
    }

    return {
      totalHooks: this.allHooks.size,
      hooksByTrigger,
      enabledHooks: enabledCount,
      disabledHooks: disabledCount,
    };
  }

  /**
   * Unregister all hooks for a plugin
   * @param pluginInstanceId - Plugin instance ID
   * @returns Number of hooks unregistered
   */
  unregisterAllHooks(pluginInstanceId: string): number {
    return this.unregisterHooksForPlugin(pluginInstanceId);
  }

  /**
   * Trigger a hook by name
   * @param hookName - Hook name
   * @param payload - Payload to pass to hook
   * @param context - Optional context
   * @returns Hook result
   */
  async triggerHook(
    hookName: string,
    payload: unknown,
    context?: HookExecutionContext,
  ): Promise<unknown> {
    const hook = this.getHookByName(hookName);
    if (!hook) {
      throw new Error(`Hook not found: ${hookName}`);
    }
    return hook.handler(payload, context);
  }

  /**
   * Get hook registry
   * @returns Hook registry
   */
  getHookRegistry(): HookRegistry {
    const registry: HookRegistry = {};
    for (const [hookName, hook] of this.allHooks.entries()) {
      if (!registry[hookName]) {
        registry[hookName] = [];
      }
      registry[hookName].push(hook);
    }
    return registry;
  }
}

/**
 * Hook statistics
 */
export interface HookStatistics {
  /**
   * Total number of executions
   */
  totalExecutions: number;

  /**
   * Total duration in milliseconds
   */
  totalDurationMs: number;

  /**
   * Average duration in milliseconds
   */
  averageDurationMs: number;

  /**
   * Number of successful executions
   */
  successCount: number;

  /**
   * Number of failed executions
   */
  errorCount: number;

  /**
   * Last execution timestamp
   */
  lastExecution: string | null;
}

/**
 * Global hook system instance
 */
export const hookSystem = new HookSystem();

/**
 * Alias for PluginHookSystem compatibility
 */
export const PluginHookSystem = HookSystem;
export const pluginHookSystem = hookSystem;
export type { HookSystem as PluginHookSystemType };

/**
 * Convenience functions for the global hook system
 */

/**
 * Register a hook
 * @param definition - Hook definition
 * @param handler - Hook handler function
 * @param pluginInstanceId - Plugin instance ID
 * @returns The created hook instance
 */
export const registerHook = (
  definition: PluginHookDefinition,
  handler: PluginHookHandler,
  pluginInstanceId: string
): PluginHookInstance => {
  return hookSystem.registerHook(pluginInstanceId, definition, handler);
};

/**
 * Unregister a hook by ID
 * @param hookId - The hook ID
 * @returns True if unregistered
 */
export const unregisterHook = (hookId: string): boolean => {
  return hookSystem.unregisterHook(hookId);
};

/**
 * Execute hooks for a trigger
 * @param trigger - The trigger event
 * @param payload - Data to pass to hooks
 * @param options - Execution options
 * @returns Array of results
 */
export const executeHooks = <T = unknown, R = unknown>(
  trigger: PluginTrigger,
  payload: T,
  options?: HookExecutionOptions
): Promise<HookResult[]> => {
  return hookSystem.executeHooks(trigger, payload, options);
};

/**
 * Get hooks by trigger
 * @param trigger - The trigger event
 * @returns Array of hook instances
 */
export const getHooks = (trigger: PluginTrigger): PluginHookInstance[] => {
  return hookSystem.getHooksByTrigger(trigger);
};

/**
 * Get hook statistics
 * @param hookId - The hook ID (optional)
 * @returns Statistics or statistics map
 */
export const getHookStats = (hookId?: string): HookStatistics | Map<string, HookStatistics> => {
  return hookSystem.getStatistics(hookId);
};

/**
 * Get hook system summary
 * @returns Summary object
 */
export const getHookSummary = () => {
  return hookSystem.getSummary();
};
