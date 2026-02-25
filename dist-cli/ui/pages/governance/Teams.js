import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// OpenClaw Next - Teams Management Page
// Manage teams and organizations
import { useState } from 'react';
import { Users, Plus, Settings, Bot, Server, ChevronRight, Shield } from 'lucide-react';
export const Teams = () => {
    const [selectedTeam, setSelectedTeam] = useState(null);
    // Mock teams data - will be replaced with API data
    const displayTeams = [
        {
            id: 'team-1',
            name: 'Engineering',
            description: 'Core engineering team with full access',
            memberCount: 12,
            agentCount: 8,
            gatewayCount: 2,
            createdAt: new Date(Date.now() - 2592000000).toISOString(),
            settings: {
                maxAgents: 20,
                maxGateways: 5,
                requireApprovalFor: ['agent_spawn', 'skill_install'],
                autoApprove: false
            }
        },
        {
            id: 'team-2',
            name: 'Data Science',
            description: 'Data processing and ML workloads',
            memberCount: 6,
            agentCount: 15,
            gatewayCount: 1,
            createdAt: new Date(Date.now() - 1728000000).toISOString(),
            settings: {
                maxAgents: 30,
                maxGateways: 3,
                requireApprovalFor: ['delegation'],
                autoApprove: true
            }
        },
        {
            id: 'team-3',
            name: 'DevOps',
            description: 'Infrastructure and automation',
            memberCount: 4,
            agentCount: 6,
            gatewayCount: 3,
            createdAt: new Date(Date.now() - 864000000).toISOString(),
            settings: {
                maxAgents: 15,
                maxGateways: 10,
                requireApprovalFor: [],
                autoApprove: true
            }
        }
    ];
    const team = selectedTeam
        ? displayTeams.find(t => t.id === selectedTeam)
        : null;
    return (_jsx("div", { className: "p-8 space-y-6 bg-[var(--color-bg)] text-white", children: !team ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Teams" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Manage teams and organizations" })] }), _jsxs("button", { className: "flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Create Team" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: displayTeams.map((t) => (_jsxs("div", { onClick: () => setSelectedTeam(t.id), className: "bg-slate-900 border border-slate-800 rounded-xl p-6 cursor-pointer hover:border-indigo-500/50 transition-colors", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsx("div", { className: "w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center", children: _jsx(Users, { className: "w-6 h-6 text-indigo-400" }) }), _jsx("button", { className: "p-2 text-slate-500 hover:text-white", children: _jsx(Settings, { className: "w-4 h-4" }) })] }), _jsx("h3", { className: "text-white font-semibold text-lg mb-1", children: t.name }), _jsx("p", { className: "text-slate-400 text-sm mb-4", children: t.description }), _jsxs("div", { className: "grid grid-cols-3 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-white", children: t.memberCount }), _jsx("p", { className: "text-slate-500 text-xs", children: "Members" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-white", children: t.agentCount }), _jsx("p", { className: "text-slate-500 text-xs", children: "Agents" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-white", children: t.gatewayCount }), _jsx("p", { className: "text-slate-500 text-xs", children: "Gateways" })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-slate-800", children: [_jsxs("span", { className: "text-slate-500 text-sm", children: ["Created ", new Date(t.createdAt).toLocaleDateString()] }), _jsxs("button", { className: "flex items-center gap-1 text-indigo-400 text-sm hover:text-indigo-300", children: [_jsx("span", { children: "Manage" }), _jsx(ChevronRight, { className: "w-4 h-4" })] })] })] }, t.id))) })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsx("button", { onClick: () => setSelectedTeam(null), className: "text-slate-400 hover:text-white", children: "\u2190 Back" }), _jsx("h1", { className: "text-2xl font-bold", children: team.name })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Users, { className: "w-5 h-5 text-indigo-400" }), _jsx("span", { className: "text-slate-400", children: "Members" })] }), _jsx("p", { className: "text-3xl font-bold text-white", children: team.memberCount })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Bot, { className: "w-5 h-5 text-blue-400" }), _jsx("span", { className: "text-slate-400", children: "Agents" })] }), _jsxs("p", { className: "text-3xl font-bold text-white", children: [team.agentCount, " / ", team.settings.maxAgents] })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(Server, { className: "w-5 h-5 text-green-400" }), _jsx("span", { className: "text-slate-400", children: "Gateways" })] }), _jsxs("p", { className: "text-3xl font-bold text-white", children: [team.gatewayCount, " / ", team.settings.maxGateways] })] })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6", children: [_jsx("h3", { className: "text-white font-semibold mb-4", children: "Recent Activity" }), _jsx("div", { className: "space-y-4", children: [
                                                { action: 'Agent spawned', user: 'John Doe', time: '2 min ago' },
                                                { action: 'Task completed', user: 'Agent-15', time: '5 min ago' },
                                                { action: 'Settings updated', user: 'Jane Smith', time: '1 hour ago' },
                                            ].map((activity, i) => (_jsxs("div", { className: "flex items-center justify-between py-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-2 h-2 bg-indigo-500 rounded-full" }), _jsx("span", { className: "text-slate-300", children: activity.action })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-slate-400 text-sm", children: activity.user }), _jsx("p", { className: "text-slate-500 text-xs", children: activity.time })] })] }, i))) })] })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6", children: [_jsxs("h3", { className: "text-white font-semibold mb-4 flex items-center gap-2", children: [_jsx(Shield, { className: "w-5 h-5" }), "Team Settings"] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-slate-400 text-sm", children: "Auto-approve" }), _jsxs("div", { className: "mt-1 flex items-center gap-2", children: [_jsx("div", { className: `w-11 h-6 rounded-full ${team.settings.autoApprove ? 'bg-indigo-500' : 'bg-slate-700'} relative cursor-pointer`, children: _jsx("div", { className: `absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${team.settings.autoApprove ? 'translate-x-6' : 'translate-x-1'}` }) }), _jsx("span", { className: "text-slate-400 text-sm", children: team.settings.autoApprove ? 'Enabled' : 'Disabled' })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-slate-400 text-sm", children: "Require approval for:" }), _jsx("div", { className: "mt-2 flex flex-wrap gap-2", children: team.settings.requireApprovalFor.length > 0 ? (team.settings.requireApprovalFor.map((req) => (_jsx("span", { className: "px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded", children: req.replace('_', ' ') }, req)))) : (_jsx("span", { className: "text-slate-500 text-sm", children: "None" })) })] }), _jsx("div", { className: "pt-4 border-t border-slate-800", children: _jsx("button", { className: "w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors", children: "Edit Settings" }) })] })] })] })] })) }));
};
export default Teams;
