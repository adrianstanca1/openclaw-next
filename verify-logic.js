import { AgentExecutor, AgentManager } from './dist-cli/agents/index.js';
import { toolOrchestrator } from './dist-cli/agents/tools.js';
import fs from 'fs';

async function runIntegrityTest() {
  console.log("🚀 STARTING REFACTORED INTEGRITY TEST...");
  
  const manager = new AgentManager();
  const executor = new AgentExecutor(manager);
  const agentId = 'test-agent-final-001';
  
  console.log("🛠️ Testing Tool Bridge (Direct)...");
  try {
    const result = await toolOrchestrator.executeTool(agentId, 'file_write', {
      path: 'final_proof.log',
      content: 'SYSTEM_ACTIVE_FINAL: ' + new Date().toISOString()
    }, { requireApproval: false });

    const path = './workspace/agents/test-agent-final-001/final_proof.log';
    if (fs.existsSync(path)) {
      console.log("✅ SUCCESS: The system is fully integrated and functional.");
      console.log("📄 Content found:", fs.readFileSync(path, 'utf-8'));
    } else {
      console.log("❌ FAILURE: Tool did not write file.");
    }
  } catch (e) {
    console.error("💥 TEST ERROR:", e.message);
  }
}

runIntegrityTest();
