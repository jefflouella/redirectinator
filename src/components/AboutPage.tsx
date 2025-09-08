import React from 'react';
import {
  ExternalLink,
  ArrowLeft,
  Code,
  Zap,
  Shield,
} from 'lucide-react';

// ProjectCard component for displaying other projects
interface ProjectCardProps {
  url: string;
  title: string;
  description: string;
  logoPath: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  url,
  title,
  description,
  logoPath,
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mr-4 p-2">
          <img
            src={logoPath}
            alt={`${title} logo`}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Chrome Extension</p>
        </div>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors text-sm font-medium"
      >
        Visit {title}
        <ExternalLink className="w-3 h-3 ml-1" />
      </a>
    </div>
  );
};

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
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
            About Redirectinator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A professional-grade URL redirect checker and monitoring tool
            designed specifically for SEO professionals and technical marketers.
          </p>
        </div>

        {/* App Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Zap className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Comprehensive Redirect Detection
              </h3>
            </div>
            <p className="text-gray-600">
              Detect HTTP redirects (301, 302, 307, 308), Meta Refresh
              redirects, and JavaScript redirects with our advanced browser
              extension.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Advanced Analysis
              </h3>
            </div>
            <p className="text-gray-600">
              Track complete redirect chains, detect loops, mixed redirect
              types, domain changes, and affiliate link protection.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Code className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Professional Tools
              </h3>
            </div>
            <p className="text-gray-600">
              Built for SEO professionals with Wayback Machine integration,
              SEMrush import, project management, and detailed export
              capabilities.
            </p>
          </div>
        </div>

        {/* Current Capabilities & Extension Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Current Capabilities & Extension Status
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Default Mode */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Default Mode
                </h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  HTTP redirects (301, 302, 303, 307, 308)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Redirect chains and loops
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Domain changes and HTTPS upgrades
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Affiliate link detection and blocking
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Wayback Machine historical URL discovery
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  SEMrush campaign integration
                </li>
              </ul>
            </div>

            {/* Advanced Mode */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                  <svg
                    className="h-5 w-5 text-purple-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Advanced Mode
                </h3>
              </div>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Meta Refresh redirects (HTML meta tags)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  JavaScript redirects (window.location changes)
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Comprehensive redirect type analysis
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Complete redirect chain visualization
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Mixed redirect type detection
                </li>
              </ul>
            </div>
          </div>

          {/* Extension Status */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
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
                  Browser Extension Required
                </h4>
                <p className="text-sm text-blue-700">
                  Advanced mode is available through our browser extension (Chrome & Firefox). 
                  The extension is currently in pre-release testing and requires manual installation. 
                  <a
                    href="/extensions/dist/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium underline hover:text-blue-800 ml-1"
                  >
                    Download and install the extension
                  </a>
                  to unlock advanced redirect detection capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Integrations */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Professional Integrations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <img
                  src="/wayback-icon.png"
                  alt="Wayback Machine"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Wayback Machine Integration
              </h3>
              <p className="text-gray-600 text-sm">
                Discover historical URLs from the Internet Archive. Perfect for
                recovering lost URLs from site migrations and identifying
                missing redirects.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <img
                  src="/SEMrush-Icon.png"
                  alt="SEMrush"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                SEMrush Integration
              </h3>
              <p className="text-gray-600 text-sm">
                Import URLs directly from your SEMrush campaigns and keyword
                research. Analyze redirect patterns for your most important
                pages.
              </p>
            </div>
          </div>
        </div>

        {/* Other Projects */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Other Projects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProjectCard
              url="https://www.quickclickseo.us/"
              title="Quick Click Website Audit"
              description="Transform your SEO workflow with one-click access to 25+ professional tools. Analyze any website instantly with comprehensive on-page analysis and real-time scoring."
              logoPath="/quick-click-logo.png"
            />
            <ProjectCard
              url="https://www.lazyspy.us/"
              title="Lazy Spy"
              description="Visually analyze image loading strategies on any webpage with color-coded overlays. Detect lazy loading libraries, identify performance issues, and get actionable optimization recommendations."
              logoPath="/lazyspylogo.png"
            />
            <ProjectCard
              url="https://www.gshoplens.com/"
              title="GShop Lens"
              description="Master Google Shopping SERPs with AI-powered insights, pricing analysis, and competitive intelligence. Perfect for e-commerce managers and marketers."
              logoPath="/gshoplens-icon.png"
            />
            <ProjectCard
              url="https://www.titletune.com/"
              title="Title Tune"
              description="Unleash AI-powered title perfection! Craft click-worthy, SEO-optimized page titles using live SERP analysis and multiple AI models (GPT, Claude, Gemini)."
              logoPath="/title-tune-logo.png"
            />
          </div>
        </section>

        {/* Technology Stack */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Built with Modern Technology
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">React</span>
              </div>
              <p className="text-sm text-gray-600">Frontend Framework</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">Vercel</span>
              </div>
              <p className="text-sm text-gray-600">Hosting & Deployment</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold text-lg">
                  TypeScript
                </span>
              </div>
              <p className="text-sm text-gray-600">Type Safety</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold text-lg">
                  Extensions
                </span>
              </div>
              <p className="text-sm text-gray-600">Browser Extensions</p>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Client-side processing with browser extension integration for
              advanced redirect detection
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
