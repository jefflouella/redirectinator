import React from 'react';
import { AppSettings } from '@/types';
import {
  Settings as SettingsIcon,
  Database,
  Zap,
  Shield,
  Palette
} from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({ settings, onUpdateSettings }) => {
  const handleSettingChange = async (key: keyof AppSettings, value: string | boolean | number) => {
    await onUpdateSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <SettingsIcon className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-tech-900">Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Palette className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-tech-900">Appearance</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-tech-700 mb-2">
                Theme
              </label>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="input-field"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-tech-900">Performance</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-tech-700 mb-2">
                Default Batch Size
              </label>
              <input
                type="number"
                value={settings.defaultBatchSize}
                onChange={(e) => handleSettingChange('defaultBatchSize', parseInt(e.target.value))}
                min="1"
                max="100"
                className="input-field"
              />
              <p className="text-xs text-tech-500 mt-1">
                Number of URLs to process in each batch
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-tech-700 mb-2">
                Default Delay (ms)
              </label>
              <input
                type="number"
                value={settings.defaultDelay}
                onChange={(e) => handleSettingChange('defaultDelay', parseInt(e.target.value))}
                min="0"
                max="5000"
                className="input-field"
              />
              <p className="text-xs text-tech-500 mt-1">
                Delay between requests to avoid rate limiting
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-tech-700 mb-2">
                Default Timeout (ms)
              </label>
              <input
                type="number"
                value={settings.defaultTimeout}
                onChange={(e) => handleSettingChange('defaultTimeout', parseInt(e.target.value))}
                min="1000"
                max="30000"
                className="input-field"
              />
              <p className="text-xs text-tech-500 mt-1">
                Request timeout for URL checks
              </p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-tech-900">Data Management</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-tech-700">Auto-save</label>
                <p className="text-xs text-tech-500">Automatically save project changes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            {settings.autoSave && (
              <div>
                <label className="block text-sm font-medium text-tech-700 mb-2">
                  Auto-save Interval (ms)
                </label>
                <input
                  type="number"
                  value={settings.autoSaveInterval}
                  onChange={(e) => handleSettingChange('autoSaveInterval', parseInt(e.target.value))}
                  min="1000"
                  max="30000"
                  className="input-field"
                />
                <p className="text-xs text-tech-500 mt-1">
                  How often to auto-save (minimum 1 second)
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-tech-700">Show Advanced Options</label>
                <p className="text-xs text-tech-500">Display advanced settings in UI</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showAdvancedOptions}
                  onChange={(e) => handleSettingChange('showAdvancedOptions', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-tech-900">Security & Privacy</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
              <h4 className="text-sm font-medium text-success-800 mb-2">
                Client-side Processing
              </h4>
              <p className="text-xs text-success-700">
                All URL checking happens in your browser. No data is sent to external servers.
              </p>
            </div>
            
            <div className="p-4 bg-info-50 border border-info-200 rounded-lg">
              <h4 className="text-sm font-medium text-info-800 mb-2">
                Local Storage
              </h4>
              <p className="text-xs text-info-700">
                All data is stored locally in your browser using IndexedDB. Your data never leaves your device.
              </p>
            </div>
            
            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <h4 className="text-sm font-medium text-warning-800 mb-2">
                CORS Limitations
              </h4>
              <p className="text-xs text-warning-700">
                Some URLs may be blocked due to CORS policies. This is a browser security feature.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="text-lg font-semibold text-tech-900 mb-4">About Redirectinator</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-tech-700 mb-2">Version</h4>
            <p className="text-sm text-tech-600">2.0.0</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-tech-700 mb-2">Technology</h4>
            <p className="text-sm text-tech-600">React + TypeScript + IndexedDB</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-tech-700 mb-2">License</h4>
            <p className="text-sm text-tech-600">MIT</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-tech-700 mb-2">Developer</h4>
            <p className="text-sm text-tech-600">Tech SEO</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-tech-200">
          <p className="text-sm text-tech-600">
            Redirectinator is a professional-grade tool for analyzing URL redirects. 
            It processes all data locally in your browser, ensuring privacy and eliminating server costs.
          </p>
        </div>
      </div>
    </div>
  );
};
