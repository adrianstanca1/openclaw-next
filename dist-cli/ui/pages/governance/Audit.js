import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OpenClaw Next - Audit Log Page
// Track all actions and changes
import { useState } from 'react';
import { FileText, Filter, Download, Search, Shield, Bot, User, Settings, AlertTriangle } from 'lucide-react';
export const Audit = () => {
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    // Mock audit logs - will be replaced with API data
    const auditLogs = [
        {
            id: 'log-1',
            action: 'Agent terminated',
            actor: 'Admin',
            actorType: 'user',
            target: 'Agent-12',
            targetType: 'agent',
            details: { reason: 'Resource cleanup', sessionId: 'sess-123' },
            timestamp: new Date(Date.now() - 120000).toISOString(),
            severity: 'warning'
        },
        {
            id: 'log-2',
            action: 'Policy updated',
            actor: 'John Doe',
            actorType: 'user',
            target: 'Approval Policy',
            targetType: 'policy',
            details: { changes: ['requireApprovalFor', 'approvers'] },
            timestamp: new Date(Date.now() - 900000).toISOString(),
            severity: 'info'
        },
        {
            id: 'log-3',
            action: 'Team created',
            actor: 'Jane Smith',
            actorType: 'user',
            target: 'Engineering',
            targetType: 'config',
            details: { memberCount: 12, initialAgents: 5 },
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            severity: 'info'
        },
        {
            id: 'log-4',
            action: 'API key revoked',
            actor: 'System',
            actorType: 'system',
            target: 'Key-***45',
            targetType: 'key',
            details: { reason: 'Expired', keyId: 'key-45' },
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            severity: 'warning'
        },
        {
            id: 'log-5',
            action: 'Agent failed to spawn',
            actor: 'Agent-Manager',
            actorType: 'agent',
            target: 'Code-Reviewer',
            targetType: 'agent',
            details: { error: 'Model not available', retryCount: 3 },
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            severity: 'error'
        },
        {
            id: 'log-6',
            action: 'Configuration changed',
            actor: 'Admin',
            actorType: 'user',
            target: 'Gateway Settings',
            targetType: 'config',
            details: { previous: { maxConnections: 100 }, new: { maxConnections: 200 } },
            timestamp: new Date(Date.now() - 28800000).toISOString(),
            severity: 'info'
        }
    ];
    const getActorIcon = (type) => {
        switch (type) {
            case 'user':
                return _jsx(User, { className: "w-4 h-4" });
            case 'agent':
                return _jsx(Bot, { className: "w-4 h-4" });
            case 'system':
                return _jsx(Settings, { className: "w-4 h-4" });
            default:
                return _jsx(Shield, { className: "w-4 h-4" });
        }
    };
    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'error':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'warning':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'info':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default:
                return 'bg-slate-700 text-slate-400 border-slate-600';
        }
    };
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return 'Just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        if (days < 7)
            return `${days}d ago`;
        return date.toLocaleDateString();
    };
    const filteredLogs = auditLogs.filter(log => {
        if (filter === 'error' && log.severity !== 'error' && log.severity !== 'critical') {
            return false;
        }
        if (filter === 'warning' && log.severity !== 'warning') {
            return false;
        }
        if (searchQuery && !log.action.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !log.actor.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !log.target.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });
    return (_jsxs("div", { className: "p-8 space-y-6 bg-[var(--color-bg)] text-white", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Audit Log" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Track all actions and changes" })] }), _jsxs("button", { className: "flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700", children: [_jsx(Download, { className: "w-4 h-4" }), _jsx("span", { children: "Export" })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "relative flex-1 max-w-md", children: [_jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" }), _jsx("input", { type: "text", placeholder: "Search logs...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Filter, { className: "w-4 h-4 text-slate-400" }), _jsxs("select", { value: filter, onChange: (e) => setFilter(e.target.value), className: "px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500", children: [_jsx("option", { value: "all", children: "All Severity" }), _jsx("option", { value: "error", children: "Errors Only" }), _jsx("option", { value: "warning", children: "Warnings Only" })] })] })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-slate-800/50 border-b border-slate-800", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "w-4 h-4" }), "Action"] }) }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider", children: "Actor" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider", children: "Target" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider", children: "Severity" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider", children: "Time" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-800", children: filteredLogs.map((log) => (_jsxs("tr", { className: "hover:bg-slate-800/30 transition-colors", children: [_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { children: [_jsx("p", { className: "text-white font-medium", children: log.action }), Object.keys(log.details).length > 0 && (_jsx("p", { className: "text-slate-500 text-xs mt-1 font-mono", children: JSON.stringify(log.details) }))] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `p-1.5 rounded ${log.actorType === 'user' ? 'bg-blue-500/20 text-blue-400' :
                                                                log.actorType === 'agent' ? 'bg-purple-500/20 text-purple-400' :
                                                                    'bg-slate-700 text-slate-400'}`, children: getActorIcon(log.actorType) }), _jsx("span", { className: "text-slate-300", children: log.actor })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [log.targetType === 'agent' && _jsx(Bot, { className: "w-4 h-4 text-slate-400" }), log.targetType === 'policy' && _jsx(Shield, { className: "w-4 h-4 text-slate-400" }), log.targetType === 'config' && _jsx(Settings, { className: "w-4 h-4 text-slate-400" }), log.targetType === 'key' && _jsx(AlertTriangle, { className: "w-4 h-4 text-slate-400" }), _jsx("span", { className: "text-slate-300", children: log.target })] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: `px-2 py-1 text-xs rounded-full border ${getSeverityColor(log.severity)}`, children: log.severity }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("span", { className: "text-slate-400 text-sm", children: formatTime(log.timestamp) }) })] }, log.id))) })] }) }), filteredLogs.length === 0 && (_jsxs("div", { className: "p-12 text-center", children: [_jsx(FileText, { className: "w-12 h-12 text-slate-700 mx-auto mb-3" }), _jsx("p", { className: "text-slate-500", children: "No audit logs found" })] }))] }), _jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Total Events" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: auditLogs.length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Errors" }), _jsx("p", { className: "text-2xl font-bold text-red-400 mt-1", children: auditLogs.filter(l => l.severity === 'error' || l.severity === 'critical').length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Warnings" }), _jsx("p", { className: "text-2xl font-bold text-yellow-400 mt-1", children: auditLogs.filter(l => l.severity === 'warning').length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Info" }), _jsx("p", { className: "text-2xl font-bold text-blue-400 mt-1", children: auditLogs.filter(l => l.severity === 'info').length })] })] })] }));
};
export default Audit;
