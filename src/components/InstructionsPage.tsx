import React from 'react';

interface InstructionsPageProps {
  onBack: () => void;
}

export const InstructionsPage: React.FC<InstructionsPageProps> = ({ onBack }) => {
  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            📚 Redirectinator - Complete User Guide
          </h1>
          <p className="text-lg text-gray-600">
            Welcome to Redirectinator, the professional URL redirect checker and monitor for SEO professionals. 
            This comprehensive guide will walk you through all the powerful features that make Redirectinator 
            the go-to tool for redirect analysis and site migration planning.
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🎯 What is Redirectinator?</h2>
            <p className="text-gray-700 mb-6">
              Redirectinator is a professional-grade tool designed to help SEO professionals, web developers, 
              and digital marketers analyze URL redirects, plan site migrations, and ensure no valuable traffic 
              is lost during website changes. Built with modern web technologies, it provides fast, accurate, 
              and comprehensive redirect analysis.
            </p>
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <img 
                src="/.playwright-mcp/dashboard-overview.png" 
                alt="Dashboard Overview" 
                className="w-full rounded-lg shadow-md"
              />
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🚀 Getting Started</h2>
            
            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">1. Create Your First Project</h3>
              <p className="text-gray-700 mb-4">
                When you first visit Redirectinator, you'll see the main dashboard. To get started:
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Click <strong>"Add Project"</strong> to create a new project</li>
                <li>Give your project a descriptive name (e.g., "Client Site Migration - Q1 2025")</li>
                <li>Your project will be saved and you can return to it anytime</li>
              </ol>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">2. Understanding the Dashboard</h3>
              <p className="text-gray-700 mb-4">
                The dashboard provides a comprehensive overview of your redirect analysis:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Total URLs</strong>: Number of URLs in your project</li>
                <li><strong>Good</strong>: URLs with proper redirects (301/302)</li>
                <li><strong>Bad</strong>: URLs with errors or issues</li>
                <li><strong>Not Redirected</strong>: URLs that return 200 (direct access)</li>
                <li><strong>Redirect Chain</strong>: URLs with multiple redirects</li>
                <li><strong>Status Code Analysis</strong>: Breakdown by HTTP status codes</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">📥 Adding URLs to Your Project</h2>
            <p className="text-gray-700 mb-6">
              Redirectinator offers multiple ways to add URLs for analysis. Click <strong>"Add More URLs"</strong> to see all available options:
            </p>
            
            <div className="bg-gray-100 rounded-lg p-6 mb-8">
              <img 
                src="/.playwright-mcp/url-input-modal.png" 
                alt="URL Input Modal" 
                className="w-full rounded-lg shadow-md"
              />
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Method 1: Single URL Input</h3>
              <p className="text-gray-700 mb-4">
                Perfect for testing individual URLs or adding a few URLs manually:
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Select <strong>"Single URL"</strong> tab</li>
                <li>Enter the starting URL (the old URL you want to check)</li>
                <li>Optionally enter a target redirect URL (where you expect it to redirect)</li>
                <li>Click <strong>"Add URL"</strong></li>
              </ol>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                <p className="text-blue-800"><strong>Use Cases:</strong></p>
                <ul className="list-disc list-inside text-blue-700 mt-2">
                  <li>Testing specific redirects</li>
                  <li>Quick validation of individual URLs</li>
                  <li>Manual entry of important URLs</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Method 2: Bulk Upload</h3>
              <p className="text-gray-700 mb-4">
                Upload large lists of URLs from CSV files or XML sitemaps:
              </p>
              
              <div className="bg-gray-100 rounded-lg p-6 mb-6">
                <img 
                  src="/.playwright-mcp/bulk-upload-interface.png" 
                  alt="Bulk Upload Interface" 
                  className="w-full rounded-lg shadow-md"
                />
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-2"><strong>Supported Formats:</strong></p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li><strong>CSV Files</strong>: Include "Starting URL" and optional "Target Redirect" columns</li>
                  <li><strong>XML Sitemaps</strong>: Standard sitemap format with <code>&lt;loc&gt;</code> elements</li>
                  <li><strong>Dirty Sitemaps</strong>: Sitemaps with extra content or formatting issues</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-gray-700 mb-2"><strong>CSV Format Example:</strong></p>
                <pre className="text-sm text-gray-600 bg-white p-3 rounded border overflow-x-auto">
{`Starting URL,Target Redirect
https://oldsite.com/page1,https://newsite.com/page1
https://oldsite.com/page2,https://newsite.com/page2
https://oldsite.com/page3,`}
                </pre>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-800"><strong>Use Cases:</strong></p>
                <ul className="list-disc list-inside text-blue-700 mt-2">
                  <li>Site migrations with large URL lists</li>
                  <li>Importing from existing redirect maps</li>
                  <li>Processing sitemaps from old websites</li>
                  <li>Bulk analysis of competitor redirects</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Method 3: Copy/Paste</h3>
              <p className="text-gray-700 mb-4">
                Quickly add multiple URLs by pasting them directly:
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Select <strong>"Copy/Paste"</strong> tab</li>
                <li>Paste your list of URLs (one per line)</li>
                <li>URLs are automatically parsed and added</li>
              </ol>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
                <p className="text-blue-800"><strong>Use Cases:</strong></p>
                <ul className="list-disc list-inside text-blue-700 mt-2">
                  <li>Quick entry from spreadsheets</li>
                  <li>Copying URLs from browser bookmarks</li>
                  <li>Adding URLs from text files</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Method 4: Wayback Machine Discovery</h3>
              <p className="text-gray-700 mb-4">
                Discover historical URLs from before a site migration using the Internet Archive:
              </p>
              
              <div className="bg-gray-100 rounded-lg p-6 mb-6">
                <img 
                  src="/.playwright-mcp/wayback-machine-interface.png" 
                  alt="Wayback Machine Interface" 
                  className="w-full rounded-lg shadow-md"
                />
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-2"><strong>How to Use Wayback Discovery:</strong></p>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li>Select <strong>"Wayback"</strong> tab</li>
                  <li>Enter the domain (e.g., <code>example.com</code> or <code>example.com/blog</code>)</li>
                  <li>Set the timeframe (e.g., June 2023 - July 2023)</li>
                  <li>Set URL limit (max 10,000)</li>
                  <li>Apply filters:
                    <ul className="list-disc list-inside ml-6 mt-2">
                      <li>✅ HTML pages only (exclude images, CSS, JS, PDFs)</li>
                      <li>✅ Remove duplicates</li>
                      <li>✅ Exclude robots.txt, sitemap.xml, admin areas</li>
                    </ul>
                  </li>
                  <li>Click <strong>"Discover URLs"</strong></li>
                </ol>
              </div>

              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800"><strong>Why Use Wayback Machine Discovery:</strong></p>
                <ul className="list-disc list-inside text-green-700 mt-2">
                  <li><strong>Recover Lost URLs</strong>: Find URLs that existed before a site migration</li>
                  <li><strong>Complete Migration Analysis</strong>: Ensure no valuable pages are missed</li>
                  <li><strong>Historical Content Recovery</strong>: Discover content that was accidentally lost</li>
                  <li><strong>SEO Audit Completeness</strong>: Identify all URLs that need redirects</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-800"><strong>Example Use Case:</strong></p>
                <p className="text-yellow-700">
                  A client migrated their e-commerce site in June 2023 but didn't keep records of all their old product pages. 
                  Using Wayback Machine Discovery, you can:
                </p>
                <ol className="list-decimal list-inside text-yellow-700 mt-2">
                  <li>Enter <code>example-store.com</code> as the domain</li>
                  <li>Set timeframe to "May 2023 - June 2023"</li>
                  <li>Discover 2,500+ historical product URLs</li>
                  <li>Process them to see which ones now return 404 errors</li>
                  <li>Create a comprehensive redirect plan</li>
                </ol>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-800"><strong>Supporting the Internet Archive:</strong></p>
                <p className="text-blue-700">
                  The Wayback Machine API is completely free to use. We encourage users to support the Internet Archive 
                  through donations to help keep this invaluable service running.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Method 5: SEMrush Top Pages Discovery</h3>
              <p className="text-gray-700 mb-4">
                Discover top-performing pages from SEMrush data:
              </p>
              
              <div className="bg-gray-100 rounded-lg p-6 mb-6">
                <img 
                  src="/.playwright-mcp/semrush-interface.png" 
                  alt="SEMrush Interface" 
                  className="w-full rounded-lg shadow-md"
                />
              </div>

              <div className="mb-4">
                <p className="text-gray-700 mb-2"><strong>How to Use SEMrush Discovery:</strong></p>
                <ol className="list-decimal list-inside text-gray-700 space-y-2">
                  <li>Select <strong>"SEMrush"</strong> tab</li>
                  <li>Enter the domain to analyze</li>
                  <li>Set URL limit (default 1000)</li>
                  <li>Choose country and device type</li>
                  <li>Select month for historical data</li>
                  <li>Click <strong>"Discover Top Pages"</strong></li>
                </ol>
              </div>

              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                <p className="text-green-800"><strong>Why Use SEMrush Discovery:</strong></p>
                <ul className="list-disc list-inside text-green-700 mt-2">
                  <li><strong>Competitor Analysis</strong>: Find top pages from competitor sites</li>
                  <li><strong>Content Gap Analysis</strong>: Identify high-performing content</li>
                  <li><strong>Migration Planning</strong>: Understand which pages drive the most traffic</li>
                  <li><strong>SEO Strategy</strong>: Focus on pages with the highest potential</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-yellow-800"><strong>Note:</strong> Historical Top Pages are only available on higher SEMrush plans. Lower-tier plans only support current data.</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🔧 Redirect Detection Modes</h2>
            <p className="text-gray-700 mb-6">
              Redirectinator offers two detection modes to handle different types of redirects:
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">Default Mode (Server-Side Processing)</h3>
                <ul className="list-disc list-inside text-blue-800 space-y-2">
                  <li><strong>HTTP redirects only</strong> (301, 302, 307, 308)</li>
                  <li><strong>Fast processing</strong> (100-500ms per URL)</li>
                  <li><strong>No server costs</strong> (processed on our servers)</li>
                  <li><strong>Standard redirect detection</strong></li>
                </ul>
                <div className="mt-4">
                  <p className="text-blue-800 font-semibold">Best for:</p>
                  <ul className="list-disc list-inside text-blue-700 mt-2">
                    <li>Standard HTTP redirects</li>
                    <li>Large batches of URLs</li>
                    <li>Quick analysis</li>
                    <li>Most common use cases</li>
                  </ul>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-900 mb-4">Advanced Mode (Browser Extension Required)</h3>
                <ul className="list-disc list-inside text-green-800 space-y-2">
                  <li><strong>Meta Refresh + JavaScript redirects</strong></li>
                  <li><strong>Comprehensive detection</strong> (1-3 seconds per URL)</li>
                  <li><strong>Local processing</strong> (uses your browser)</li>
                  <li><strong>Full browser capabilities</strong></li>
                </ul>
                <div className="mt-4">
                  <p className="text-green-800 font-semibold">Best for:</p>
                  <ul className="list-disc list-inside text-green-700 mt-2">
                    <li>Complex redirect chains</li>
                    <li>JavaScript-based redirects</li>
                    <li>Meta refresh redirects</li>
                    <li>Complete redirect analysis</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🌐 Browser Extensions</h2>
            <p className="text-gray-700 mb-6">
              To use Advanced Mode, you'll need to install the Redirectinator Advanced browser extension:
            </p>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Why Use the Extension?</h3>
              <p className="text-gray-700 mb-4">
                The browser extension enables Advanced Mode, which provides:
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li><strong>Complete Redirect Detection</strong>: Detects all types of redirects including:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li>HTTP redirects (301, 302, 307, 308)</li>
                    <li>Meta refresh redirects</li>
                    <li>JavaScript redirects</li>
                    <li>Mixed redirect chains</li>
                  </ul>
                </li>
                <li><strong>Local Processing</strong>: All analysis happens in your browser, ensuring:
                  <ul className="list-disc list-inside ml-6 mt-2">
                    <li><strong>Privacy</strong>: No data sent to external servers</li>
                    <li><strong>Speed</strong>: No server bottlenecks</li>
                    <li><strong>Reliability</strong>: Works even when servers are down</li>
                  </ul>
                </li>
                <li><strong>Professional Results</strong>: Get the same comprehensive analysis that enterprise tools provide, but faster and more private.</li>
              </ol>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Installation</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3">Chrome Extension:</h4>
                  <ol className="list-decimal list-inside text-blue-800 space-y-2">
                    <li>Download from the Chrome Web Store (coming soon)</li>
                    <li>Or install manually from <code>/extensions</code> folder</li>
                    <li>Enable Developer mode in Chrome</li>
                    <li>Load the extension</li>
                  </ol>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-orange-900 mb-3">Firefox Add-on:</h4>
                  <ol className="list-decimal list-inside text-orange-800 space-y-2">
                    <li>Download from Firefox Add-ons (coming soon)</li>
                    <li>Or install manually from <code>/extensions</code> folder</li>
                    <li>Use the <code>.xpi</code> file for easy installation</li>
                    <li>Load as temporary add-on or permanent installation</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Extension Features</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Automatic Detection</strong>: The web app automatically detects when the extension is installed</li>
                <li><strong>Seamless Integration</strong>: Switch between Default and Advanced modes instantly</li>
                <li><strong>No Configuration</strong>: Works out of the box with sensible defaults</li>
                <li><strong>Cross-Browser Support</strong>: Available for Chrome and Firefox</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">📊 Understanding Results</h2>
            <p className="text-gray-700 mb-6">
              Once you've processed your URLs, you'll see detailed results in the results table:
            </p>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Result Columns</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Status</strong>: Visual indicator of redirect status</li>
                <li><strong>Starting URL</strong>: The original URL you entered</li>
                <li><strong>Target Redirect</strong>: Expected redirect destination (if specified)</li>
                <li><strong>Final URL</strong>: Where the URL actually redirects to</li>
                <li><strong>HTTP Status</strong>: Final HTTP status code</li>
                <li><strong>Redirect Types</strong>: Types of redirects in the chain</li>
                <li><strong>Redirects</strong>: Number of redirects in the chain</li>
                <li><strong>Time (ms)</strong>: Processing time</li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Status Types</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>✅ Good</strong>: Proper redirect (301/302)</li>
                <li><strong>❌ Bad</strong>: Error or problematic redirect</li>
                <li><strong>⚠️ Warning</strong>: Potential issue (e.g., 302 instead of 301)</li>
                <li><strong>🔄 Loop</strong>: Redirect loop detected</li>
                <li><strong>📄 Direct</strong>: URL returns 200 (no redirect)</li>
              </ul>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Filtering and Search</h3>
              <p className="text-gray-700 mb-4">
                Use the search box and filter dropdown to find specific results:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>All Results</strong>: Show all processed URLs</li>
                <li><strong>Redirects</strong>: Show only URLs with redirects</li>
                <li><strong>Errors</strong>: Show only URLs with errors</li>
                <li><strong>Loops</strong>: Show only redirect loops</li>
                <li><strong>Direct</strong>: Show only URLs that don't redirect</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">📤 Exporting Results</h2>
            <p className="text-gray-700 mb-6">
              Redirectinator offers multiple export formats for your analysis:
            </p>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Export Formats</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">1. CSV</h4>
                  <p className="text-gray-600">Spreadsheet format for further analysis</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">2. Excel</h4>
                  <p className="text-gray-600">Microsoft Excel format with formatting</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">3. JSON</h4>
                  <p className="text-gray-600">Machine-readable format for developers</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">4. Report</h4>
                  <p className="text-gray-600">Formatted report for clients</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">Export Contents</h3>
              <p className="text-gray-700 mb-4">All exports include:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Complete redirect chain information</li>
                <li>HTTP status codes</li>
                <li>Processing timestamps</li>
                <li>Error details (if any)</li>
                <li>Performance metrics</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🎯 Common Use Cases</h2>

            <div className="space-y-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-blue-900 mb-4">1. Site Migration Planning</h3>
                <p className="text-blue-800 mb-4"><strong>Scenario:</strong> Client is migrating from <code>oldsite.com</code> to <code>newsite.com</code></p>
                <div className="mb-4">
                  <p className="text-blue-800 font-semibold mb-2">Steps:</p>
                  <ol className="list-decimal list-inside text-blue-700 space-y-2">
                    <li>Create project "Client Migration - Q1 2025"</li>
                    <li>Use Wayback Machine Discovery to find historical URLs</li>
                    <li>Upload current sitemap to get existing URLs</li>
                    <li>Process all URLs to identify:
                      <ul className="list-disc list-inside ml-6 mt-2">
                        <li>URLs that need redirects (404 errors)</li>
                        <li>URLs with incorrect redirects</li>
                        <li>URLs with redirect chains that can be optimized</li>
                      </ul>
                    </li>
                  </ol>
                </div>
                <p className="text-blue-800"><strong>Result:</strong> Complete redirect map for the migration</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-900 mb-4">2. SEO Audit</h3>
                <p className="text-green-800 mb-4"><strong>Scenario:</strong> Analyzing competitor redirects for insights</p>
                <div className="mb-4">
                  <p className="text-green-800 font-semibold mb-2">Steps:</p>
                  <ol className="list-decimal list-inside text-green-700 space-y-2">
                    <li>Use SEMrush Discovery to find top pages</li>
                    <li>Process URLs to understand redirect strategy</li>
                    <li>Identify opportunities for improvement</li>
                    <li>Export results for client presentation</li>
                  </ol>
                </div>
                <p className="text-green-800"><strong>Result:</strong> Competitive intelligence on redirect strategies</p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-purple-900 mb-4">3. Technical SEO Analysis</h3>
                <p className="text-purple-800 mb-4"><strong>Scenario:</strong> Client reports traffic drops after site changes</p>
                <div className="mb-4">
                  <p className="text-purple-800 font-semibold mb-2">Steps:</p>
                  <ol className="list-decimal list-inside text-purple-700 space-y-2">
                    <li>Use Advanced Mode with browser extension</li>
                    <li>Process URLs to detect JavaScript redirects</li>
                    <li>Identify redirect chains causing delays</li>
                    <li>Find broken redirects causing 404 errors</li>
                  </ol>
                </div>
                <p className="text-purple-800"><strong>Result:</strong> Technical issues identified and prioritized</p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-yellow-900 mb-4">4. Content Recovery</h3>
                <p className="text-yellow-800 mb-4"><strong>Scenario:</strong> Client lost content during site migration</p>
                <div className="mb-4">
                  <p className="text-yellow-800 font-semibold mb-2">Steps:</p>
                  <ol className="list-decimal list-inside text-yellow-700 space-y-2">
                    <li>Use Wayback Machine Discovery to find lost URLs</li>
                    <li>Process to see current status</li>
                    <li>Identify valuable content that needs to be restored</li>
                    <li>Create redirect plan for recovered content</li>
                  </ol>
                </div>
                <p className="text-yellow-800"><strong>Result:</strong> Lost content identified and recovery plan created</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">💡 Pro Tips</h2>

            <div className="space-y-6">
              <div className="bg-gray-50 border-l-4 border-blue-500 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">1. Use Wayback Machine for Complete Analysis</h3>
                <p className="text-gray-700">
                  When doing site migration analysis, always use Wayback Machine Discovery to ensure you don't miss any valuable URLs. 
                  Even if the client has a sitemap, the Wayback Machine might have captured additional pages.
                </p>
              </div>

              <div className="bg-gray-50 border-l-4 border-green-500 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2. Combine Multiple Input Methods</h3>
                <p className="text-gray-700">
                  For comprehensive analysis, combine different input methods:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2">
                  <li>Use Wayback Machine for historical URLs</li>
                  <li>Use SEMrush for top-performing pages</li>
                  <li>Use bulk upload for known URL lists</li>
                  <li>Use single URL for testing specific redirects</li>
                </ul>
              </div>

              <div className="bg-gray-50 border-l-4 border-purple-500 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3. Use Advanced Mode for Complex Sites</h3>
                <p className="text-gray-700">
                  If a site uses JavaScript redirects or meta refresh, you'll need Advanced Mode with the browser extension. 
                  This is especially important for:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2">
                  <li>E-commerce sites</li>
                  <li>Sites with complex tracking</li>
                  <li>Sites with JavaScript-based redirects</li>
                </ul>
              </div>

              <div className="bg-gray-50 border-l-4 border-yellow-500 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4. Export Results for Client Reports</h3>
                <p className="text-gray-700">
                  Always export your results in multiple formats:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2">
                  <li>CSV for technical analysis</li>
                  <li>Excel for client presentations</li>
                  <li>Report format for executive summaries</li>
                </ul>
              </div>

              <div className="bg-gray-50 border-l-4 border-red-500 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">5. Monitor Extension Status</h3>
                <p className="text-gray-700">
                  Keep the browser extension updated for the best results. The web app will show you if the extension 
                  is available and working properly.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🔍 Troubleshooting</h2>

            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Extension Not Detected</h3>
                <p className="text-red-800 mb-2">If the web app shows "Extension not detected":</p>
                <ol className="list-decimal list-inside text-red-700 space-y-1">
                  <li>Ensure the extension is installed and enabled</li>
                  <li>Refresh the web page</li>
                  <li>Check browser console for error messages</li>
                  <li>Try reinstalling the extension</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">URLs Not Processing</h3>
                <p className="text-yellow-800 mb-2">If URLs are stuck in processing:</p>
                <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                  <li>Check your internet connection</li>
                  <li>Try processing a smaller batch</li>
                  <li>Switch between Default and Advanced modes</li>
                  <li>Clear browser cache and cookies</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Incomplete Results</h3>
                <p className="text-blue-800 mb-2">If results seem incomplete:</p>
                <ol className="list-decimal list-inside text-blue-700 space-y-1">
                  <li>Use Advanced Mode for JavaScript redirects</li>
                  <li>Check if URLs are behind authentication</li>
                  <li>Verify URLs are accessible</li>
                  <li>Try processing individual URLs</li>
                </ol>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🆘 Getting Help</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Documentation</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>This Guide</strong>: Complete feature documentation</li>
                  <li><strong>Extension Guide</strong>: <code>/extensions/README.md</code></li>
                  <li><strong>API Documentation</strong>: Available in the codebase</li>
                </ul>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Support</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>GitHub Issues</strong>: Report bugs and request features</li>
                  <li><strong>Email Support</strong>: Contact through the website</li>
                  <li><strong>Community</strong>: Join discussions on GitHub</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🎉 Conclusion</h2>
            <p className="text-gray-700 mb-6">
              Redirectinator is a powerful tool that combines multiple data sources and detection methods to provide 
              comprehensive redirect analysis. Whether you're planning a site migration, conducting an SEO audit, or 
              analyzing competitor strategies, Redirectinator gives you the insights you need to make informed decisions.
            </p>
            <p className="text-gray-700 mb-6">
              The combination of Wayback Machine integration, SEMrush data, browser extensions, and multiple input methods 
              makes Redirectinator the most comprehensive redirect analysis tool available.
            </p>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Key Benefits:</h3>
              <ul className="list-disc list-inside text-green-800 space-y-2">
                <li>✅ <strong>Complete Coverage</strong>: Multiple input methods ensure no URLs are missed</li>
                <li>✅ <strong>Advanced Detection</strong>: Browser extension enables detection of all redirect types</li>
                <li>✅ <strong>Professional Results</strong>: Enterprise-grade analysis with detailed reporting</li>
                <li>✅ <strong>Easy to Use</strong>: Intuitive interface with helpful guidance</li>
                <li>✅ <strong>Cost Effective</strong>: No per-URL charges or usage limits</li>
              </ul>
            </div>

            <p className="text-gray-700 mt-6">
              Start your redirect analysis today and ensure your site migrations and SEO strategies are built on solid, 
              data-driven foundations!
            </p>
          </section>

          <div className="border-t border-gray-200 pt-8 mt-12">
            <p className="text-center text-gray-500">
              <em>Built with ❤️ for the SEO community by Jeff Louella</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
