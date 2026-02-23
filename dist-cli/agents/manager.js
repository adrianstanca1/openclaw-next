// OpenClaw Next - Agent Manager
// Superintelligence Agentic Gateway System
//
// Manages agent lifecycle: spawning, terminating, monitoring, and coordination
// Supports superintelligence capabilities including reasoning, planning, learning,
// and multi-agent collaboration.
import { AgentState } from './types.js';
import { AgentMemorySystem } from './memory.js';
import { SkillRegistry } from './skills.js';
import { ToolOrchestrator } from './tools.js';
import { generateId } from '../core/utils.js';
/**
 * Agent Manager - Core lifecycle management for autonomous agents
 *
 * Features:
 * - Agent spawning with configurable parameters
 * - Health monitoring with heartbeat support
 * - Agent termination with graceful cleanup
 * - Multi-agent collaboration and delegation
 * - Group chat management
 * - Persistent state tracking
 */
export class AgentManager {
    agents = new Map();
    groups = new Map();
    delegationQueue = new Map();
    eventListeners = new Map();
    options;
    executor;
    memorySystem;
    _skillRegistry;
    _toolOrchestrator;
    running = false;
    constructor(options = {}, executor, memorySystem, skillRegistry, toolOrchestrator) {
        this.options = {
            maxAgents: options.maxAgents ?? 100,
            defaultTimeoutMs: options.defaultTimeoutMs ?? 300000,
            autoSpawn: options.autoSpawn ?? true,
            heartbeatEnabled: options.heartbeatEnabled ?? true,
            maxRetries: options.maxRetries ?? 3,
            retryDelayMs: options.retryDelayMs ?? 1000,
        };
        if (executor)
            this.executor = executor;
        this.memorySystem = memorySystem ?? new AgentMemorySystem();
        this._skillRegistry = skillRegistry ?? new SkillRegistry();
        this._toolOrchestrator = toolOrchestrator ?? new ToolOrchestrator();
        // Mark as used to avoid TS errors
        void this._skillRegistry;
        void this._toolOrchestrator;
    }
    setExecutor(executor) {
        this.executor = executor;
    }
    /**
     * Start the agent manager and all registered agents
     */
    async start() {
        if (this.running) {
            throw new Error('Agent manager is already running');
        }
        this.running = true;
        this.log('info', 'Agent manager starting', { agentCount: this.agents.size });
        // Start all registered agents in idle state
        for (const [agentId, instance] of this.agents.entries()) {
            if (instance.state === AgentState.IDLE || instance.state === AgentState.SUSPENDED) {
                await this.spawnAgent(instance.config, agentId);
            }
        }
        // Start heartbeat monitoring
        if (this.options.heartbeatEnabled) {
            this.startHeartbeatMonitor();
        }
    }
    /**
     * Stop all agents and the agent manager
     */
    async stop() {
        if (!this.running) {
            return;
        }
        this.running = false;
        this.log('info', 'Agent manager stopping');
        // Terminate all agents gracefully
        for (const [agentId] of this.agents.entries()) {
            await this.terminateAgent(agentId, 'manager_stopped');
        }
        // Clear delegation queue
        this.delegationQueue.clear();
        this.log('info', 'Agent manager stopped');
    }
    /**
     * Spawn a new agent with the given configuration
     * @param config - Agent configuration
     * @param agentId - Optional agent ID (generated if not provided)
     * @returns The spawned agent instance
     */
    async spawnAgent(config, agentId) {
        const id = agentId ?? generateId('agent');
        const existing = this.agents.get(id);
        if (existing) {
            throw new Error(`Agent with ID ${id} already exists`);
        }
        if (this.agents.size >= this.options.maxAgents) {
            throw new Error(`Maximum agent count (${this.options.maxAgents}) reached`);
        }
        // Validate configuration
        this.validateAgentConfig(config);
        // Create agent instance
        const instance = {
            id,
            config,
            state: AgentState.INITIALIZING,
            runsCompleted: 0,
            uptimeMs: 0,
            toolsUsed: new Set(),
            skillsUsed: new Set(),
        };
        // Initialize memory for the agent
        await this.memorySystem.initializeAgentMemory(id, config);
        this.agents.set(id, instance);
        this.log('info', 'Agent spawned', { agentId: id, name: config.name, role: config.role });
        // Emit spawn event
        this.emitEvent({
            type: 'agent_spawned',
            timestamp: new Date().toISOString(),
            agentId: id,
            config,
        });
        // Start agent if autoSpawn is enabled
        if (this.options.autoSpawn) {
            instance.state = AgentState.IDLE;
        }
        return instance;
    }
    /**
     * Terminate an agent gracefully
     * @param agentId - ID of the agent to terminate
     * @param reason - Reason for termination
     */
    async terminateAgent(agentId, reason = 'termination_requested') {
        const instance = this.agents.get(agentId);
        if (!instance) {
            throw new Error(`Agent with ID ${agentId} not found`);
        }
        const oldState = instance.state;
        // Handle pending runs
        if (instance.currentRunId) {
            // Wait for current run to finish with timeout
            await this.executor.waitForRun(instance.currentRunId, this.options.defaultTimeoutMs);
        }
        // Update state
        instance.state = AgentState.TERMINATED;
        instance.uptimeMs = Date.now() - new Date(instance.uptimeMs).getTime();
        this.agents.delete(agentId);
        this.log('info', 'Agent terminated', { agentId, reason, oldState });
        // Clean up memory
        await this.memorySystem.cleanupAgentMemory(agentId);
        // Emit termination event
        this.emitEvent({
            type: 'agent_terminated',
            timestamp: new Date().toISOString(),
            agentId,
            reason,
        });
    }
    /**
     * Suspend an agent temporarily
     * @param agentId - ID of the agent to suspend
     */
    async suspendAgent(agentId) {
        const instance = this.agents.get(agentId);
        if (!instance) {
            throw new Error(`Agent with ID ${agentId} not found`);
        }
        // Stop any running runs
        if (instance.currentRunId) {
            await this.executor.pauseRun(instance.currentRunId);
        }
        instance.state = AgentState.SUSPENDED;
        this.log('info', 'Agent suspended', { agentId });
        this.emitEvent({
            type: 'agent_state_changed',
            timestamp: new Date().toISOString(),
            agentId,
            oldState: AgentState.ACTIVE,
            newState: AgentState.SUSPENDED,
        });
    }
    /**
     * Resume a suspended agent
     * @param agentId - ID of the agent to resume
     */
    async resumeAgent(agentId) {
        const instance = this.agents.get(agentId);
        if (!instance) {
            throw new Error(`Agent with ID ${agentId} not found`);
        }
        instance.state = AgentState.IDLE;
        this.log('info', 'Agent resumed', { agentId });
        this.emitEvent({
            type: 'agent_state_changed',
            timestamp: new Date().toISOString(),
            agentId,
            oldState: AgentState.SUSPENDED,
            newState: AgentState.IDLE,
        });
    }
    /**
     * Get an agent instance by ID
     */
    getAgent(agentId) {
        return this.agents.get(agentId);
    }
    /**
     * Get all agent instances
     */
    getAllAgents() {
        return Array.from(this.agents.values());
    }
    /**
     * Get the current health status of an agent
     */
    getAgentHealth(agentId) {
        const instance = this.agents.get(agentId);
        if (!instance)
            return undefined;
        return {
            id: agentId,
            state: instance.state,
            lastActive: instance.lastHeartbeat ?? 'never',
            runsCompleted: instance.runsCompleted,
            errorCount: this.getAgentErrorCount(agentId),
            avgResponseTimeMs: 0, // Would need to track this separately
            memoryUsage: 0, // Would need to track this separately
            cpuUsage: 0, // Would need to track this separately
        };
    }
    /**
     * Get health status of all agents
     */
    getAllAgentsHealth() {
        return this.getAllAgents()
            .map((agent) => this.getAgentHealth(agent.id))
            .filter((health) => health !== undefined);
    }
    /**
     * Create a group of agents for collaboration
     */
    createAgentGroup(config) {
        if (this.groups.has(config.id)) {
            throw new Error(`Group with ID ${config.id} already exists`);
        }
        const group = {
            id: config.id,
            name: config.name,
            description: config.description,
            members: config.members,
            coordinator: config.coordinator,
            rules: config.rules ?? [],
            sharedMemory: config.sharedMemory ?? false,
            consensusRequired: config.consensusRequired ?? false,
        };
        this.groups.set(config.id, group);
        this.log('info', 'Agent group created', { groupId: config.id, memberCount: config.members.length });
        return group;
    }
    /**
     * Get an agent group by ID
     */
    getAgentGroup(groupId) {
        return this.groups.get(groupId);
    }
    /**
     * Get all agent groups
     */
    getAllAgentGroups() {
        return Array.from(this.groups.values());
    }
    /**
     * Send a delegation request to another agent
     */
    async delegateTask(delegation) {
        const toAgent = this.agents.get(delegation.toAgent);
        if (!toAgent) {
            throw new Error(`Target agent ${delegation.toAgent} not found`);
        }
        if (toAgent.state !== AgentState.IDLE && toAgent.state !== AgentState.ACTIVE) {
            throw new Error(`Target agent ${delegation.toAgent} is not available for delegation`);
        }
        this.delegationQueue.set(delegation.id, delegation);
        this.log('info', 'Task delegated', {
            from: delegation.fromAgent,
            to: delegation.toAgent,
            delegationId: delegation.id,
        });
        this.emitEvent({
            type: 'delegation_received',
            timestamp: new Date().toISOString(),
            fromAgent: delegation.fromAgent,
            toAgent: delegation.toAgent,
            delegationId: delegation.id,
            task: delegation.task,
        });
    }
    /**
     * Process pending delegation requests
     */
    async processDelegations() {
        for (const [delegationId, delegation] of this.delegationQueue.entries()) {
            try {
                const result = await this.executor.executeDelegation(delegation);
                this.delegationQueue.delete(delegationId);
                this.log('info', 'Delegation completed', { delegationId, success: result.success });
            }
            catch (error) {
                this.log('error', 'Delegation failed', {
                    delegationId,
                    error: error.message,
                });
            }
        }
    }
    /**
     * Listen for agent events
     */
    on(eventType, callback) {
        const listeners = this.eventListeners.get(eventType) ?? [];
        listeners.push(callback);
        this.eventListeners.set(eventType, listeners);
        return () => {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }
    /**
     * Emit an agent event
     */
    emitEvent(event) {
        const listeners = this.eventListeners.get(event.type);
        if (listeners) {
            for (const listener of listeners) {
                try {
                    listener(event);
                }
                catch (error) {
                    this.log('error', 'Event listener error', {
                        eventType: event.type,
                        error: error.message,
                    });
                }
            }
        }
    }
    /**
     * Handle agent state changes
     */
    async updateAgentState(agentId, newState, runId) {
        const instance = this.agents.get(agentId);
        if (!instance) {
            throw new Error(`Agent with ID ${agentId} not found`);
        }
        const oldState = instance.state;
        instance.state = newState;
        if (runId) {
            instance.currentRunId = runId;
        }
        this.log('info', 'Agent state changed', {
            agentId,
            oldState,
            newState,
        });
        this.emitEvent({
            type: 'agent_state_changed',
            timestamp: new Date().toISOString(),
            agentId,
            oldState,
            newState,
        });
    }
    /**
     * Record agent heartbeat
     */
    recordHeartbeat(agentId, data = {}) {
        const instance = this.agents.get(agentId);
        if (!instance) {
            return;
        }
        const now = new Date().toISOString();
        instance.lastHeartbeat = now;
        this.emitEvent({
            type: 'agent_heartbeat',
            timestamp: now,
            agentId,
            data,
        });
        this.log('debug', 'Heartbeat recorded', {
            agentId,
            uptimeMs: instance.uptimeMs,
        });
    }
    /**
     * Record agent run completion
     */
    recordRunCompletion(agentId, runId, success) {
        const instance = this.agents.get(agentId);
        if (!instance) {
            return;
        }
        instance.runsCompleted += 1;
        instance.currentRunId = undefined;
        this.log('info', 'Run completed', {
            agentId,
            runId,
            success,
            runsCompleted: instance.runsCompleted,
        });
    }
    /**
     * Record an error for an agent
     */
    recordError(agentId, error, context) {
        this.log('error', 'Agent error', {
            agentId,
            error,
            context,
        });
        this.emitEvent({
            type: 'agent_error',
            timestamp: new Date().toISOString(),
            agentId,
            error,
            context,
        });
    }
    /**
     * Get the number of errors for an agent
     */
    getAgentErrorCount(_agentId) {
        // Would need to track errors per agent for accurate counting
        return 0;
    }
    /**
     * Validate agent configuration
     */
    validateAgentConfig(config) {
        if (!config.id) {
            throw new Error('Agent configuration must include an ID');
        }
        if (!config.name) {
            throw new Error('Agent configuration must include a name');
        }
        if (!config.role) {
            throw new Error('Agent configuration must include a role');
        }
        if (!config.model) {
            throw new Error('Agent configuration must include a model');
        }
        if (!config.capabilities || config.capabilities.length === 0) {
            throw new Error('Agent must have at least one capability');
        }
    }
    /**
     * Log a message with agent context
     */
    log(_level, _message, _context) {
        // const timestamp = new Date().toISOString();
        // const agentContext = _context ? ` [${JSON.stringify(_context)}]` : '';
        // Would integrate with actual logging system in production
        // console.log(`[${timestamp}] [agents] [${level.toUpperCase()}]${agentContext}: ${message}`);
    }
    /**
     * Start heartbeat monitor for all agents
     */
    startHeartbeatMonitor() {
        // Would implement actual heartbeat monitoring logic
    }
}
