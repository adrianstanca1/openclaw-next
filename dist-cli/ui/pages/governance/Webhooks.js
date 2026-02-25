import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plus, Trash2, Edit } from 'lucide-react';
export const Webhooks = () => {
    // Mock webhooks data - will be replaced with API data
    const webhooks = [
        {
            id: 'wh-1',
            name: 'Slack Notifications',
            url: 'https://hooks.slack.com/services/xxx/yyy/zzz',
            events: ['agent.spawned', 'task.completed', 'approval.requested'],
            active: true,
            createdAt: new Date(Date.now() - 864000000).toISOString()
        },
        {
            id: 'wh-2',
            name: 'Discord Alerts',
            url: 'https://discord.com/api/webhooks/xxx/yyy',
            events: ['agent.error', 'task.failed'],
            active: true,
            createdAt: new Date(Date.now() - 432000000).toISOString()
        }
    ];
    return (_jsxs("div", { className: "p-8 space-y-6 bg-[var(--color-bg)] text-white", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Webhooks" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Manage webhook integrations" })] }), _jsxs("button", { className: "flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Create Webhook" })] })] }), _jsx("div", { className: "space-y-4", children: webhooks.map((webhook) => (_jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-white font-semibold text-lg", children: webhook.name }), _jsx("span", { className: `px-2 py-0.5 text-xs rounded-full ${webhook.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`, children: webhook.active ? 'Active' : 'Inactive' })] }), _jsx("p", { className: "text-slate-400 text-sm font-mono mb-4", children: webhook.url }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "text-slate-500 text-sm", children: "Events:" }), webhook.events.map((event) => (_jsx("span", { className: "px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded", children: event }, event)))] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { className: "p-2 text-slate-400 hover:text-white transition-colors", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx("button", { className: "p-2 text-slate-400 hover:text-red-400 transition-colors", children: _jsx(Trash2, { className: "w-4 h-4" }) })] })] }) }, webhook.id))) }), webhooks.length === 0 && (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-12 text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDD0C" }), _jsx("h3", { className: "text-white font-semibold mb-2", children: "No Webhooks" }), _jsx("p", { className: "text-slate-400", children: "Create your first webhook integration" })] }))] }));
};
export default Webhooks;
