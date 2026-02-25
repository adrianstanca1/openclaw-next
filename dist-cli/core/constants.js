// OpenClaw Next - Core Constants
// Superintelligence Platform for Agentic Gateways
/**
 * Default Gateway Configuration
 */
export const DEFAULT_GATEWAY_CONFIG = {
    url: typeof window !== "undefined"
        ? `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}/api`
        : "ws://localhost:18789/api",
    token: "",
    timeout: 30000,
    reconnect: {
        enabled: true,
        initialDelay: 1000,
        maxDelay: 30000,
        factor: 2,
    },
};
/**
 * Agent Defaults
 */
export const DEFAULT_AGENT_CONFIG = {
    role: "developer",
    capabilities: ["reasoning", "tool_use", "memory", "planning", "learning"],
    personality: {
        tone: "professional",
        style: "step-by-step",
        bias: "balanced",
        collaboration: "collaborative",
    },
    heartbeat: {
        enabled: true,
        interval: "30m",
        taskList: [],
        autoRespond: true,
        responseTemplate: "HEARTBEAT_OK",
        visibility: {
            webchat: false,
            mobile: false,
            desktop: false,
        },
    },
    tools: [],
    skills: [],
};
/**
 * System Capabilities
 */
export const SYSTEM_CAPABILITIES = {
    MAX_AGENTS: 100,
    MAX_SESSIONS_PER_AGENT: 1000,
    MAX_MEMORY_ENTRIES: 10000,
    MAX_HISTORY_MESSAGES: 1000,
    MAX_TOOL_OUTPUT_CHARS: 100000,
    MAX_ATTACHMENT_SIZE_MB: 20,
    DEFAULT_TIMEOUT_MS: 300000,
};
/**
 * Skill Categories
 */
export const SKILL_CATEGORIES = [
    "development",
    "data",
    "communication",
    "automation",
    "analysis",
    "creation",
    "management",
    "integration",
];
/**
 * Marketplace Categories
 */
export const MARKETPLACE_CATEGORIES = [
    { id: "all", name: "All Skills" },
    { id: "development", name: "Development" },
    { id: "data", name: "Data & Analytics" },
    { id: "communication", name: "Communication" },
    { id: "automation", name: "Automation" },
    { id: "analysis", name: "Analysis" },
    { id: "creation", name: "Content Creation" },
    { id: "management", name: "Management" },
    { id: "integration", name: "Integrations" },
];
/**
 * Activity Severity Levels
 */
export const SEVERITY_COLORS = {
    info: "blue",
    warning: "yellow",
    error: "red",
    success: "green",
};
/**
 * Gateway API Methods
 */
export const GATEWAY_METHODS = {
    // Agent control
    AGENT_SEND: "agent",
    AGENT_IDENTITY: "agent.identity.get",
    AGENT_WAIT: "agent.wait",
    // Agent management
    AGENTS_LIST: "agents.list",
    AGENTS_CREATE: "agents.create",
    AGENTS_UPDATE: "agents.update",
    AGENTS_DELETE: "agents.delete",
    // Chat
    CHAT_SEND: "chat.send",
    CHAT_HISTORY: "chat.history",
    CHAT_ABORT: "chat.abort",
    // Channels
    CHANNELS_LIST: "channels.list",
    CHANNELS_START: "channels.start",
    CHANNELS_STOP: "channels.stop",
    // Sessions
    SESSIONS_LIST: "sessions.list",
    SESSIONS_CREATE: "sessions.spawn",
    SESSIONS_ABORT: "sessions.abort",
    // Tools
    TOOLS_LIST: "tools.list",
    // Skills
    SKILLS_LIST: "skills.list",
    SKILLS_INSTALL: "skills.install",
    // System
    HEALTH: "health",
    CONFIG_GET: "config.get",
    CONFIG_SET: "config.set",
    SYSTEM_RESTART: "system.restart",
};
/**
 * Default Skills for New Agents
 */
export const DEFAULT_SKILLS = [
    { id: "filesystem", name: "Filesystem", description: "Read/write files", enabled: true },
    { id: "bash", name: "Bash", description: "Execute shell commands", enabled: true },
    { id: "web", name: "Web", description: "Search and fetch web content", enabled: true },
    { id: "memory", name: "Memory", description: "Store and retrieve knowledge", enabled: true },
];
/**
 * Default Tools for New Agents
 */
export const DEFAULT_TOOLS = [
    { name: "filesystem", enabled: true },
    { name: "bash", enabled: true },
    { name: "web_search", enabled: true },
    { name: "web_fetch", enabled: true },
];
/**
 * Theme Constants
 */
export const THEMES = {
    dark: {
        bg: "#0f1115",
        surface: "#161b22",
        primary: "#ff5c5c",
        text: "#e4e4e7",
        textMuted: "#71717a",
        border: "#27272a",
    },
    light: {
        bg: "#ffffff",
        surface: "#f5f5f5",
        primary: "#dc2626",
        text: "#18181b",
        textMuted: "#71717a",
        border: "#e4e4e7",
    },
};
