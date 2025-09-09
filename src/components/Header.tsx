import React from 'react';
import { Project } from '@/types';
import { Zap, FolderOpen, Settings, ExternalLink, Github } from 'lucide-react';

interface HeaderProps {
  currentProject: Project | null;
  activeTab:
    | 'dashboard'
    | 'projects'
    | 'settings'
    | 'about'
    | 'privacy'
    | 'terms';
  onTabChange: (
    tab: 'dashboard' | 'projects' | 'settings' | 'about' | 'privacy' | 'terms'
  ) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="bg-gradient-to-r from-slate-50 to-blue-50 border-b-2 border-blue-200 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              {/* Redirectinator Logo with text */}
              <img
                src="/logo.svg"
                alt="Redirectinator"
                className="h-[56px] w-auto object-contain"
              />
              <p
                className="text-gray-600 font-medium mt-0 text-right"
                style={{ fontSize: '0.83rem' }}
              >
                Find your way through every redirect
              </p>
            </div>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center space-x-4">
            {/* Current Project Info */}
            {currentProject && (
              <div className="hidden md:flex items-center space-x-2">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg shadow-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-blue-900">
                      {currentProject.name}
                    </span>
                    <div className="flex items-center space-x-2 text-xs text-blue-600">
                      <span>{currentProject.urls?.length || 0} URLs</span>
                      {currentProject.results.length > 0 && (
                        <>
                          <span>•</span>
                          <span>{currentProject.results.length} results</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <nav className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onTabChange('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => onTabChange('projects')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'projects'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Projects</span>
              </button>

              <button
                onClick={() => onTabChange('settings')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </nav>

            {/* External Links */}
            <div className="flex items-center space-x-2">
              <a
                href="https://github.com/jefflouella"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="View on GitHub"
              >
                <Github className="w-5 h-5" />
              </a>

              <a
                href="https://www.jefflouella.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Visit Jeff Louella"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
