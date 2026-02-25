// OpenClaw Next - Approvals Management Page
// Manage pending approval requests

import React, { useState } from 'react';
import {
  ClipboardCheck,
  Check,
  X,
  Clock,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';

interface Approval {
  id: string;
  type: 'task' | 'agent_spawn' | 'skill_install' | 'delegation' | 'config_change';
  requester: string;
  requesterId: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export const Approvals: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Mock approvals data - will be replaced with API data
  const approvals: Approval[] = [
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

  const getTypeIcon = (type: string) => {
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

  const getPriorityColor = (priority: string) => {
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

  const getStatusColor = (status: string) => {
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const handleApprove = (id: string) => {
    console.log('Approving:', id);
    // Will be replaced with API call
  };

  const handleReject = (id: string) => {
    console.log('Rejecting:', id);
    // Will be replaced with API call
  };

  return (
    <div className="p-8 space-y-6 bg-[var(--color-bg)] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Approvals</h1>
          <p className="text-slate-400 mt-1">Manage pending approval requests</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-medium">
            {approvals.filter(a => a.status === 'pending').length} Pending
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === status
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{approvals.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">
            {approvals.filter(a => a.status === 'pending').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Approved</p>
          <p className="text-2xl font-bold text-green-400 mt-1">
            {approvals.filter(a => a.status === 'approved').length}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Rejected</p>
          <p className="text-2xl font-bold text-red-400 mt-1">
            {approvals.filter(a => a.status === 'rejected').length}
          </p>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <div
            key={approval.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* Type Icon */}
                <div className="text-3xl">
                  {getTypeIcon(approval.type)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-semibold text-lg">{approval.description}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(approval.priority)}`}>
                      {approval.priority}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(approval.status)}`}>
                      {approval.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {approval.requester}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatTime(approval.requestedAt)}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-xs">
                      {approval.type.replace('_', ' ')}
                    </span>
                  </div>

                  {approval.metadata && (
                    <div className="mt-3 p-3 bg-slate-800 rounded-lg">
                      <p className="text-slate-500 text-xs mb-2">Metadata:</p>
                      <pre className="text-slate-300 text-xs font-mono overflow-x-auto">
                        {JSON.stringify(approval.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {approval.reason && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      approval.status === 'approved'
                        ? 'bg-green-500/10 border border-green-500/20'
                        : 'bg-red-500/10 border border-red-500/20'
                    }`}>
                      <p className={`text-sm ${
                        approval.status === 'approved' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <span className="font-medium">Reviewer: </span>
                        {approval.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {approval.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {approval.status !== 'pending' && (
                <div className="text-right">
                  <p className="text-slate-400 text-sm">
                    {approval.status === 'approved' ? 'Approved by' : 'Rejected by'}
                  </p>
                  <p className="text-white font-medium">{approval.reviewer}</p>
                  {approval.reviewedAt && (
                    <p className="text-slate-500 text-xs mt-1">
                      {formatTime(approval.reviewedAt)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredApprovals.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">
            {filter === 'pending' ? '🎉' : '📋'}
          </div>
          <h3 className="text-white font-semibold mb-2">
            {filter === 'pending' ? 'All Caught Up!' : `No ${filter} approvals`}
          </h3>
          <p className="text-slate-400">
            {filter === 'pending'
              ? 'No pending approval requests'
              : 'Change filter to view other approvals'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Approvals;
