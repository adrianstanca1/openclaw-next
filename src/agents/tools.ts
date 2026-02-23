/**
 * OpenClaw Next - Tool Orchestrator
 * The central bridge between Agent Intent and System Execution.
 */

import { SystemTools } from '../tools/definitions/system.js';
import { VoiceTools } from '../tools/definitions/voice.js';
import { toolSynthesizer } from '../tools/synthesizer.js';
import { skillRegistry } from './skills.js';

export interface ExecutionContext {
  agentId: string;
  workspace: string;
  approvalGranted?: boolean;
}

export class ToolOrchestrator {
  
  /**
   * Execute a requested tool action
   */
  async executeTool(
    agentId: string,
    toolName: string,
    input: any,
    options: { requireApproval: boolean }
  ): Promise<{ success: boolean; output?: any; error?: string }> {
    
    console.log(`[Orchestrator] Agent ${agentId} invoking ${toolName}...`);

    // 1. Context Setup
    const ctx: ExecutionContext = {
      agentId,
      workspace: `./workspace/agents/${agentId}`
    };

    // Ensure workspace exists
    await this.ensureWorkspace(ctx.workspace);

    // 2. Security Check (Innovation: Dynamic Permissions)
    if (options.requireApproval && !ctx.approvalGranted) {
      console.warn(`[Orchestrator] 🛑 Tool ${toolName} requires approval. Pausing execution.`);
      return { 
        success: false, 
        error: 'APPROVAL_REQUIRED', 
        output: { tool: toolName, reason: "High-risk action requires user confirmation." } 
      };
    }

    try {
      // 3. Routing Logic
      
      // A. System Tools (Bash, File, Browser)
      if (toolName === 'bash_exec') return await SystemTools.bash_exec(input.command, ctx);
      if (toolName === 'file_write') return await SystemTools.file_write(input.path, input.content, ctx);
      if (toolName === 'file_read') return await SystemTools.file_read(input.path, ctx);
      if (toolName === 'web_search') return await SystemTools.browser_search(input.query);
      if (toolName === 'ssh_exec') return await SystemTools.ssh_exec(input.host, input.command, input.keyPath);
      
      // B. Voice Tools
      if (toolName === 'speak') return await VoiceTools.speak(input.text);
      
      // C. Meta-Tools (Self-Evolution)
      if (toolName === 'create_skill') {
        const success = await toolSynthesizer.synthesize(input.id, input.code, input.definition);
        return { success };
      }

      // D. Registered Skills (Plugins/Extensions)
      // if (skillRegistry.has(toolName)) { ... }

      return { success: false, error: `Tool ${toolName} not found.` };

    } catch (error) {
      console.error(`[Orchestrator] Execution failed:`, error);
      return { success: false, error: (error as Error).message };
    }
  }

  private async ensureWorkspace(path: string) {
    const fs = await import('fs');
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  }
}

export const toolOrchestrator = new ToolOrchestrator();
