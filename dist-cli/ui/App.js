import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OpenClaw Next - Main App Component
// Root application component with routing and state management
import { useState, useEffect, useCallback } from 'react';
import { SetupWizard } from './components/SetupWizard.js';
import { DashboardLayout } from './components/DashboardLayout.js';
import { AgentDashboard } from '../views/AgentDashboard.js';
import { ToolsView } from '../views/ToolsView.js';
import { PluginsView } from '../views/PluginsView.js';
import { SkillsView } from '../views/SkillsView.js';
import { configManager } from '../core/config.js';
/**
 * Main App Component
 */
export const App = () => {
    const [isSetupComplete, setIsSetupComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');
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
                setError(err instanceof Error ? err.message : 'Failed to initialize app');
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
            case 'agents':
                return _jsx(AgentDashboard, {});
            case 'delegation':
                return _jsxs("div", { className: "p-8", children: [_jsx("h2", { className: "text-2xl font-bold text-white", children: "Delegation" }), _jsx("p", { className: "text-slate-400 mt-2", children: "Use the mobile app for task delegation." })] });
            case 'tools':
                return _jsx(ToolsView, {});
            case 'plugins':
                return _jsx(PluginsView, {});
            case 'skills':
                return _jsx(SkillsView, {});
            case 'dashboard':
            default:
                return (_jsxs("div", { className: "p-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-6", children: "Welcome to OpenClaw Next" }), _jsx("p", { className: "text-[var(--color-text-muted)] mb-8", children: "Your agentic gateway control center. Use the sidebar to navigate to different sections." }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(QuickLinkCard, { title: "Agents", description: "Manage your AI agents", icon: "\uD83E\uDD16", onClick: () => handleNavigate('agents') }), _jsx(QuickLinkCard, { title: "Tools", description: "Configure available tools", icon: "\uD83D\uDEE0\uFE0F", onClick: () => handleNavigate('tools') }), _jsx(QuickLinkCard, { title: "Plugins", description: "Manage system plugins", icon: "\uD83D\uDD0C", onClick: () => handleNavigate('plugins') }), _jsx(QuickLinkCard, { title: "Skills", description: "Browse and install skills", icon: "\u2728", onClick: () => handleNavigate('skills') })] })] }));
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
