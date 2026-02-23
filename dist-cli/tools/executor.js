/**
 * OpenClaw Next - Superintelligence Agentic Gateway System
 * Tools Module - Tool Execution Engine
 *
 * Handles tool execution with validation, rate limiting, cost control,
 * and execution lifecycle management.
 */
import { validateInput, validateOutput, sanitizeOutput, } from './validators';
import { getTool, recordUsage } from './registry';
/**
 * Tool execution engine
 */
export class ToolExecutor {
    context;
    stats;
    constructor(context) {
        this.context = {
            sessionId: context?.sessionId,
            userId: context?.userId,
            approvalRequired: context?.approvalRequired ?? false,
            enableTracing: context?.enableTracing ?? false,
            maxDepth: context?.maxDepth ?? 10,
        };
        this.stats = {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            totalDuration: 0,
            averageDuration: 0,
            totalCost: 0,
            byCategory: {},
        };
    }
    /**
     * Execute a tool by ID
     * @param toolId - The ID of the tool to execute
     * @param input - Input parameters for the tool
     * @param options - Execution options
     * @param context - Execution context
     * @returns The execution result
     */
    async execute(toolId, input = {}, options = {}, context) {
        const startTime = Date.now();
        // Get tool definition
        const tool = getTool(toolId);
        if (!tool) {
            throw this.createExecutionError(toolId, 'unknown', `Tool '${toolId}' not found`);
        }
        // Default options
        const finalOptions = {
            validateInput: true,
            validateOutput: true,
            applyRateLimit: true,
            checkCost: true,
            sanitizeOutput: true,
            timeoutMs: tool.config?.timeoutMs ?? 30000,
            ...options,
        };
        // Build execution context
        const finalContext = {
            sessionId: context?.sessionId || this.context.sessionId,
            userId: context?.userId || this.context.userId,
            timestamp: Date.now(),
            chainId: context?.chainId,
            parentToolId: context?.parentToolId,
            ...context,
        };
        // Validate input
        let validation;
        if (finalOptions.validateInput) {
            validation = validateInput(input, tool.schema);
            if (!validation.valid) {
                return {
                    toolId,
                    success: false,
                    error: `Input validation failed: ${validation.errors.join('; ')}`,
                    duration: Date.now() - startTime,
                    validation,
                };
            }
        }
        // Check cost limits
        if (finalOptions.checkCost && tool.cost) {
            const estimatedCost = this.estimateCost(tool);
            if (this.stats.totalCost + estimatedCost > tool.cost.maxCostPerSession) {
                return {
                    toolId,
                    success: false,
                    error: `Cost limit exceeded for tool '${toolId}'`,
                    duration: Date.now() - startTime,
                    cost: estimatedCost,
                };
            }
        }
        // Record usage and check rate limits
        if (finalOptions.applyRateLimit && tool.rateLimit) {
            if (!recordUsage(toolId)) {
                return {
                    toolId,
                    success: false,
                    error: `Rate limit exceeded for tool '${toolId}'`,
                    duration: Date.now() - startTime,
                };
            }
        }
        // Execute with timeout
        let executionResult;
        try {
            executionResult = await this.executeWithTimeout(tool, input, finalContext, finalOptions.timeoutMs);
        }
        catch (error) {
            const err = error;
            if (err.name === 'TimeoutError') {
                return {
                    toolId,
                    success: false,
                    error: `Tool execution timed out after ${finalOptions.timeoutMs}ms`,
                    duration: Date.now() - startTime,
                    validation,
                };
            }
            return {
                toolId,
                success: false,
                error: err.message,
                duration: Date.now() - startTime,
                validation,
            };
        }
        // Calculate cost
        const cost = this.estimateCost(tool);
        this.stats.totalCost += cost;
        // Sanitize output if enabled
        let sanitizedResult = executionResult;
        if (finalOptions.sanitizeOutput && tool.config?.restrictOutput) {
            sanitizedResult = sanitizeOutput(executionResult, tool.config.outputMaxSize);
        }
        // Validate output if enabled
        let outputValidation;
        if (finalOptions.validateOutput) {
            outputValidation = validateOutput(sanitizedResult);
            if (!outputValidation.valid) {
                return {
                    toolId,
                    success: false,
                    error: `Output validation failed: ${outputValidation.errors.join('; ')}`,
                    duration: Date.now() - startTime,
                    validation,
                };
            }
        }
        // Update stats
        const duration = Date.now() - startTime;
        this.stats.totalExecutions++;
        this.stats.successfulExecutions++;
        this.stats.totalDuration += duration;
        this.stats.averageDuration = this.stats.totalDuration / this.stats.totalExecutions;
        // Update category stats
        const category = tool.category;
        if (!this.stats.byCategory[category]) {
            this.stats.byCategory[category] = {
                totalExecutions: 0,
                successfulExecutions: 0,
                failedExecutions: 0,
                totalDuration: 0,
                averageDuration: 0,
                totalCost: 0,
                byCategory: {},
            };
        }
        this.stats.byCategory[category].totalExecutions++;
        this.stats.byCategory[category].successfulExecutions++;
        this.stats.byCategory[category].totalDuration += duration;
        // Build final result
        return {
            toolId,
            success: sanitizedResult.success,
            data: sanitizedResult.data,
            error: sanitizedResult.error,
            metadata: sanitizedResult.metadata,
            duration,
            validation,
            cost,
        };
    }
    /**
     * Execute a tool function with a timeout
     */
    async executeWithTimeout(tool, input, context, timeoutMs) {
        return new Promise((resolve, reject) => {
            let completed = false;
            let timeoutId;
            const timeoutHandler = () => {
                if (!completed) {
                    completed = true;
                    reject(new Error('TimeoutError'));
                }
            };
            timeoutId = setTimeout(timeoutHandler, timeoutMs);
            const execute = async () => {
                try {
                    const result = await tool.execute(input, context);
                    if (!completed) {
                        completed = true;
                        clearTimeout(timeoutId);
                        resolve(result);
                    }
                }
                catch (error) {
                    if (!completed) {
                        completed = true;
                        clearTimeout(timeoutId);
                        reject(error);
                    }
                }
            };
            execute();
        });
    }
    /**
     * Execute multiple tools in sequence (tool chaining)
     * @param toolIds - Array of tool IDs to execute in sequence
     * @param initialInput - Initial input for the first tool
     * @param options - Execution options
     * @param context - Execution context
     * @returns Array of execution results
     */
    async executeChain(toolIds, initialInput = {}, options = {}, context) {
        if (toolIds.length === 0) {
            return [];
        }
        const results = [];
        let currentInput = initialInput;
        for (let i = 0; i < toolIds.length; i++) {
            const toolId = toolIds[i];
            const chainId = `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            // Check chain depth limit
            if (i >= this.context.maxDepth) {
                throw this.createExecutionError(toolId, 'unknown', `Maximum chain depth of ${this.context.maxDepth} exceeded`);
            }
            // Execute the tool
            const result = await this.execute(toolId, currentInput, options, {
                ...context,
                timestamp: context?.timestamp ?? Date.now(),
                chainId,
                parentToolId: i > 0 ? toolIds[i - 1] : undefined,
            });
            results.push(result);
            // If any tool failed, stop the chain
            if (!result.success) {
                break;
            }
            // Use previous output as input for next tool (if no specific input provided)
            if (result.data !== undefined) {
                currentInput = { data: result.data };
            }
        }
        return results;
    }
    /**
     * Estimate the cost of executing a tool
     */
    estimateCost(tool) {
        return tool.cost?.costPerRequest ?? 0;
    }
    /**
     * Create a standardized execution error
     */
    createExecutionError(toolId, reason, message, details) {
        const error = new Error(message);
        error.toolId = toolId;
        error.reason = reason;
        error.details = details;
        return error;
    }
    /**
     * Get execution statistics
     */
    getStats() {
        return { ...this.stats };
    }
    /**
     * Reset execution statistics
     */
    resetStats() {
        this.stats = {
            totalExecutions: 0,
            successfulExecutions: 0,
            failedExecutions: 0,
            totalDuration: 0,
            averageDuration: 0,
            totalCost: 0,
            byCategory: {},
        };
    }
    /**
     * Execute a tool with automatic error handling
     * @param toolId - The ID of the tool to execute
     * @param input - Input parameters for the tool
     * @param options - Execution options
     * @returns The execution result or error
     */
    async executeSafe(toolId, input = {}, options = {}) {
        try {
            return await this.execute(toolId, input, options);
        }
        catch (error) {
            const err = error;
            return {
                toolId,
                success: false,
                error: err.message,
                duration: 0,
            };
        }
    }
}
/**
 * Singleton executor instance
 */
export const toolExecutor = new ToolExecutor();
/**
 * Convenience function for tool execution
 */
export const executeTool = (toolId, input = {}, options, context) => toolExecutor.execute(toolId, input, options, context);
/**
 * Convenience function for tool chaining
 */
export const executeChain = (toolIds, initialInput = {}, options, context) => toolExecutor.executeChain(toolIds, initialInput, options, context);
/**
 * Get execution statistics
 */
export const getExecutionStats = () => toolExecutor.getStats();
/**
 * Reset execution statistics
 */
export const resetExecutionStats = () => toolExecutor.resetStats();
