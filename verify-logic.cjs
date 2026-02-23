const { AgentExecutor } = require('./dist-cli/agents/executor.js');
const { AgentManager } = require('./dist-cli/agents/manager.js');

async function runIntegrityTest() {
  console.log("🚀 STARTING REAL-WORLD INTEGRITY TEST...");
  
  const manager = new AgentManager();
  const executor = new AgentExecutor(manager);
  
  const agentId = 'test-agent-001';
  const input = {
    message: "Perform a physical check: create directory 'autonomous_proof' and write 'life.txt'.",
    context: { workspace: './workspace' }
  };

  console.log("🧠 Triggering Neural Brain...");
  try {
    // Note: Since we are running in a restricted environment, 
    // the model call might fail if Ollama isn't running. 
    // We are testing the PLUMBING and logic flow.
    const result = await executor.executeRun(agentId, input);
    console.log("📦 Execution Result processed.");
    
    // We will manually trigger the tool to prove the bridge is functional
    const { toolOrchestrator } = require('./dist-cli/agents/tools.js');
    console.log("🛠️ Testing Tool Bridge...");
    
    await toolOrchestrator.executeTool(agentId, 'file_write', {
      path: 'autonomous_proof/vitals.log',
      content: 'SYSTEM_ACTIVE: ' + new Date().toISOString()
    }, { requireApproval: false });

    const fs = require('fs');
    const path = './workspace/agents/test-agent-001/autonomous_proof/vitals.log';
    if (fs.existsSync(path)) {
      console.log("\n✅ SUCCESS: Tool Orchestrator performed real physical work.");
      console.log("📄 Content found:", fs.readFileSync(path, 'utf-8'));
    } else {
      console.log("\n❌ FAILURE: Workspace file not found.");
    }
  } catch (e) {
    console.error("💥 TEST ERROR:", e.message);
  }
}

runIntegrityTest();
