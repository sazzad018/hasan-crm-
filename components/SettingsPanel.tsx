
import React, { useState } from 'react';
import { Save, Eye, EyeOff, Copy, Check, FileSpreadsheet } from 'lucide-react';
import { PluginSettings } from '../types';

interface SettingsPanelProps {
  settings: PluginSettings;
  updateSettings: (newSettings: PluginSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, updateSettings }) => {
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateSettings({ ...settings, [name]: value });
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(settings.webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Connection Settings</h2>
            <p className="text-sm text-slate-500">Configure Facebook App & Google Sheets</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Save size={16} />
            Save Changes
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm"
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
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm"
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-sm pr-10"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-shadow text-sm font-mono text-slate-600"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-shadow text-sm font-mono text-slate-600"
                />
                <p className="text-xs text-slate-400">Paste the contents of your Google Cloud Service Account JSON key here.</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;