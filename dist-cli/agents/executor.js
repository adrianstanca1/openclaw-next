/**
 * OpenClaw Next - Definitive Agent Execution Engine
 */
import { AgentState } from './types.js';
import { toolOrchestrator } from './tools.js';
import { memoryManager } from '../memory/index.js';
import { modelGateway, generateId, taskAnalyst, apiServer } from '../core/index.js';
export class AgentExecutor {
    manager;
    activeRuns = new Map();
    constructor(manager) {
        this.manager = manager;
    }
    async executeRun(agentId, input) {
        const runId = generateId('run');
        const run = this.initializeRun(runId, agentId, input);
        this.activeRuns.set(runId, run);
        try {
            // 1. ANALYSIS
            apiServer.broadcast('agent_activity', { type: 'analysis', content: 'Analyzing task goals...', agentId });
            const analysis = await taskAnalyst.analyze(input.message);
            // 2. JIT CHECK
            const missing = analysis.requiredCapabilities.filter(c => c.status === 'missing');
            if (missing.length > 0) {
                apiServer.broadcast('capability_proposal', { runId, missing });
                return { success: false, status: 'paused', missing };
            }
            // 3. LOOP
            let context = await this.constructContext(agentId, input);
            let isDone = false;
            let turns = 0;
            while (!isDone && turns < 5) {
                turns++;
                const content = await this.getModelResponse(context, input.message);
                const parsed = this.parseResponse(content);
                if (parsed.action) {
                    apiServer.broadcast('agent_activity', { type: 'thought', content: parsed.thought, agentId });
                    const observation = await this.executeAction(agentId, parsed.action, parsed.input);
                    apiServer.broadcast('agent_activity', { type: 'observation', content: observation, agentId });
                    context.history.push({ role: 'assistant', content });
                    context.history.push({ role: 'user', content: `OBSERVATION: ${observation}` });
                }
                else {
                    isDone = true;
                    run.output = { response: content, completed: true, success: true };
                }
            }
            // 4. DISTILL
            await this.distill(agentId, run.output?.response || '', run);
            return { success: true, output: run.output };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
        finally {
            this.activeRuns.delete(runId);
        }
    }
    async getModelResponse(context, msg) {
        const res = await modelGateway.chat({
            model: 'llama3.1',
            messages: [...context.history, { role: 'user', content: msg }],
            temperature: 0.4
        });
        return res.choices[0].message.content;
    }
    async executeAction(agentId, action, input) {
        let params = {};
        try {
            params = JSON.parse(input);
        }
        catch {
            params = { value: input };
        }
        const result = await toolOrchestrator.executeTool(agentId, action, params, { requireApproval: false });
        return result.success ? (typeof result.output === 'string' ? result.output : JSON.stringify(result.output)) : `Error: ${result.error}`;
    }
    parseResponse(content) {
        const thought = (content.match(/THOUGHT:(.*?)(?=ACTION:|$)/s) || [])[1]?.trim() || '';
        const action = (content.match(/ACTION:(.*?)(?=INPUT:|$)/s) || [])[1]?.trim() || null;
        const input = (content.match(/INPUT:(.*)/s) || [])[1]?.trim() || '';
        return { thought, action, input };
    }
    async constructContext(agentId, input) {
        const history = await memoryManager.getContext(input.context?.workspace || 'default');
        return {
            systemPrompt: "THOUGHT, ACTION, INPUT loop.",
            history: history.map(m => ({ role: m.role, content: m.content }))
        };
    }
    async distill(agentId, response, run) {
        await memoryManager.addKnowledge({
            content: `Result for "${run.input.message}": ${response.substring(0, 50)}...`,
            category: 'learning',
            tags: ['auto'],
            confidence: 1,
            source: agentId
        });
    }
    initializeRun(id, agentId, input) {
        return {
            id, agentId, sessionId: input.context?.workspace ?? 'default',
            state: AgentState.INITIALIZING, startTimestamp: new Date().toISOString(),
            input, reasoningTrace: [], actions: [], observations: [],
            memoriesCreated: [], toolsUsed: [], skillsUsed: [], metadata: {}
        };
    }
    async waitForRun(id, t) { while (this.activeRuns.has(id))
        await new Promise(r => setTimeout(r, 100)); }
    async pauseRun(id) { const r = this.activeRuns.get(id); if (r)
        r.state = AgentState.WAITING; }
    async executeDelegation(d) { return { success: true }; }
}
