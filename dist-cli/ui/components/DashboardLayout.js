import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OpenClaw Next - Dashboard Layout Component
// Main layout with sidebar, header, and content area
import { useState, useCallback } from 'react';
const NAV_ITEMS = [
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
export const DashboardLayout = ({ children, currentView, onNavigate, }) => {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const toggleSidebar = useCallback(() => {
        setIsSidebarCollapsed((prev) => !prev);
    }, []);
    const toggleMobileMenu = useCallback(() => {
        setIsMobileMenuOpen((prev) => !prev);
    }, []);
    const handleNavClick = useCallback((view) => {
        onNavigate(view);
        setIsMobileMenuOpen(false);
    }, [onNavigate]);
    return (_jsxs("div", { className: "min-h-screen flex", children: [isMobileMenuOpen && (_jsx("div", { className: "fixed inset-0 bg-black/50 z-40 lg:hidden", onClick: () => setIsMobileMenuOpen(false) })), _jsxs("aside", { className: `fixed lg:static inset-y-0 left-0 z-50 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-16' : 'w-64'} ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`, children: [_jsx("div", { className: "p-4 border-b border-[var(--color-border)]", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 bg-[var(--color-primary)] rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0", children: "OC" }), !isSidebarCollapsed && (_jsxs("div", { className: "overflow-hidden", children: [_jsx("h1", { className: "font-bold text-lg truncate", children: "OpenClaw" }), _jsx("p", { className: "text-xs text-[var(--color-text-muted)] truncate", children: "Next" })] }))] }) }), _jsx("nav", { className: "flex-1 py-4 px-2 overflow-y-auto", children: _jsx("ul", { className: "space-y-1", children: NAV_ITEMS.map((item) => (_jsx("li", { children: _jsxs("button", { onClick: () => handleNavClick(item.id), className: `w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${currentView === item.id
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]'} ${isSidebarCollapsed ? 'justify-center' : ''}`, title: isSidebarCollapsed ? item.label : undefined, children: [_jsx("span", { className: "text-xl", children: item.icon }), !isSidebarCollapsed && (_jsx("span", { className: "font-medium truncate", children: item.label })), !isSidebarCollapsed && item.badge && (_jsx("span", { className: "ml-auto bg-[var(--color-primary)] text-white text-xs px-2 py-0.5 rounded-full", children: item.badge }))] }) }, item.id))) }) }), _jsxs("div", { className: "p-4 border-t border-[var(--color-border)] space-y-2", children: [_jsxs("button", { className: `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''}`, title: isSidebarCollapsed ? 'Help' : undefined, children: [_jsx("span", { className: "text-xl", children: "\u2753" }), !isSidebarCollapsed && _jsx("span", { className: "font-medium", children: "Help" })] }), _jsxs("button", { className: `w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''}`, title: isSidebarCollapsed ? 'Toggle Theme' : undefined, children: [_jsx("span", { className: "text-xl", children: "\uD83C\uDF19" }), !isSidebarCollapsed && _jsx("span", { className: "font-medium", children: "Dark Mode" })] }), _jsx("button", { onClick: toggleSidebar, className: "hidden lg:flex w-full items-center gap-3 px-3 py-2 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)] transition-all duration-200 justify-center", title: isSidebarCollapsed ? 'Expand' : 'Collapse', children: _jsx("span", { className: "text-xl", children: isSidebarCollapsed ? '→' : '←' }) })] })] }), _jsxs("div", { className: "flex-1 flex flex-col min-w-0", children: [_jsxs("header", { className: "h-16 border-b border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between px-4 lg:px-6", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: toggleMobileMenu, className: "lg:hidden p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]", children: _jsx("span", { className: "text-xl", children: "\u2630" }) }), _jsxs("div", { className: "hidden md:flex items-center relative", children: [_jsx("span", { className: "absolute left-3 text-[var(--color-text-muted)]", children: "\uD83D\uDD0D" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "Search agents, tools, skills...", className: "w-80 pl-10 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "relative", children: _jsxs("button", { className: "p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors", children: [_jsx("span", { className: "text-xl", children: "\uD83D\uDD14" }), notifications.length > 0 && (_jsx("span", { className: "absolute top-1 right-1 w-2 h-2 bg-[var(--color-primary)] rounded-full" }))] }) }), _jsxs("button", { className: "hidden sm:flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors", children: [_jsx("span", { children: "+" }), _jsx("span", { children: "Create" })] }), _jsxs("button", { className: "flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors", children: [_jsx("div", { className: "w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-medium", children: "U" }), _jsx("span", { className: "hidden md:block text-sm font-medium", children: "User" }), _jsx("span", { className: "hidden md:block text-xs", children: "\u25BC" })] })] })] }), _jsx("main", { className: "flex-1 overflow-auto bg-[var(--color-bg)]", children: children })] })] }));
};
export default DashboardLayout;
