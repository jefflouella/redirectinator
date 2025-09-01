import React from 'react';
import { ExternalLink, ArrowLeft, Code, Zap, Shield, Users, Award, Github, Linkedin, Globe } from 'lucide-react';

// ProjectCard component for displaying other projects
interface ProjectCardProps {
  url: string;
  title: string;
  description: string;
  logoPath: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ url, title, description, logoPath }) => {
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
      <p className="text-gray-600 mb-4">
        {description}
      </p>
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
            A professional-grade URL redirect checker and monitoring tool designed specifically for SEO professionals and technical marketers.
          </p>
        </div>

        {/* App Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Zap className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Bulk Processing</h3>
            </div>
            <p className="text-gray-600">
              Process hundreds of URLs simultaneously with intelligent batching and progress tracking.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Advanced Detection</h3>
            </div>
            <p className="text-gray-600">
              Detect redirect chains, loops, mixed redirect types, and domain changes with precision.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Code className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Technical SEO</h3>
            </div>
            <p className="text-gray-600">
              Built by SEO professionals for SEO professionals with deep technical insights.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-orange-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Team Collaboration</h3>
            </div>
            <p className="text-gray-600">
              Share projects, export results, and collaborate with your team seamlessly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Award className="w-8 h-8 text-yellow-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Professional Grade</h3>
            </div>
            <p className="text-gray-600">
              Enterprise-level features with client-side processing for unlimited scalability.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Globe className="w-8 h-8 text-indigo-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Wayback Integration</h3>
            </div>
            <p className="text-gray-600">
              Discover historical URLs and analyze redirect patterns over time.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <ExternalLink className="w-8 h-8 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">SEMrush Integration</h3>
            </div>
            <p className="text-gray-600">
              Discover URLs using SEMrush data and analyze competitor redirect patterns.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Code className="w-8 h-8 text-emerald-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">File Uploads</h3>
            </div>
            <p className="text-gray-600">
              Import URLs from CSV and XML files for bulk processing and analysis.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Privacy First</h3>
            </div>
            <p className="text-gray-600">
              Client-side processing with privacy-focused analytics and secure API handling.
            </p>
          </div>
        </div>

        {/* Creator Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Made by Jeff Louella</h2>
            <p className="text-gray-600 mb-4">
              Technical SEO & Digital Problem Solver with a unique blend of developer fluency and strategic insight. 
              Jeff has transformed complex technical challenges into organic traffic growth by aligning website architecture, 
              site performance, and business strategy.
            </p>
            
            <p className="text-gray-600 mb-6">
              With over 25 years of experience in web design, front-end development, and search optimization, 
              Jeff uncovers and resolves technical SEO barriers that limit visibility and growth. His approach 
              integrates analytics, code-level problem-solving, and cross-functional collaboration to engineer 
              scalable, high-impact solutions.
            </p>

            <div className="flex justify-center space-x-4">
              <a
                href="https://www.jefflouella.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Globe className="w-4 h-4 mr-2" />
                Website
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <a
                href="https://github.com/jefflouella"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-600 hover:text-gray-700 transition-colors"
              >
                <Github className="w-4 h-4 mr-2" />
                GitHub
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
              <a
                href="https://linkedin.com/in/jefflouella"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        </div>

        {/* Other Projects */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Other Projects</h2>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Built with Modern Technology</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold text-lg">React</span>
              </div>
              <p className="text-sm text-gray-600">Frontend Framework</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold text-lg">Node.js</span>
              </div>
              <p className="text-sm text-gray-600">Backend Runtime</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold text-lg">TypeScript</span>
              </div>
              <p className="text-sm text-gray-600">Type Safety</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-yellow-600 font-bold text-lg">Tailwind</span>
              </div>
              <p className="text-sm text-gray-600">Styling Framework</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
