import React from 'react';
import { ExternalLink, ArrowLeft, Code, Zap, Shield, Users, Award, Github, Linkedin, Globe } from 'lucide-react';

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
        </div>

        {/* Creator Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet the Creator</h2>
            <p className="text-lg text-gray-600">
              Built by Jeff Louella, a seasoned technical SEO expert with over 25 years of experience
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Jeff Louella</h3>
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

              <div className="flex space-x-4">
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

            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Experience</h4>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Botify</p>
                    <p className="text-sm text-gray-600">Search Engine Optimization Consultant</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">NY Times / Wirecutter</p>
                    <p className="text-sm text-gray-600">Senior Technical SEO & Product Manager</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Search Discovery</p>
                    <p className="text-sm text-gray-600">Senior Technical SEO & Platform Engineer</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

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
