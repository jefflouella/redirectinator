import React from 'react';

interface ModeSelectorProps {
  mode: 'default' | 'advanced';
  onModeChange: (mode: 'default' | 'advanced') => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Detection Mode:</span>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onModeChange('default')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              mode === 'default'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Default
          </button>
          <button
            onClick={() => onModeChange('advanced')}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              mode === 'advanced'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Advanced
          </button>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        {mode === 'default' ? (
          <span>Fast HTTP redirect detection only</span>
        ) : (
          <span>Comprehensive detection with Puppeteer (slower but thorough)</span>
        )}
      </div>
    </div>
  );
};
