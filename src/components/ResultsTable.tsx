import React, { useState, useMemo, useEffect } from 'react';
import { RedirectResult } from '@/types';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Filter,
  Search,
  Download,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface ResultsTableProps {
  results: RedirectResult[];
  onExport: (format: 'csv' | 'json' | 'excel' | 'report') => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results, onExport }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<Set<string>>(new Set());
  const { trackCopyAction, trackSearch, trackFilter, trackUIInteraction } = useAnalytics();

  // Track search term changes
  useEffect(() => {
    if (searchTerm.trim()) {
      trackSearch(searchTerm, 'results_table', filteredResults.length);
    }
  }, [searchTerm, trackSearch, filteredResults.length]);

  // Track status filter changes
  useEffect(() => {
    if (statusFilter !== 'all') {
      trackFilter('status', statusFilter, filteredResults.length);
    }
  }, [statusFilter, trackFilter, filteredResults.length]);

  const filteredResults = useMemo(() => {
    return results.filter(result => {
      const matchesSearch =
        result.startingUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.targetRedirect.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.finalUrl.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || result.result === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [results, searchTerm, statusFilter]);

  const toggleDetails = (resultId: string) => {
    const newShowDetails = new Set(showDetails);
    const isExpanding = !newShowDetails.has(resultId);

    if (isExpanding) {
      newShowDetails.add(resultId);
      trackUIInteraction('expand_details', 'result_row', 'results_table');
    } else {
      newShowDetails.delete(resultId);
      trackUIInteraction('collapse_details', 'result_row', 'results_table');
    }
    setShowDetails(newShowDetails);
  };

  const getStatusIcon = (result: RedirectResult) => {
    // Check if this is a blocked affiliate link
    if (result.blockedReason) {
      return <AlertCircle className="w-4 h-4 text-orange-600" />;
    }
    
    switch (result.result) {
      case 'redirect':
        return <CheckCircle className="w-4 h-4 text-success-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-error-600" />;
      case 'loop':
        return <AlertCircle className="w-4 h-4 text-warning-600" />;
      case 'direct':
        return <Clock className="w-4 h-4 text-info-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-tech-600" />;
    }
  };

  const getStatusBadge = (result: RedirectResult) => {
    const baseClasses = "status-badge";
    
    // Check if this is a blocked affiliate link
    if (result.blockedReason) {
      return `${baseClasses} status-warning`;
    }
    
    switch (result.result) {
      case 'redirect':
        return `${baseClasses} status-success`;
      case 'error':
        return `${baseClasses} status-error`;
      case 'loop':
        return `${baseClasses} status-warning`;
      case 'direct':
        return `${baseClasses} status-info`;
      default:
        return `${baseClasses} status-info`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    trackCopyAction('url', 'results_table');
  };

  const getStatusCodeColor = (httpStatus: string) => {
    // Extract the first status code from chains like "301 → 200"
    const firstCode = httpStatus.split(' ')[0];
    const code = parseInt(firstCode);
    
    if (isNaN(code)) {
      return 'text-gray-600 bg-gray-100 px-2 py-1 rounded'; // Default color for invalid codes
    }
    
    // 4xx errors - red
    if (code >= 400 && code < 500) {
      return 'text-red-700 bg-red-100 px-2 py-1 rounded font-semibold';
    }
    
    // 5xx errors - purple
    if (code >= 500 && code < 600) {
      return 'text-purple-700 bg-purple-100 px-2 py-1 rounded font-semibold';
    }
    
    // Temporary redirects (302, 307) - yellow
    if (code === 302 || code === 307) {
      return 'text-yellow-700 bg-yellow-100 px-2 py-1 rounded font-semibold';
    }
    
    // 301 and 200 - default (keep same)
    if (code === 301 || code === 200) {
      return 'text-gray-600';
    }
    
    // Other codes - default
    return 'text-gray-600';
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-tech-900">
          Results ({filteredResults.length} of {results.length})
        </h3>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onExport('csv')}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-tech-400" />
            <input
              type="text"
              placeholder="Search URLs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-tech-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Results</option>
            <option value="redirect">Redirects</option>
            <option value="error">Errors</option>
            <option value="loop">Loops</option>
            <option value="direct">Direct</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-500 uppercase tracking-wider">
                Starting URL
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-500 uppercase tracking-wider">
                Target Redirect
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-500 uppercase tracking-wider">
                Final URL
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-500 uppercase tracking-wider">
                HTTP Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-500 uppercase tracking-wider">
                Redirects
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-500 uppercase tracking-wider">
                Time (ms)
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-tech-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tech-200">
            {filteredResults.map((result, index) => (
              <React.Fragment key={result.id}>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-tech-600">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result)}
                      <span className={getStatusBadge(result)}>
                        {result.blockedReason ? 'blocked' : result.result}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-tech-900 truncate">
                        {result.startingUrl}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <div className="text-sm text-tech-600 truncate">
                        {result.targetRedirect}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="max-w-xs">
                      <div className="text-sm text-tech-600 truncate">
                        {result.finalUrl || '-'}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className={`text-sm font-mono ${getStatusCodeColor(result.httpStatus)}`}>
                      {result.httpStatus}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="text-sm text-tech-600">
                      {result.numberOfRedirects}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="text-sm text-tech-600">
                      {result.responseTime}
                    </div>
                  </td>
                  
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleDetails(result.id)}
                        className="p-1 text-tech-400 hover:text-tech-600 transition-colors"
                        title={showDetails.has(result.id) ? 'Hide details' : 'Show details'}
                      >
                        {showDetails.has(result.id) ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => copyToClipboard(result.startingUrl)}
                        className="p-1 text-tech-400 hover:text-tech-600 transition-colors"
                        title="Copy starting URL"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      
                      {result.finalUrl && (
                        <a
                          href={result.finalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-tech-400 hover:text-tech-600 transition-colors"
                          title="Open final URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
                
                {/* Expanded Details */}
                {showDetails.has(result.id) && (
                  <tr className="bg-gray-25">
                    <td colSpan={8} className="px-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-tech-700 mb-2">Analysis Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-tech-600">Has Redirect Loop:</span>
                                <span className={result.hasRedirectLoop ? 'text-error-600' : 'text-success-600'}>
                                  {result.hasRedirectLoop ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-tech-600">Mixed Redirect Types:</span>
                                <span className={result.mixedRedirectTypes ? 'text-warning-600' : 'text-success-600'}>
                                  {result.mixedRedirectTypes ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-tech-600">Domain Changes:</span>
                                <span className={result.domainChanges ? 'text-warning-600' : 'text-success-600'}>
                                  {result.domainChanges ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-tech-600">HTTPS Upgrade:</span>
                                <span className={result.httpsUpgrade ? 'text-success-600' : 'text-tech-600'}>
                                  {result.httpsUpgrade ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {result.error && (
                            <div>
                              <h4 className="text-sm font-medium text-error-700 mb-2">Error</h4>
                              <div className="text-sm text-error-600 bg-error-50 p-2 rounded border border-error-200">
                                {result.error}
                              </div>
                            </div>
                          )}
                          
                          {result.blockedReason && (
                            <div>
                              <h4 className="text-sm font-medium text-orange-700 mb-2">Affiliate Link Blocked</h4>
                              <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded border border-orange-200">
                                <div className="mb-2">
                                  <strong>Service:</strong> {result.affiliateService}
                                </div>
                                <div className="mb-2">
                                  {result.blockedReason}
                                </div>
                                {result.suggestedDirectUrl && (
                                  <div className="mt-2 pt-2 border-t border-orange-200">
                                    <strong>Suggested direct URL:</strong>
                                    <div className="font-mono text-sm mt-1 p-2 bg-orange-100 rounded">
                                      {result.suggestedDirectUrl}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Right Column */}
                        <div>
                          <h4 className="text-sm font-medium text-tech-700 mb-2">Redirect Chain</h4>
                          {result.fullRedirectChain.length > 0 ? (
                            <div className="space-y-1">
                              {result.fullRedirectChain.map((url, index) => {
                                const statusCode = result.statusChain[index];
                                const getStatusColor = (code: string) => {
                                  const numCode = parseInt(code);
                                  if (numCode === 200) return 'text-green-600';
                                  if (numCode >= 400 && numCode < 500) return 'text-red-600';
                                  if (numCode >= 500) return 'text-red-600';
                                  if (numCode === 301) return 'text-blue-600';
                                  if (numCode >= 300 && numCode < 400) return 'text-yellow-600';
                                  return 'text-gray-600';
                                };
                                
                                return (
                                  <div key={index} className="text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded border">
                                    {index + 1}. {url} <span className={`font-medium ${getStatusColor(statusCode)}`}>({statusCode || 'N/A'})</span>
                                  </div>
                                );
                              })}
                              {/* Final URL */}
                              <div className="text-sm font-mono text-green-700 bg-green-50 p-2 rounded border border-green-200 font-medium">
                                {result.fullRedirectChain.length + 1}. {result.finalUrl} <span className="text-green-800">({result.finalStatusCode})</span> = final
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-tech-500 italic">No redirects</div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredResults.length === 0 && (
        <div className="text-center py-12">
          <div className="text-tech-400 mb-4">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-tech-900 mb-2">No results found</h3>
          <p className="text-tech-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No results available. Process some URLs to see results here.'
            }
          </p>
        </div>
      )}
    </div>
  );
};
