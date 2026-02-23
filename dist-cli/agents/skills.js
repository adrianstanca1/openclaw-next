/**
 * OpenClaw Next - Skill Registry for Agents
 * Superintelligence Agentic Gateway System
 *
 * Manages skills that agents can invoke during execution.
 */
import { generateId } from '../core/utils.js';
/**
 * Skill Registry
 * Manages available skills and their execution
 */
export class SkillRegistry {
    skills = new Map();
    invocations = new Map();
    constructor() {
        this.registerDefaultSkills();
        this._registerSkillCreator();
    }
    /**
     * Register a skill
     */
    register(skill) {
        this.skills.set(skill.id, skill);
        if (!this.invocations.has(skill.id)) {
            this.invocations.set(skill.id, []);
        }
    }
    /**
     * Unregister a skill
     */
    unregister(skillId) {
        return this.skills.delete(skillId);
    }
    /**
     * Get a skill by ID
     */
    get(skillId) {
        return this.skills.get(skillId);
    }
    /**
     * List all registered skills
     */
    list() {
        return Array.from(this.skills.values());
    }
    /**
     * Invoke a skill by name (alias for invoke with skill name)
     */
    async invokeSkill(_agentId, skillName, parameters) {
        try {
            const skill = this.skills.get(skillName);
            if (!skill) {
                return { success: false, error: `Skill not found: ${skillName}` };
            }
            // Use the first method as default or 'execute' if exists
            const methodName = skill.methods[0]?.name || 'execute';
            const result = await this.invoke(skillName, methodName, parameters);
            return { success: true, result };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
    /**
     * Invoke a skill method
     */
    async invoke(skillId, methodName, parameters) {
        const skill = this.skills.get(skillId);
        if (!skill) {
            throw new Error(`Skill not found: ${skillId}`);
        }
        const method = skill.methods.find((m) => m.name === methodName);
        if (!method) {
            throw new Error(`Method not found: ${methodName} in skill ${skillId}`);
        }
        // Validate parameters
        for (const [paramName, paramDef] of Object.entries(method.parameters)) {
            if (paramDef.required && !(paramName in parameters)) {
                throw new Error(`Required parameter missing: ${paramName}`);
            }
        }
        const startTime = Date.now();
        const invocation = {
            id: generateId(),
            skillId,
            methodName,
            parameters,
            durationMs: 0,
            timestamp: new Date().toISOString(),
        };
        try {
            // Execute the skill (mock implementation)
            const result = await this.executeSkillMethod(skill, methodName, parameters);
            invocation.result = result;
            invocation.durationMs = Date.now() - startTime;
        }
        catch (error) {
            invocation.error = error instanceof Error ? error.message : 'Unknown error';
            invocation.durationMs = Date.now() - startTime;
            throw error;
        }
        finally {
            // Record invocation
            const skillInvocations = this.invocations.get(skillId) || [];
            skillInvocations.push(invocation);
            this.invocations.set(skillId, skillInvocations);
        }
        return invocation.result;
    }
    /**
     * Execute skill method (internal)
     */
    async executeSkillMethod(skill, methodName, parameters) {
        // This is a mock implementation
        // In production, this would dynamically execute the skill code
        switch (skill.id) {
            case 'code':
                return this.executeCodeSkill(methodName, parameters);
            case 'search':
                return this.executeSearchSkill(methodName, parameters);
            case 'analytics':
                return this.executeAnalyticsSkill(methodName, parameters);
            case 'review':
                return this.executeReviewSkill(methodName, parameters);
            default:
                return { success: true, message: `Executed ${skill.id}.${methodName}` };
        }
    }
    /**
     * Execute code-related skill
     */
    async executeCodeSkill(method, params) {
        switch (method) {
            case 'generate':
                return { code: '// Generated code placeholder', language: params.language };
            case 'review':
                return { issues: [], suggestions: ['Add more comments'] };
            case 'refactor':
                return { code: params.code, changes: ['Refactored'] };
            default:
                return { error: 'Unknown method' };
        }
    }
    /**
     * Execute search-related skill
     */
    async executeSearchSkill(method, _params) {
        switch (method) {
            case 'web':
                return { results: [{ title: 'Search result', url: 'https://example.com' }] };
            case 'code':
                return { results: [{ file: 'example.ts', matches: [] }] };
            case 'docs':
                return { results: [{ title: 'Documentation', content: '...' }] };
            default:
                return { error: 'Unknown method' };
        }
    }
    /**
     * Execute analytics-related skill
     */
    async executeAnalyticsSkill(method, _params) {
        switch (method) {
            case 'analyze':
                return { insights: ['Trend detected'], metrics: {} };
            case 'predict':
                return { prediction: 'Future value', confidence: 0.85 };
            default:
                return { error: 'Unknown method' };
        }
    }
    /**
     * Execute review-related skill
     */
    async executeReviewSkill(method, _params) {
        switch (method) {
            case 'code':
                return { approved: true, comments: ['Looks good'] };
            case 'test':
                return { passed: true, coverage: 0.9 };
            default:
                return { error: 'Unknown method' };
        }
    }
    /**
     * Get invocation history for a skill
     */
    getInvocations(skillId) {
        return this.invocations.get(skillId) || [];
    }
    /**
     * Check if skill exists
     */
    has(skillId) {
        return this.skills.has(skillId);
    }
    /**
     * Register default skills
     */
    registerDefaultSkills() {
        // Code skill
        this.register({
            id: 'code',
            name: 'Code Assistant',
            description: 'Code generation, review, and refactoring',
            methods: [
                {
                    name: 'generate',
                    description: 'Generate code from description',
                    parameters: {
                        description: { type: 'string', description: 'What to generate', required: true },
                        language: { type: 'string', description: 'Programming language', required: true },
                    },
                    returns: { type: 'object' },
                },
                {
                    name: 'review',
                    description: 'Review code for issues',
                    parameters: {
                        code: { type: 'string', description: 'Code to review', required: true },
                    },
                    returns: { type: 'object' },
                },
            ],
            requires: [],
            permissions: ['code:read', 'code:write'],
        });
        // Search skill
        this.register({
            id: 'search',
            name: 'Search',
            description: 'Web and code search capabilities',
            methods: [
                {
                    name: 'web',
                    description: 'Search the web',
                    parameters: {
                        query: { type: 'string', description: 'Search query', required: true },
                    },
                    returns: { type: 'object' },
                },
            ],
            requires: [],
            permissions: ['web:search'],
        });
        // Analytics skill
        this.register({
            id: 'analytics',
            name: 'Analytics',
            description: 'Data analysis and insights',
            methods: [
                {
                    name: 'analyze',
                    description: 'Analyze data',
                    parameters: {
                        data: { type: 'object', description: 'Data to analyze', required: true },
                    },
                    returns: { type: 'object' },
                },
            ],
            requires: [],
            permissions: ['data:read'],
        });
        // Review skill
        this.register({
            id: 'review',
            name: 'Review',
            description: 'Code and content review',
            methods: [
                {
                    name: 'code',
                    description: 'Review code',
                    parameters: {
                        code: { type: 'string', description: 'Code to review', required: true },
                    },
                    returns: { type: 'object' },
                },
            ],
            requires: [],
            permissions: ['code:read'],
        });
        // Skill Creator skill
        this.register({
            id: 'skill-creator',
            name: 'Skill Creator',
            description: 'Analyzes skill requests, enhances them, and generates complete skill definitions with documentation',
            methods: [
                {
                    name: 'analyze',
                    description: 'Analyze a skill request and provide enhancement suggestions',
                    parameters: {
                        description: { type: 'string', description: 'What the skill should do', required: true },
                        purpose: { type: 'string', description: 'Why this skill is needed', required: false },
                        targetUsers: { type: 'array', description: 'Who will use this skill', required: false },
                    },
                    returns: { type: 'object', description: 'Analysis result with improvements and suggestions' },
                },
                {
                    name: 'create',
                    description: 'Create a complete skill from a request',
                    parameters: {
                        request: { type: 'object', description: 'Skill request details', required: true },
                    },
                    returns: { type: 'object', description: 'Complete skill schema and markdown documentation' },
                },
                {
                    name: 'enhance',
                    description: 'Enhance an existing skill request with missing details',
                    parameters: {
                        description: { type: 'string', description: 'Original skill description', required: true },
                    },
                    returns: { type: 'object', description: 'Enhanced description with improvements' },
                },
            ],
            requires: ['core'],
            permissions: ['skill:read', 'skill:write'],
        });
    }
    /**
     * Register the skill-creator
     */
    _registerSkillCreator() {
        // This is a placeholder for runtime registration
        // The skill-creator is registered above in registerDefaultSkills
        void this;
    }
    /**
     * Get skill usage stats
     */
    getStats() {
        const allInvocations = Array.from(this.invocations.values()).flat();
        const totalDuration = allInvocations.reduce((sum, i) => sum + i.durationMs, 0);
        return {
            totalSkills: this.skills.size,
            totalInvocations: allInvocations.length,
            averageDurationMs: allInvocations.length > 0 ? totalDuration / allInvocations.length : 0,
        };
    }
}
/**
 * Global skill registry instance
 */
export const skillRegistry = new SkillRegistry();
