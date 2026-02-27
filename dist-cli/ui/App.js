import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OpenClaw Next - Main App Component
// Root application component with routing and state management
import { useState, useEffect, useCallback } from "react";
import { configManager } from "../core/config.js";
import { AgentDashboard } from "../views/AgentDashboard.js";
import { GovernanceDashboard } from "../views/governance/GovernanceDashboard.js";
import { PluginsView } from "../views/PluginsView.js";
import { SessionsView } from "../views/SessionsView.js";
import { SkillsView } from "../views/SkillsView.js";
import { ToolsView } from "../views/ToolsView.js";
import { DashboardLayout } from "./components/DashboardLayout.js";
import { SetupWizard } from "./components/SetupWizard.js";
import { ApiKeys } from "./pages/governance/ApiKeys.js";
import { Approvals } from "./pages/governance/Approvals.js";
import { Audit } from "./pages/governance/Audit.js";
import { Gateways } from "./pages/governance/Gateways.js";
import { Policies } from "./pages/governance/Policies.js";
import { Settings } from "./pages/governance/Settings.js";
import { Tasks } from "./pages/governance/Tasks.js";
import { Teams } from "./pages/governance/Teams.js";
import { Webhooks } from "./pages/governance/Webhooks.js";
/**
 * Main App Component
 */
export const App = () => {
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState("dashboard");
    const [error, setError] = useState(null);
    // Check if setup is complete on mount
    useEffect(() => {
        const checkSetup = async () => {
            try {
                setIsLoading(true);
                await configManager.load();
                const config = configManager.get();
                const hasRequiredConfig = config.ollama?.local?.endpoint || config.ollama?.cloud?.enabled;
                setIsSetupComplete(Boolean(hasRequiredConfig && config.ollama?.enabled));
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "Failed to initialize app");
            }
            finally {
                setIsLoading(false);
            }
        };
        checkSetup();
    }, []);
    // Handle setup completion
    const handleSetupComplete = useCallback(() => {
        setIsSetupComplete(true);
    }, []);
    // Handle navigation
    const handleNavigate = useCallback((view) => {
        setCurrentView(view);
    }, []);
    // Render current view
    const renderView = () => {
        switch (currentView) {
            case "dashboard":
            case "governance":
                return _jsx(GovernanceDashboard, {});
            case "agents":
                return _jsx(AgentDashboard, {});
            case "sessions":
                return _jsx(SessionsView, {});
            case "delegation":
                return (_jsxs("div", { className: "p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Delegation" }), _jsx("p", { className: "text-slate-400 mt-2", children: "Use the mobile app for task delegation." })] }));
            case "tools":
                return _jsx(ToolsView, {});
            case "plugins":
                return _jsx(PluginsView, {});
            case "skills":
                return _jsx(SkillsView, {});
            case "teams":
                return _jsx(Teams, {});
            case "tasks":
                return _jsx(Tasks, {});
            case "approvals":
                return _jsx(Approvals, {});
            case "webhooks":
                return _jsx(Webhooks, {});
            case "apiKeys":
                return _jsx(ApiKeys, {});
            case "policies":
                return _jsx(Policies, {});
            case "gateways":
                return _jsx(Gateways, {});
            case "audit":
                return _jsx(Audit, {});
            case "settings":
                return _jsx(Settings, {});
            default:
                return (_jsxs("div", { className: "p-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Welcome to OpenClaw Next" }), _jsx("p", { className: "text-[var(--color-text-muted)] mb-8", children: "Your agentic gateway control center. Use the sidebar to navigate to different sections." }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(QuickLinkCard, { title: "Agents", description: "Manage your AI agents", icon: "\uD83E\uDD16", onClick: () => handleNavigate("agents") }), _jsx(QuickLinkCard, { title: "Governance", description: "System governance and oversight", icon: "\u2696\uFE0F", onClick: () => handleNavigate("governance") }), _jsx(QuickLinkCard, { title: "Teams", description: "Manage teams and organizations", icon: "\uD83D\uDC65", onClick: () => handleNavigate("teams") }), _jsx(QuickLinkCard, { title: "Tools", description: "Configure available tools", icon: "\uD83D\uDEE0\uFE0F", onClick: () => handleNavigate("tools") }), _jsx(QuickLinkCard, { title: "Plugins", description: "Manage system plugins", icon: "\uD83D\uDD0C", onClick: () => handleNavigate("plugins") }), _jsx(QuickLinkCard, { title: "Skills", description: "Browse and install skills", icon: "\u2728", onClick: () => handleNavigate("skills") }), _jsx(QuickLinkCard, { title: "Gateways", description: "Manage gateway servers", icon: "\uD83C\uDF10", onClick: () => handleNavigate("gateways") }), _jsx(QuickLinkCard, { title: "Audit Log", description: "View system audit logs", icon: "\uD83D\uDCDC", onClick: () => handleNavigate("audit") })] })] }));
        }
    };
    // Loading state
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-[var(--color-bg)]", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-4" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: "Loading OpenClaw Next..." })] }) }));
    }
    // Error state
    if (error) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-[var(--color-bg)]", children: _jsxs("div", { className: "text-center max-w-md p-6", children: [_jsx("div", { className: "text-6xl mb-4", children: "\u26A0\uFE0F" }), _jsx("h2", { className: "text-xl font-bold mb-2 text-[var(--color-error)]", children: "Initialization Error" }), _jsx("p", { className: "text-[var(--color-text-muted)] mb-4", children: error }), _jsx("button", { onClick: () => window.location.reload(), className: "btn-primary", children: "Retry" })] }) }));
    }
    // Setup wizard
    if (!isSetupComplete) {
        return (_jsx("div", { className: "min-h-screen bg-[var(--color-bg)]", children: _jsx(SetupWizard, { onComplete: handleSetupComplete }) }));
    }
    // Main dashboard
    return (_jsx(DashboardLayout, { currentView: currentView, onNavigate: handleNavigate, children: renderView() }));
};
const QuickLinkCard = ({ title, description, icon, onClick }) => (_jsxs("button", { onClick: onClick, className: "card-hover text-left group", children: [_jsx("div", { className: "text-4xl mb-4 group-hover:scale-110 transition-transform duration-200", children: icon }), _jsx("h3", { className: "text-lg font-semibold mb-1", children: title }), _jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: description })] }));
export default App;
