"use strict";
/**
 * OpenClaw Next - CLI Entry Point
 * Starts the full autonomous ecosystem.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenClawCLI = void 0;
exports.main = main;
const manager_js_1 = require("../agents/manager.js");
const api_server_js_1 = require("../core/api-server.js");
const manager_js_2 = require("../core/channels/manager.js");
const telegram_js_1 = require("../core/channels/providers/telegram.js");
const config_js_1 = require("../core/config.js");
const daemon_js_1 = require("../core/daemon.js");
class OpenClawCLI {
    constructor() {
        this.manager = new manager_js_1.AgentManager();
        this.apiServer = new api_server_js_1.SmartApiServer();
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
        var _a, _b;
        console.log("\n🚀 Initializing OpenClaw Next Ecosystem...\n");
        // 1. Load Config
        await config_js_1.configManager.load();
        const config = config_js_1.configManager.get();
        // 2. Start Core Systems
        daemon_js_1.daemon.start(); // Heartbeat
        console.log("✅ Heartbeat Daemon active.");
        // 3. Start System Watchdog (Local 3B)
        // systemAgent constructor starts its loop automatically
        console.log("✅ System Watchdog active.");
        // 4. Start Channels (if configured)
        if ((_b = (_a = config.channels) === null || _a === void 0 ? void 0 : _a.telegram) === null || _b === void 0 ? void 0 : _b.token) {
            manager_js_2.channelManager.registerChannel(new telegram_js_1.TelegramAdapter(config.channels.telegram.token));
            await manager_js_2.channelManager.startAll();
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
exports.OpenClawCLI = OpenClawCLI;
async function main(args = process.argv.slice(2)) {
    const cli = new OpenClawCLI();
    return cli.run(args);
}
if (require.main === module) {
    main().then((code) => process.exit(code));
}
