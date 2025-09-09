import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Project } from '@/types';
import { useUrlPersistence } from '@/hooks/useUrlPersistence';
import { useAnalytics } from '@/hooks/useAnalytics';
import {
  X,
  Plus,
  Upload,
  FileText,
  Globe,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Download,
  Filter,
  ArrowRight,
} from 'lucide-react';
import Papa from 'papaparse';
import { SEMrushDiscoveryTab } from './SEMrushDiscoveryTab';
import { WaybackDiscoveryTab } from './WaybackDiscoveryTab';
import { ConfirmationOverlay } from './ConfirmationOverlay';

interface UrlInputOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: Project | null;
  onUrlsAdded?: () => void; // Callback to notify parent when URLs are added
  onProjectUpdate?: (updatedProject: Project) => void;
}

export const UrlInputOverlay: React.FC<UrlInputOverlayProps> = ({
  isOpen,
  onClose,
  currentProject,
  onUrlsAdded,
  onProjectUpdate,
}) => {
  const [inputMethod, setInputMethod] = useState<
    'single' | 'bulk' | 'paste' | 'wayback' | 'semrush'
  >('single');
  const [singleStartingUrl, setSingleStartingUrl] = useState('');
  const [singleTargetUrl, setSingleTargetUrl] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [authentication, setAuthentication] = useState({
    username: '',
    password: '',
  });
  const [isClosing, setIsClosing] = useState(false);
  const [showSingleUrlInfo, setShowSingleUrlInfo] = useState(false);
  const [showBulkInfo, setShowBulkInfo] = useState(false);
  const [showPasteInfo, setShowPasteInfo] = useState(false);
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

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

  // Analytics tracking
  const { trackFeatureUsage, trackUrlDiscovery } = useAnalytics();

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  }, [onClose]);

  // Handle escape key to close overlay
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        overlayRef.current &&
        !overlayRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClose]);

  const addSingleUrl = () => {
    if (singleStartingUrl.trim()) {
      const newUrl = {
        startingUrl: singleStartingUrl.trim(),
        targetRedirect: singleTargetUrl.trim() || '', // Make target optional
      };
      addUrl(newUrl);
      setSingleStartingUrl('');
      setSingleTargetUrl('');
      onUrlsAdded?.(); // Notify parent that URLs were added
      onUrlsAdded?.();
    }
  };

  const parseXmlSitemap = (
    xmlText: string
  ): Array<{ startingUrl: string; targetRedirect: string }> => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    const urls = xmlDoc.querySelectorAll('url');
    const parsedUrls: Array<{ startingUrl: string; targetRedirect: string }> =
      [];

    urls.forEach(urlElement => {
      const locElement = urlElement.querySelector('loc');
      if (locElement && locElement.textContent) {
        parsedUrls.push({
          startingUrl: locElement.textContent.trim(),
          targetRedirect: '', // XML sitemaps don't have target URLs
        });
      }
    });

    return parsedUrls;
  };

  const processFile = (file: File) => {
    if (!file) return;

    const fileExtension = file.name.toLowerCase().split('.').pop();

    if (fileExtension === 'csv') {
      // Handle CSV files - first check if it has headers, then parse accordingly
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        preview: 1, // Only read first row to check headers
        complete: previewResults => {
          console.log('CSV preview results:', previewResults);
          const headers = previewResults.meta?.fields || [];
          
          // Check if first row looks like headers (contains descriptive text, not URLs)
          const hasHeaders = headers.some(h => {
            if (!h || typeof h !== 'string') return false;
            const normalized = h.toLowerCase().trim();
            // If it contains URL-like patterns, it's probably data, not headers
            if (normalized.startsWith('http') || normalized.includes('www.') || normalized.includes('.com')) {
              return false;
            }
            // If it contains descriptive words, it's probably a header
            return (
              normalized.includes('url') || 
              normalized.includes('redirect') ||
              normalized.includes('source') ||
              normalized.includes('target') ||
              normalized.includes('starting') ||
              normalized.includes('from') ||
              normalized.includes('to')
            );
          });

          console.log('Headers detected:', headers);
          console.log('Has meaningful headers:', hasHeaders);

          if (hasHeaders) {
            // Parse with headers
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete: results => {
                const startingUrlColumn = headers.find(h => {
                  if (!h) return false;
                  const normalized = h.toLowerCase().trim();
                  return (
                    normalized.includes('starting') && normalized.includes('url') ||
                    normalized === 'url' ||
                    normalized === 'source' ||
                    normalized === 'from' ||
                    normalized === 'original' ||
                    normalized.includes('old') && normalized.includes('url')
                  );
                });
                
                const targetRedirectColumn = headers.find(h => {
                  if (!h) return false;
                  const normalized = h.toLowerCase().trim();
                  return (
                    (normalized.includes('target') && normalized.includes('redirect')) ||
                    normalized === 'redirect' ||
                    normalized === 'destination' ||
                    normalized === 'to' ||
                    normalized === 'new' ||
                    normalized.includes('new') && normalized.includes('url')
                  );
                });

                console.log('Detected columns:', { startingUrlColumn, targetRedirectColumn });

                if (!startingUrlColumn) {
                  alert(`No "Starting URL" column found. Available columns: ${headers.join(', ')}`);
                  return;
                }

                const parsedUrls = (results.data as Record<string, unknown>[])
                  .filter(row => {
                    const url = row[startingUrlColumn];
                    return url && String(url).trim() !== '';
                  })
                  .map(row => ({
                    startingUrl: String(row[startingUrlColumn]).trim(),
                    targetRedirect: targetRedirectColumn ? String(row[targetRedirectColumn] || '').trim() : '',
                  }));

                console.log('Parsed URLs (with headers):', parsedUrls);

                if (parsedUrls.length === 0) {
                  alert('No valid URLs found in the CSV file. Please check that the "Starting URL" column contains valid URLs.');
                  return;
                }

                setAllUrls(parsedUrls);
                setInputMethod('bulk');
                trackFeatureUsage('csv_upload', { url_count: parsedUrls.length });
                onUrlsAdded?.();
              },
              error: error => {
                console.error('CSV parsing error:', error);
                alert('Error parsing CSV file. Please check the format.');
              },
            });
          } else {
            // Parse without headers - treat as raw data
            console.log('No headers detected, parsing as raw data');
            Papa.parse(file, {
              header: false,
              skipEmptyLines: true,
              complete: results => {
                const parsedUrls = (results.data as string[][])
                  .filter(row => row && row.length >= 1 && row[0] && row[0].trim() !== '')
                  .map(row => ({
                    startingUrl: row[0].trim(),
                    targetRedirect: row[1] ? row[1].trim() : '',
                  }));

                console.log('Parsed URLs (no headers):', parsedUrls);

                if (parsedUrls.length === 0) {
                  alert('No valid URLs found in the CSV file. Please check that the first column contains valid URLs.');
                  return;
                }

                setAllUrls(parsedUrls);
                setInputMethod('bulk');
                trackFeatureUsage('csv_upload', { url_count: parsedUrls.length });
                onUrlsAdded?.();
              },
              error: error => {
                console.error('CSV parsing error:', error);
                alert('Error parsing CSV file. Please check the format.');
              },
            });
          }
        },
        error: error => {
          console.error('CSV preview error:', error);
          alert('Error reading CSV file. Please check the format.');
        },
      });
    } else if (fileExtension === 'xml') {
      // Handle XML sitemap files
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const xmlText = e.target?.result as string;
          const parsedUrls = parseXmlSitemap(xmlText);

          if (parsedUrls.length === 0) {
            alert(
              'No URLs found in the XML sitemap. Please check the file format and ensure it contains <loc> elements.'
            );
            return;
          }

          setAllUrls(parsedUrls);
          setInputMethod('bulk');

          // Track XML sitemap upload
          trackFeatureUsage('xml_sitemap_upload', {
            url_count: parsedUrls.length,
          });

          // Notify parent that URLs were added
          onUrlsAdded?.();
        } catch (error) {
          console.error('XML parsing error:', error);
          alert('Error parsing XML sitemap. Please check the file format.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a CSV file (.csv) or XML sitemap file (.xml).');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      processFile(file);
    }
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
    // Notify parent that URLs were added
    onUrlsAdded?.();
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

  const handleClearAll = () => {
    setShowClearConfirmation(true);
  };

  const handleConfirmClear = () => {
    clearAll();
    setShowClearConfirmation(false);
  };

  const copyToClipboard = () => {
    const csvContent = urls
      .map(url => `${url.startingUrl},${url.targetRedirect}`)
      .join('\n');
    navigator.clipboard.writeText(csvContent);
  };

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

      {/* Overlay Content */}
      <div
        ref={overlayRef}
        className={`relative w-full max-w-4xl mx-4 bg-white rounded-xl shadow-2xl transform transition-all duration-200 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Add URLs</h2>
            <p className="text-sm text-gray-600 mt-1">
              {currentProject
                ? `Project: ${currentProject.name}`
                : 'No project selected'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Input Method Tabs */}
            <div className="space-y-2">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => {
                    setInputMethod('single');
                    trackFeatureUsage('input_method_selected', {
                      method: 'single',
                    });
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                    inputMethod === 'single'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Single URL</span>
                </button>

                <button
                  onClick={() => {
                    setInputMethod('bulk');
                    trackFeatureUsage('input_method_selected', {
                      method: 'bulk',
                    });
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                    inputMethod === 'bulk'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Bulk Upload</span>
                </button>

                <button
                  onClick={() => {
                    setInputMethod('paste');
                    trackFeatureUsage('input_method_selected', {
                      method: 'paste',
                    });
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                    inputMethod === 'paste'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Copy/Paste</span>
                </button>

                <button
                  onClick={() => {
                    setInputMethod('wayback');
                    trackFeatureUsage('input_method_selected', {
                      method: 'wayback',
                    });
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                    inputMethod === 'wayback'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Wayback</span>
                </button>

                <button
                  onClick={() => {
                    setInputMethod('semrush');
                    trackFeatureUsage('input_method_selected', {
                      method: 'semrush',
                    });
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                    inputMethod === 'semrush'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>SEMrush</span>
                </button>
              </div>
            </div>

            {/* Single URL Input */}
            {inputMethod === 'single' && (
              <div className="space-y-4 relative">
                {showSingleUrlInfo && (
                  <div className="absolute top-0 left-0 mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 shadow-lg z-50 max-w-md">
                    <h4 className="text-sm font-semibold text-blue-900">
                      Single URL Input
                    </h4>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p>
                        <strong>What it does:</strong> Add one URL at a time
                        with optional target redirect.
                      </p>
                      <p>
                        <strong>Best for:</strong> Testing individual URLs or
                        adding a few URLs quickly.
                      </p>
                      <p>
                        <strong>Target redirect:</strong> Optional - specify
                        where the URL should redirect to for validation.
                      </p>
                      <p>
                        <strong>Keyboard shortcut:</strong> Press Enter in
                        either field to add the URL.
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Single URL Input
                    <button
                      onClick={() => setShowSingleUrlInfo(!showSingleUrlInfo)}
                      className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                      title="Learn about single URL input"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Starting URL
                    </label>
                    <input
                      type="url"
                      value={singleStartingUrl}
                      onChange={e => setSingleStartingUrl(e.target.value)}
                      placeholder="http://example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={e => e.key === 'Enter' && addSingleUrl()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Redirect{' '}
                      <span className="text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="url"
                      value={singleTargetUrl}
                      onChange={e => setSingleTargetUrl(e.target.value)}
                      placeholder="https://example.com (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={e => e.key === 'Enter' && addSingleUrl()}
                    />
                  </div>
                </div>
                <button
                  onClick={addSingleUrl}
                  disabled={!singleStartingUrl.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add URL</span>
                </button>
              </div>
            )}

            {/* Bulk Upload */}
            {inputMethod === 'bulk' && (
              <div className="space-y-4 relative">
                {showBulkInfo && (
                  <div className="absolute top-0 left-0 mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 shadow-lg z-50 max-w-md">
                    <h4 className="text-sm font-semibold text-blue-900">
                      Bulk Upload
                    </h4>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p>
                        <strong>What it does:</strong> Upload multiple URLs from
                        CSV files or XML sitemaps.
                      </p>
                      <p>
                        <strong>CSV format:</strong> "Starting URL" and optional
                        "Target Redirect" columns.
                      </p>
                      <p>
                        <strong>XML sitemaps:</strong> Standard sitemap format
                        with &lt;loc&gt; elements.
                      </p>
                      <p>
                        <strong>Best for:</strong> Large datasets, existing URL
                        lists, or sitemap imports.
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Bulk Upload
                    <button
                      onClick={() => setShowBulkInfo(!showBulkInfo)}
                      className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                      title="Learn about bulk upload"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </h3>
                </div>
                <div 
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    isDragOver 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${
                    isDragOver ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm mb-2 ${
                    isDragOver ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {isDragOver 
                      ? 'Drop your file here' 
                      : 'Upload a CSV file with URLs, or an XML sitemap file'
                    }
                  </p>
                  <div className="text-xs text-gray-500 mb-4">
                    <p>
                      • CSV: Two columns (Starting URL, Target Redirect) - headers optional
                    </p>
                    <p>
                      • XML Sitemap: Standard sitemap format with &lt;loc&gt;
                      elements
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Choose File (CSV or XML)
                  </button>
                  <p className="text-xs text-gray-400 mt-2">
                    Or drag and drop your file here
                  </p>
                </div>
              </div>
            )}

            {/* Copy/Paste */}
            {inputMethod === 'paste' && (
              <div className="space-y-4 relative">
                {showPasteInfo && (
                  <div className="absolute top-0 left-0 mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 shadow-lg z-50 max-w-md">
                    <h4 className="text-sm font-semibold text-blue-900">
                      Copy/Paste Input
                    </h4>
                    <div className="text-sm text-blue-800 space-y-2">
                      <p>
                        <strong>What it does:</strong> Paste URLs directly from
                        spreadsheets or text files.
                      </p>
                      <p>
                        <strong>Format:</strong> CSV format: Starting URL,
                        Target Redirect (optional).
                      </p>
                      <p>
                        <strong>Auto-parse:</strong> Automatically detects and
                        parses URLs as you type.
                      </p>
                      <p>
                        <strong>Best for:</strong> Quick imports from Excel,
                        Google Sheets, or text files.
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Copy/Paste Input
                    <button
                      onClick={() => setShowPasteInfo(!showPasteInfo)}
                      className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                      title="Learn about copy/paste input"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </h3>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste URLs (CSV format: Starting URL, Target Redirect -
                    Target is optional)
                  </label>
                  <textarea
                    value={bulkText}
                    onChange={e => handleBulkTextChange(e.target.value)}
                    placeholder="http://example.com,https://example.com&#10;http://test.com&#10;http://another.com,https://another.com"
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* Wayback Machine Discovery */}
            {inputMethod === 'wayback' && (
              <WaybackDiscoveryTab
                onUrlsDiscovered={urls => {
                  // Add discovered URLs to the project (no target URLs needed for discovery)
                  urls.forEach(url => {
                    addUrl({
                      startingUrl: url,
                      targetRedirect: '', // Empty for discovery URLs
                    });
                  });

                  // Track Wayback discovery
                  trackUrlDiscovery('wayback', urls.length);

                  // Notify parent that URLs were added
                  onUrlsAdded?.();
                }}
                onClose={handleClose}
              />
            )}

            {/* SEMrush Discovery */}
            {inputMethod === 'semrush' && (
              <SEMrushDiscoveryTab
                onUrlsDiscovered={urls => {
                  // Add discovered URLs to the project (no target URLs needed for discovery)
                  urls.forEach(url => {
                    addUrl({
                      startingUrl: url,
                      targetRedirect: '', // Empty for discovery URLs
                    });
                  });

                  // Track SEMrush discovery
                  trackUrlDiscovery('semrush', urls.length);

                  // Notify parent that URLs were added
                  onUrlsAdded?.();
                }}
                onClose={handleClose}
              />
            )}

            {/* Advanced Options */}
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Filter className="w-4 h-4" />
                <span>Advanced Options</span>
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Password Protected URLs (Staging)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* URL List */}
            {!urlsLoading && urls.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    URLs Added ({urls.length})
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="flex items-center space-x-2 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span>Clear All</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {url.startingUrl}
                            </div>
                            <div className="text-xs text-gray-500 truncate flex items-center">
                              <ArrowRight className="w-3 h-3 mr-1" />
                              {url.targetRedirect || 'No target specified'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeUrl(index)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <AlertCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading State */}
            {urlsLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
                <span className="ml-3 text-gray-600">
                  Loading URLs from project...
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="text-sm text-gray-600">
            {!currentProject
              ? 'Please select or create a project first'
              : urls.length === 0
                ? 'Add URLs to continue'
                : `${urls.length} URL${urls.length !== 1 ? 's' : ''} ready`}
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleClose}
              disabled={!currentProject || urls.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save URLs
            </button>
          </div>
        </div>
      </div>

      {/* Clear All URLs Confirmation Overlay */}
      <ConfirmationOverlay
        isOpen={showClearConfirmation}
        onClose={() => setShowClearConfirmation(false)}
        onConfirm={handleConfirmClear}
        title="Clear All URLs"
        message={`Are you sure you want to clear all ${urls.length} URLs? This action cannot be undone and will remove all URLs you've added in this session.`}
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
