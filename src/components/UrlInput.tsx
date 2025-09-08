import React, { useState, useRef } from 'react';
import { Project } from '@/types';
import {
  Upload,
  Copy,
  Plus,
  Trash2,
  Play,
  CheckCircle,
  Settings,
} from 'lucide-react';
import Papa from 'papaparse';
import { useUrlPersistence } from '@/hooks/useUrlPersistence';

interface UrlInputProps {
  onProcessUrls: (
    urls: Array<{ startingUrl: string; targetRedirect: string }>
  ) => void;
  isProcessing: boolean;
  currentProject: Project | null;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  onProcessUrls,
  isProcessing,
  currentProject,
  onProjectUpdate,
}) => {
  const [inputMethod, setInputMethod] = useState<'single' | 'bulk' | 'paste'>(
    'single'
  );
  const [singleStartingUrl, setSingleStartingUrl] = useState('');
  const [singleTargetUrl, setSingleTargetUrl] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [authentication, setAuthentication] = useState({
    username: '',
    password: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use persistent URL storage
  const {
    urls,
    isLoading: urlsLoading,
    addUrl,
    removeUrl,
    setAllUrls,
    clearUrls,
  } = useUrlPersistence({
    currentProject,
    onProjectUpdate,
  });

  const addSingleUrl = () => {
    if (singleStartingUrl.trim()) {
      const newUrl = {
        startingUrl: singleStartingUrl.trim(),
        targetRedirect: singleTargetUrl.trim() || '', // Make target optional
      };
      addUrl(newUrl);
      setSingleStartingUrl('');
      setSingleTargetUrl('');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const parsedUrls = results.data
          .filter((row: Record<string, unknown>) => row['Starting URL']) // Only require starting URL
          .map((row: Record<string, unknown>) => ({
            startingUrl: String(row['Starting URL']).trim(),
            targetRedirect: String(row['Target Redirect'] || '').trim(), // Make target optional
          }));

        setAllUrls(parsedUrls);
        setInputMethod('bulk');
      },
      error: error => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file. Please check the format.');
      },
    });
  };

  const handleBulkTextChange = (text: string) => {
    setBulkText(text);

    // Auto-parse URLs from text
    const lines = text.split('\n').filter(line => line.trim());
    const parsedUrls: Array<{ startingUrl: string; targetRedirect: string }> =
      [];

    for (const line of lines) {
      const parts = line.split(',').map(part => part.trim());
      if (parts.length >= 1) {
        parsedUrls.push({
          startingUrl: parts[0],
          targetRedirect: parts[1] || '', // Make target optional
        });
      }
    }

    setAllUrls(parsedUrls);
  };

  const validateUrls = () => {
    const errors: string[] = [];

    urls.forEach((url, index) => {
      try {
        new URL(url.startingUrl);
      } catch {
        errors.push(
          `Row ${index + 1}: Invalid starting URL - ${url.startingUrl}`
        );
      }

      // Only validate target URL if it's provided
      if (url.targetRedirect.trim()) {
        try {
          new URL(url.targetRedirect);
        } catch {
          errors.push(
            `Row ${index + 1}: Invalid target URL - ${url.targetRedirect}`
          );
        }
      }
    });

    return errors;
  };

  const handleProcess = () => {
    if (!currentProject) {
      alert('Please select or create a project before processing URLs.');
      return;
    }

    if (urls.length === 0) {
      alert('Please add at least one URL to process.');
      return;
    }

    const errors = validateUrls();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }

    onProcessUrls(urls);
  };

  const clearAll = () => {
    clearUrls();
    setSingleStartingUrl('');
    setSingleTargetUrl('');
    setBulkText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const copyToClipboard = () => {
    const csvContent = urls
      .map(url => `${url.startingUrl},${url.targetRedirect}`)
      .join('\n');
    navigator.clipboard.writeText(csvContent);
  };

  return (
    <div className="space-y-6">
      {/* Input Method Tabs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-tech-900">URL Input</h3>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm transition-colors ${
                showAdvanced
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-tech-600 hover:text-tech-900'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Advanced</span>
            </button>
          </div>
        </div>

        {/* Input Method Selector */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
          <button
            onClick={() => setInputMethod('single')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              inputMethod === 'single'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-tech-600 hover:text-tech-900'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Single URL</span>
          </button>

          <button
            onClick={() => setInputMethod('bulk')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              inputMethod === 'bulk'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-tech-600 hover:text-tech-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Upload</span>
          </button>

          <button
            onClick={() => setInputMethod('paste')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              inputMethod === 'paste'
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-tech-600 hover:text-tech-900'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Copy/Paste</span>
          </button>
        </div>

        {/* Single URL Input */}
        {inputMethod === 'single' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tech-700 mb-2">
                  Starting URL
                </label>
                <input
                  type="url"
                  value={singleStartingUrl}
                  onChange={e => setSingleStartingUrl(e.target.value)}
                  placeholder="http://example.com"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tech-700 mb-2">
                  Target Redirect
                </label>
                <input
                  type="url"
                  value={singleTargetUrl}
                  onChange={e => setSingleTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="input-field"
                />
              </div>
            </div>
            <button
              onClick={addSingleUrl}
              disabled={!singleStartingUrl.trim() || !singleTargetUrl.trim()}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add URL</span>
            </button>
          </div>
        )}

        {/* Bulk Upload */}
        {inputMethod === 'bulk' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-tech-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-tech-400 mx-auto mb-4" />
              <p className="text-sm text-tech-600 mb-2">
                Upload a CSV file with "Starting URL" and "Target Redirect"
                columns
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary"
              >
                Choose CSV File
              </button>
            </div>
          </div>
        )}

        {/* Copy/Paste */}
        {inputMethod === 'paste' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-tech-700 mb-2">
                Paste URLs (CSV format: Starting URL, Target Redirect)
              </label>
              <textarea
                value={bulkText}
                onChange={e => handleBulkTextChange(e.target.value)}
                placeholder="http://example.com,https://example.com&#10;http://test.com,https://test.com"
                rows={6}
                className="input-field font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="border-t border-tech-200 pt-4">
            <h4 className="text-sm font-medium text-tech-700 mb-3">
              Password Protected URLs (Staging)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tech-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={authentication.username}
                  onChange={e =>
                    setAuthentication(prev => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  placeholder="staging_user"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tech-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={authentication.password}
                  onChange={e =>
                    setAuthentication(prev => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="staging_pass"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {urlsLoading && (
        <div className="card">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-tech-600">
              Loading URLs from project...
            </span>
          </div>
        </div>
      )}

      {/* URL List */}
      {!urlsLoading && urls.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-tech-900">
              URLs to Process ({urlsLoading ? '...' : urls.length})
            </h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={copyToClipboard}
                className="btn-secondary flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </button>
              <button
                onClick={clearAll}
                className="btn-secondary flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {urls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-tech-900 truncate">
                        {url.startingUrl}
                      </div>
                      <div className="text-xs text-tech-500 truncate">
                        → {url.targetRedirect}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeUrl(index)}
                  className="p-1 text-tech-400 hover:text-error-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Process Button */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-tech-600">
              {!currentProject
                ? 'Please select or create a project first'
                : urls.length === 0
                  ? 'Add URLs to process'
                  : `${urls.length} URL${urls.length !== 1 ? 's' : ''} ready to process`}
            </div>
            <button
              onClick={handleProcess}
              disabled={isProcessing || urls.length === 0 || !currentProject}
              className="btn-primary flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Processing...'
                  : !currentProject
                    ? 'Select Project First'
                    : 'Process URLs'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
