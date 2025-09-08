import React, { useState, useEffect, useRef } from 'react';
import { extensionService } from '../services/extensionService';

interface AdvancedModeSelectorProps {
  currentMode: 'default' | 'advanced';
  onModeChange: (mode: 'default' | 'advanced') => void;
  disabled?: boolean;
}

export const AdvancedModeSelector: React.FC<AdvancedModeSelectorProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
}) => {
  const [extensionAvailable, setExtensionAvailable] = useState(false);
  const [extensionVersion, setExtensionVersion] = useState<string | null>(null);
  const [checkingExtension, setCheckingExtension] = useState(true);
  const [showAdvancedBanner, setShowAdvancedBanner] = useState(true);

  // Track previous state to only log changes
  const prevExtensionState = useRef({
    available: false,
    version: null as string | null,
  });
  const isInitialCheck = useRef(true);

  // Only log props in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 AdvancedModeSelector props:', {
      currentMode,
      onModeChange: typeof onModeChange,
      disabled,
    });
  }

  useEffect(() => {
    const checkExtension = async () => {
      try {
        const available = extensionService.isAvailable();
        const version = extensionService.getVersion();

        // Only log if this is the initial check or if the state actually changed
        if (
          isInitialCheck.current ||
          available !== prevExtensionState.current.available ||
          version !== prevExtensionState.current.version
        ) {
          if (isInitialCheck.current) {
            console.log(
              '🔍 AdvancedModeSelector: Initial extension check - available:',
              available,
              'version:',
              version
            );
          } else {
            console.log(
              '🔄 AdvancedModeSelector: Extension state changed - available:',
              available,
              'version:',
              version
            );
          }

          // Update previous state
          prevExtensionState.current = { available, version };
          isInitialCheck.current = false;
        }

        setExtensionAvailable(available);
        setExtensionVersion(version);

        // If extension becomes available and we're in default mode, we could auto-suggest advanced mode
        if (available && currentMode === 'default' && isInitialCheck.current) {
          console.log(
            'Advanced mode extension detected - user can now use advanced features'
          );
        }
      } catch (error) {
        console.warn('Error checking extension availability:', error);
        setExtensionAvailable(false);
      } finally {
        setCheckingExtension(false);
      }
    };

    checkExtension();

    // Re-check less frequently to reduce noise - only every 10 seconds after initial detection
    const interval = setInterval(checkExtension, 10000);
    return () => clearInterval(interval);
  }, [currentMode]);

  // Listen for extension state changes with reduced frequency
  useEffect(() => {
    const handleExtensionStateChange = () => {
      const available = extensionService.isAvailable();
      const version = extensionService.getVersion();

      // Only update state if it actually changed
      if (available !== extensionAvailable || version !== extensionVersion) {
        setExtensionAvailable(available);
        setExtensionVersion(version);
      }
    };

    // Check immediately
    handleExtensionStateChange();

    // Set up a more frequent check for the first few seconds, then reduce frequency
    const initialCheck = setInterval(handleExtensionStateChange, 1000);
    setTimeout(() => {
      clearInterval(initialCheck);
      // Switch to less frequent checking
      const maintenanceCheck = setInterval(handleExtensionStateChange, 15000); // Every 15 seconds
      return () => clearInterval(maintenanceCheck);
    }, 3000);

    return () => clearInterval(initialCheck);
  }, [extensionAvailable, extensionVersion]);

  const handleModeToggle = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        '🔘 Toggle clicked! Current mode:',
        currentMode,
        'Extension available:',
        extensionAvailable,
        'Disabled:',
        disabled
      );
    }

    if (disabled) {
      console.log('❌ Toggle is disabled, cannot proceed');
      return;
    }

    if (currentMode === 'advanced' || extensionAvailable) {
      const newMode = currentMode === 'default' ? 'advanced' : 'default';
      console.log('✅ Switching from', currentMode, 'to', newMode);
      onModeChange(newMode);
    } else {
      console.log('❌ Cannot switch modes - extension not available');
    }
  };

  const getExtensionStatusText = () => {
    if (checkingExtension) {
      return 'Checking extension...';
    }

    if (extensionAvailable) {
      return `Extension detected${extensionVersion ? ` (v${extensionVersion})` : ''}`;
    }

    return 'Extension not detected';
  };

  const getExtensionStatusColor = () => {
    if (checkingExtension) {
      return 'text-yellow-600';
    }

    return extensionAvailable ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Main Mode Selector - Clean and Simple */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Redirect Detection Mode
            </h3>

            {/* Mode Options with Info Icons */}
            <div className="flex items-center space-x-6 mb-3">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    currentMode === 'default'
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    currentMode === 'default'
                      ? 'text-blue-700'
                      : 'text-gray-500'
                  }`}
                >
                  Default Mode
                </span>
                <div className="group relative">
                  <svg
                    className="w-4 h-4 text-gray-400 cursor-help"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="font-medium mb-1">Default Mode</div>
                    <div>• HTTP redirects only</div>
                    <div>• 100-500ms per URL</div>
                    <div>• No server costs</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    currentMode === 'advanced'
                      ? 'bg-purple-500 border-purple-500'
                      : 'border-gray-300'
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    currentMode === 'advanced'
                      ? 'text-purple-700'
                      : 'text-gray-500'
                  }`}
                >
                  Advanced Mode
                </span>
                <div className="group relative">
                  <svg
                    className="w-4 h-4 text-gray-400 cursor-help"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="font-medium mb-1">Advanced Mode</div>
                    <div>• Meta Refresh + JavaScript</div>
                    <div>• 1-3 seconds per URL</div>
                    <div>• Local processing</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Extension Status */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Extension Status:</span>
              <span
                className={`text-sm font-medium ${getExtensionStatusColor()}`}
              >
                {getExtensionStatusText()}
              </span>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="ml-6">
            <button
              onClick={handleModeToggle}
              disabled={disabled || !extensionAvailable}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                ${
                  currentMode === 'advanced'
                    ? 'bg-purple-600'
                    : extensionAvailable
                      ? 'bg-blue-600'
                      : 'bg-gray-300 cursor-not-allowed'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={`Extension available: ${extensionAvailable}, Disabled: ${disabled || !extensionAvailable}`}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${currentMode === 'advanced' ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>

            <div className="mt-2 text-center">
              <span
                className={`text-xs font-medium ${
                  currentMode === 'advanced'
                    ? 'text-purple-700'
                    : 'text-blue-700'
                }`}
              >
                {currentMode === 'advanced' ? 'ADVANCED' : 'DEFAULT'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Extension Installation Instructions */}
      {!extensionAvailable && !checkingExtension && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-yellow-800">
                Advanced Mode Requires Extension
              </h4>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  To use Advanced mode, install the Redirectinator Advanced
                  browser extension:
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-yellow-600 font-medium mb-2">
                    ⚠️ Pre-release version - Manual installation required
                  </p>
                  <p className="mb-2">
                    Download and manually install the extension until official
                    launch:
                  </p>
                  <div className="space-y-2">
                    <a
                      href="https://redirectinator.us/extensions/dist/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      📥 Download Extensions
                    </a>
                  </div>
                  <p className="text-xs text-yellow-600 mt-2">
                    See installation guide for step-by-step instructions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Mode Available Banner - Collapsible */}
      {extensionAvailable && showAdvancedBanner && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-green-800">
                    Advanced Mode Now Available! 🎉
                  </h4>
                  <button
                    onClick={() => setShowAdvancedBanner(false)}
                    className="text-green-600 hover:text-green-500"
                    title="Dismiss banner"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Advanced mode uses the browser extension to detect Meta
                  Refresh and JavaScript redirects locally.
                </p>
                <p className="text-sm text-green-700 mt-1">
                  <strong>No server costs</strong> - all processing happens in
                  your browser!
                </p>
                <p className="text-sm text-green-600 mt-2">
                  💡 <strong>Pre-release version:</strong> Extension loaded
                  manually. Will be available in stores at launch.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedModeSelector;
