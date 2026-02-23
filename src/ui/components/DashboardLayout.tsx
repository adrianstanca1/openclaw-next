// OpenClaw Next - Dashboard Layout Component
// Main layout with sidebar, header, and content area

import React, { useState, useCallback } from 'react';
import type { ViewState, NavItem } from '../types.js';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/' },
  { id: 'agents', label: 'Agents', icon: '🤖', path: '/agents' },
  { id: 'delegation', label: 'Delegation', icon: '📋', path: '/delegation' },
  { id: 'sessions', label: 'Sessions', icon: '💬', path: '/sessions' },
  { id: 'tools', label: 'Tools', icon: '🛠️', path: '/tools' },
  { id: 'skills', label: 'Skills', icon: '✨', path: '/skills' },
  { id: 'plugins', label: 'Plugins', icon: '🔌', path: '/plugins' },
  { id: 'marketplace', label: 'Marketplace', icon: '🏪', path: '/marketplace' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
];

/**
 * Dashboard Layout Component
 * Main application layout with sidebar navigation
 */
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentView,
  onNavigate,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleNavClick = useCallback(
    (view: ViewState) => {
      onNavigate(view);
      setIsMobileMenuOpen(false);
    },
    [onNavigate]
  );

  return (
    <div className="min-h-screen flex">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0">
              OC
            </div>
            {!isSidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-lg truncate">OpenClaw</h1>
                <p className="text-xs text-[var(--color-text-muted)] truncate">Next</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item.id as ViewState)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    currentView === item.id
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <span className="text-xl">{item.icon}</span>
                  {!isSidebarCollapsed && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                  {!isSidebarCollapsed && item.badge && (
                    <span className="ml-auto bg-[var(--color-primary)] text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[var(--color-border)] space-y-2">
          {/* Help */}
          <button
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-all duration-200 ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
            title={isSidebarCollapsed ? 'Help' : undefined}
          >
            <span className="text-xl">❓</span>
            {!isSidebarCollapsed && <span className="font-medium">Help</span>}
          </button>

          {/* Theme Toggle */}
          <button
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-all duration-200 ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
            title={isSidebarCollapsed ? 'Toggle Theme' : undefined}
          >
            <span className="text-xl">🌙</span>
            {!isSidebarCollapsed && <span className="font-medium">Dark Mode</span>}
          </button>

          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-all duration-200 justify-center"
            title={isSidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            <span className="text-xl">{isSidebarCollapsed ? '→' : '←'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-4 lg:px-6">
          {/* Left: Mobile Menu & Search */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <span className="text-xl">☰</span>
            </button>

            <div className="hidden md:flex items-center relative">
              <span className="absolute left-3 text-[var(--color-text-muted)]">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agents, tools, skills..."
                className="w-80 pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
                <span className="text-xl">🔔</span>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-primary)] rounded-full" />
                )}
              </button>
            </div>

            {/* Create Button */}
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors">
              <span>+</span>
              <span>Create</span>
            </button>

            {/* User Menu */}
            <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors">
              <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-medium">
                U
              </div>
              <span className="hidden md:block text-sm font-medium">User</span>
              <span className="hidden md:block text-xs">▼</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto bg-[var(--color-bg)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
