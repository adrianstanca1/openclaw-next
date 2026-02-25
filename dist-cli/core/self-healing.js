/**
 * OpenClaw Next - Self-Healing System
 * "Never Die" Architecture - Autonomous Recovery & Optimization
 *
 * Features:
 * - Agent auto-respawn on failure
 * - Connection failover (local <-> cloud)
 * - Memory persistence & recovery
 * - Health monitoring with auto-remediation
 * - Resource optimization
 */
import { EventEmitter } from "events";
import { AgentManager } from "../agents/manager.js";
import { MemoryManager } from "../memory/manager.js";
import { configManager } from "./config.js";
import { ollamaClient } from "./ollama.js";
import { AgentRole, AgentCapability } from "./types.js";
import { generateId } from "./utils.js";
export class SelfHealingSystem extends EventEmitter {
    agentManager;
    memoryManager;
    healthCheckInterval = null;
    isRunning = false;
    recoveryHistory = [];
    metrics = {
        agentCount: 0,
        activeAgents: 0,
        failedAgents: 0,
        memoryUsage: 0,
        ollamaConnected: false,
        ollamaMode: "unavailable",
        apiServerRunning: false,
        uptime: 0,
        recoveryCount: 0,
    };
    constructor(agentManager, memoryManager) {
        super();
        this.agentManager = agentManager;
        this.memoryManager = memoryManager;
    }
    /**
     * Start the self-healing system
     */
    start() {
        if (this.isRunning)
            return;
        console.log("[Self-Healing] Starting never-die system...");
        this.isRunning = true;
        this.metrics.uptime = Date.now();
        // Start health monitoring (every 30 seconds)
        this.healthCheckInterval = setInterval(() => this.healthCheck(), 30000);
        // Initial health check
        this.healthCheck();
        this.emit("started", { timestamp: new Date().toISOString() });
    }
    /**
     * Stop the self-healing system
     */
    stop() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
        this.isRunning = false;
        this.emit("stopped", { timestamp: new Date().toISOString() });
    }
    /**
     * Main health check loop
     */
    async healthCheck() {
        console.log("[Self-Healing] Running health check...");
        try {
            // 1. Check Ollama connection
            const ollamaStatus = await ollamaClient.checkConnection();
            this.metrics.ollamaConnected = ollamaStatus.connected;
            this.metrics.ollamaMode = ollamaStatus.mode;
            // 2. Auto-failover if local Ollama is down
            if (!ollamaStatus.connected && ollamaStatus.mode === "unavailable") {
                await this.attemptOllamaFailover();
            }
            // 3. Check agent health
            const agents = this.agentManager.getAllAgents();
            this.metrics.agentCount = agents.length;
            this.metrics.activeAgents = agents.filter((a) => a.state === "active").length;
            this.metrics.failedAgents = agents.filter((a) => a.state === "error").length;
            // 4. Auto-respawn failed agents
            for (const agent of agents) {
                if (agent.state === "error") {
                    await this.attemptAgentRespawn(agent.id);
                }
            }
            // 5. Check memory usage
            const memUsage = process.memoryUsage();
            this.metrics.memoryUsage = Math.round(memUsage.heapUsed / 1024 / 1024);
            // 6. Auto-scale if memory is too high
            if (this.metrics.memoryUsage > 500) {
                // 500MB threshold
                await this.attemptMemoryOptimization();
            }
            // 7. Ensure minimum agents are running
            await this.ensureMinimumAgents();
            this.emit("health_check", { ...this.metrics, timestamp: new Date().toISOString() });
        }
        catch (error) {
            console.error("[Self-Healing] Health check failed:", error);
            this.emit("error", { error, timestamp: new Date().toISOString() });
        }
    }
    /**
     * Attempt Ollama failover from local to cloud
     */
    async attemptOllamaFailover() {
        console.log("[Self-Healing] Ollama disconnected, attempting failover...");
        const config = configManager.get();
        // Try cloud if available
        if (config.ollama.cloud?.enabled && config.ollama.cloud.apiKey) {
            console.log("[Self-Healing] Switching to Ollama Cloud...");
            const newConfig = {
                ...config.ollama,
                local: { ...config.ollama.local, enabled: false },
                cloud: config.ollama.cloud ? { ...config.ollama.cloud, enabled: true } : undefined,
            };
            configManager.set("ollama", newConfig);
            ollamaClient.updateConfig(newConfig);
            const status = await ollamaClient.checkConnection();
            this.recordRecovery({
                type: "switch_ollama",
                target: "ollama-endpoint",
                reason: "Local Ollama unavailable, switched to cloud",
                timestamp: new Date().toISOString(),
                success: status.connected,
            });
            if (status.connected) {
                console.log("[Self-Healing] Successfully switched to Ollama Cloud");
                this.emit("failover", { from: "local", to: "cloud" });
            }
        }
        else {
            // Try restarting local Ollama connection
            console.log("[Self-Healing] Cloud not available, retrying local connection...");
            const retryConfig = {
                ...config.ollama,
                local: { ...config.ollama.local, enabled: true },
                cloud: config.ollama.cloud ? { ...config.ollama.cloud, enabled: false } : undefined,
            };
            configManager.set("ollama", retryConfig);
            ollamaClient.updateConfig(retryConfig);
        }
    }
    /**
     * Attempt to respawn a failed agent
     */
    async attemptAgentRespawn(agentId) {
        console.log(`[Self-Healing] Attempting to respawn failed agent: ${agentId}`);
        try {
            const agents = this.agentManager.getAllAgents();
            const failedAgent = agents.find((a) => a.id === agentId);
            if (!failedAgent) {
                console.log(`[Self-Healing] Agent ${agentId} not found, spawning new one`);
                // Spawn a replacement with valid AgentConfig
                const agentConfig = {
                    id: generateId("agent"),
                    name: `Auto-Respawn-${agentId.split("-")[1] || "Agent"}`,
                    model: "llama3.2",
                    role: "worker",
                    workspace: "/tmp",
                    skills: [],
                    tools: [],
                    capabilities: ["reasoning"],
                };
                await this.agentManager.spawnAgent(agentConfig);
                this.recordRecovery({
                    type: "respawn_agent",
                    target: agentId,
                    reason: "Agent not found, spawned replacement",
                    timestamp: new Date().toISOString(),
                    success: true,
                });
                return;
            }
            // Try to resume if suspended
            if (failedAgent.state === "error" || failedAgent.state === "suspended") {
                await this.agentManager.resumeAgent(agentId);
                this.recordRecovery({
                    type: "respawn_agent",
                    target: agentId,
                    reason: `Resumed agent from ${failedAgent.state} state`,
                    timestamp: new Date().toISOString(),
                    success: true,
                });
            }
        }
        catch (error) {
            console.error(`[Self-Healing] Failed to respawn agent ${agentId}:`, error);
            this.recordRecovery({
                type: "respawn_agent",
                target: agentId,
                reason: `Respawn failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                timestamp: new Date().toISOString(),
                success: false,
            });
        }
    }
    /**
     * Ensure minimum number of agents are running
     */
    async ensureMinimumAgents() {
        const MIN_AGENTS = 1; // Always keep at least 1 agent alive
        const agents = this.agentManager.getAllAgents();
        const activeAgents = agents.filter((a) => a.state === "active" || a.state === "idle");
        if (activeAgents.length < MIN_AGENTS) {
            console.log("[Self-Healing] Below minimum agents, spawning backup...");
            const guardianConfig = {
                id: generateId("agent"),
                name: "Guardian-Agent",
                model: "llama3.2",
                role: AgentRole.OPERATOR,
                capabilities: [AgentCapability.TOOL_USE, AgentCapability.COMMUNICATION],
                workspace: "/tmp",
                skills: [],
                tools: [],
            };
            await this.agentManager.spawnAgent(guardianConfig);
            this.recordRecovery({
                type: "respawn_agent",
                target: "guardian-agent",
                reason: "Below minimum agent count",
                timestamp: new Date().toISOString(),
                success: true,
            });
        }
    }
    /**
     * Attempt memory optimization
     */
    async attemptMemoryOptimization() {
        console.log("[Self-Healing] High memory usage detected, optimizing...");
        try {
            // 1. Clear old short-term memories
            // 2. Compact agent contexts
            // 3. Force garbage collection if available
            if (global.gc) {
                global.gc();
                console.log("[Self-Healing] Garbage collection triggered");
            }
            this.recordRecovery({
                type: "clear_memory",
                target: "system",
                reason: `High memory usage: ${this.metrics.memoryUsage}MB`,
                timestamp: new Date().toISOString(),
                success: true,
            });
            this.emit("memory_optimized", { usageBefore: this.metrics.memoryUsage });
        }
        catch (error) {
            console.error("[Self-Healing] Memory optimization failed:", error);
        }
    }
    /**
     * Record a recovery action
     */
    recordRecovery(action) {
        this.recoveryHistory.push(action);
        this.metrics.recoveryCount++;
        this.metrics.lastRecovery = action.timestamp;
        // Keep only last 100 actions
        if (this.recoveryHistory.length > 100) {
            this.recoveryHistory.shift();
        }
        this.emit("recovery", action);
    }
    /**
     * Get current health metrics
     */
    getMetrics() {
        return { ...this.metrics };
    }
    /**
     * Get recovery history
     */
    getRecoveryHistory(limit = 10) {
        return this.recoveryHistory.slice(-limit);
    }
    /**
     * Trigger manual recovery
     */
    async triggerRecovery() {
        console.log("[Self-Healing] Manual recovery triggered");
        await this.healthCheck();
    }
}
// Export singleton instance
export const selfHealingSystem = new SelfHealingSystem(new AgentManager(), new MemoryManager());
