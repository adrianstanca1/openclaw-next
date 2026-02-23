/**
 * OpenClaw Next - Definitive Agent Execution Engine
 */

import type { AgentRun, RunInput } from './types.js';
import { AgentState } from './types.js';
import { AgentManager } from './manager.js';
import { toolOrchestrator } from './tools.js';
import { memoryManager } from '../memory/index.js';
import { 
  modelGateway, 
  generateId, 
  taskAnalyst, 
  apiServer
} from '../core/index.js';

export class AgentExecutor {
  private activeRuns: Map<string, AgentRun> = new Map();

  constructor(private manager: AgentManager) {}

  async executeRun(agentId: string, input: RunInput): Promise<any> {
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
        } else {
          isDone = true;
          run.output = { response: content, completed: true, success: true };
        }
      }

      // 4. DISTILL
      await this.distill(agentId, run.output?.response || '', run);
      return { success: true, output: run.output };

    } catch (error) {
      return { success: false, error: (error as Error).message };
    } finally {
      this.activeRuns.delete(runId);
    }
  }

  private async getModelResponse(context: any, msg: string) {
    const res = await modelGateway.chat({
      model: 'llama3.1',
      messages: [...context.history, { role: 'user', content: msg }],
      temperature: 0.4
    });
    return res.choices[0].message.content;
  }

  private async executeAction(agentId: string, action: string, input: string): Promise<string> {
    let params = {};
    try { params = JSON.parse(input); } catch { params = { value: input }; }
    const result = await toolOrchestrator.executeTool(agentId, action, params, { requireApproval: false });
    return result.success ? (typeof result.output === 'string' ? result.output : JSON.stringify(result.output)) : `Error: ${result.error}`;
  }

  private parseResponse(content: string) {
    const thought = (content.match(/THOUGHT:(.*?)(?=ACTION:|$)/s) || [])[1]?.trim() || '';
    const action = (content.match(/ACTION:(.*?)(?=INPUT:|$)/s) || [])[1]?.trim() || null;
    const input = (content.match(/INPUT:(.*)/s) || [])[1]?.trim() || '';
    return { thought, action, input };
  }

  private async constructContext(agentId: string, input: RunInput) {
    const history = await memoryManager.getContext(input.context?.workspace || 'default');
    return { 
      systemPrompt: "THOUGHT, ACTION, INPUT loop.",
      history: history.map(m => ({ role: m.role as any, content: m.content })) 
    };
  }

  private async distill(agentId: string, response: string, run: any) {
    await memoryManager.addKnowledge({
      content: `Result for "${run.input.message}": ${response.substring(0, 50)}...`,
      category: 'learning',
      tags: ['auto'],
      confidence: 1,
      source: agentId
    });
  }

  private initializeRun(id: string, agentId: string, input: RunInput): AgentRun {
    return {
      id, agentId, sessionId: input.context?.workspace ?? 'default',
      state: AgentState.INITIALIZING, startTimestamp: new Date().toISOString(),
      input, reasoningTrace: [], actions: [], observations: [],
      memoriesCreated: [], toolsUsed: [], skillsUsed: [], metadata: {}
    };
  }

  async waitForRun(id: string, t: number) { while(this.activeRuns.has(id)) await new Promise(r => setTimeout(r, 100)); }
  async pauseRun(id: string) { const r = this.activeRuns.get(id); if(r) r.state = AgentState.WAITING; }
  async executeDelegation(d: any) { return { success: true }; }
}
