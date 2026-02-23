/**
 * OpenClaw Next - Superintelligence Agentic Gateway System
 * Tools Module - Main Entry Point
 *
 * Exports all tools module components for easy imports.
 *
 * Example usage:
 * ```ts
 * import { toolRegistry, toolExecutor, toolManager } from '@openclaw/tools';
 *
 * // Register a tool
 * const toolId = toolRegistry.register({
 *   id: 'example_tool',
 *   name: 'Example Tool',
 *   description: 'An example tool',
 *   category: 'custom',
 *   execute: async (input) => ({ success: true, data: input }),
 *   schema: { type: 'object', properties: {} }
 * });
 *
 * // Execute a tool
 * const result = await toolExecutor.execute(toolId, { key: 'value' });
 * ```
 */

// Core types
export * from './types';

// Validators
export * from './validators';

// Registry - export everything except enableTool/disableTool to avoid conflicts
export {
  toolRegistry,
  registerTool,
  unregisterTool,
  getTool,
  listTools,
  onToolEvent,
  recordUsage,
  ToolRegistry,
} from './registry';

// Executor
export * from './executor';

// Manager
export * from './manager';

// Restrictions
export * from './restrictions';

// Import ToolConfig type for use in this module
import type { ToolConfig } from './types';

// Convenience re-exports
export { toolExecutor } from './executor';
export { toolManager } from './manager';

// Combined interface for easy configuration
export interface ToolsModuleOptions {
  registry?: {
    defaultRateLimit?: {
      maxRequestsPerMinute?: number;
      maxRequestsPerHour?: number;
      maxRequestsPerDay?: number;
    };
    defaultCost?: {
      costPerRequest?: number;
      maxCostPerSession?: number;
      maxCostPerDay?: number;
    };
  };
  executor?: {
    defaultTimeoutMs?: number;
    enableTracing?: boolean;
    maxChainDepth?: number;
  };
  manager?: {
    defaultApprovalRequired?: boolean;
    defaultRestrictOutput?: boolean;
  };
}

// Export a function to configure the tools module with defaults
export function configureTools(options?: ToolsModuleOptions): void {
  // This function can be used to configure default settings
  // when the module is initialized
  console.log('Tools module configured with options:', options);
}

// Export a factory function for creating tool configurations
export function createToolConfig(config: Partial<ToolConfig> = {}): ToolConfig {
  const defaults: ToolConfig = {
    enabled: true,
    timeoutMs: 30000,
    retryCount: 3,
    retryDelayMs: 1000,
    cacheEnabled: false,
    cacheTtlMs: 60000,
    approvalRequired: false,
    restrictOutput: true,
    outputMaxSize: 1024 * 1024,
  };
  return { ...defaults, ...config };
}
