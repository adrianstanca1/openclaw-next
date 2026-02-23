/**
 * OpenClaw Next - Superintelligence Agentic Gateway System
 * Tools Module - Core Type Definitions
 *
 * Defines the fundamental types for tool definitions, inputs, outputs,
 * and schemas used throughout the tools module.
 */

/**
 * Unique identifier for a tool
 */
export type ToolId = string;

/**
 * Tool category for organizational purposes
 */
export type ToolCategory =
  | 'web'           // Web browsing and scraping
  | 'search'        // Search engines and queries
  | 'computation'   // Mathematical and data processing
  | 'storage'       // File and data storage
  | 'communication' // Messaging and email
  | 'automation'    // Workflow automation
  | 'ai'            // AI/ML operations
  | 'system'        // System operations
  | 'custom';       // User-defined custom tools

/**
 * Tool status states
 */
export const ToolStatus = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  UNAVAILABLE: 'unavailable',
  RATE_LIMITED: 'rate_limited',
  COST_EXCEEDED: 'cost_exceeded',
  PENDING_APPROVAL: 'pending_approval',
} as const;

export type ToolStatus = typeof ToolStatus[keyof typeof ToolStatus];

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
  sanitizedData?: unknown;
}

/**
 * Tool schema definition - defines the structure and constraints
 */
export interface ToolSchema {
  type: 'object';
  properties: {
    [key: string]: SchemaProperty;
  };
  required?: string[];
  additionalProperties?: boolean;
  description?: string;
}

/**
 * Individual property definition within a schema
 */
export interface SchemaProperty {
  type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null';
  description?: string;
  enum?: string[];
  format?: string; // e.g., 'email', 'uri', 'date-time'
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  items?: SchemaProperty | SchemaProperty[];
  minItems?: number;
  maxItems?: number;
  // Object-specific properties
  properties?: { [key: string]: SchemaProperty };
  additionalProperties?: boolean;
}

/**
 * Tool input parameters
 */
export interface ToolInput {
  [key: string]: unknown;
}

/**
 * Tool output result
 */
export interface ToolOutput {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: {
    executionTime?: number;     // Milliseconds
    tokensUsed?: number;         // For AI tools
    cost?: number;               // In credits/currency
    cacheHit?: boolean;
    rateLimitRemaining?: number;
    originalSize?: number;        // For sanitized outputs
    sanitizedSize?: number;       // For sanitized outputs
  };
}

/**
 * Core tool definition - the main interface for all tools
 */
export interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  category: ToolCategory;

  // Function signature for tool execution
  execute: (input: ToolInput, context?: ToolContext) => Promise<ToolOutput>;

  // Schema for validating inputs
  schema: ToolSchema;

  // Optional metadata
  metadata?: {
    version?: string;
    author?: string;
    tags?: string[];
    icon?: string;
    examples?: ToolExample[];
    lastExecutionTime?: number;
  };

  // Configuration options
  config?: ToolConfig;

  // Status and limits
  status?: ToolStatus;
  rateLimit?: RateLimitConfig;
  cost?: CostConfig;

  // Dependencies
  dependencies?: string[]; // Other tool IDs this tool depends on
}

/**
 * Context passed to tool execution
 */
export interface ToolContext {
  sessionId?: string;
  userId?: string;
  timestamp: number;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  chainId?: string;      // For tool chaining
  parentToolId?: string; // For tool chaining
}

/**
 * Example usage of a tool
 */
export interface ToolExample {
  input: ToolInput;
  output?: ToolOutput;
  description: string;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  maxRequestsPerMinute?: number;
  maxRequestsPerHour?: number;
  maxRequestsPerDay?: number;
  burstLimit?: number;
  cooldownMs?: number;
}

/**
 * Cost configuration for tools
 */
export interface CostConfig {
  costPerRequest?: number;
  maxCostPerSession?: number;
  maxCostPerDay?: number;
  currency?: string;
}

/**
 * Tool configuration options
 */
export interface ToolConfig {
  enabled: boolean;
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
  cacheEnabled?: boolean;
  cacheTtlMs?: number;
  approvalRequired?: boolean;
  restrictOutput?: boolean;
  outputMaxSize?: number;
}

/**
 * Registry entry combining definition with runtime state
 */
export interface RegistryEntry {
  definition: ToolDefinition;
  status: ToolStatus;
  lastUsed?: number;
  usageCount: number;
  lastRateLimitReset?: number;
  rateLimitCount: number;
}

/**
 * Tool operation options for execution
 */
export interface ToolExecutionOptions {
  validateInput?: boolean;
  validateOutput?: boolean;
  applyRateLimit?: boolean;
  checkCost?: boolean;
  sanitizeOutput?: boolean;
  timeoutMs?: number;
  context?: ToolContext;
}

/**
 * Event types for tool operations
 */
export type ToolEvent =
  | { type: 'tool_registered'; toolId: ToolId }
  | { type: 'tool_unregistered'; toolId: ToolId }
  | { type: 'tool_enabled'; toolId: ToolId }
  | { type: 'tool_disabled'; toolId: ToolId }
  | { type: 'tool_execution_started'; toolId: ToolId; input: ToolInput }
  | { type: 'tool_execution_completed'; toolId: ToolId; output: ToolOutput; duration: number }
  | { type: 'tool_execution_failed'; toolId: ToolId; error: Error }
  | { type: 'rate_limit_exceeded'; toolId: ToolId; limit: number }
  | { type: 'cost_exceeded'; toolId: ToolId; cost: number; limit: number }
  | { type: 'approval_required'; toolId: ToolId; input: ToolInput }
  | { type: 'output_sanitized'; toolId: ToolId; originalSize: number; sanitizedSize: number };

/**
 * Event handler type
 */
export type ToolEventHandler = (event: ToolEvent) => void;

/**
 * Tool chain definition for chaining multiple tools together
 */
export interface ToolChain {
  id: string;
  name: string;
  description?: string;
  steps: ToolChainStep[];
  outputMapper?: (results: ToolOutput[]) => ToolOutput;
}

/**
 * Individual step in a tool chain
 */
export interface ToolChainStep {
  toolId: ToolId;
  input: ToolInput;
  inputMapper?: (previousOutput: ToolOutput) => ToolInput;
  skipIf?: (previousOutput: ToolOutput) => boolean;
}

/**
 * Approval workflow state
 */
export interface ApprovalWorkflow {
  id: string;
  toolId: ToolId;
  input: ToolInput;
  requestId: string;
  requesterId: string;
  requestedAt: number;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: number;
  rejectionReason?: string;
}
