import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, AlertCircle, CheckCircle, Loader2, Info, X } from 'lucide-react';
import { SEMrushService, SEMrushDiscoveryParams, SEMrushDiscoveryResult } from '@/services/semrushService';

interface SEMrushDiscoveryTabProps {
  onUrlsDiscovered: (urls: string[]) => void;
  onClose: () => void;
}

export const SEMrushDiscoveryTab: React.FC<SEMrushDiscoveryTabProps> = ({
  onUrlsDiscovered,
  onClose
}) => {
  const [domain, setDomain] = useState('');
  // SEMrush uses a single as-of date (monthly snapshot). Use explicit Month + Year selects.
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth(); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(currentMonthIndex);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}`
  );
  const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const firstHistoricalYear = 2012; // Based on SEMrush historical availability
  const years: number[] = Array.from({ length: currentYear - firstHistoricalYear + 1 }, (_, i) => currentYear - i);

  // Keep combined YYYY-MM string in sync with dropdowns
  useEffect(() => {
    const mm = String(selectedMonthIndex + 1).padStart(2, '0');
    setSelectedMonth(`${selectedYear}-${mm}`);
  }, [selectedYear, selectedMonthIndex]);
  const [urlLimit, setUrlLimit] = useState(1000);
  const [country, setCountry] = useState('us');
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryResult, setDiscoveryResult] = useState<SEMrushDiscoveryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const [hasApiKey, setHasApiKey] = useState(false);
  const [remainingUnits, setRemainingUnits] = useState<number | null>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  const semrushService = new SEMrushService();

  // Calculate API impact based on URL limit
  const calculateApiImpact = (limit: number) => {
    // SEMrush domain_organic endpoint costs 1 API unit per request
    // The limit parameter determines how many results are returned in one request
    return {
      apiUnits: 1, // Always 1 unit per request regardless of limit
      maxResults: Math.min(limit, 10000), // SEMrush max is 10,000
      costDescription: limit > 10000 ? 'Limited to 10,000 results (SEMrush maximum)' : `${limit} results`
    };
  };

  const apiImpact = calculateApiImpact(urlLimit);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  // Close info tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(event.target as Node)) {
        setShowInfo(false);
      }
    };

    if (showInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showInfo]);

  const checkApiKeyStatus = async () => {
    try {
      const hasKey = await semrushService.hasApiKey();
      setHasApiKey(hasKey);
      if (hasKey) {
        const units = await semrushService.getRemainingUnits();
        setRemainingUnits(units);
      } else {
        setRemainingUnits(null);
      }
    } catch (error) {
      console.error('Failed to check API key status:', error);
    }
  };

  const handleDiscover = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain');
      return;
    }

    if (!hasApiKey) {
      setError('SEMrush API key not configured. Please add your API key in Settings.');
      return;
    }

    setIsDiscovering(true);
    setError(null);

    try {
      // Convert month (YYYY-MM) to first and last day strings
      const [yearStr, monthStr] = selectedMonth.split('-');
      const year = parseInt(yearStr, 10);
      const monthIndex = parseInt(monthStr, 10) - 1; // 0-based
      const firstDay = new Date(year, monthIndex, 1);
      const lastDay = new Date(year, monthIndex + 1, 0);

      const params: SEMrushDiscoveryParams = {
        domain: domain.trim(),
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0],
        country,
        device,
        limit: urlLimit,
      };

      const result = await semrushService.discoverTopPages(params);
      setDiscoveryResult(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to discover pages');
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleClear = () => {
    setDomain('');
    setSelectedYear(currentYear);
    setSelectedMonthIndex(currentMonthIndex);
    setUrlLimit(1000);
    setCountry('us');
    setDevice('desktop');
    setDiscoveryResult(null);
    setError(null);
  };

  const handleAddAllUrls = () => {
    if (discoveryResult) {
      const urls = discoveryResult.pages.map(page => page.url);
      onUrlsDiscovered(urls);
    }
  };



  return (
    <div className="space-y-6">
      {/* Discovery Form */}
      <div className="space-y-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <img src="/SEMrush-Icon.png" alt="SEMrush" className="w-6 h-4 mr-2" />
            Top Pages Discovery
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
              title="Learn how SEMrush discovery works"
            >
              <Info className="w-4 h-4" />
            </button>
          </h3>
          
          {/* Info Tooltip */}
          {showInfo && (
            <div 
              ref={infoRef}
              className="absolute top-0 left-0 mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 shadow-lg z-50 max-w-md"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-blue-900">How SEMrush Discovery Works</h4>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 text-blue-600 hover:text-blue-800 transition-colors rounded-full hover:bg-blue-100"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>What it does:</strong> Discovers top-performing pages from SEMrush historical data for your specified timeframe.</p>
                <p><strong>Data source:</strong> Uses SEMrush's domain analytics to find pages that were ranking and driving traffic.</p>
                <p><strong>Historical insight:</strong> Shows pages that were successful during your selected period, even if they're no longer active.</p>
                <p><strong>Use cases:</strong> Perfect for finding lost content, analyzing competitor pages, or discovering old URLs that may need redirects.</p>
                <p><strong>API requirement:</strong> Requires a SEMrush API key (stored securely in your browser).</p>
                <p><strong>API costs:</strong> Each discovery request costs 1 API unit, regardless of the number of results requested.</p>
                <p><strong>Limits:</strong> Maximum 10,000 results per request (SEMrush API limit).</p>
                <p><strong>Plan note:</strong> Historical Top Pages are available on higher-tier SEMrush plans. Lower-tier plans only support Current Data.</p>
                <p><strong>✅ Ready to use:</strong> SEMrush API integration is working! Discover top organic pages for any domain.</p>
              </div>
            </div>
          )}

          {/* Plan Note (always visible) */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-start">
            <Info className="w-4 h-4 mr-2 mt-0.5" />
            <div>
              <span className="font-medium">Plan note:</span> Historical Top Pages are only available on higher SEMrush plans. Lower-tier plans only support Current Data.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Domain *
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Limit
              </label>
              <input
                type="number"
                value={urlLimit}
                onChange={(e) => setUrlLimit(parseInt(e.target.value) || 1000)}
                min="1"
                max="10000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
                <option value="au">Australia</option>
                <option value="de">Germany</option>
                <option value="fr">France</option>
                <option value="es">Spain</option>
                <option value="it">Italy</option>
                <option value="br">Brazil</option>
                <option value="ru">Russia</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device
              </label>
              <select
                value={device}
                onChange={(e) => setDevice(e.target.value as 'desktop' | 'mobile')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Month (as of)
              </label>
              <div className="flex space-x-2">
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    const y = parseInt(e.target.value, 10);
                    setSelectedYear(y);
                    // If selecting current year, prevent selecting a future month
                    if (y === currentYear && selectedMonthIndex > currentMonthIndex) {
                      setSelectedMonthIndex(currentMonthIndex);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <select
                  value={selectedMonthIndex}
                  onChange={(e) => setSelectedMonthIndex(parseInt(e.target.value, 10))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {monthsShort.map((m, idx) => {
                    const disabled = (selectedYear === currentYear && idx > currentMonthIndex) ||
                                     (selectedYear === firstHistoricalYear && idx < 0); // no lower bound within 2012
                    return (
                      <option key={m} value={idx} disabled={disabled}>{m}</option>
                    );
                  })}
                </select>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                SEMrush returns a monthly snapshot as of the selected month. Historical availability varies by database.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDiscover}
              disabled={!domain.trim() || isDiscovering}
              className="btn-primary flex items-center space-x-2"
            >
              {isDiscovering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Discovering...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Discover Top Pages</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleClear}
              disabled={isDiscovering}
              className="btn-secondary"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Results Display */}
      {discoveryResult && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800">
                Found {discoveryResult.totalFound} top-performing pages for {discoveryResult.domain}
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Timeframe: {discoveryResult.timeframe} | Country: {discoveryResult.country.toUpperCase()} | Device: {discoveryResult.device}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h4 className="font-medium text-gray-900">Discovered Pages</h4>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {discoveryResult.pages.slice(0, 20).map((page, index) => (
                <div key={index} className="px-4 py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{page.url}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>Traffic: {page.organicTraffic.toLocaleString()}</span>
                        <span>Keywords: {page.organicKeywords}</span>
                        <span>Position: {page.organicPosition.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {discoveryResult.pages.length > 20 && (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  ... and {discoveryResult.pages.length - 20} more pages
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Add all discovered pages to your project for redirect analysis
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAllUrls}
                className="btn-primary flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Add All Pages ({discoveryResult.totalFound})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
