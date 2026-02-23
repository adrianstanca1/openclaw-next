// OpenClaw Next - Main App Component
// Root application component with routing and state management

import React, { useState, useEffect, useCallback } from 'react';
import { SetupWizard } from './components/SetupWizard.js';
import { DashboardLayout } from './components/DashboardLayout.js';
import { AgentDashboard } from '../views/AgentDashboard.js';
import { ToolsView } from '../views/ToolsView.js';
import { PluginsView } from '../views/PluginsView.js';
import { SkillsView } from '../views/SkillsView.js';
import { configManager } from '../core/config.js';
import type { ViewState } from './types.js';

/**
 * Main App Component
 */
export const App: React.FC = () => {
  const [isSetupComplete, setIsSetupComplete] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [error, setError] = useState<string | null>(null);

  // Check if setup is complete on mount
  useEffect(() => {
    const checkSetup = async () => {
      try {
        setIsLoading(true);
        await configManager.load();
        const config = configManager.get();
        const hasRequiredConfig = config.ollama?.local?.endpoint || config.ollama?.cloud?.enabled;
        setIsSetupComplete(Boolean(hasRequiredConfig && config.ollama?.enabled));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize app');
      } finally {
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
  const handleNavigate = useCallback((view: ViewState) => {
    setCurrentView(view);
  }, []);

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'agents':
        return <AgentDashboard />;
      case 'delegation':
        return <div className="p-8"><h2 className="text-2xl font-bold text-white">Delegation</h2><p className="text-slate-400 mt-2">Use the mobile app for task delegation.</p></div>;
      case 'tools':
        return <ToolsView />;
      case 'plugins':
        return <PluginsView />;
      case 'skills':
        return <SkillsView />;
      case 'dashboard':
      default:
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Welcome to OpenClaw Next</h1>
            <p className="text-[var(--color-text-muted)] mb-8">
              Your agentic gateway control center. Use the sidebar to navigate to different sections.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <QuickLinkCard
                title="Agents"
                description="Manage your AI agents"
                icon="🤖"
                onClick={() => handleNavigate('agents')}
              />
              <QuickLinkCard
                title="Tools"
                description="Configure available tools"
                icon="🛠️"
                onClick={() => handleNavigate('tools')}
              />
              <QuickLinkCard
                title="Plugins"
                description="Manage system plugins"
                icon="🔌"
                onClick={() => handleNavigate('plugins')}
              />
              <QuickLinkCard
                title="Skills"
                description="Browse and install skills"
                icon="✨"
                onClick={() => handleNavigate('skills')}
              />
            </div>
          </div>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Loading OpenClaw Next...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center max-w-md p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2 text-[var(--color-error)]">Initialization Error</h2>
          <p className="text-[var(--color-text-muted)] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Setup wizard
  if (!isSetupComplete) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <SetupWizard onComplete={handleSetupComplete} />
      </div>
    );
  }

  // Main dashboard
  return (
    <DashboardLayout currentView={currentView} onNavigate={handleNavigate}>
      {renderView()}
    </DashboardLayout>
  );
};

/**
 * Quick Link Card Component
 */
interface QuickLinkCardProps {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}

const QuickLinkCard: React.FC<QuickLinkCardProps> = ({ title, description, icon, onClick }) => (
  <button
    onClick={onClick}
    className="card-hover text-left group"
  >
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-1">{title}</h3>
    <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
  </button>
);

export default App;
