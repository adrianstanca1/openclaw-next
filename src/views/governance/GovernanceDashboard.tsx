/**
 * OpenClaw Next - Governance Dashboard
 * Ported and enhanced from OpenClaw Dashboard
 */

import React, { useEffect, useMemo } from 'react';
import { useDashboardStore } from '../../ui/stores/dashboard.js';
import {
  Bot,
  Server,
  ListTodo,
  ClipboardCheck,
  Users,
  TrendingUp,
  AlertCircle,
  Activity,
  ArrowRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

/**
 * Governance Dashboard View
 */
export const GovernanceDashboard: React.FC = () => {
  const { stats, fetchAgents, fetchTasks, fetchStats, fetchApprovals, agents, tasks, approvals } = useDashboardStore();

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
    const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
    const hourData = hours.map(time => ({ time, completed: 0, failed: 0 }));

    tasks.forEach(task => {
      const date = new Date(task.createdAt);
      const hourIndex = Math.floor(date.getHours() / 4);
      if (hourIndex >= 0 && hourIndex < hourData.length) {
        if (task.status === 'completed') hourData[hourIndex].completed++;
        else if (task.status === 'failed') hourData[hourIndex].failed++;
      }
    });

    return hourData;
  }, [tasks]);

  const agentData = useMemo(() => {
    const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
    const hourData = hours.map(time => ({ time, active: 0, idle: 0 }));

    agents.forEach(agent => {
      const date = new Date(agent.lastActive || agent.createdAt || Date.now());
      const hourIndex = Math.floor(date.getHours() / 4);
      if (hourIndex >= 0 && hourIndex < hourData.length) {
        if (agent.state === 'active') hourData[hourIndex].active++;
        else hourData[hourIndex].idle++;
      }
    });

    return hourData;
  }, [agents]);

  const statCards = [
    {
      title: 'Active Agents',
      value: stats?.activeAgents || 0,
      total: stats?.totalAgents || 0,
      icon: Bot,
      color: 'bg-blue-500',
      trend: '+12%'
    },
    {
      title: 'Online Gateways',
      value: stats?.onlineGateways || 0,
      total: 1,
      icon: Server,
      color: 'bg-green-500',
      trend: '100%'
    },
    {
      title: 'Pending Tasks',
      value: stats?.pendingTasks || 0,
      total: stats?.totalTasks || 0,
      icon: ListTodo,
      color: 'bg-yellow-500',
      trend: '-5%'
    },
    {
      title: 'Pending Approvals',
      value: stats?.pendingApprovals || 0,
      icon: ClipboardCheck,
      color: 'bg-red-500',
      trend: stats?.criticalApprovals ? `+${stats.criticalApprovals} critical` : '0 critical'
    }
  ];

  return (
    <div className="p-8 space-y-6 bg-[var(--color-bg)] text-white">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Governance Dashboard</h1>
          <p className="text-slate-400 mt-1">Centralized oversight for OpenClaw Next ecosystem</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-full border border-slate-700">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">System {stats?.systemHealth || 'Healthy'}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-colors group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-bold">{stat.value}</span>
                  {stat.total !== undefined && (
                    <span className="text-slate-500 text-sm">/ {stat.total}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">{stat.trend}</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} bg-opacity-20 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Activity Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Task Activity</h2>
              <p className="text-slate-400 text-sm">Completed vs failed tasks over time</p>
            </div>
            <Activity className="w-5 h-5 text-slate-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name="Completed"
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  name="Failed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Activity Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Agent Utilization</h2>
              <p className="text-slate-400 text-sm">Active vs idle agents over time</p>
            </div>
            <Bot className="w-5 h-5 text-slate-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={agentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Line
                  type="monotone"
                  dataKey="active"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                  name="Active"
                />
                <Line
                  type="monotone"
                  dataKey="idle"
                  stroke="#64748b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Idle"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              Pending Approvals
              {stats?.pendingApprovals ? (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingApprovals}
                </span>
              ) : null}
            </h2>
            <button className="text-indigo-400 text-sm font-medium hover:text-indigo-300 flex items-center gap-1">
              View Queue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {approvals.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardCheck className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <p className="text-slate-500">No pending approvals</p>
              </div>
            ) : (
              approvals.slice(0, 3).map((approval) => (
                <div key={approval.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    approval.priority === 'critical' ? 'bg-red-500/20 text-red-500' :
                    approval.priority === 'high' ? 'bg-orange-500/20 text-orange-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-200 truncate">{approval.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">From: {approval.requester}</span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-500">{new Date(approval.requestedAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors">
                      Approve
                    </button>
                    <button className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Health / Quick Actions */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-6">Security & Policies</h2>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-750 transition-colors text-left border border-slate-750">
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-medium">Policy Audit</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-800 hover:bg-slate-750 transition-colors text-left border border-slate-750">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-medium">Team Permissions</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
          
          <div className="bg-indigo-600 rounded-xl p-6 text-white overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Advanced Monitoring</h3>
              <p className="text-indigo-100 text-sm mb-4">View real-time agent execution traces and internal state.</p>
              <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-indigo-50 transition-colors">
                Open Trace Explorer
              </button>
            </div>
            <Activity className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-500/20 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
