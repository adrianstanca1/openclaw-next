// OpenClaw Next - Audit Log Page
// Track all actions and changes

import React, { useState } from 'react';
import {
  FileText,
  Filter,
  Download,
  Search,
  Shield,
  Bot,
  User,
  Settings,
  AlertTriangle
} from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  actor: string;
  actorType: 'user' | 'agent' | 'system';
  target: string;
  targetType: 'agent' | 'task' | 'policy' | 'config' | 'key';
  details: Record<string, unknown>;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export const Audit: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock audit logs - will be replaced with API data
  const auditLogs: AuditLog[] = [
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

  const getActorIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'agent':
        return <Bot className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
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

  return (
    <div className="p-8 space-y-6 bg-[var(--color-bg)] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-slate-400 mt-1">Track all actions and changes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Severity</option>
            <option value="error">Errors Only</option>
            <option value="warning">Warnings Only</option>
          </select>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Action
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{log.action}</p>
                      {Object.keys(log.details).length > 0 && (
                        <p className="text-slate-500 text-xs mt-1 font-mono">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded ${
                        log.actorType === 'user' ? 'bg-blue-500/20 text-blue-400' :
                        log.actorType === 'agent' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {getActorIcon(log.actorType)}
                      </span>
                      <span className="text-slate-300">{log.actor}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {log.targetType === 'agent' && <Bot className="w-4 h-4 text-slate-400" />}
                      {log.targetType === 'policy' && <Shield className="w-4 h-4 text-slate-400" />}
                      {log.targetType === 'config' && <Settings className="w-4 h-4 text-slate-400" />}
                      {log.targetType === 'key' && <AlertTriangle className="w-4 h-4 text-slate-400" />}
                      <span className="text-slate-300">{log.target}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400 text-sm">{formatTime(log.timestamp)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No audit logs found</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Events</p>
          <p className="text-2xl font-bold text-white mt-1">{auditLogs.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Errors</p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {auditLogs.filter(l => l.severity === 'error' || l.severity === 'critical').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Warnings</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">
            {auditLogs.filter(l => l.severity === 'warning').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Info</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">
            {auditLogs.filter(l => l.severity === 'info').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Audit;
