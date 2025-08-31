'use client';

import React, { useEffect, useState } from 'react';

interface ApiKeyConfig {
  key: string;
  label: string;
  placeholder: string;
  helpText: string;
  getLink: string;
  required?: boolean;
}

const apiConfigs: ApiKeyConfig[] = [
  {
    key: 'openai_key',
    label: 'OpenAI API Key',
    placeholder: 'sk-...',
    helpText: 'Used for AI-powered features like smart suggestions and knowledge management',
    getLink: 'https://platform.openai.com/api-keys'
  },
  {
    key: 'dust_key',
    label: 'Dust API Key',
    placeholder: 'dust_...',
    helpText: 'Required for Dust workspace integration and agent management',
    getLink: 'https://dust.tt'
  },
  {
    key: 'dust_workspace_id',
    label: 'Dust Workspace ID',
    placeholder: 'workspace_...',
    helpText: 'Your Dust workspace identifier for agent configuration',
    getLink: 'https://dust.tt/workspaces'
  },
  {
    key: 'aci_key',
    label: 'ACI API Key',
    placeholder: 'aci_...',
    helpText: 'Used for external API integrations and automation',
    getLink: 'https://platform.aci.dev'
  },
  {
    key: 'elevenlabs_key',
    label: 'ElevenLabs API Key',
    placeholder: 'sk_...',
    helpText: 'Used for voice input transcription and audio features',
    getLink: 'https://elevenlabs.io/app/profile'
  }
];

export default function AdminKeysPanel() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function load() {
    try {
      const res = await fetch('/api/settings');
      const json = await res.json();
      setSettings(json.settings || {});
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setLoading(true);
    setSaveStatus('saving');

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setSaveStatus('saved');
        setTimeout(() => {
          setSaveStatus('idle');
          setOpen(false);
        }, 1500);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  }

  const hasRequiredKeys = apiConfigs.every(config =>
    !config.required || (settings[config.key] && settings[config.key].trim())
  );

  return (
    <>
      <button
        aria-label="Admin settings"
        className="fixed bottom-3 left-3 z-50 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-3 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        onClick={() => setOpen(true)}
        title="Admin Settings"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Admin Settings</h2>
                  <p className="text-sm text-gray-600 mt-1">Configure API keys for enhanced features</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {apiConfigs.map((config) => (
                  <div key={config.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          {config.label}
                          {config.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <p className="text-sm text-gray-600">{config.helpText}</p>
                      </div>
                      <a
                        href={config.getLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                      >
                        Get Key →
                      </a>
                    </div>

                    <div className="relative">
                      <input
                        type="password"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={config.placeholder}
                        value={settings[config.key] ?? ''}
                        onChange={(e) => setSettings({ ...settings, [config.key]: e.target.value })}
                      />
                      {settings[config.key] && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {!hasRequiredKeys && (
                    <div className="flex items-center text-sm text-orange-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"/>
                      </svg>
                      <span className="ml-1">Some required keys are missing</span>
                    </div>
                  )}
                  {hasRequiredKeys && (
                    <div className="flex items-center text-sm text-green-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                      <span className="ml-1">All required keys configured</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={() => setOpen(false)}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      saveStatus === 'saved'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={save}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Saving...
                      </div>
                    ) : saveStatus === 'saved' ? (
                      'Saved!'
                    ) : saveStatus === 'error' ? (
                      'Error - Try Again'
                    ) : (
                      'Save Settings'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


