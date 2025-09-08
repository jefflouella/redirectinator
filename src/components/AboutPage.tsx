import React from 'react';
import {
  ExternalLink,
  ArrowLeft,
  Code,
  Zap,
  Shield,
  Users,
  Award,
  Github,
  Linkedin,
  Globe,
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
                Bulk Processing
              </h3>
            </div>
            <p className="text-gray-600">
              Process hundreds of URLs simultaneously with intelligent batching
              and progress tracking.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Advanced Detection
              </h3>
            </div>
            <p className="text-gray-600">
              Detect redirect chains, loops, mixed redirect types, and domain
              changes with precision.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Code className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Technical SEO
              </h3>
            </div>
            <p className="text-gray-600">
              Built specifically for SEO professionals with detailed analysis
              and export capabilities.
            </p>
          </div>
        </div>

        {/* Current Limitations & Future Plans */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-16">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-blue-400"
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
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                Current Limitations & Future Plans
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-blue-700 mb-2">
                    What We Detect Now (Default Mode)
                  </h4>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>✅ HTTP redirects (301, 302, 303, 307, 308)</li>
                    <li>✅ Redirect chains and loops</li>
                    <li>✅ Domain changes and HTTPS upgrades</li>
                    <li>✅ Affiliate link detection and blocking</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-blue-700 mb-2">
                    What's Coming Soon (Advanced Mode)
                  </h4>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>🔄 Meta Refresh redirects (HTML meta tags)</li>
                    <li>🟨 JavaScript redirects (window.location changes)</li>
                    <li>📊 Comprehensive redirect type analysis</li>
                    <li>🔗 Complete redirect chain visualization</li>
                  </ul>
                </div>

                <div className="bg-blue-100 rounded p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Note:</strong> Advanced mode requires server hosting
                    that supports browser automation (Puppeteer). We're
                    currently on Vercel which has limitations for this feature.
                    <a
                      href="https://github.com/jefflouella/redirectinator/blob/main/FUTURE-PHASE.md"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline ml-1"
                    >
                      Learn more about our roadmap
                    </a>
                  </p>
                </div>
              </div>
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
                <span className="text-green-600 font-bold text-lg">
                  Node.js
                </span>
              </div>
              <p className="text-sm text-gray-600">Backend Runtime</p>
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
                  Tailwind
                </span>
              </div>
              <p className="text-sm text-gray-600">Styling Framework</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
