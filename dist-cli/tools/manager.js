/**
 * OpenClaw Next - Superintelligence Agentic Gateway System
 * Tools Module - Tool Management
 *
 * Provides tool lifecycle management including enable/disable,
 * configuration, and policy enforcement.
 */
import { toolRegistry, getTool, updateStatus, listTools } from './registry';
/**
 * Manager for tool policies and configurations
 */
export class ToolManager {
    policies;
    configOverrides;
    constructor() {
        this.policies = new Map();
        this.configOverrides = new Map();
    }
    /**
     * Enable a tool
     * @param toolId - The ID of the tool to enable
     * @returns True if the tool was enabled
     */
    enableTool(toolId) {
        return updateStatus(toolId, 'enabled');
    }
    /**
     * Enable multiple tools
     * @param toolIds - Array of tool IDs to enable
     * @returns Number of tools successfully enabled
     */
    enableTools(toolIds) {
        let count = 0;
        for (const toolId of toolIds) {
            if (this.enableTool(toolId)) {
                count++;
            }
        }
        return count;
    }
    /**
     * Disable a tool
     * @param toolId - The ID of the tool to disable
     * @returns True if the tool was disabled
     */
    disableTool(toolId) {
        return updateStatus(toolId, 'disabled');
    }
    /**
     * Disable multiple tools
     * @param toolIds - Array of tool IDs to disable
     * @returns Number of tools successfully disabled
     */
    disableTools(toolIds) {
        let count = 0;
        for (const toolId of toolIds) {
            if (this.disableTool(toolId)) {
                count++;
            }
        }
        return count;
    }
    /**
     * Set tool configuration
     * @param toolId - The ID of the tool
     * @param config - Configuration to apply
     * @returns True if configuration was applied
     */
    configureTool(toolId, config) {
        const tool = getTool(toolId);
        if (!tool) {
            return false;
        }
        // Store configuration override
        this.configOverrides.set(toolId, {
            ...this.configOverrides.get(toolId),
            ...config,
        });
        // Update the tool's config
        tool.config = {
            ...tool.config,
            ...config,
            enabled: config.enabled !== undefined ? config.enabled : tool.config?.enabled ?? true,
            timeoutMs: config.timeoutMs ?? tool.config?.timeoutMs,
            retryCount: config.retryCount ?? tool.config?.retryCount ?? 3,
            retryDelayMs: config.retryDelayMs ?? tool.config?.retryDelayMs ?? 1000,
            cacheEnabled: config.cacheEnabled ?? tool.config?.cacheEnabled ?? false,
            cacheTtlMs: config.cacheTtlMs ?? tool.config?.cacheTtlMs ?? 60000,
            restrictOutput: config.restrictOutput ?? tool.config?.restrictOutput ?? true,
            outputMaxSize: config.outputMaxSize ?? tool.config?.outputMaxSize ?? 1024 * 1024,
            approvalRequired: config.approvalRequired ?? tool.config?.approvalRequired ?? false,
        };
        // Update rate limits if provided
        if (config.rateLimit) {
            tool.rateLimit = {
                ...tool.rateLimit,
                ...config.rateLimit,
            };
        }
        // Update cost configuration if provided
        if (config.cost) {
            tool.cost = {
                ...tool.cost,
                ...config.cost,
            };
        }
        return true;
    }
    /**
     * Set policy for a tool or category
     * @param target - Tool ID or category
     * @param policy - Policy to apply
     */
    setPolicy(target, policy) {
        this.policies.set(target, policy);
    }
    /**
     * Get policy for a tool or category
     * @param target - Tool ID or category
     * @returns Policy or undefined
     */
    getPolicy(target) {
        return this.policies.get(target);
    }
    /**
     * Remove a policy
     * @param target - Tool ID or category
     */
    removePolicy(target) {
        return this.policies.delete(target);
    }
    /**
     * Get tool configuration
     * @param toolId - The ID of the tool
     * @returns Tool configuration or undefined
     */
    getConfig(toolId) {
        const tool = getTool(toolId);
        return tool?.config;
    }
    /**
     * Get effective configuration for a tool (merging default, stored, and override)
     * @param toolId - The ID of the tool
     * @returns Effective configuration
     */
    getEffectiveConfig(toolId) {
        const tool = getTool(toolId);
        if (!tool) {
            return {
                enabled: false,
                timeoutMs: 30000,
                retryCount: 3,
                retryDelayMs: 1000,
                cacheEnabled: false,
                cacheTtlMs: 60000,
                approvalRequired: false,
                restrictOutput: true,
                outputMaxSize: 1024 * 1024,
            };
        }
        const override = this.configOverrides.get(toolId) || {};
        const stored = tool.config || {};
        return {
            enabled: override.enabled ?? stored.enabled ?? true,
            timeoutMs: override.timeoutMs ?? stored.timeoutMs ?? 30000,
            retryCount: override.retryCount ?? stored.retryCount ?? 3,
            retryDelayMs: override.retryDelayMs ?? stored.retryDelayMs ?? 1000,
            cacheEnabled: override.cacheEnabled ?? stored.cacheEnabled ?? false,
            cacheTtlMs: override.cacheTtlMs ?? stored.cacheTtlMs ?? 60000,
            approvalRequired: override.approvalRequired ?? stored.approvalRequired ?? false,
            restrictOutput: override.restrictOutput ?? stored.restrictOutput ?? true,
            outputMaxSize: override.outputMaxSize ?? stored.outputMaxSize ?? 1024 * 1024,
        };
    }
    /**
     * List all tools with their current status
     * @param options - Filtering options
     * @returns Array of tools with status information
     */
    listTools(options) {
        const tools = listTools(options);
        return tools.map(tool => ({
            definition: tool,
            status: toolRegistry.getStatus(tool.id) || 'disabled',
            config: this.getEffectiveConfig(tool.id),
        }));
    }
    /**
     * Check if a tool requires approval
     * @param toolId - The ID of the tool
     * @returns True if approval is required
     */
    requiresApproval(toolId) {
        const config = this.getEffectiveConfig(toolId);
        return config.approvalRequired || false;
    }
    /**
     * Get tools that are currently enabled
     * @returns Array of enabled tool definitions
     */
    getEnabledTools() {
        return listTools({ status: 'enabled' });
    }
    /**
     * Get tools by category
     * @param category - The category to filter by
     * @returns Array of tools in the category
     */
    getToolsByCategory(category) {
        return listTools({ category });
    }
    /**
     * Bulk enable/disable tools by category
     * @param category - The category to update
     * @param enabled - Whether to enable or disable
     * @returns Number of tools updated
     */
    setCategoryStatus(category, enabled) {
        const tools = this.getToolsByCategory(category);
        const method = enabled ? 'enableTool' : 'disableTool';
        let count = 0;
        for (const tool of tools) {
            if (this[method](tool.id)) {
                count++;
            }
        }
        return count;
    }
    /**
     * Reset all tool configurations to defaults
     */
    resetAllConfigs() {
        this.configOverrides.clear();
    }
    /**
     * Check rate limit for a tool
     * @param toolId - The ID of the tool
     * @returns Rate limit status information
     */
    getRateLimitStatus(toolId) {
        const tool = getTool(toolId);
        if (!tool?.rateLimit) {
            return undefined;
        }
        // This is a simplified implementation
        // A production system would track actual usage and implement proper rate limiting
        const maxPerMinute = tool.rateLimit.maxRequestsPerMinute ?? 60;
        const remaining = Math.max(0, maxPerMinute - 1); // Simplified: assume 1 request made
        return {
            remaining,
            limit: maxPerMinute,
            resetAt: Date.now() + 60000, // Reset in 1 minute
        };
    }
    /**
     * Get cost tracking for a tool
     * @param toolId - The ID of the tool
     * @returns Cost tracking information
     */
    getCostTracking(toolId) {
        const tool = getTool(toolId);
        if (!tool?.cost) {
            return undefined;
        }
        const spent = 0; // Would track actual spending in production
        const limit = tool.cost.maxCostPerSession ?? 100;
        const remaining = Math.max(0, limit - spent);
        return {
            spent,
            limit,
            remaining,
        };
    }
}
/**
 * Singleton manager instance
 */
export const toolManager = new ToolManager();
/**
 * Convenience functions for the global manager
 */
export const enableTool = (toolId) => toolManager.enableTool(toolId);
export const disableTool = (toolId) => toolManager.disableTool(toolId);
export const configureTool = (toolId, config) => toolManager.configureTool(toolId, config);
export const getToolConfig = (toolId) => toolManager.getConfig(toolId);
export const setToolPolicy = (target, policy) => toolManager.setPolicy(target, policy);
export const getToolPolicy = (target) => toolManager.getPolicy(target);
export const getToolsByCategory = (category) => toolManager.getToolsByCategory(category);
export const setCategoryStatus = (category, enabled) => toolManager.setCategoryStatus(category, enabled);
export const requiresApproval = (toolId) => toolManager.requiresApproval(toolId);
