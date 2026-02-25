import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OpenClaw Next - Tasks Management Page
// View and manage delegated tasks
import { useState } from 'react';
import { ListTodo, Play, Pause, Trash2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
export const Tasks = () => {
    const [filter, setFilter] = useState('all');
    // Mock tasks data - will be replaced with API data
    const tasks = [
        {
            id: 'task-1',
            type: 'execution',
            priority: 1,
            status: 'completed',
            agentId: 'agent-1',
            assignedAgent: 'Code-Reviewer',
            description: 'Review pull request #123',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            startedAt: new Date(Date.now() - 3500000).toISOString(),
            completedAt: new Date(Date.now() - 3000000).toISOString()
        },
        {
            id: 'task-2',
            type: 'reasoning',
            priority: 2,
            status: 'processing',
            agentId: 'agent-2',
            assignedAgent: 'Data-Analyzer',
            description: 'Analyze user behavior patterns',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            startedAt: new Date(Date.now() - 1700000).toISOString()
        },
        {
            id: 'task-3',
            type: 'delegation',
            priority: 1,
            status: 'pending',
            description: 'Process batch upload #456',
            createdAt: new Date(Date.now() - 900000).toISOString()
        },
        {
            id: 'task-4',
            type: 'monitoring',
            priority: 3,
            status: 'failed',
            agentId: 'agent-3',
            assignedAgent: 'System-Monitor',
            description: 'Monitor API health endpoints',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            startedAt: new Date(Date.now() - 7100000).toISOString(),
            completedAt: new Date(Date.now() - 7000000).toISOString(),
            error: 'Connection timeout after 30s'
        }
    ];
    const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return _jsx(CheckCircle, { className: "w-4 h-4 text-green-400" });
            case 'processing':
                return _jsx(Play, { className: "w-4 h-4 text-blue-400" });
            case 'pending':
                return _jsx(Clock, { className: "w-4 h-4 text-yellow-400" });
            case 'failed':
                return _jsx(XCircle, { className: "w-4 h-4 text-red-400" });
            default:
                return _jsx(AlertCircle, { className: "w-4 h-4 text-slate-400" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/20 text-green-400';
            case 'processing':
                return 'bg-blue-500/20 text-blue-400';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'failed':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-slate-700 text-slate-400';
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'execution':
                return 'bg-purple-500/20 text-purple-400';
            case 'reasoning':
                return 'bg-indigo-500/20 text-indigo-400';
            case 'delegation':
                return 'bg-orange-500/20 text-orange-400';
            case 'monitoring':
                return 'bg-cyan-500/20 text-cyan-400';
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
    const getPriorityColor = (priority) => {
        if (priority === 1)
            return 'text-red-400';
        if (priority === 2)
            return 'text-yellow-400';
        return 'text-slate-400';
    };
    return (_jsxs("div", { className: "p-8 space-y-6 bg-[var(--color-bg)] text-white", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Tasks" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Manage delegated tasks" })] }), _jsxs("button", { className: "flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors", children: [_jsx(ListTodo, { className: "w-4 h-4" }), _jsx("span", { children: "Create Task" })] })] }), _jsx("div", { className: "flex items-center gap-2", children: ['all', 'pending', 'processing', 'completed', 'failed'].map((status) => (_jsx("button", { onClick: () => setFilter(status), className: `px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === status
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'}`, children: status.charAt(0).toUpperCase() + status.slice(1) }, status))) }), _jsxs("div", { className: "grid grid-cols-5 gap-4", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Total" }), _jsx("p", { className: "text-2xl font-bold text-white mt-1", children: tasks.length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Pending" }), _jsx("p", { className: "text-2xl font-bold text-yellow-400 mt-1", children: tasks.filter(t => t.status === 'pending').length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Processing" }), _jsx("p", { className: "text-2xl font-bold text-blue-400 mt-1", children: tasks.filter(t => t.status === 'processing').length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Completed" }), _jsx("p", { className: "text-2xl font-bold text-green-400 mt-1", children: tasks.filter(t => t.status === 'completed').length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsx("p", { className: "text-slate-400 text-sm", children: "Failed" }), _jsx("p", { className: "text-2xl font-bold text-red-400 mt-1", children: tasks.filter(t => t.status === 'failed').length })] })] }), _jsx("div", { className: "space-y-3", children: filteredTasks.map((task) => (_jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-4 flex-1", children: [_jsx("div", { className: "flex-shrink-0", children: getStatusIcon(task.status) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-white font-medium", children: task.description }), _jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.status)}`, children: task.status }), _jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${getTypeColor(task.type)}`, children: task.type }), _jsxs("span", { className: `text-xs ${getPriorityColor(task.priority)}`, children: ["Priority ", task.priority] })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-slate-400", children: [task.assignedAgent && (_jsxs("span", { children: ["Assigned to: ", _jsx("span", { className: "text-slate-300", children: task.assignedAgent })] })), _jsxs("span", { children: ["Created: ", formatTime(task.createdAt)] }), task.completedAt && (_jsxs("span", { children: ["Completed: ", formatTime(task.completedAt)] }))] }), task.error && (_jsx("div", { className: "mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg", children: _jsx("p", { className: "text-red-400 text-sm", children: task.error }) }))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [task.status === 'pending' && (_jsx("button", { className: "p-2 text-slate-400 hover:text-green-400 transition-colors", title: "Start", children: _jsx(Play, { className: "w-4 h-4" }) })), task.status === 'processing' && (_jsx("button", { className: "p-2 text-slate-400 hover:text-yellow-400 transition-colors", title: "Pause", children: _jsx(Pause, { className: "w-4 h-4" }) })), _jsx("button", { className: "p-2 text-slate-400 hover:text-red-400 transition-colors", title: "Delete", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }) }, task.id))) }), filteredTasks.length === 0 && (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-12 text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDCCB" }), _jsx("h3", { className: "text-white font-semibold mb-2", children: "No Tasks" }), _jsx("p", { className: "text-slate-400", children: filter === 'all' ? 'Create your first task' : `No ${filter} tasks` })] }))] }));
};
export default Tasks;
