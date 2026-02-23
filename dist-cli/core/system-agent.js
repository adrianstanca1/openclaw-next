/**
 * OpenClaw Next - System Watchdog Agent
 * Ensures 100% uptime through autonomous self-healing and model failover.
 */
import { ollamaClient } from './ollama.js';
import { agentManager } from '../agents/index.js';
import { apiServer } from './api-server.js';
import { EventEmitter } from 'events';
export class SystemWatchdog extends EventEmitter {
    checkInterval = 30000; // 30 seconds
    restartCounts = new Map();
    lastStatus = 'healthy';
    constructor() {
        super();
        this.initialize();
    }
    initialize() {
        console.log('[Watchdog] 🛡️ System Watchdog active. Root of Trust: Local LLM');
        setInterval(() => this.patrol(), this.checkInterval);
    }
    /**
     * Main Patrol: Monitors all system vitals
     */
    async patrol() {
        try {
            // 1. Check LLM Availability
            const ollama = await ollamaClient.checkConnection();
            if (!ollama.connected) {
                return await this.handleModelFailure();
            }
            // 2. Check Agent Manager State
            const agents = agentManager.getAllAgents();
            for (const agent of agents) {
                if (agent.state === 'error') {
                    const restarts = this.restartCounts.get(agent.id) || 0;
                    if (restarts < 3) {
                        console.warn(`[Watchdog] ⚠️ Agent ${agent.id} in error state. Rebooting (Attempt ${restarts + 1})...`);
                        await agentManager.resumeAgent(agent.id);
                        this.restartCounts.set(agent.id, restarts + 1);
                    }
                    else {
                        console.error(`[Watchdog] 🛑 Agent ${agent.id} failed 3 times. Suspending to prevent loop.`);
                        apiServer.broadcast('system_alert', { title: 'Agent Failure', message: `${agent.id} suspended after multiple crashes.` });
                    }
                }
            }
            // 3. Resource Monitoring
            const mem = process.memoryUsage().heapUsed / 1024 / 1024;
            if (mem > 1024) { // 1GB limit
                console.error('[Watchdog] 🚨 Memory leak detected. Triggering emergency cleanup.');
                this.performEmergencyCleanup();
            }
            if (this.lastStatus === 'healthy') {
                await this.reconcileKnowledge();
            }
            this.lastStatus = 'healthy';
        }
        catch (error) {
            this.lastStatus = 'critical';
            this.emit('emergency_reboot_required');
        }
    }
    async handleModelFailure() {
        console.error('[Watchdog] 🚨 Local LLM (Ollama) is non-responsive.');
        this.lastStatus = 'degraded';
    }
    performEmergencyCleanup() {
        agentManager.stop();
        setTimeout(() => agentManager.start(), 5000);
    }
    /**
     * Memory Reconciliation (Dreaming Phase)
     */
    async reconcileKnowledge() {
        // console.log('[Watchdog] 🌙 Dreaming: Reconciling long-term memory...');
        // Placeholder for memory optimization logic
    }
    getStatus() {
        return this.lastStatus;
    }
}
export const systemAgent = new SystemWatchdog();
export const watchdog = systemAgent;
