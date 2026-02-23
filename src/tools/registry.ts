/**
 * OpenClaw Next - Superintelligence Agentic Gateway System
 * Tools Module - Tool Registry
 *
 * Manages the registration, discovery, and lifecycle of tools.
 */

import type {
  ToolDefinition,
  ToolId,
  ToolStatus,
  RegistryEntry,
  ToolEvent,
  ToolEventHandler,
  ToolCategory,
} from './types';

import { ToolStatus as ToolStatusConst } from './types';

import { createValidator, ValidationUtils } from './validators';

/**
 * Default configuration for tools
 */
const DEFAULT_TOOL_CONFIG = {
  enabled: true,
  timeoutMs: 30000,
  retryCount: 3,
  retryDelayMs: 1000,
  cacheEnabled: false,
  cacheTtlMs: 60000,
  approvalRequired: false,
  restrictOutput: true,
  outputMaxSize: 1024 * 1024, // 1MB default
};

/**
 * Default rate limit configuration
 */
const DEFAULT_RATE_LIMIT: { [key: string]: number } = {
  maxRequestsPerMinute: 60,
  maxRequestsPerHour: 1000,
  maxRequestsPerDay: 10000,
};

/**
 * Default cost configuration
 */
const DEFAULT_COST_CONFIG = {
  costPerRequest: 0,
  maxCostPerSession: 100,
  maxCostPerDay: 1000,
  currency: 'credits',
};

/**
 * Internal state for the tool registry
 */
interface RegistryState {
  tools: Map<ToolId, RegistryEntry>;
  events: Map<string, ToolEventHandler[]>;
  lastToolId: number;
}

/**
 * Tool Registry - central registry for all tools
 */
export class ToolRegistry {
  private state: RegistryState;
  private eventBus: Map<string, ToolEventHandler[]>;

  constructor() {
    this.state = {
      tools: new Map<ToolId, RegistryEntry>(),
      events: new Map<string, ToolEventHandler[]>(),
      lastToolId: 0,
    };
    this.eventBus = new Map<string, ToolEventHandler[]>();
  }

  /**
   * Register a tool with the registry
   * @param definition - The tool definition to register
   * @returns The registered tool's ID
   */
  register(definition: ToolDefinition): ToolId {
    // Generate unique ID if not provided
    const toolId = definition.id || `tool_${++this.state.lastToolId}`;

    // Create default config if not provided
    const config = {
      ...DEFAULT_TOOL_CONFIG,
      ...definition.config,
      enabled: definition.config?.enabled ?? true,
    };

    // Apply default rate limits if not specified
    const rateLimit = {
      ...DEFAULT_RATE_LIMIT,
      ...definition.rateLimit,
    };

    // Create registry entry
    const entry: RegistryEntry = {
      definition: {
        ...definition,
        id: toolId,
        config,
        rateLimit,
        cost: {
          ...DEFAULT_COST_CONFIG,
          ...definition.cost,
        },
        metadata: {
          ...definition.metadata,
          version: definition.metadata?.version || '1.0.0',
        },
      },
      status: ToolStatusConst.ENABLED,
      usageCount: 0,
      rateLimitCount: 0,
    };

    // Store the entry
    this.state.tools.set(toolId, entry);

    // Dispatch registration event
    this.dispatchEvent('tool_registered', { toolId });

    // Create input validator for the tool
    if (!definition.schema || definition.schema.type !== 'object') {
      console.warn(`Tool ${toolId} has invalid schema, using inferred schema`);
    }

    return toolId;
  }

  /**
   * Register multiple tools at once
   * @param definitions - Array of tool definitions to register
   * @returns Array of registered tool IDs
   */
  registerMany(definitions: ToolDefinition[]): ToolId[] {
    return definitions.map(def => this.register(def));
  }

  /**
   * Unregister a tool from the registry
   * @param toolId - The ID of the tool to unregister
   * @returns True if the tool was unregistered, false if not found
   */
  unregister(toolId: ToolId): boolean {
    if (!this.state.tools.has(toolId)) {
      return false;
    }

    this.state.tools.delete(toolId);
    this.dispatchEvent('tool_unregistered', { toolId });

    return true;
  }

  /**
   * Get a tool definition by ID
   * @param toolId - The ID of the tool to retrieve
   * @returns The tool definition, or undefined if not found
   */
  get(toolId: ToolId): ToolDefinition | undefined {
    const entry = this.state.tools.get(toolId);
    return entry?.definition;
  }

  /**
   * Get a tool's runtime status by ID
   * @param toolId - The ID of the tool
   * @returns The runtime status, or undefined if not found
   */
  getStatus(toolId: ToolId): ToolStatus | undefined {
    return this.state.tools.get(toolId)?.status;
  }

  /**
   * Check if a tool is enabled
   * @param toolId - The ID of the tool
   * @returns True if the tool is enabled
   */
  isEnabled(toolId: ToolId): boolean {
    const entry = this.state.tools.get(toolId);
    return entry?.status === 'enabled';
  }

  /**
   * List all registered tools
   * @param options - Filtering options
   * @returns Array of tool definitions
   */
  list(options?: {
    category?: ToolCategory;
    status?: ToolStatus;
    includeDisabled?: boolean;
  }): ToolDefinition[] {
    let tools = Array.from(this.state.tools.values());

    // Apply filters
    if (options?.category) {
      tools = tools.filter(entry => entry.definition.category === options.category);
    }

    if (options?.status) {
      tools = tools.filter(entry => entry.status === options.status);
    }

    if (!options?.includeDisabled) {
      tools = tools.filter(entry => entry.status === 'enabled');
    }

    return tools.map(entry => entry.definition);
  }

