// OpenClaw Next - Settings Page
// System configuration and settings

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Database,
  Bell,
  Shield,
  Cpu,
  Clock,
  Globe
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    // General
    systemName: 'OpenClaw Next',
    timezone: 'UTC',
    language: 'en',

    // API
    apiEnabled: true,
    apiPort: 18789,
    maxRequestSize: '10MB',
    rateLimitPerMinute: 100,

    // Agents
    maxConcurrentAgents: 20,
    defaultAgentTimeout: 300,
    agentHeartbeatInterval: 30,

    // Database
    dbHost: 'localhost',
    dbPort: 5432,
    dbName: 'openclaw',
    dbPoolSize: 10,

    // Notifications
    emailNotifications: false,
    slackNotifications: true,
    slackWebhook: 'https://hooks.slack.com/services/xxx/yyy/zzz',

    // Security
    requireApprovalForSpawn: true,
    requireApprovalForSkills: true,
    auditLogRetention: 90,
    sessionTimeout: 3600
  });

  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'agents' | 'database' | 'notifications' | 'security'>('general');

  const handleSave = () => {
    // Save settings - will be replaced with API call
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'api', label: 'API', icon: Globe },
    { id: 'agents', label: 'Agents', icon: Cpu },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ] as const;

  return (
    <div className="p-8 space-y-6 bg-[var(--color-bg)] text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-slate-400 mt-1">System configuration</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-500/20 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">General Settings</h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">System Name</label>
                  <input
                    type="text"
                    value={settings.systemName}
                    onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Europe/Paris">Central European</option>
                    <option value="Asia/Tokyo">Tokyo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">API Settings</h2>

              <div className="flex items-center justify-between py-4 border-b border-slate-800">
                <div>
                  <p className="font-medium">Enable API Server</p>
                  <p className="text-slate-400 text-sm">Allow REST API access</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, apiEnabled: !settings.apiEnabled })}
                  className={`w-11 h-6 rounded-full relative transition-colors ${
                    settings.apiEnabled ? 'bg-indigo-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.apiEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">API Port</label>
                  <input
                    type="number"
                    value={settings.apiPort}
                    onChange={(e) => setSettings({ ...settings, apiPort: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Max Request Size</label>
                  <input
                    type="text"
                    value={settings.maxRequestSize}
                    onChange={(e) => setSettings({ ...settings, maxRequestSize: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Rate Limit (req/min)</label>
                  <input
                    type="number"
                    value={settings.rateLimitPerMinute}
                    onChange={(e) => setSettings({ ...settings, rateLimitPerMinute: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Agent Settings</h2>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Max Concurrent Agents</label>
                  <input
                    type="number"
                    value={settings.maxConcurrentAgents}
                    onChange={(e) => setSettings({ ...settings, maxConcurrentAgents: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Default Timeout (seconds)</label>
                  <input
                    type="number"
                    value={settings.defaultAgentTimeout}
                    onChange={(e) => setSettings({ ...settings, defaultAgentTimeout: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Heartbeat Interval (seconds)</label>
                  <input
                    type="number"
                    value={settings.agentHeartbeatInterval}
                    onChange={(e) => setSettings({ ...settings, agentHeartbeatInterval: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Database Settings</h2>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Host</label>
                  <input
                    type="text"
                    value={settings.dbHost}
                    onChange={(e) => setSettings({ ...settings, dbHost: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Port</label>
                  <input
                    type="number"
                    value={settings.dbPort}
                    onChange={(e) => setSettings({ ...settings, dbPort: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Database Name</label>
                  <input
                    type="text"
                    value={settings.dbName}
                    onChange={(e) => setSettings({ ...settings, dbName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Pool Size</label>
                  <input
                    type="number"
                    value={settings.dbPoolSize}
                    onChange={(e) => setSettings({ ...settings, dbPoolSize: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-slate-800">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-slate-400 text-sm">Receive email alerts</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      settings.emailNotifications ? 'bg-indigo-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-slate-800">
                  <div>
                    <p className="font-medium">Slack Notifications</p>
                    <p className="text-slate-400 text-sm">Send alerts to Slack</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, slackNotifications: !settings.slackNotifications })}
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      settings.slackNotifications ? 'bg-indigo-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.slackNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {settings.slackNotifications && (
                  <div>
                    <label className="block text-slate-400 text-sm mb-2">Slack Webhook URL</label>
                    <input
                      type="text"
                      value={settings.slackWebhook}
                      onChange={(e) => setSettings({ ...settings, slackWebhook: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Security Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-slate-800">
                  <div>
                    <p className="font-medium">Require Approval for Agent Spawn</p>
                    <p className="text-slate-400 text-sm">Manual approval required to create agents</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, requireApprovalForSpawn: !settings.requireApprovalForSpawn })}
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      settings.requireApprovalForSpawn ? 'bg-indigo-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.requireApprovalForSpawn ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-4 border-b border-slate-800">
                  <div>
                    <p className="font-medium">Require Approval for Skills</p>
                    <p className="text-slate-400 text-sm">Manual approval required to install skills</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, requireApprovalForSkills: !settings.requireApprovalForSkills })}
                    className={`w-11 h-6 rounded-full relative transition-colors ${
                      settings.requireApprovalForSkills ? 'bg-indigo-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.requireApprovalForSkills ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Audit Log Retention (days)</label>
                  <input
                    type="number"
                    value={settings.auditLogRetention}
                    onChange={(e) => setSettings({ ...settings, auditLogRetention: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Session Timeout (seconds)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
