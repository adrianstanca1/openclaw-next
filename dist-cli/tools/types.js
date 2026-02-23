/**
 * OpenClaw Next - Superintelligence Agentic Gateway System
 * Tools Module - Core Type Definitions
 *
 * Defines the fundamental types for tool definitions, inputs, outputs,
 * and schemas used throughout the tools module.
 */
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
};