  /**
   * Find tools by category
   * @param category - The category to search for
   * @returns Array of tools in the category
   */
  findByCategory(category: ToolCategory): ToolDefinition[] {
    return this.list({ category });
  }

  /**
   * Find tools by tag
   * @param tag - The tag to search for
   * @returns Array of tools with the tag
   */
  findByTag(tag: string): ToolDefinition[] {
    return this.list().filter(tool =>
      tool.metadata?.tags?.includes(tag)
    );
  }

  /**
   * Update the status of a tool
   * @param toolId - The ID of the tool
   * @param status - The new status
   * @returns True if the status was updated
   */
  updateStatus(toolId: ToolId, status: ToolStatus): boolean {
    const entry = this.state.tools.get(toolId);
    if (!entry) {
      return false;
    }

    const oldStatus = entry.status;
    entry.status = status;

    // Dispatch status change event
    if (status === 'enabled') {
      this.dispatchEvent('tool_enabled', { toolId });
    } else if (oldStatus === 'enabled') {
      this.dispatchEvent('tool_disabled', { toolId });
    }

    return true;
  }

  /**
   * Enable a tool
   * @param toolId - The ID of the tool to enable
   * @returns True if the tool was enabled
   */
  enableTool(toolId: ToolId): boolean {
    return this.updateStatus(toolId, 'enabled');
  }

  /**
   * Disable a tool
   * @param toolId - The ID of the tool to disable
   * @returns True if the tool was disabled
   */
  disableTool(toolId: ToolId): boolean {
    return this.updateStatus(toolId, 'disabled');
  }

  /**
   * Record tool usage for rate limiting
   * @param toolId - The ID of the tool
   * @returns True if usage was recorded (not rate limited)
   */
  recordUsage(toolId: ToolId): boolean {
    const entry = this.state.tools.get(toolId);
    if (!entry) {
      return false;
    }

    entry.usageCount++;
    entry.rateLimitCount++;

    // Check rate limits
    if (entry.definition.rateLimit) {
      const now = Date.now();

      // Reset daily counter if needed
      if (entry.lastRateLimitReset === undefined ||
          now - entry.lastRateLimitReset > 24 * 60 * 60 * 1000) {
        entry.rateLimitCount = 1;
        entry.lastRateLimitReset = now;
      }

      // Check per-minute limit
      if (entry.definition.rateLimit.maxRequestsPerMinute !== undefined) {
        const minuteAgo = now - 60 * 1000;
        // Note: This is a simplified rate limit check
        // A production system would need a sliding window or token bucket
      }

      // Check per-hour limit
      if (entry.definition.rateLimit.maxRequestsPerHour !== undefined &&
          entry.usageCount > entry.definition.rateLimit.maxRequestsPerHour) {
        this.updateStatus(toolId, 'rate_limited');
        this.dispatchEvent('rate_limit_exceeded', {
          toolId,
          limit: entry.definition.rateLimit.maxRequestsPerHour!,
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Track tool execution time
   * @param toolId - The ID of the tool
   * @param startTime - Start timestamp in milliseconds
   */
  trackExecutionTime(toolId: ToolId, startTime: number): number {
    const entry = this.state.tools.get(toolId);
    if (entry) {
      const duration = Date.now() - startTime;
      entry.definition.metadata = {
        ...entry.definition.metadata,
        lastExecutionTime: duration,
      };
      return duration;
    }
    return 0;
  }

  /**
   * Add an event listener for tool events
   * @param eventType - The event type to listen for
   * @param handler - The event handler function
   * @returns A function to remove the listener
   */
  on(eventType: ToolEvent['type'], handler: ToolEventHandler): () => void {
    if (!this.eventBus.has(eventType)) {
      this.eventBus.set(eventType, []);
    }

    this.eventBus.get(eventType)!.push(handler);

    return () => {
      const handlers = this.eventBus.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Dispatch an event to registered handlers
   */
  private dispatchEvent(
    eventType: ToolEvent['type'],
    data: Record<string, unknown>
  ): void {
    const handlers = this.eventBus.get(eventType);
    if (handlers) {
      const event = { type: eventType, ...data } as ToolEvent;
      handlers.forEach(handler => handler(event));
    }
  }

  /**
   * Get the total count of registered tools
   */
  get count(): number {
    return this.state.tools.size;
  }

  /**
   * Clear all registered tools
   */
  clear(): void {
    this.state.tools.clear();
    this.eventBus.clear();
  }
}

/**
 * Singleton registry instance
 */
export const toolRegistry = new ToolRegistry();

/**
 * Convenience functions for the global registry
 */
export const registerTool = (definition: ToolDefinition): ToolId =>
  toolRegistry.register(definition);

export const unregisterTool = (toolId: ToolId): boolean =>
  toolRegistry.unregister(toolId);

export const getTool = (toolId: ToolId): ToolDefinition | undefined =>
  toolRegistry.get(toolId);

export const listTools = (options?: {
  category?: ToolCategory;
  status?: ToolStatus;
  includeDisabled?: boolean;
}): ToolDefinition[] => toolRegistry.list(options);

export const updateStatus = (toolId: ToolId, status: ToolStatus): boolean =>
  toolRegistry.updateStatus(toolId, status);

export const enableTool = (toolId: ToolId): boolean =>
  toolRegistry.updateStatus(toolId, 'enabled');

export const disableTool = (toolId: ToolId): boolean =>
  toolRegistry.updateStatus(toolId, 'disabled');

export const recordUsage = (toolId: ToolId): boolean =>
  toolRegistry.recordUsage(toolId);

export const onToolEvent = (eventType: ToolEvent['type'], handler: ToolEventHandler): () => void =>
  toolRegistry.on(eventType, handler);
