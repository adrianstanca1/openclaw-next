import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * OpenClaw Next - Plugins View
 * Manage plugins using the PluginManager
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { pluginManager } from '../plugins/manager.js';
/**
 * Plugins View Component
 * Displays and manages installed plugins
 */
export const PluginsView = () => {
    const [plugins, setPlugins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        search: '',
        category: null,
        source: null,
        status: null,
        sortBy: 'name',
        sortOrder: 'asc',
    });
    const [selectedPlugin, setSelectedPlugin] = useState(null);
    const [isProcessing, setIsProcessing] = useState(null);
    // Load plugins on mount
    useEffect(() => {
        loadPlugins();
        // Subscribe to plugin events
        const listener = (event) => {
            console.log('Plugin enabled:', event.pluginId);
            loadPlugins();
        };
        pluginManager.on('plugin_enabled', listener);
        return () => {
            pluginManager.off('plugin_enabled', listener);
        };
    }, []);
    const loadPlugins = useCallback(async () => {
        setLoading(true);
        try {
            const allInstances = pluginManager.registry.getAllInstances();
            const pluginData = allInstances.map((plugin) => {
                return {
                    plugin,
                    hookCount: plugin.hooks?.length || 0,
                    eventCount: plugin.events?.length || 0,
                    dependenciesSatisfied: plugin.dependenciesSatisfied || false,
                };
            });
            setPlugins(pluginData);
        }
        catch (error) {
            console.error('Failed to load plugins:', error);
            setPlugins([]);
        }
        finally {
            setLoading(false);
        }
    }, []);
    // Filter and sort plugins
    const filteredPlugins = useMemo(() => {
        let result = [...plugins];
        // Search filter
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            result = result.filter((p) => p.plugin.name.toLowerCase().includes(searchLower) ||
                p.plugin.description.toLowerCase().includes(searchLower) ||
                p.plugin.id.toLowerCase().includes(searchLower));
        }
        // Category filter
        if (filter.category) {
            result = result.filter((p) => p.plugin.metadata?.category === filter.category);
        }
        // Source filter
        if (filter.source) {
            result = result.filter((p) => p.plugin.source === filter.source);
        }
        // Status filter
        if (filter.status) {
            result = result.filter((p) => p.plugin.state === filter.status);
        }
        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (filter.sortBy) {
                case 'name':
                    comparison = a.plugin.name.localeCompare(b.plugin.name);
                    break;
                case 'date':
                    comparison =
                        new Date(b.plugin.installedAt).getTime() -
                            new Date(a.plugin.installedAt).getTime();
                    break;
                case 'status':
                    comparison = a.plugin.state.localeCompare(b.plugin.state);
                    break;
            }
            return filter.sortOrder === 'asc' ? comparison : -comparison;
        });
        return result;
    }, [plugins, filter]);
    // Toggle plugin
    const handleTogglePlugin = useCallback(async (instanceId, currentState) => {
        setIsProcessing(instanceId);
        try {
            if (currentState === 'enabled') {
                await pluginManager.disablePlugin(instanceId);
            }
            else {
                await pluginManager.enablePlugin(instanceId);
            }
            await loadPlugins();
        }
        catch (error) {
            console.error('Failed to toggle plugin:', error);
        }
        finally {
            setIsProcessing(null);
        }
    }, [loadPlugins]);
    // Hot reload plugin
    const handleHotReload = useCallback(async (instanceId) => {
        setIsProcessing(instanceId);
        try {
            await pluginManager.hotReload(instanceId);
            await loadPlugins();
        }
        catch (error) {
            console.error('Failed to hot reload plugin:', error);
        }
        finally {
            setIsProcessing(null);
        }
    }, [loadPlugins]);
    // Get status badge
    const getStatusBadge = (state) => {
        const configs = {
            installed: { label: 'Installed', className: 'badge-info' },
            enabled: { label: 'Enabled', className: 'badge-success' },
            disabled: { label: 'Disabled', className: 'badge-error' },
            error: { label: 'Error', className: 'badge-error' },
            loading: { label: 'Loading', className: 'badge-warning' },
            uninstalling: { label: 'Uninstalling', className: 'badge-warning' },
        };
        return configs[state] || configs.disabled;
    };
    // Get source icon
    const getSourceIcon = (source) => {
        const icons = {
            local: '📁',
            remote: '🌐',
            bundled: '📦',
            marketplace: '🏪',
            builtin: '🔧',
        };
        return icons[source] || '🔧';
    };
    // Plugin categories
    const categories = [
        'monitoring',
        'logging',
        'analytics',
        'security',
        'automation',
        'integration',
        'notification',
        'cache',
        'storage',
        'optimization',
        'experimental',
    ];
    if (loading) {
        return (_jsx("div", { className: "p-8 flex items-center justify-center", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" }) }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Plugins" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: "Manage system plugins and extensions" })] }), _jsxs("button", { className: "btn-primary", children: [_jsx("span", { className: "mr-2", children: "+" }), "Install Plugin"] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6", children: [_jsx(StatCard, { label: "Total Plugins", value: plugins.length, icon: "\uD83D\uDD0C" }), _jsx(StatCard, { label: "Enabled", value: plugins.filter((p) => p.plugin.state === 'enabled').length, icon: "\u2705", color: "text-green-500" }), _jsx(StatCard, { label: "Disabled", value: plugins.filter((p) => p.plugin.state === 'disabled').length, icon: "\u274C", color: "text-red-500" }), _jsx(StatCard, { label: "With Errors", value: plugins.filter((p) => p.plugin.state === 'error').length, icon: "\u26A0\uFE0F", color: "text-yellow-500" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 mb-6", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]", children: "\uD83D\uDD0D" }), _jsx("input", { type: "text", value: filter.search, onChange: (e) => setFilter((prev) => ({ ...prev, search: e.target.value })), placeholder: "Search plugins...", className: "w-full pl-10 pr-4 py-2 input" })] }), _jsxs("select", { value: filter.status || '', onChange: (e) => setFilter((prev) => ({
                            ...prev,
                            status: e.target.value || null,
                        })), className: "select", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "enabled", children: "Enabled" }), _jsx("option", { value: "disabled", children: "Disabled" }), _jsx("option", { value: "error", children: "Error" }), _jsx("option", { value: "installed", children: "Installed" })] }), _jsxs("select", { value: `${filter.sortBy}-${filter.sortOrder}`, onChange: (e) => {
                            const [sortBy, sortOrder] = e.target.value.split('-');
                            setFilter((prev) => ({ ...prev, sortBy, sortOrder }));
                        }, className: "select", children: [_jsx("option", { value: "name-asc", children: "Name A-Z" }), _jsx("option", { value: "name-desc", children: "Name Z-A" }), _jsx("option", { value: "date-desc", children: "Recently Installed" }), _jsx("option", { value: "status-asc", children: "By Status" })] })] }), filteredPlugins.length === 0 ? (_jsx(EmptyState, {})) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredPlugins.map((pluginData) => (_jsx(PluginCard, { pluginData: pluginData, statusBadge: getStatusBadge(pluginData.plugin.state), sourceIcon: getSourceIcon(pluginData.plugin.source), isProcessing: isProcessing === pluginData.plugin.instanceId, onToggle: () => handleTogglePlugin(pluginData.plugin.instanceId, pluginData.plugin.state), onHotReload: () => handleHotReload(pluginData.plugin.instanceId), onSelect: () => setSelectedPlugin(pluginData.plugin) }, pluginData.plugin.instanceId))) })), selectedPlugin && (_jsx(PluginDetailModal, { plugin: selectedPlugin, onClose: () => setSelectedPlugin(null) }))] }));
};
const StatCard = ({ label, value, icon, color }) => (_jsx("div", { className: "card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: label }), _jsx("p", { className: `text-2xl font-bold ${color || ''}`, children: value })] }), _jsx("span", { className: "text-2xl", children: icon })] }) }));
/**
 * Empty State Component
 */
const EmptyState = () => (_jsxs("div", { className: "text-center py-16 card", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDD0C" }), _jsx("h3", { className: "text-xl font-bold mb-2", children: "No Plugins Installed" }), _jsx("p", { className: "text-[var(--color-text-muted)] mb-6 max-w-md mx-auto", children: "Install your first plugin to extend OpenClaw's functionality" }), _jsxs("button", { className: "btn-primary", children: [_jsx("span", { className: "mr-2", children: "+" }), "Browse Marketplace"] })] }));
const PluginCard = ({ pluginData, statusBadge, sourceIcon, isProcessing, onToggle, onHotReload, onSelect, }) => {
    const { plugin, hookCount, eventCount } = pluginData;
    const isEnabled = plugin.state === 'enabled';
    return (_jsxs("div", { className: "card-hover group", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-[var(--color-surface-hover)] rounded-lg flex items-center justify-center text-2xl", children: plugin.metadata?.icon || sourceIcon }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold truncate max-w-[150px]", children: plugin.name }), _jsxs("p", { className: "text-sm text-[var(--color-text-muted)]", children: ["v", plugin.version] })] })] }), _jsx("span", { className: statusBadge.className, children: statusBadge.label })] }), _jsx("p", { className: "text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2", children: plugin.description }), _jsxs("div", { className: "flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-4", children: [_jsxs("div", { className: "flex gap-3", children: [_jsxs("span", { title: "Hooks", children: ["\uD83E\uDE9D ", hookCount] }), _jsxs("span", { title: "Events", children: ["\uD83D\uDCE1 ", eventCount] })] }), _jsxs("span", { children: [sourceIcon, " ", plugin.source] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: onToggle, disabled: isProcessing, className: `flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${isEnabled
                            ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`, children: isProcessing ? '⏳' : isEnabled ? 'Disable' : 'Enable' }), isEnabled && plugin.hotReloadable && (_jsx("button", { onClick: onHotReload, disabled: isProcessing, className: "py-2 px-3 rounded-lg text-sm font-medium bg-[var(--color-surface-hover)] hover:bg-[var(--color-border)] transition-colors disabled:opacity-50", children: "\uD83D\uDD04" })), _jsx("button", { onClick: onSelect, className: "flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors", children: "Details" })] })] }));
};
const PluginDetailModal = ({ plugin, onClose }) => {
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/50", onClick: onClose }), _jsxs("div", { className: "relative bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] w-full max-w-2xl max-h-[90vh] overflow-auto", children: [_jsx("div", { className: "p-6 border-b border-[var(--color-border)]", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-16 h-16 bg-[var(--color-surface-hover)] rounded-lg flex items-center justify-center text-4xl", children: plugin.metadata?.icon || '🔌' }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold", children: plugin.name }), _jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: plugin.id }), _jsxs("div", { className: "flex gap-2 mt-1", children: [_jsxs("span", { className: "badge-info", children: ["v", plugin.version] }), _jsx("span", { className: "badge", children: plugin.state })] })] })] }), _jsx("button", { onClick: onClose, className: "text-2xl hover:text-[var(--color-primary)]", children: "\u00D7" })] }) }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Description" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: plugin.longDescription || plugin.description })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Author" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: plugin.author || 'Unknown' })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "License" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: plugin.license || 'MIT' })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Installed" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: new Date(plugin.installedAt).toLocaleDateString() })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Source" }), _jsx("p", { className: "text-[var(--color-text-muted)] capitalize", children: plugin.source })] })] }), plugin.metadata?.tags && plugin.metadata.tags.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Tags" }), _jsx("div", { className: "flex flex-wrap gap-2", children: plugin.metadata.tags.map((tag) => (_jsx("span", { className: "badge", children: tag }, tag))) })] })), plugin.hooks && plugin.hooks.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Registered Hooks" }), _jsx("div", { className: "bg-[var(--color-bg)] rounded-lg p-4 space-y-2", children: plugin.hooks.map((hook, index) => (_jsxs("div", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: hook.name }), _jsxs("span", { className: "text-[var(--color-text-muted)]", children: [' ', "\u2192 ", hook.trigger] })] }, index))) })] })), plugin.config && Object.keys(plugin.config).length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Configuration" }), _jsx("pre", { className: "bg-[var(--color-bg)] p-4 rounded-lg text-sm overflow-x-auto", children: _jsx("code", { children: JSON.stringify(plugin.config, null, 2) }) })] })), plugin.lastError && (_jsxs("div", { className: "p-4 bg-[var(--color-error-bg)] border border-[var(--color-error)] rounded-lg", children: [_jsx("h3", { className: "font-medium mb-2 text-[var(--color-error)]", children: "Last Error" }), _jsx("p", { className: "text-sm text-[var(--color-error)]", children: plugin.lastError.message })] }))] }), _jsx("div", { className: "p-6 border-t border-[var(--color-border)] flex justify-end gap-3", children: _jsx("button", { onClick: onClose, className: "btn-secondary", children: "Close" }) })] })] }));
};
export default PluginsView;
