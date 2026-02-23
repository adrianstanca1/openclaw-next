import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * OpenClaw Next - Tools View
 * Display and manage available tools from the ToolRegistry
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toolRegistry } from '../tools/registry.js';
/**
 * Tools View Component
 * Displays and manages available tools
 */
export const ToolsView = () => {
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({
        search: '',
        category: null,
        status: null,
        sortBy: 'name',
        sortOrder: 'asc',
    });
    const [selectedTool, setSelectedTool] = useState(null);
    // Load tools on mount
    useEffect(() => {
        loadTools();
    }, []);
    const loadTools = useCallback(() => {
        setLoading(true);
        try {
            const allTools = toolRegistry.list({ includeDisabled: true });
            const toolData = allTools.map((definition) => {
                const status = toolRegistry.getStatus(definition.id) || 'enabled';
                return {
                    definition,
                    status,
                    usageCount: 0, // Would track from actual usage
                };
            });
            setTools(toolData);
        }
        catch (error) {
            console.error('Failed to load tools:', error);
        }
        finally {
            setLoading(false);
        }
    }, []);
    // Filter and sort tools
    const filteredTools = useMemo(() => {
        let result = [...tools];
        // Search filter
        if (filter.search) {
            const searchLower = filter.search.toLowerCase();
            result = result.filter((tool) => tool.definition.name.toLowerCase().includes(searchLower) ||
                tool.definition.description.toLowerCase().includes(searchLower) ||
                tool.definition.id.toLowerCase().includes(searchLower));
        }
        // Category filter
        if (filter.category) {
            result = result.filter((tool) => tool.definition.category === filter.category);
        }
        // Status filter
        if (filter.status) {
            result = result.filter((tool) => tool.status === filter.status);
        }
        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (filter.sortBy) {
                case 'name':
                    comparison = a.definition.name.localeCompare(b.definition.name);
                    break;
                case 'usage':
                    comparison = b.usageCount - a.usageCount;
                    break;
                case 'category':
                    comparison = (a.definition.category || '').localeCompare(b.definition.category || '');
                    break;
            }
            return filter.sortOrder === 'asc' ? comparison : -comparison;
        });
        return result;
    }, [tools, filter]);
    // Toggle tool status
    const handleToggleTool = useCallback(async (toolId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
            toolRegistry.updateStatus(toolId, newStatus);
            loadTools();
        }
        catch (error) {
            console.error('Failed to toggle tool:', error);
        }
    }, [loadTools]);
    // Get category icon
    const getCategoryIcon = (category) => {
        const icons = {
            web: '🌐',
            search: '🔍',
            computation: '🧮',
            storage: '💾',
            communication: '💬',
            automation: '⚡',
            ai: '🤖',
            system: '⚙️',
            custom: '🔧',
        };
        return icons[category] || '🔧';
    };
    // Get status badge
    const getStatusBadge = (status) => {
        const configs = {
            enabled: { label: 'Enabled', className: 'badge-success' },
            disabled: { label: 'Disabled', className: 'badge-error' },
            unavailable: { label: 'Unavailable', className: 'badge-warning' },
            rate_limited: { label: 'Rate Limited', className: 'badge-warning' },
            cost_exceeded: { label: 'Cost Exceeded', className: 'badge-error' },
            pending_approval: { label: 'Pending', className: 'badge-info' },
        };
        return configs[status] || configs.disabled;
    };
    // Tool categories
    const categories = ['web', 'search', 'computation', 'storage', 'communication', 'automation', 'ai', 'system', 'custom'];
    if (loading) {
        return (_jsx("div", { className: "p-8 flex items-center justify-center", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full" }) }));
    }
    return (_jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Tools" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: "Manage available tools for your agents" })] }), _jsxs("div", { className: "text-sm text-[var(--color-text-muted)]", children: [tools.filter((t) => t.status === 'enabled').length, " / ", tools.length, " enabled"] })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6", children: [_jsx(StatCard, { label: "Total Tools", value: tools.length, icon: "\uD83D\uDEE0\uFE0F" }), _jsx(StatCard, { label: "Enabled", value: tools.filter((t) => t.status === 'enabled').length, icon: "\u2705", color: "text-green-500" }), _jsx(StatCard, { label: "Disabled", value: tools.filter((t) => t.status === 'disabled').length, icon: "\u274C", color: "text-red-500" }), _jsx(StatCard, { label: "Categories", value: new Set(tools.map((t) => t.definition.category)).size, icon: "\uD83D\uDCC2", color: "text-blue-500" })] }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 mb-6", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]", children: "\uD83D\uDD0D" }), _jsx("input", { type: "text", value: filter.search, onChange: (e) => setFilter((prev) => ({ ...prev, search: e.target.value })), placeholder: "Search tools...", className: "w-full pl-10 pr-4 py-2 input" })] }), _jsxs("select", { value: filter.category || '', onChange: (e) => setFilter((prev) => ({
                            ...prev,
                            category: e.target.value || null,
                        })), className: "select", children: [_jsx("option", { value: "", children: "All Categories" }), categories.map((cat) => (_jsx("option", { value: cat, children: cat.charAt(0).toUpperCase() + cat.slice(1) }, cat)))] }), _jsxs("select", { value: filter.status || '', onChange: (e) => setFilter((prev) => ({
                            ...prev,
                            status: e.target.value || null,
                        })), className: "select", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "enabled", children: "Enabled" }), _jsx("option", { value: "disabled", children: "Disabled" }), _jsx("option", { value: "unavailable", children: "Unavailable" })] }), _jsxs("select", { value: `${filter.sortBy}-${filter.sortOrder}`, onChange: (e) => {
                            const [sortBy, sortOrder] = e.target.value.split('-');
                            setFilter((prev) => ({ ...prev, sortBy, sortOrder }));
                        }, className: "select", children: [_jsx("option", { value: "name-asc", children: "Name A-Z" }), _jsx("option", { value: "name-desc", children: "Name Z-A" }), _jsx("option", { value: "usage-desc", children: "Most Used" }), _jsx("option", { value: "category-asc", children: "Category" })] })] }), filteredTools.length === 0 ? (_jsx(EmptyState, {})) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredTools.map((tool) => (_jsx(ToolCard, { tool: tool, categoryIcon: getCategoryIcon(tool.definition.category), statusBadge: getStatusBadge(tool.status), onToggle: () => handleToggleTool(tool.definition.id, tool.status), onSelect: () => setSelectedTool(tool.definition) }, tool.definition.id))) })), selectedTool && (_jsx(ToolDetailModal, { tool: selectedTool, onClose: () => setSelectedTool(null) }))] }));
};
const StatCard = ({ label, value, icon, color }) => (_jsx("div", { className: "card", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-[var(--color-text-muted)]", children: label }), _jsx("p", { className: `text-2xl font-bold ${color || ''}`, children: value })] }), _jsx("span", { className: "text-2xl", children: icon })] }) }));
/**
 * Empty State Component
 */
const EmptyState = () => (_jsxs("div", { className: "text-center py-16 card", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDEE0\uFE0F" }), _jsx("h3", { className: "text-xl font-bold mb-2", children: "No Tools Found" }), _jsx("p", { className: "text-[var(--color-text-muted)] max-w-md mx-auto", children: "No tools match your current filters. Try adjusting your search or filters." })] }));
const ToolCard = ({ tool, categoryIcon, statusBadge, onToggle, onSelect, }) => {
    const isEnabled = tool.status === 'enabled';
    return (_jsxs("div", { className: "card-hover group", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-12 h-12 bg-[var(--color-surface-hover)] rounded-lg flex items-center justify-center text-2xl", children: categoryIcon }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold truncate max-w-[150px]", children: tool.definition.name }), _jsx("p", { className: "text-sm text-[var(--color-text-muted)] capitalize", children: tool.definition.category })] })] }), _jsx("span", { className: statusBadge.className, children: statusBadge.label })] }), _jsx("p", { className: "text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2", children: tool.definition.description }), _jsxs("div", { className: "flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-4", children: [_jsxs("span", { children: ["ID: ", tool.definition.id] }), tool.definition.metadata?.version && (_jsxs("span", { children: ["v", tool.definition.metadata.version] }))] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: onToggle, className: `flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${isEnabled
                            ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`, children: isEnabled ? 'Disable' : 'Enable' }), _jsx("button", { onClick: onSelect, className: "flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors", children: "Details" })] })] }));
};
const ToolDetailModal = ({ tool, onClose }) => {
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [_jsx("div", { className: "absolute inset-0 bg-black/50", onClick: onClose }), _jsxs("div", { className: "relative bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] w-full max-lg max-h-[90vh] overflow-auto", children: [_jsxs("div", { className: "p-6 border-b border-[var(--color-border)]", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "text-xl font-bold", children: tool.name }), _jsx("button", { onClick: onClose, className: "text-2xl hover:text-[var(--color-primary)]", children: "\u00D7" })] }), _jsx("p", { className: "text-sm text-[var(--color-text-muted)] mt-1", children: tool.id })] }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Description" }), _jsx("p", { className: "text-[var(--color-text-muted)]", children: tool.description })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Category" }), _jsx("span", { className: "badge-info capitalize", children: tool.category })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Version" }), _jsx("span", { className: "text-[var(--color-text-muted)]", children: tool.metadata?.version || '1.0.0' })] })] }), tool.metadata?.tags && tool.metadata.tags.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Tags" }), _jsx("div", { className: "flex flex-wrap gap-2", children: tool.metadata.tags.map((tag) => (_jsx("span", { className: "badge", children: tag }, tag))) })] })), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Schema" }), _jsx("pre", { className: "bg-[var(--color-bg)] p-4 rounded-lg text-sm overflow-x-auto", children: _jsx("code", { children: JSON.stringify(tool.schema, null, 2) }) })] }), tool.metadata?.examples && tool.metadata.examples.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Examples" }), _jsx("div", { className: "space-y-2", children: tool.metadata.examples.map((example, index) => (_jsxs("div", { className: "bg-[var(--color-bg)] p-4 rounded-lg", children: [_jsx("p", { className: "text-sm text-[var(--color-text-muted)] mb-2", children: example.description }), _jsxs("code", { className: "text-xs block", children: ["Input: ", JSON.stringify(example.input)] })] }, index))) })] }))] }), _jsx("div", { className: "p-6 border-t border-[var(--color-border)] flex justify-end", children: _jsx("button", { onClick: onClose, className: "btn-secondary", children: "Close" }) })] })] }));
};
export default ToolsView;
