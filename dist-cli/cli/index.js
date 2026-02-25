/**
 * OpenClaw Next - CLI Entry Point
 * Starts the full autonomous ecosystem.
 */
import { AgentManager } from "../agents/manager.js";
import { SmartApiServer } from "../core/api-server.js";
import { channelManager } from "../core/channels/manager.js";
import { TelegramAdapter } from "../core/channels/providers/telegram.js";
import { configManager } from "../core/config.js";
import { daemon } from "../core/daemon.js";
export class OpenClawCLI {
    manager;
    apiServer;
    constructor() {
        this.manager = new AgentManager();
        this.apiServer = new SmartApiServer();
    }
    async run(args) {
        const command = args[0] || "start";
        if (command === "start") {
            await this.startEcosystem();
            return 0;
        }
        // ... (other commands omitted for brevity)
        console.log('Use "start" to launch the ecosystem.');
        return 0;
    }
    async startEcosystem() {
        console.log("\n🚀 Initializing OpenClaw Next Ecosystem...\n");
        // 1. Load Config
        await configManager.load();
        const config = configManager.get();
        // 2. Start Core Systems
        daemon.start(); // Heartbeat
        console.log("✅ Heartbeat Daemon active.");
        // 3. Start System Watchdog (Local 3B)
        // systemAgent constructor starts its loop automatically
        console.log("✅ System Watchdog active.");
        // 4. Start Channels (if configured)
        if (config.channels?.telegram?.token) {
            channelManager.registerChannel(new TelegramAdapter(config.channels.telegram.token));
            await channelManager.startAll();
            console.log("✅ Messaging Channels active.");
        }
        // 5. Start API Server (UI + WebSocket)
        await this.apiServer.start();
        console.log(`✅ API Server listening on port 18789.`);
        console.log(`🌐 Dashboard: http://localhost:3000 (via Vite dev) or http://localhost:18789`);
        console.log("\n🤖 OpenClaw is now autonomous. Press Ctrl+C to stop.\n");
        // Keep alive
        await new Promise(() => { });
    }
}
export async function main(args = process.argv.slice(2)) {
    const cli = new OpenClawCLI();
    return cli.run(args);
}
if (import.meta.url === `file://${process.argv[1]}`) {
    main().then((code) => process.exit(code));
}
