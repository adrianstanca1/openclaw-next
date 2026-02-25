import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Server, Plus, MoreVertical, Activity, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
export const Gateways = () => {
    // Mock gateways data - will be replaced with API data
    const gateways = [
        {
            id: 'gw-1',
            name: 'US-East-1',
            region: 'us-east-1',
            endpoint: 'https://gateway-us-east.openclaw.io',
            status: 'online',
            version: '1.2.3',
            uptime: 720,
            connections: {
                active: 156,
                total: 500,
                websocket: 89,
                http: 67
            },
            resources: {
                memory: 45,
                cpu: 32,
                requestsPerMinute: 1250
            }
        },
        {
            id: 'gw-2',
            name: 'EU-West-1',
            region: 'eu-west-1',
            endpoint: 'https://gateway-eu-west.openclaw.io',
            status: 'online',
            version: '1.2.3',
            uptime: 480,
            connections: {
                active: 98,
                total: 400,
                websocket: 54,
                http: 44
            },
            resources: {
                memory: 38,
                cpu: 28,
                requestsPerMinute: 890
            }
        },
        {
            id: 'gw-3',
            name: 'AP-South-1',
            region: 'ap-south-1',
            endpoint: 'https://gateway-ap-south.openclaw.io',
            status: 'degraded',
            version: '1.2.2',
            uptime: 168,
            connections: {
                active: 23,
                total: 300,
                websocket: 12,
                http: 11
            },
            resources: {
                memory: 78,
                cpu: 65,
                requestsPerMinute: 320
            }
        }
    ];
    const getStatusIcon = (status) => {
        switch (status) {
            case 'online':
                return _jsx(CheckCircle, { className: "w-5 h-5 text-green-400" });
            case 'degraded':
                return _jsx(AlertCircle, { className: "w-5 h-5 text-yellow-400" });
            case 'offline':
                return _jsx(XCircle, { className: "w-5 h-5 text-red-400" });
            default:
                return _jsx(Activity, { className: "w-5 h-5 text-slate-400" });
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'online':
                return 'bg-green-500/20 text-green-400';
            case 'degraded':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'offline':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-slate-700 text-slate-400';
        }
    };
    const formatUptime = (hours) => {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        if (days > 0) {
            return `${days}d ${remainingHours}h`;
        }
        return `${hours}h`;
    };
    return (_jsxs("div", { className: "p-8 space-y-6 bg-[var(--color-bg)] text-white", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold", children: "Gateway Management" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Manage OpenClaw gateways across regions" })] }), _jsxs("button", { className: "flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors", children: [_jsx(Plus, { className: "w-4 h-4" }), _jsx("span", { children: "Add Gateway" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Server, { className: "w-5 h-5 text-indigo-400" }), _jsx("span", { className: "text-slate-400 text-sm", children: "Total Gateways" })] }), _jsx("p", { className: "text-3xl font-bold mt-2", children: gateways.length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-400" }), _jsx("span", { className: "text-slate-400 text-sm", children: "Online" })] }), _jsx("p", { className: "text-3xl font-bold mt-2", children: gateways.filter(g => g.status === 'online').length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-yellow-400" }), _jsx("span", { className: "text-slate-400 text-sm", children: "Degraded" })] }), _jsx("p", { className: "text-3xl font-bold mt-2", children: gateways.filter(g => g.status === 'degraded').length })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Activity, { className: "w-5 h-5 text-blue-400" }), _jsx("span", { className: "text-slate-400 text-sm", children: "Total Requests/min" })] }), _jsx("p", { className: "text-3xl font-bold mt-2", children: gateways.reduce((sum, g) => sum + g.resources.requestsPerMinute, 0) })] })] }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: gateways.map((gateway) => (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 bg-indigo-500/20 rounded-lg", children: _jsx(Server, { className: "w-6 h-6 text-indigo-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-white font-semibold text-lg", children: gateway.name }), _jsx("p", { className: "text-slate-400 text-sm", children: gateway.region })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getStatusIcon(gateway.status), _jsx("span", { className: `px-2 py-1 text-xs rounded-full ${getStatusColor(gateway.status)}`, children: gateway.status }), _jsx("button", { className: "p-1 text-slate-400 hover:text-white", children: _jsx(MoreVertical, { className: "w-4 h-4" }) })] })] }), _jsx("p", { className: "text-slate-400 text-sm font-mono mb-4", children: gateway.endpoint }), _jsxs("div", { className: "grid grid-cols-2 gap-4 mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-slate-500 text-xs mb-1", children: "Version" }), _jsx("p", { className: "text-white font-medium", children: gateway.version })] }), _jsxs("div", { children: [_jsx("p", { className: "text-slate-500 text-xs mb-1", children: "Uptime" }), _jsx("p", { className: "text-white font-medium", children: formatUptime(gateway.uptime) })] }), _jsxs("div", { children: [_jsx("p", { className: "text-slate-500 text-xs mb-1", children: "Connections" }), _jsxs("p", { className: "text-white font-medium", children: [gateway.connections.active, " / ", gateway.connections.total] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-slate-500 text-xs mb-1", children: "Requests/min" }), _jsx("p", { className: "text-white font-medium", children: gateway.resources.requestsPerMinute.toLocaleString() })] })] }), _jsxs("div", { className: "space-y-3 pt-4 border-t border-slate-800", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs mb-1", children: [_jsx("span", { className: "text-slate-400", children: "CPU" }), _jsxs("span", { className: "text-slate-300", children: [gateway.resources.cpu, "%"] })] }), _jsx("div", { className: "h-2 bg-slate-800 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full rounded-full ${gateway.resources.cpu > 80 ? 'bg-red-500' :
                                                    gateway.resources.cpu > 50 ? 'bg-yellow-500' :
                                                        'bg-green-500'}`, style: { width: `${gateway.resources.cpu}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs mb-1", children: [_jsx("span", { className: "text-slate-400", children: "Memory" }), _jsxs("span", { className: "text-slate-300", children: [gateway.resources.memory, "%"] })] }), _jsx("div", { className: "h-2 bg-slate-800 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full rounded-full ${gateway.resources.memory > 80 ? 'bg-red-500' :
                                                    gateway.resources.memory > 50 ? 'bg-yellow-500' :
                                                        'bg-green-500'}`, style: { width: `${gateway.resources.memory}%` } }) })] })] })] }, gateway.id))) }), gateways.length === 0 && (_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-12 text-center", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83C\uDF10" }), _jsx("h3", { className: "text-white font-semibold mb-2", children: "No Gateways" }), _jsx("p", { className: "text-slate-400", children: "Add your first gateway" })] }))] }));
};
export default Gateways;
