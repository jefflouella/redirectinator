import React from 'react';
import {
  ExternalLink,
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle,
  Zap,
  Shield,
  Code,
} from 'lucide-react';

interface ExtensionsPageProps {
  onBack: () => void;
}

export const ExtensionsPage: React.FC<ExtensionsPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Redirectinator Advanced
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Browser extension for advanced redirect detection including Meta Refresh and JavaScript redirects.
          </p>
        </div>

        {/* Pre-release Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-16">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">
                Pre-Release Version
              </h3>
              <p className="text-sm text-yellow-700">
                This extension is currently in testing and not yet available in official stores. 
                Manual installation is required until official launch.
              </p>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Download Extensions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Chrome Extension */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <img
                  src="/logo-chrome.png"
                  alt="Chrome"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chrome / Edge
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                For Chrome, Edge, and other Chromium-based browsers
              </p>
              <a
                href="/extensions/dist/redirectinator-advanced-chrome.zip"
                download
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Chrome Extension
              </a>
            </div>

            {/* Firefox Extension */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <div className="w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <img
                  src="/logo-firefox.png"
                  alt="Firefox"
                  className="w-16 h-16 object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Firefox
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                For Firefox and other Mozilla-based browsers
              </p>
              <a
                href="/extensions/dist/redirectinator-advanced-firefox.zip"
                download
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Firefox Extension
              </a>
            </div>
          </div>
        </div>

        {/* Installation Instructions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Installation Instructions
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <ol className="space-y-4">
              <li className="flex items-start space-x-3">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Download the extension</h3>
                  <p className="text-gray-600 text-sm">Download the extension for your browser above</p>
                </div>
              </li>
              
              <li className="flex items-start space-x-3">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Extract the ZIP file</h3>
                  <p className="text-gray-600 text-sm">Extract the ZIP file to a folder on your computer</p>
                </div>
              </li>
              
              <li className="flex items-start space-x-3">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Load the extension</h3>
                  <p className="text-gray-600 text-sm">
                    Load the extension in your browser. For detailed steps, see the{' '}
                    <a
                      href="/extensions/dist/INSTALLATION.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      full installation guide
                    </a>
                  </p>
                </div>
              </li>
              
              <li className="flex items-start space-x-3">
                <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Test the extension</h3>
                  <p className="text-gray-600 text-sm">
                    Test by going to{' '}
                    <a
                      href="https://redirectinator.us"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      redirectinator.us
                    </a>{' '}
                    and enabling Advanced Mode
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>

        {/* Advanced Features */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Advanced Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Meta Refresh Detection</h3>
              <p className="text-sm text-gray-600">Finds HTML meta refresh redirects automatically</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">JavaScript Redirects</h3>
              <p className="text-sm text-gray-600">Catches JavaScript-based redirects in real-time</p>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Local Processing</h3>
              <p className="text-sm text-gray-600">All analysis happens in your browser</p>
            </div>
            
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Code className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No Server Costs</h3>
              <p className="text-sm text-gray-600">Completely client-side operation</p>
            </div>
          </div>
        </div>

        {/* Extension Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-500 mt-0.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-2">
                Extension Status
              </h4>
              <p className="text-sm text-blue-700">
                <strong>Version:</strong> 1.0.0-local (Pre-release testing version)<br/>
                <strong>Status:</strong> Manual installation required<br/>
                <strong>Support:</strong> For support and updates, visit{' '}
                <a
                  href="https://redirectinator.us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline hover:text-blue-800"
                >
                  redirectinator.us
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
