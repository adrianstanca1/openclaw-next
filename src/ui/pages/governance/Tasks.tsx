// OpenClaw Next - Tasks Management Page
// View and manage delegated tasks

import React, { useState } from 'react';
import {
  ListTodo,
  Play,
  Pause,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Task {
  id: string;
  type: 'reasoning' | 'execution' | 'delegation' | 'monitoring';
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  agentId?: string;
  assignedAgent?: string;
  description: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  result?: unknown;
  error?: string;
}

export const Tasks: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');

  // Mock tasks data - will be replaced with API data
  const tasks: Task[] = [
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing':
        return <Play className="w-4 h-4 text-blue-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getTypeColor = (type: string) => {
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

  const getPriorityColor = (priority: number) => {
    if (priority === 1) return 'text-red-400';
    if (priority === 2) return 'text-yellow-400';
    return 'text-slate-400';
  };

  return (
    <div className="p-8 space-y-6 bg-[var(--color-bg)] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-slate-400 mt-1">Manage delegated tasks</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
          <ListTodo className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'pending', 'processing', 'completed', 'failed'] as const).map((status) => (
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
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white mt-1">{tasks.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400 mt-1">{tasks.filter(t => t.status === 'pending').length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Processing</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{tasks.filter(t => t.status === 'processing').length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{tasks.filter(t => t.status === 'completed').length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Failed</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{tasks.filter(t => t.status === 'failed').length}</p>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(task.status)}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-white font-medium">{task.description}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(task.type)}`}>
                      {task.type}
                    </span>
                    <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                      Priority {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    {task.assignedAgent && (
                      <span>Assigned to: <span className="text-slate-300">{task.assignedAgent}</span></span>
                    )}
                    <span>Created: {formatTime(task.createdAt)}</span>
                    {task.completedAt && (
                      <span>Completed: {formatTime(task.completedAt)}</span>
                    )}
                  </div>

                  {task.error && (
                    <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-red-400 text-sm">{task.error}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {task.status === 'pending' && (
                  <button className="p-2 text-slate-400 hover:text-green-400 transition-colors" title="Start">
                    <Play className="w-4 h-4" />
                  </button>
                )}
                {task.status === 'processing' && (
                  <button className="p-2 text-slate-400 hover:text-yellow-400 transition-colors" title="Pause">
                    <Pause className="w-4 h-4" />
                  </button>
                )}
                <button className="p-2 text-slate-400 hover:text-red-400 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-white font-semibold mb-2">No Tasks</h3>
          <p className="text-slate-400">
            {filter === 'all' ? 'Create your first task' : `No ${filter} tasks`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
