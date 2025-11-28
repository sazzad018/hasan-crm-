import React, { useState } from 'react';
import { Save, Eye, EyeOff, Copy, Check, FileSpreadsheet, Settings, Database, Server } from 'lucide-react';
import { PluginSettings } from '../types';

interface SettingsPanelProps {
  settings: PluginSettings;
  updateSettings: (newSettings: PluginSettings) => void;
  onSave: () => void;
  onSyncData?: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    settings, updateSettings, onSave, onSyncData
}) => {
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateSettings({ ...settings, [name]: value });
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(settings.webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveClick = async () => {
      setIsSaving(true);
      await onSave();
      setIsSaving(false);
  };

  const handleSyncClick = async () => {
      if (!onSyncData) return;
      if (!window.confirm("Are you sure you want to push all local/mock data to the database? This might take a moment.")) return;
      
      setIsSyncing(true);
      await onSyncData();
      setIsSyncing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* MIGRATION / SYNC PANEL */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden text-white">
          <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
              <div className="flex gap-2 items-center">
                  <Database className="text-[#9B7BE3]" size={20} />
                  <h2 className="text-lg font-bold">Database Migration</h2>
              </div>
          </div>
          <div className="p-6">
              <p className="text-sm text-slate-300 mb-4">
                  If you are moving from local/mock mode to a live Shared Hosting MySQL database, use this button to bulk upload your current leads and client data to the server.
              </p>
              <button 
                onClick={handleSyncClick}
                disabled={isSyncing || !onSyncData}
                className="flex items-center gap-2 bg-[#9B7BE3] hover:bg-violet-600 text-white px-5 py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-900/20"
              >
                {isSyncing ? <Server className="animate-pulse" size={18} /> : <Server size={18} />}
                {isSyncing ? 'Syncing Data...' : 'Migrate Local Data to Database'}
              </button>
          </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex gap-2 items-center">
              <Settings className="text-slate-500" size={20} />
              <h2 className="text-lg font-bold text-slate-800">Plugin Configuration</h2>
          </div>
          <button 
            onClick={handleSaveClick}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#9B7BE3] hover:bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="p-6 space-y-8">
            {/* Facebook Configuration */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Facebook Integration</h3>
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Webhook Endpoint</h3>
                    <p className="text-xs text-blue-700 mb-3">
                    Copy this URL and paste it into your Facebook App Webhook settings.
                    </p>
                    <div className="flex gap-2">
                    <code className="flex-1 bg-white border border-blue-200 text-slate-600 px-3 py-2 rounded text-sm font-mono truncate">
                        {settings.webhookUrl}
                    </code>
                    <button 
                        onClick={copyWebhook}
                        className="bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 px-3 rounded flex items-center justify-center transition-colors"
                        title="Copy URL"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Page Access Token</label>
                    <input
                        type="text"
                        name="pageAccessToken"
                        value={settings.pageAccessToken}
                        onChange={handleChange}
                        placeholder="EAA..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#9B7BE3] outline-none transition-shadow text-sm"
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Verify Token</label>
                    <input
                        type="text"
                        name="verifyToken"
                        value={settings.verifyToken}
                        onChange={handleChange}
                        placeholder="my_secure_custom_token"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#9B7BE3] outline-none transition-shadow text-sm"
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">App ID</label>
                    <input
                        type="text"
                        name="appId"
                        value={settings.appId}
                        onChange={handleChange}
                        placeholder="1234567890"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#9B7BE3] outline-none transition-shadow text-sm"
                    />
                    </div>

                    <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">App Secret</label>
                    <div className="relative">
                        <input
                        type={showSecret ? "text" : "password"}
                        name="appSecret"
                        value={settings.appSecret}
                        onChange={handleChange}
                        placeholder="••••••••••••••••"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#9B7BE3] outline-none transition-shadow text-sm pr-10"
                        />
                        <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                        {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                    </div>
                </div>
            </div>

            {/* Google Sheets Configuration */}
            <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-green-600" /> Google Sheets Integration
                </h3>
                
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Google Sheet ID</label>
                    <input
                    type="text"
                    name="googleSheetId"
                    value={settings.googleSheetId || ''}
                    onChange={handleChange}
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#9B7BE3] outline-none transition-shadow text-sm font-mono text-slate-600"
                    />
                    <p className="text-xs text-slate-400">Found in your Google Sheet URL: docs.google.com/spreadsheets/d/<b>SHEET_ID</b>/edit</p>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Service Account JSON</label>
                    <textarea
                    name="googleServiceAccountJson"
                    value={settings.googleServiceAccountJson || ''}
                    onChange={handleChange}
                    rows={4}
                    placeholder='{"type": "service_account", "project_id": "...", ...}'
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#9B7BE3] outline-none transition-shadow text-sm font-mono text-slate-600"
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;