import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OpenClaw Next - Approvals Management Page
// Manage pending approval requests
import { useState } from 'react';
import { Check, X, Clock, User, Calendar } from 'lucide-react';
export const Approvals = () => {
    const [filter, setFilter] = useState('pending');
    // Mock approvals data - will be replaced with API data
    const approvals = [
        {
            id: 'approval-1',
            type: 'agent_spawn',
            requester: 'John Doe',
            requesterId: 'user-1',
            description: 'Spawn new Code Reviewer agent for PR analysis',
            priority: 'high',
            status: 'pending',
            requestedAt: new Date(Date.now() - 300000).toISOString(),
            metadata: {
                agentName: 'Code-Reviewer-2',
                model: 'llama3.2',
                capabilities: ['code_review', 'pr_analysis']
            }
        },
        {
            id: 'approval-2',
            type: 'skill_install',
            requester: 'Jane Smith',
            requesterId: 'user-2',
            description: 'Install Python code analysis skill',
            priority: 'normal',
            status: 'pending',
            requestedAt: new Date(Date.now() - 900000).toISOString(),
            metadata: {
                skillName: 'python-analyzer',
                version: '1.2.0',
                dependencies: ['python-runtime']
            }
        },
        {
            id: 'approval-3',
            type: 'delegation',
            requester: 'Agent-15',
            requesterId: 'agent-15',
            description: 'Delegate data processing task to specialist agent',
            priority: 'critical',
            status: 'pending',
            requestedAt: new Date(Date.now() - 120000).toISOString(),
            metadata: {
                taskId: 'task-789',
                targetAgent: 'Data-Specialist',
                estimatedDuration: '30 minutes'
            }
        },
        {
            id: 'approval-4',
            type: 'config_change',
            requester: 'Admin',
            requesterId: 'user-admin',
            description: 'Update rate limit configuration from 100 to 200 req/min',
            priority: 'low',
            status: 'approved',
            requestedAt: new Date(Date.now() - 7200000).toISOString(),
            reviewedAt: new Date(Date.now() - 7000000).toISOString(),
            reviewer: 'System Admin',
            reason: 'Approved for increased capacity'
        },
        {
            id: 'approval-5',
            type: 'task',
            requester: 'DevOps Bot',
            requesterId: 'agent-devops',
            description: 'Execute production deployment task',
            priority: 'high',
            status: 'rejected',
            requestedAt: new Date(Date.now() - 14400000).toISOString(),
            reviewedAt: new Date(Date.now() - 14000000).toISOString(),
            reviewer: 'Release Manager',
            reason: 'Deployment window closed, reschedule for next window'
        }
    ];
    const filteredApprovals = filter === 'all' ? approvals : approvals.filter(a => a.status === filter);
    const getTypeIcon = (type) => {
        switch (type) {
            case 'agent_spawn':
                return '🤖';
            case 'skill_install':
                return '✨';
            case 'delegation':
                return '📤';
            case 'config_change':
                return '⚙️';
            case 'task':
                return '📋';
            default:
                return '📝';
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'normal':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'low':
                return 'bg-slate-700 text-slate-400 border-slate-600';
            default:
                return 'bg-slate-700 text-slate-400';
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'approved':
                return 'bg-green-500/20 text-green-400';
            case 'rejected':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-slate-700 text-slate-400';
        }
    };
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        if (minutes < 1)
            return 'Just now';
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        return date.toLocaleDateString();
    };
    const handleApprove = (id) => {
        console.log('Approving:', id);
        // Will be replaced with API call
    };
    const handleReject = (id) => {
        console.log('Rejecting:', id);
        // Will be replaced with API call
    };
    return (_jsxs("div", { className: "p-8 space-y-6 bg-[var(--color-bg)] text-white", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Approvals" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Manage pending approval requests" })] }), _jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full", children: [_jsx(Clock, { className: "w-4 h-4 text-yellow-400" }), _jsxs("span", { className: "text-yellow-400 text-sm font-medium", children: [approvals.filter(a => a.status === 'pending').length, " Pending"] })] })] }), _jsx("div", { className: "flex items-center gap-2", children: ['all', 'pending', 'approved', 'rejected'].map((status) => (_jsx("button", { onClick: () => setFilter(status), className: `px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === status
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'}`, children: status.charAt(0).toUpperCase() + status.slice(1) }, status))) }), _jsxs("div", { className: "grid grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Total" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: approvals.length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Pending" }), _jsx("p", { className: "text-2xl font-bold text-yellow-400 mt-1", children: approvals.filter(a => a.status === 'pending').length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Approved" }), _jsx("p", { className: "text-2xl font-bold text-green-400 mt-1", children: approvals.filter(a => a.status === 'approved').length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Rejected" }), _jsx("p", { className: "text-2xl font-bold text-red-400 mt-1", children: approvals.filter(a => a.status === 'rejected').length })] })] }), _jsx("div", { className: "space-y-4", children: filteredApprovals.map((approval) => (_jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-4 flex-1", children: [_jsx("div", { className: "text-3xl", children: getTypeIcon(approval.type) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-white font-semibold text-lg", children: approval.description }), _jsx("span", { className: `px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(approval.priority)}`, children: approval.priority }), _jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${getStatusColor(approval.status)}`, children: approval.status })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-slate-400 mb-3", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(User, { className: "w-4 h-4" }), approval.requester] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "w-4 h-4" }), formatTime(approval.requestedAt)] }), _jsx("span", { className: "px-2 py-0.5 bg-slate-800 rounded text-xs", children: approval.type.replace('_', ' ') })] }), approval.metadata && (_jsxs("div", { className: "mt-3 p-3 bg-slate-800 rounded-lg", children: [_jsx("p", { className: "text-slate-500 text-xs mb-2", children: "Metadata:" }), _jsx("pre", { className: "text-slate-300 text-xs font-mono overflow-x-auto", children: JSON.stringify(approval.metadata, null, 2) })] })), approval.reason && (_jsx("div", { className: `mt-3 p-3 rounded-lg ${approval.status === 'approved'
                                                    ? 'bg-green-500/10 border border-green-500/20'
                                                    : 'bg-red-500/10 border border-red-500/20'}`, children: _jsxs("p", { className: `text-sm ${approval.status === 'approved' ? 'text-green-400' : 'text-red-400'}`, children: [_jsx("span", { className: "font-medium", children: "Reviewer: " }), approval.reason] }) }))] })] }), approval.status === 'pending' && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => handleApprove(approval.id), className: "flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors", children: [_jsx(Check, { className: "w-4 h-4" }), "Approve"] }), _jsxs("button", { onClick: () => handleReject(approval.id), className: "flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-red-600 text-white rounded-lg transition-colors", children: [_jsx(X, { className: "w-4 h-4" }), "Reject"] })] })), approval.status !== 'pending' && (_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-slate-400 text-sm", children: approval.status === 'approved' ? 'Approved by' : 'Rejected by' }), _jsx("p", { className: "text-white font-medium", children: approval.reviewer }), approval.reviewedAt && (_jsx("p", { className: "text-slate-500 text-xs mt-1", children: formatTime(approval.reviewedAt) }))] }))] }) }, approval.id))) }), filteredApprovals.length === 0 && (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-12 text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: filter === 'pending' ? '🎉' : '📋' }), _jsx("h3", { className: "text-white font-semibold mb-2", children: filter === 'pending' ? 'All Caught Up!' : `No ${filter} approvals` }), _jsx("p", { className: "text-slate-400", children: filter === 'pending'
                            ? 'No pending approval requests'
                            : 'Change filter to view other approvals' })] }))] }));
};
export default Approvals;
