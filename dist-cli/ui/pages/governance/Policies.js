import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OpenClaw Next - Policies Management Page
// Configure governance policies
import { useState } from 'react';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
export const Policies = () => {
    const [policies, setPolicies] = useState([
        {
            id: 'policy-1',
            name: 'Approval Required',
            description: 'Require approval for agent spawning and skill installation',
            type: 'approval',
            active: true,
            rules: {
                requireApprovalFor: ['agent_spawn', 'skill_install'],
                approvers: ['admin', 'lead']
            },
            createdAt: new Date(Date.now() - 2592000000).toISOString()
        },
        {
            id: 'policy-2',
            name: 'Rate Limiting',
            description: 'Limit API requests to prevent abuse',
            type: 'rate_limit',
            active: true,
            rules: {
                requestsPerMinute: 100,
                requestsPerHour: 1000,
                burstLimit: 20
            },
            createdAt: new Date(Date.now() - 1728000000).toISOString()
        },
        {
            id: 'policy-3',
            name: 'Resource Quota',
            description: 'Limit concurrent agents and resource usage',
            type: 'resource',
            active: false,
            rules: {
                maxConcurrentAgents: 20,
                maxMemoryPerAgent: '2GB',
                maxCpuPerAgent: '2 cores'
            },
            createdAt: new Date(Date.now() - 864000000).toISOString()
        }
    ]);
    const togglePolicy = (id) => {
        setPolicies(policies.map(p => p.id === id ? { ...p, active: !p.active } : p));
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'approval': return 'bg-yellow-500/20 text-yellow-400';
            case 'rate_limit': return 'bg-blue-500/20 text-blue-400';
            case 'access': return 'bg-purple-500/20 text-purple-400';
            case 'resource': return 'bg-green-500/20 text-green-400';
            default: return 'bg-slate-700 text-slate-400';
        }
    };
    return (_jsxs("div", { className: "p-8 space-y-6 bg-[var(--color-bg)] text-white", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Policies" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Configure governance policies" })] }), _jsxs("button", { className: "flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Create Policy" })] })] }), _jsx("div", { className: "space-y-4", children: policies.map((policy) => (_jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-4 flex-1", children: [_jsx("div", { className: `p-3 rounded-lg ${policy.active ? 'bg-indigo-500/20' : 'bg-slate-700/50'}`, children: _jsx(Shield, { className: `w-6 h-6 ${policy.active ? 'text-indigo-400' : 'text-slate-400'}` }) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-white font-semibold text-lg", children: policy.name }), _jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${policy.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`, children: policy.active ? 'Active' : 'Inactive' }), _jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${getTypeColor(policy.type)}`, children: policy.type.replace('_', ' ') })] }), _jsx("p", { className: "text-slate-400 text-sm mb-4", children: policy.description }), _jsx("div", { className: "flex flex-wrap gap-2", children: Object.entries(policy.rules).slice(0, 3).map(([key, value]) => (_jsxs("div", { className: "px-3 py-1.5 bg-slate-800 rounded text-xs", children: [_jsxs("span", { className: "text-slate-500", children: [key, ":"] }), ' ', _jsx("span", { className: "text-slate-300", children: Array.isArray(value) ? value.join(', ') : String(value) })] }, key))) })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => togglePolicy(policy.id), className: `w-11 h-6 rounded-full relative transition-colors ${policy.active ? 'bg-indigo-500' : 'bg-slate-700'}`, children: _jsx("div", { className: `absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${policy.active ? 'translate-x-6' : 'translate-x-1'}` }) }), _jsx("button", { className: "p-2 text-slate-400 hover:text-white transition-colors", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-2 text-slate-400 hover:text-red-400 transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }) }, policy.id))) }), policies.length === 0 && (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-12 text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDEE1\uFE0F" }), _jsx("h3", { className: "text-white font-semibold mb-2", children: "No Policies" }), _jsx("p", { className: "text-slate-400", children: "Create your first governance policy" })] }))] }));
};
export default Policies;
