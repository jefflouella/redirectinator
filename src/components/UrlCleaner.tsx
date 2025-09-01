import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  X,
  Trash2,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useNotifications } from './NotificationProvider';
import { useAnalytics } from '@/hooks/useAnalytics';

interface UrlCleanerProps {
  urls: Array<{ startingUrl: string; targetRedirect: string }>;
  onClose: () => void;
  onUrlsUpdated: (updatedUrls: Array<{ startingUrl: string; targetRedirect: string }>) => void;
}

interface UrlWithMetadata {
  id: string;
  startingUrl: string;
  targetRedirect: string;
  parameters: Map<string, string>;
  hasTrackingParams: boolean;
  isDuplicate: boolean;
  duplicateGroup?: string;
}

export const UrlCleaner: React.FC<UrlCleanerProps> = ({ urls, onClose, onUrlsUpdated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParameter, setSelectedParameter] = useState<string>('');
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [urlsToDelete, setUrlsToDelete] = useState<string[]>([]);
  const { addNotification } = useNotifications();
  const { trackCopyAction, trackSearch, trackFilter, trackBulkAction, trackCleanup, trackUIInteraction } = useAnalytics();

  // Process URLs to extract parameters and detect duplicates
  const processedUrls = useMemo(() => {
    const urlMap = new Map<string, UrlWithMetadata[]>();
    const allParams = new Set<string>();

    const processed = urls.map((url, index) => {
      const urlObj = new URL(url.startingUrl);
      const parameters = new Map<string, string>();
      
      // Extract all query parameters
      urlObj.searchParams.forEach((value, key) => {
        parameters.set(key, value);
        allParams.add(key);
      });

      // Detect tracking parameters
      const trackingParams = ['utm_', 'ref', 'source', 'campaign', 'affiliate', 'partner', 'tracking', 'clickid', 'irclickid', 'hss_channel'];
      const hasTrackingParams = Array.from(parameters.keys()).some(param => 
        trackingParams.some(tracking => param.toLowerCase().includes(tracking))
      );

      const urlData: UrlWithMetadata = {
        id: `url_${index}`,
        startingUrl: url.startingUrl,
        targetRedirect: url.targetRedirect,
        parameters,
        hasTrackingParams,
        isDuplicate: false,
      };

      // Group by base URL (without query parameters) for duplicate detection
      const baseUrl = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
      if (!urlMap.has(baseUrl)) {
        urlMap.set(baseUrl, []);
      }
      urlMap.get(baseUrl)!.push(urlData);

      return urlData;
    });

    // Mark duplicates
    urlMap.forEach((group, baseUrl) => {
      if (group.length > 1) {
        group.forEach((url, _index) => {
          url.isDuplicate = true;
          url.duplicateGroup = baseUrl;
        });
      }
    });

    return { processed, allParams: Array.from(allParams).sort() };
  }, [urls]);

  // Filter URLs based on search and parameter selection
  const filteredUrls = useMemo(() => {
    let filtered = processedUrls.processed;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(url => 
        url.startingUrl.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by parameter
    if (selectedParameter) {
      filtered = filtered.filter(url => 
        url.parameters.has(selectedParameter)
      );
    }

    return filtered;
  }, [processedUrls.processed, searchTerm, selectedParameter]);

  // Handle individual URL selection
  const toggleUrlSelection = useCallback((urlId: string) => {
    const newSelected = new Set(selectedUrls);
    if (newSelected.has(urlId)) {
      newSelected.delete(urlId);
    } else {
      newSelected.add(urlId);
    }
    setSelectedUrls(newSelected);
  }, [selectedUrls]);

  // Handle select all/none
  const toggleSelectAll = useCallback(() => {
    if (selectedUrls.size === filteredUrls.length) {
      setSelectedUrls(new Set());
      trackUIInteraction('deselect_all', 'bulk_select_button', 'url_cleaner');
    } else {
      setSelectedUrls(new Set(filteredUrls.map(url => url.id)));
      trackUIInteraction('select_all', 'bulk_select_button', 'url_cleaner');
    }
  }, [selectedUrls.size, filteredUrls, trackUIInteraction]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    if (selectedUrls.size === 0) {
      addNotification({
        type: 'warning',
        title: 'No URLs Selected',
        message: 'Please select URLs to delete first.',
        duration: 3000
      });
      return;
    }

    const urlsToDelete = Array.from(selectedUrls);
    setUrlsToDelete(urlsToDelete);
    setShowDeleteConfirm(true);
  }, [selectedUrls, addNotification]);

  // Confirm and execute delete
  const confirmDelete = useCallback(() => {
    const urlsToKeep = processedUrls.processed.filter(url => !urlsToDelete.includes(url.id));
    onUrlsUpdated(urlsToKeep.map(url => ({ startingUrl: url.startingUrl, targetRedirect: url.targetRedirect })));
    
    addNotification({
      type: 'success',
      title: 'URLs Deleted',
      message: `Successfully deleted ${urlsToDelete.length} URL${urlsToDelete.length !== 1 ? 's' : ''}.`,
      duration: 4000
    });

    setSelectedUrls(new Set());
    setShowDeleteConfirm(false);
    setUrlsToDelete([]);
  }, [urlsToDelete, processedUrls.processed, onUrlsUpdated, addNotification]);

  // Remove duplicates (keep one from each group)
  const removeDuplicates = useCallback(() => {
    const uniqueUrls = new Map<string, UrlWithMetadata>();
    
    processedUrls.processed.forEach(url => {
      if (url.duplicateGroup) {
        // Keep the first URL from each duplicate group
        if (!uniqueUrls.has(url.duplicateGroup)) {
          uniqueUrls.set(url.duplicateGroup, url);
        }
      } else {
        // Keep non-duplicate URLs
        uniqueUrls.set(url.id, url);
      }
    });

    const deduplicatedUrls = Array.from(uniqueUrls.values());
    const removedCount = processedUrls.processed.length - deduplicatedUrls.length;
    
    onUrlsUpdated(deduplicatedUrls.map(url => ({ startingUrl: url.startingUrl, targetRedirect: url.targetRedirect })));
    
    addNotification({
      type: 'success',
      title: 'Duplicates Removed',
      message: `Removed ${removedCount} duplicate URL${removedCount !== 1 ? 's' : ''}. ${deduplicatedUrls.length} unique URLs remain.`,
      duration: 4000
    });

    trackCleanup('remove_duplicates', removedCount, 'url_cleaner');
  }, [processedUrls.processed, onUrlsUpdated, addNotification, trackCleanup]);

  // Copy URL to clipboard
  const copyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    addNotification({
      type: 'success',
      title: 'URL Copied',
      message: 'URL copied to clipboard.',
      duration: 2000
    });
    trackCopyAction('url', 'url_cleaner');
  }, [addNotification, trackCopyAction]);

  // Track search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      trackSearch(searchTerm, 'url_cleaner', processedUrls.length);
    }
  }, [searchTerm, trackSearch, processedUrls.length]);

  // Track parameter filter changes
  useEffect(() => {
    if (selectedParameter) {
      trackFilter('parameter', selectedParameter, processedUrls.length);
    }
  }, [selectedParameter, trackFilter, processedUrls.length]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Clean URLs</h2>
            <p className="text-gray-600 mt-1">
              {filteredUrls.length} of {processedUrls.processed.length} URLs • {selectedUrls.size} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filters and Actions */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex items-center space-x-4">
            {/* Search Filter */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search URLs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Parameter Filter */}
            <div className="w-64">
              <select
                value={selectedParameter}
                onChange={(e) => setSelectedParameter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Parameters</option>
                {processedUrls.allParams.map(param => (
                  <option key={param} value={param}>
                    {param} ({processedUrls.processed.filter(url => url.parameters.has(param)).length})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleSelectAll}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {selectedUrls.size === filteredUrls.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>
                  {selectedUrls.size === filteredUrls.length ? 'Deselect All' : 'Select All'}
                </span>
              </button>

              <button
                onClick={removeDuplicates}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Remove Duplicates</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleBulkDelete}
                disabled={selectedUrls.size === 0}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected ({selectedUrls.size})</span>
              </button>
            </div>
          </div>
        </div>

        {/* URL Table */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Select
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parameters
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUrls.map((url) => (
                  <tr key={url.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUrls.has(url.id)}
                        onChange={() => toggleUrlSelection(url.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {url.startingUrl}
                        </div>
                        {url.isDuplicate && (
                          <div className="text-xs text-orange-600 mt-1">
                            Duplicate of {url.duplicateGroup}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {Array.from(url.parameters.entries()).map(([key, value]) => (
                          <span
                            key={key}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              key.toLowerCase().includes('utm_') || key.toLowerCase().includes('tracking')
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {key}={value.length > 20 ? `${value.substring(0, 20)}...` : value}
                          </span>
                        ))}
                        {url.parameters.size === 0 && (
                          <span className="text-gray-400 text-xs">No parameters</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {url.hasTrackingParams && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Tracking
                          </span>
                        )}
                        {url.isDuplicate && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Duplicate
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyUrl(url.startingUrl)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <a
                          href={url.startingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Open URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete {urlsToDelete.length} URL{urlsToDelete.length !== 1 ? 's' : ''}?
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
