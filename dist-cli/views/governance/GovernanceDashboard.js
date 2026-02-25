import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * OpenClaw Next - Governance Dashboard
 * Ported and enhanced from OpenClaw Dashboard
 */
import { Bot, Server, ListTodo, ClipboardCheck, Users, TrendingUp, AlertCircle, Activity, ArrowRight, } from "lucide-react";
import { useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, } from "recharts";
import { useDashboardStore } from "../../ui/stores/dashboard.js";
/**
 * Governance Dashboard View
 */
export const GovernanceDashboard = () => {
    const { stats, fetchAgents, fetchTasks, fetchStats, fetchApprovals, agents = [], tasks = [], approvals = [], } = useDashboardStore();
    useEffect(() => {
        // Initial fetch
        fetchAgents();
        fetchTasks();
        fetchStats();
        fetchApprovals();
        // Live polling every 30s
        const interval = setInterval(() => {
            fetchAgents();
            fetchTasks();
            fetchStats();
            fetchApprovals();
        }, 30000);
        return () => clearInterval(interval);
    }, []);
    const taskData = useMemo(() => {
        const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"];
        const hourData = hours.map((time) => ({ time, completed: 0, failed: 0 }));
        tasks.forEach((task) => {
            const date = new Date(task.createdAt);
            const hourIndex = Math.floor(date.getHours() / 4);
            if (hourIndex >= 0 && hourIndex < hourData.length) {
                if (task.status === "completed")
                    hourData[hourIndex].completed++;
                else if (task.status === "failed")
                    hourData[hourIndex].failed++;
            }
        });
        return hourData;
    }, [tasks]);
    const agentData = useMemo(() => {
        const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"];
        const hourData = hours.map((time) => ({ time, active: 0, idle: 0 }));
        agents.forEach((agent) => {
            const date = new Date(agent.lastActive || agent.createdAt || Date.now());
            const hourIndex = Math.floor(date.getHours() / 4);
            if (hourIndex >= 0 && hourIndex < hourData.length) {
                if (agent.state === "active")
                    hourData[hourIndex].active++;
                else
                    hourData[hourIndex].idle++;
            }
        });
        return hourData;
    }, [agents]);
    const statCards = [
        {
            title: "Active Agents",
            value: stats?.activeAgents || 0,
            total: stats?.totalAgents || 0,
            icon: Bot,
            color: "bg-blue-500",
            trend: "+12%",
        },
        {
            title: "Online Gateways",
            value: stats?.onlineGateways || 0,
            total: 1,
            icon: Server,
            color: "bg-green-500",
            trend: "100%",
        },
        {
            title: "Pending Tasks",
            value: stats?.pendingTasks || 0,
            total: stats?.totalTasks || 0,
            icon: ListTodo,
            color: "bg-yellow-500",
            trend: "-5%",
        },
        {
            title: "Pending Approvals",
            value: stats?.pendingApprovals || 0,
            icon: ClipboardCheck,
            color: "bg-red-500",
            trend: stats?.criticalApprovals ? `+${stats.criticalApprovals} critical` : "0 critical",
        },
    ];
    return (_jsxs("div", { className: "p-8 space-y-6 bg-[var(--color-bg)] text-white", children: [_jsxs("div", { className: "flex justify-between items-end", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Governance Dashboard" }), _jsx("p", { className: "text-slate-400 mt-1", children: "Centralized oversight for OpenClaw Next ecosystem" })] }), _jsxs("div", { className: "flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-green-500 animate-pulse" }), _jsxs("span", { className: "text-sm font-medium", children: ["System ", stats?.systemHealth || "Healthy"] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: statCards.map((stat) => (_jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors group", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-slate-400 text-sm font-medium", children: stat.title }), _jsxs("div", { className: "flex items-baseline gap-2 mt-2", children: [_jsx("span", { className: "text-3xl font-bold", children: stat.value }), stat.total !== undefined && (_jsxs("span", { className: "text-slate-500 text-sm", children: ["/ ", stat.total] }))] }), _jsxs("div", { className: "flex items-center gap-1 mt-2", children: [_jsx(TrendingUp, { className: "w-4 h-4 text-green-400" }), _jsx("span", { className: "text-green-400 text-sm font-medium", children: stat.trend })] })] }), _jsx("div", { className: `p-3 rounded-lg ${stat.color} bg-opacity-20 group-hover:scale-110 transition-transform`, children: _jsx(stat.icon, { className: `w-6 h-6 ${stat.color.replace("bg-", "text-")}` }) })] }) }, stat.title))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold", children: "Task Activity" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Completed vs failed tasks over time" })] }), _jsx(Activity, { className: "w-5 h-5 text-slate-500" })] }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: taskData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#334155" }), _jsx(XAxis, { dataKey: "time", stroke: "#64748b", fontSize: 12 }), _jsx(YAxis, { stroke: "#64748b", fontSize: 12 }), _jsx(Tooltip, { contentStyle: {
                                                    backgroundColor: "#1e293b",
                                                    border: "1px solid #334155",
                                                    borderRadius: "8px",
                                                }, labelStyle: { color: "#f8fafc" } }), _jsx(Area, { type: "monotone", dataKey: "completed", stroke: "#22c55e", fill: "#22c55e", fillOpacity: 0.1, strokeWidth: 2, name: "Completed" }), _jsx(Area, { type: "monotone", dataKey: "failed", stroke: "#ef4444", fill: "#ef4444", fillOpacity: 0.1, strokeWidth: 2, name: "Failed" })] }) }) })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-lg font-semibold", children: "Agent Utilization" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Active vs idle agents over time" })] }), _jsx(Bot, { className: "w-5 h-5 text-slate-500" })] }), _jsx("div", { className: "h-64", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: agentData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "#334155" }), _jsx(XAxis, { dataKey: "time", stroke: "#64748b", fontSize: 12 }), _jsx(YAxis, { stroke: "#64748b", fontSize: 12 }), _jsx(Tooltip, { contentStyle: {
                                                    backgroundColor: "#1e293b",
                                                    border: "1px solid #334155",
                                                    borderRadius: "8px",
                                                }, labelStyle: { color: "#f8fafc" } }), _jsx(Line, { type: "monotone", dataKey: "active", stroke: "#3b82f6", strokeWidth: 3, dot: { r: 4, fill: "#3b82f6" }, activeDot: { r: 6 }, name: "Active" }), _jsx(Line, { type: "monotone", dataKey: "idle", stroke: "#64748b", strokeWidth: 2, strokeDasharray: "5 5", name: "Idle" })] }) }) })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs("div", { className: "lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("h2", { className: "text-lg font-semibold flex items-center gap-2", children: ["Pending Approvals", stats?.pendingApprovals ? (_jsx("span", { className: "bg-red-500 text-white text-xs px-2 py-0.5 rounded-full", children: stats.pendingApprovals })) : null] }), _jsxs("button", { className: "text-indigo-400 text-sm font-medium hover:text-indigo-300 flex items-center gap-1", children: ["View Queue ", _jsx(ArrowRight, { className: "w-4 h-4" })] })] }), _jsx("div", { className: "space-y-4", children: approvals.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(ClipboardCheck, { className: "w-12 h-12 text-slate-700 mx-auto mb-3" }), _jsx("p", { className: "text-slate-500", children: "No pending approvals" })] })) : (approvals.slice(0, 3).map((approval) => (_jsxs("div", { className: "flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors", children: [_jsx("div", { className: `p-2 rounded-lg ${approval.priority === "critical"
                                                ? "bg-red-500/20 text-red-500"
                                                : approval.priority === "high"
                                                    ? "bg-orange-500/20 text-orange-500"
                                                    : "bg-blue-500/20 text-blue-500"}`, children: _jsx(AlertCircle, { className: "w-5 h-5" }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-slate-200 truncate", children: approval.description }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsxs("span", { className: "text-xs text-slate-500", children: ["From: ", approval.requester] }), _jsx("span", { className: "text-xs text-slate-500", children: "\u2022" }), _jsx("span", { className: "text-xs text-slate-500", children: new Date(approval.requestedAt).toLocaleString() })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors", children: "Approve" }), _jsx("button", { className: "px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors", children: "Reject" })] })] }, approval.id)))) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6", children: [_jsx("h2", { className: "text-lg font-semibold mb-6", children: "Security & Policies" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("button", { className: "w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-750 transition-colors text-left border border-slate-750", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(ClipboardCheck, { className: "w-5 h-5 text-indigo-400" }), _jsx("span", { className: "text-sm font-medium", children: "Policy Audit" })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-slate-500" })] }), _jsxs("button", { className: "w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-750 transition-colors text-left border border-slate-750", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Users, { className: "w-5 h-5 text-indigo-400" }), _jsx("span", { className: "text-sm font-medium", children: "Team Permissions" })] }), _jsx(ArrowRight, { className: "w-4 h-4 text-slate-500" })] })] })] }), _jsxs("div", { className: "bg-indigo-600 rounded-xl p-6 text-white overflow-hidden relative group", children: [_jsxs("div", { className: "relative z-10", children: [_jsx("h3", { className: "font-bold text-lg mb-2", children: "Advanced Monitoring" }), _jsx("p", { className: "text-indigo-100 text-sm mb-4", children: "View real-time agent execution traces and internal state." }), _jsx("button", { className: "bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-indigo-50 transition-colors", children: "Open Trace Explorer" })] }), _jsx(Activity, { className: "absolute -bottom-4 -right-4 w-32 h-32 text-indigo-500/20 group-hover:scale-110 transition-transform" })] })] })] })] }));
};
