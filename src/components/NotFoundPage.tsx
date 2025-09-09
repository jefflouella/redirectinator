import React, { useEffect } from 'react';
import { ArrowLeft, Home, Search } from 'lucide-react';

interface NotFoundPageProps {
  onBack: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onBack }) => {
  // Set document title to indicate 404 status
  useEffect(() => {
    document.title = '404 - Page Not Found | Redirectinator';
  }, []);
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

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* 404 Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
              <Search className="w-12 h-12 text-red-600" />
            </div>
          </div>

          {/* 404 Message */}
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or you might have entered the wrong URL.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onBack}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Go to Dashboard
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Popular Pages
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/"
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="text-blue-600 font-medium">Dashboard</div>
                <div className="text-sm text-gray-600">Main redirect checker</div>
              </a>
              
              <a
                href="/projects"
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="text-blue-600 font-medium">Projects</div>
                <div className="text-sm text-gray-600">Manage your projects</div>
              </a>
              
              <a
                href="/extensions"
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="text-blue-600 font-medium">Extensions</div>
                <div className="text-sm text-gray-600">Download browser extension</div>
              </a>
              
              <a
                href="/about"
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="text-blue-600 font-medium">About</div>
                <div className="text-sm text-gray-600">Learn more about Redirectinator</div>
              </a>
            </div>
          </div>

          {/* Current URL Display */}
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Requested URL:</strong> <code className="bg-gray-200 px-2 py-1 rounded text-xs">{window.location.pathname}</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
