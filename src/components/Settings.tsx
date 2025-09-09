import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppSettings } from '@/types';
import { SEMrushService } from '@/services/semrushService';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  Settings as SettingsIcon,
  Zap,
  Shield,
  Info,
  Key,
  Loader2,
  X,
  BookOpen,
} from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [showBatchSizeInfo, setShowBatchSizeInfo] = useState(false);
  const [showDelayInfo, setShowDelayInfo] = useState(false);
  const [showTimeoutInfo, setShowTimeoutInfo] = useState(false);
  const [showAutoSaveInfo, setShowAutoSaveInfo] = useState(false);
  const [semrushApiKey, setSemrushApiKey] = useState('');
  const [isTestingSemrushKey, setIsTestingSemrushKey] = useState(false);
  const [hasSemrushKey, setHasSemrushKey] = useState(false);

  // Analytics tracking
  const { trackFeatureUsage } = useAnalytics();

  // Refs for info tooltips
  const batchSizeInfoRef = useRef<HTMLDivElement>(null);
  const delayInfoRef = useRef<HTMLDivElement>(null);
  const timeoutInfoRef = useRef<HTMLDivElement>(null);
  const autoSaveInfoRef = useRef<HTMLDivElement>(null);

  const semrushService = new SEMrushService();

  const checkSemrushApiKeyStatus = useCallback(async () => {
    try {
      const hasKey = await semrushService.hasApiKey();
      setHasSemrushKey(hasKey);
    } catch (error) {
      console.error('Failed to check SEMrush API key status:', error);
    }
  }, [semrushService]);

  useEffect(() => {
    checkSemrushApiKeyStatus();
  }, [checkSemrushApiKeyStatus]);

  // Close info tooltips when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const refs = [
        batchSizeInfoRef,
        delayInfoRef,
        timeoutInfoRef,
        autoSaveInfoRef,
      ];
      const isOutsideAll = refs.every(
        ref => !ref.current || !ref.current.contains(event.target as Node)
      );

      if (isOutsideAll) {
        setShowBatchSizeInfo(false);
        setShowDelayInfo(false);
        setShowTimeoutInfo(false);
        setShowAutoSaveInfo(false);
      }
    };

    if (
      showBatchSizeInfo ||
      showDelayInfo ||
      showTimeoutInfo ||
      showAutoSaveInfo
    ) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBatchSizeInfo, showDelayInfo, showTimeoutInfo, showAutoSaveInfo]);

  const handleTestSemrushApiKey = async () => {
    if (!semrushApiKey.trim()) {
      return;
    }

    setIsTestingSemrushKey(true);

    try {
      const validation = await semrushService.validateApiKeyFormat(
        semrushApiKey.trim()
      );
      if (validation.isValid) {
        await semrushService.storeApiKey(semrushApiKey.trim());
        setHasSemrushKey(true);
        setSemrushApiKey('');

        // Track successful API key addition
        trackFeatureUsage('semrush_api_key_added');
      } else {
        alert(
          validation.error ||
            'Invalid API key format. Please check your key and try again.'
        );

        // Track failed API key validation
        trackFeatureUsage('semrush_api_key_validation_failed', {
          error: validation.error,
        });
      }
    } catch (error) {
      alert('Failed to validate API key. Please try again.');

      // Track API key validation error
      trackFeatureUsage('semrush_api_key_error', {
        error: 'validation_failed',
      });
    } finally {
      setIsTestingSemrushKey(false);
    }
  };

  const handleRemoveSemrushApiKey = async () => {
    try {
      localStorage.removeItem('semrush_api_key');
      setHasSemrushKey(false);

      // Track API key removal
      trackFeatureUsage('semrush_api_key_removed');
    } catch (error) {
      console.error('Failed to remove SEMrush API key:', error);

      // Track API key removal error
      trackFeatureUsage('semrush_api_key_removal_error');
    }
  };

  const handleSettingChange = async (
    key: keyof AppSettings,
    value: string | boolean | number
  ) => {
    await onUpdateSettings({ [key]: value });

    // Track settings changes
    trackFeatureUsage('setting_changed', { setting: key, value: value });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4">
      <div className="flex items-center space-x-3 mb-6">
        <SettingsIcon className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-tech-900">Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto px-4">
        {/* Performance */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-tech-900">Performance</h3>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-tech-700 flex items-center">
                  Default Batch Size
                  <button
                    onClick={() => setShowBatchSizeInfo(!showBatchSizeInfo)}
                    className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                    title="Learn about batch size"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </label>
              </div>
              <input
                type="number"
                value={settings.defaultBatchSize}
                onChange={e =>
                  handleSettingChange(
                    'defaultBatchSize',
                    parseInt(e.target.value)
                  )
                }
                min="1"
                max="100"
                className="input-field"
              />
              <p className="text-xs text-tech-500 mt-1">
                Number of URLs to process in each batch
              </p>
              {showBatchSizeInfo && (
                <div
                  ref={batchSizeInfoRef}
                  className="absolute top-0 left-0 mt-8 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2 shadow-lg z-50 max-w-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-blue-800 space-y-1">
                      <p>
                        <strong>What it does:</strong> Controls how many URLs
                        are processed simultaneously.
                      </p>
                      <p>
                        <strong>Recommended:</strong> 5-10 for most sites, 1-3
                        for rate-limited servers.
                      </p>
                      <p>
                        <strong>Trade-offs:</strong> Higher = faster processing,
                        but may trigger rate limits.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBatchSizeInfo(false)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-100 ml-2"
                      title="Close"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-tech-700 flex items-center">
                  Default Delay (ms)
                  <button
                    onClick={() => setShowDelayInfo(!showDelayInfo)}
                    className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                    title="Learn about request delay"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </label>
              </div>
              <input
                type="number"
                value={settings.defaultDelay}
                onChange={e =>
                  handleSettingChange('defaultDelay', parseInt(e.target.value))
                }
                min="0"
                max="5000"
                className="input-field"
              />
              <p className="text-xs text-tech-500 mt-1">
                Delay between requests to avoid rate limiting
              </p>
              {showDelayInfo && (
                <div
                  ref={delayInfoRef}
                  className="absolute top-0 left-0 mt-8 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2 shadow-lg z-50 max-w-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-blue-800 space-y-1">
                      <p>
                        <strong>What it does:</strong> Adds a pause between URL
                        requests to be respectful to servers.
                      </p>
                      <p>
                        <strong>Recommended:</strong> 100-500ms for most sites,
                        1000ms+ for rate-limited servers.
                      </p>
                      <p>
                        <strong>Why needed:</strong> Prevents overwhelming
                        servers and triggering rate limits.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDelayInfo(false)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-100 ml-2"
                      title="Close"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-tech-700 flex items-center">
                  Default Timeout (ms)
                  <button
                    onClick={() => setShowTimeoutInfo(!showTimeoutInfo)}
                    className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                    title="Learn about request timeout"
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </label>
              </div>
              <input
                type="number"
                value={settings.defaultTimeout}
                onChange={e =>
                  handleSettingChange(
                    'defaultTimeout',
                    parseInt(e.target.value)
                  )
                }
                min="1000"
                max="30000"
                className="input-field"
              />
              <p className="text-xs text-tech-500 mt-1">
                Request timeout for URL checks
              </p>
              {showTimeoutInfo && (
                <div
                  ref={timeoutInfoRef}
                  className="absolute top-0 left-0 mt-8 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2 shadow-lg z-50 max-w-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs text-blue-800 space-y-1">
                      <p>
                        <strong>What it does:</strong> Maximum time to wait for
                        a server response before giving up.
                      </p>
                      <p>
                        <strong>Recommended:</strong> 5000-10000ms (5-10
                        seconds) for most sites.
                      </p>
                      <p>
                        <strong>When to increase:</strong> For slow servers or
                        complex redirect chains.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowTimeoutInfo(false)}
                      className="p-1 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-100 ml-2"
                      title="Close"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-tech-900">
              Security & Privacy
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
              <h4 className="text-sm font-medium text-success-800 mb-2">
                Client-side Processing
              </h4>
              <p className="text-xs text-success-700">
                All URL checking happens in your browser. No data is sent to
                external servers.
              </p>
            </div>

            <div className="p-4 bg-info-50 border border-info-200 rounded-lg">
              <h4 className="text-sm font-medium text-info-800 mb-2">
                Local Storage
              </h4>
              <p className="text-xs text-info-700">
                All data is stored locally in your browser using IndexedDB. Your
                data never leaves your device.
              </p>
            </div>

            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <h4 className="text-sm font-medium text-warning-800 mb-2">
                CORS Limitations
              </h4>
              <p className="text-xs text-warning-700">
                Some URLs may be blocked due to CORS policies. This is a browser
                security feature.
              </p>
            </div>
          </div>
        </div>

        {/* SEMrush API Integration */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <img src="/SEMrush-Logo.png" alt="SEMrush" className="h-8 w-auto" />
            <h3 className="text-lg font-semibold text-tech-900">
              API Integration
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Secure API Key Storage
              </h4>
              <p className="text-xs text-blue-700 mb-3">
                Your SEMrush API key is stored securely in your browser's local
                storage and never sent to our servers.
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>
                  • <strong>Privacy First:</strong> API key never leaves your
                  device
                </p>
                <p>
                  • <strong>Direct API Calls:</strong> All requests go directly
                  from your browser to SEMrush
                </p>
                <p>
                  • <strong>Local Storage:</strong> Key is stored in your
                  browser's secure local storage
                </p>
              </div>
            </div>

            {hasSemrushKey ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-green-800 mb-1">
                      API Key Configured ✓
                    </h4>
                    <p className="text-xs text-green-700">
                      Your SEMrush API key is set up and ready to use.
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveSemrushApiKey}
                    className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Remove Key
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="text-sm font-medium text-amber-800 mb-2">
                    API Key Required
                  </h4>
                  <p className="text-xs text-amber-700">
                    To use SEMrush discovery features, you'll need to add your
                    API key. Get your key from{' '}
                    <a
                      href="https://www.semrush.com/api/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-800 hover:underline font-medium"
                    >
                      SEMrush API
                    </a>
                    .
                  </p>
                  <p className="text-xs text-amber-700 mt-2">
                    <strong>Note:</strong> We validate the API key format. API
                    calls are proxied through our backend server.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tech-700 mb-2">
                    SEMrush API Key
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value={semrushApiKey}
                      onChange={e => setSemrushApiKey(e.target.value)}
                      placeholder="Enter your SEMrush API key"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleTestSemrushApiKey}
                      disabled={!semrushApiKey.trim() || isTestingSemrushKey}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isTestingSemrushKey ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Validating...</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4" />
                          <span>Validate & Save</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions & Help */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-tech-900">
              Instructions & Help
            </h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Complete User Guide
              </h4>
              <p className="text-xs text-blue-700 mb-3">
                Learn how to use all of Redirectinator's powerful features including 
                Wayback Machine discovery, SEMrush integration, browser extensions, and more.
              </p>
              <a
                href="/instructions"
                className="inline-flex items-center px-3 py-2 text-xs font-medium text-blue-800 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <BookOpen className="w-3 h-3 mr-1" />
                View Instructions
              </a>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 mb-2">
                Key Features Covered
              </h4>
              <div className="text-xs text-green-700 space-y-1">
                <p>• <strong>Wayback Machine Discovery:</strong> Find historical URLs from site migrations</p>
                <p>• <strong>SEMrush Integration:</strong> Discover top-performing pages</p>
                <p>• <strong>Browser Extensions:</strong> Advanced redirect detection</p>
                <p>• <strong>Multiple Upload Methods:</strong> CSV, XML sitemaps, and more</p>
                <p>• <strong>Export Options:</strong> CSV, Excel, JSON, and reports</p>
              </div>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="text-sm font-medium text-purple-800 mb-2">
                Quick Start Guide
              </h4>
              <div className="text-xs text-purple-700 space-y-1">
                <p>1. Create a new project</p>
                <p>2. Add URLs using any of the 5 methods</p>
                <p>3. Process URLs to analyze redirects</p>
                <p>4. Export results for your reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="text-lg font-semibold text-tech-900 mb-4">
          About Redirectinator
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-tech-700 mb-2">Version</h4>
            <p className="text-sm text-tech-600">2.0.0</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-tech-700 mb-2">
              Technology
            </h4>
            <p className="text-sm text-tech-600">
              React + TypeScript + IndexedDB
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-tech-700 mb-2">License</h4>
            <p className="text-sm text-tech-600">MIT</p>
          </div>

          <div>
            <h4 className="text-sm font-medium text-tech-700 mb-2">
              Developer
            </h4>
            <p className="text-sm text-tech-600">Tech SEO</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-tech-200">
          <p className="text-sm text-tech-600">
            Redirectinator is a professional-grade tool for analyzing URL
            redirects. It processes all data locally in your browser, ensuring
            privacy and eliminating server costs.
          </p>
        </div>
      </div>
    </div>
  );
};
