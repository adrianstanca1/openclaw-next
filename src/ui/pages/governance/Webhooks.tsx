// OpenClaw Next - Webhooks Management Page
// Manage webhook integrations

import React from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

export const Webhooks: React.FC = () => {
  // Mock webhooks data - will be replaced with API data
  const webhooks: Webhook[] = [
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

  return (
    <div className="p-8 space-y-6 bg-[var(--color-bg)] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-slate-400 mt-1">Manage webhook integrations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span>Create Webhook</span>
        </button>
      </div>

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <div
            key={webhook.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-semibold text-lg">{webhook.name}</h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    webhook.active ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {webhook.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-slate-400 text-sm font-mono mb-4">{webhook.url}</p>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500 text-sm">Events:</span>
                  {webhook.events.map((event) => (
                    <span
                      key={event}
                      className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded"
                    >
                      {event}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-white transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {webhooks.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h3 className="text-white font-semibold mb-2">No Webhooks</h3>
          <p className="text-slate-400">Create your first webhook integration</p>
        </div>
      )}
    </div>
  );
};

export default Webhooks;
