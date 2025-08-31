import React, { useState } from 'react';
import { Search, Filter, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { WaybackService, WaybackDiscoveryParams, WaybackDiscoveryResult } from '@/services/waybackService';
import { InternetArchiveDonation } from './InternetArchiveDonation';
import { DateRangePicker } from './DateRangePicker';

interface WaybackDiscoveryTabProps {
  onUrlsDiscovered: (urls: string[]) => void;
  onClose: () => void;
}

export const WaybackDiscoveryTab: React.FC<WaybackDiscoveryTabProps> = ({
  onUrlsDiscovered,
  onClose
}) => {
  const [domain, setDomain] = useState('');
  const [fromDate, setFromDate] = useState(new Date(2023, 5, 1)); // June 1, 2023
  const [toDate, setToDate] = useState(new Date(2023, 6, 31)); // July 31, 2023
  const [urlLimit, setUrlLimit] = useState(1000);
  const [filters, setFilters] = useState({
    htmlOnly: true,
    removeDuplicates: true,
    excludeSystemFiles: true,
  });
  
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<WaybackDiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const waybackService = new WaybackService();

  const handleDiscover = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain');
      return;
    }

    if (!waybackService.validateDomain(domain)) {
      setError('Please enter a valid domain (e.g., example.com)');
      return;
    }

    setIsDiscovering(true);
    setError(null);
    setDiscoveryResult(null);

    try {
      const fromDateStr = waybackService.formatDateForAPI(fromDate);
      const toDateStr = waybackService.formatDateForAPI(toDate);

      const params: WaybackDiscoveryParams = {
        domain: domain.trim(),
        fromDate: fromDateStr,
        toDate: toDateStr,
        limit: urlLimit,
        filters,
      };

      const result = await waybackService.discoverUrls(params);
      setDiscoveryResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to discover URLs';
      
      // Handle specific timeout errors
      if (errorMessage.includes('timeout') || errorMessage.includes('408')) {
        setError('The Wayback Machine API is taking too long to respond. Large datasets may take 30-60 seconds. Try reducing the date range or URL limit, or wait and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleAddUrls = () => {
    if (discoveryResult) {
      const urls = discoveryResult.urls.map(url => url.original);
      onUrlsDiscovered(urls);
      onClose();
    }
  };

  const handleClear = () => {
    setDomain('');
    setFromDate(new Date(2023, 5, 1)); // June 1, 2023
    setToDate(new Date(2023, 6, 31)); // July 31, 2023
    setUrlLimit(1000);
    setDiscoveryResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Discovery Form */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Search className="w-5 h-5 mr-2" />
          Wayback Machine Discovery
        </h3>

        {/* Domain Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Domain
          </label>
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            className="input-field w-full"
            disabled={isDiscovering}
          />
        </div>

        {/* Date Range Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeframe
          </label>
          <DateRangePicker
            fromDate={fromDate}
            toDate={toDate}
            onDateChange={(from, to) => {
              setFromDate(from);
              setToDate(to);
            }}
            className="w-full"
          />
        </div>

        {/* URL Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Limit (max 10,000)
          </label>
          <input
            type="number"
            value={urlLimit}
            onChange={(e) => setUrlLimit(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))}
            min="1"
            max="10000"
            className="input-field w-full"
            disabled={isDiscovering}
          />
          {urlLimit > 1000 && (
            <p className="text-xs text-amber-600 mt-1">
              ⏱️ Large datasets ({urlLimit.toLocaleString()} URLs) may take 30-60 seconds to process
            </p>
          )}
        </div>

        {/* Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.htmlOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, htmlOnly: e.target.checked }))}
                className="mr-2"
                disabled={isDiscovering}
              />
              <span className="text-sm text-gray-700">HTML pages only (exclude images, CSS, JS, PDFs)</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.removeDuplicates}
                onChange={(e) => setFilters(prev => ({ ...prev, removeDuplicates: e.target.checked }))}
                className="mr-2"
                disabled={isDiscovering}
              />
              <span className="text-sm text-gray-700">Remove duplicates</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.excludeSystemFiles}
                onChange={(e) => setFilters(prev => ({ ...prev, excludeSystemFiles: e.target.checked }))}
                className="mr-2"
                disabled={isDiscovering}
              />
              <span className="text-sm text-gray-700">Exclude robots.txt, sitemap.xml, admin areas</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleDiscover}
            disabled={isDiscovering || !domain.trim()}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDiscovering ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{isDiscovering ? 'Discovering...' : 'Discover URLs'}</span>
          </button>
          <button
            onClick={handleClear}
            disabled={isDiscovering}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Discovery Results */}
      {discoveryResult && (
        <div className={`border rounded-lg p-4 ${
          discoveryResult.demo 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className={`flex items-center space-x-2 mb-3 ${
            discoveryResult.demo ? 'text-blue-800' : 'text-green-800'
          }`}>
            <CheckCircle className="w-5 h-5" />
            <h4 className="font-semibold">
              {discoveryResult.demo ? 'Demo Results' : 'Discovery Results'}
            </h4>
          </div>
          
          <div className={`space-y-2 text-sm ${
            discoveryResult.demo ? 'text-blue-700' : 'text-green-700'
          }`}>
            <p><strong>Domain:</strong> {discoveryResult.domain}</p>
            <p><strong>Timeframe:</strong> {waybackService.getReadableTimeframe(
              discoveryResult.timeframe.split(' to ')[0],
              discoveryResult.timeframe.split(' to ')[1]
            )}</p>
            <p><strong>URLs Found:</strong> {discoveryResult.totalFound.toLocaleString()}</p>
            
            {discoveryResult.demo && (
              <div className="bg-blue-100 border border-blue-200 rounded p-2 mt-2">
                <p className="text-xs text-blue-800">
                  <strong>Demo Mode:</strong> {discoveryResult.message}
                </p>
              </div>
            )}
            
            {discoveryResult.filtersApplied.length > 0 && (
              <div>
                <strong>Filters Applied:</strong>
                <ul className="list-disc list-inside ml-2 mt-1">
                  {discoveryResult.filtersApplied.map((filter, index) => (
                    <li key={index}>{filter}</li>
                  ))}
                </ul>
              </div>
            )}

            {discoveryResult.urls.length > 0 && (
              <div>
                <strong>Sample URLs:</strong>
                <div className="bg-white rounded border p-2 mt-1 max-h-32 overflow-y-auto">
                  {discoveryResult.urls.slice(0, 5).map((url, index) => (
                    <div key={index} className="text-xs font-mono text-gray-600 truncate">
                      {url.original}
                    </div>
                  ))}
                  {discoveryResult.urls.length > 5 && (
                    <div className="text-xs text-gray-500 italic">
                      ... and {discoveryResult.urls.length - 5} more
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex space-x-3">
            <button
              onClick={handleAddUrls}
              className="btn-primary flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Add All URLs ({discoveryResult.totalFound.toLocaleString()})</span>
            </button>
          </div>
        </div>
      )}

      {/* Internet Archive Donation */}
      <InternetArchiveDonation className="mt-6" />
    </div>
  );
};
