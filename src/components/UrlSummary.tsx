import React from 'react';
import { Project } from '@/types';
import {
  Plus,
  Trash2,
  Play,
  CheckCircle,
  Edit,
  ArrowRight
} from 'lucide-react';
import { useUrlPersistence } from '@/hooks/useUrlPersistence';

interface UrlSummaryProps {
  currentProject: Project | null;
  onProcessUrls: (urls: Array<{ startingUrl: string; targetRedirect: string }>) => void;
  isProcessing: boolean;
  onEditUrls: () => void;
  onNavigateToProjects?: () => void;
}

export const UrlSummary: React.FC<UrlSummaryProps> = ({
  currentProject,
  onProcessUrls,
  isProcessing,
  onEditUrls,
  onNavigateToProjects
}) => {
  const { urls, isLoading: urlsLoading, clearUrls, refreshUrls } = useUrlPersistence(currentProject);

  // Refresh URLs when component mounts or when current project changes
  React.useEffect(() => {
    if (currentProject) {
      refreshUrls();
    }
  }, [currentProject, refreshUrls]);

  const validateUrls = () => {
    const errors: string[] = [];
    
    urls.forEach((url, index) => {
      try {
        new URL(url.startingUrl);
      } catch {
        errors.push(`Row ${index + 1}: Invalid starting URL - ${url.startingUrl}`);
      }
      
      // Only validate target URL if it's provided
      if (url.targetRedirect.trim()) {
        try {
          new URL(url.targetRedirect);
        } catch {
          errors.push(`Row ${index + 1}: Invalid target URL - ${url.targetRedirect}`);
        }
      }
    });
    
    return errors;
  };

  const handleProcess = () => {
    if (!currentProject) {
      alert('Please select or create a project before processing URLs.');
      return;
    }

    if (urls.length === 0) {
      alert('Please add at least one URL to process.');
      return;
    }

    const errors = validateUrls();
    if (errors.length > 0) {
      alert('Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }

    onProcessUrls(urls);
  };

  // Show empty state when no URLs
  if (!urlsLoading && urls.length === 0) {
    // If no current project, show create project message
    if (!currentProject) {
      return (
        <div className="card">
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Start!</h3>
            <p className="text-gray-600 mb-4">
              First, let's create a project.
            </p>
            <button
              onClick={onNavigateToProjects}
              className="btn-primary flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>
        </div>
      );
    }

    // If there's a current project but no URLs, show add URLs message
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Start!</h3>
          <p className="text-gray-600 mb-4">
            Add URLs to begin analyzing redirects for your project
          </p>
          <button
            onClick={onEditUrls}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add URLs</span>
          </button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (urlsLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading URLs from project...</span>
        </div>
      </div>
    );
  }

  // Show URL summary
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              URLs Ready ({urls.length})
            </h3>
            <p className="text-sm text-gray-600">
              {currentProject ? `Project: ${currentProject.name}` : 'No project selected'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEditUrls}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit URLs</span>
          </button>
          <button
            onClick={clearUrls}
            className="btn-secondary flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* URL Preview */}
      <div className="space-y-2 max-h-32 overflow-y-auto mb-4">
        {urls.slice(0, 3).map((url, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {url.startingUrl}
                  </div>
                  <div className="text-xs text-gray-500 truncate flex items-center">
                    <ArrowRight className="w-3 h-3 mr-1" />
                    {url.targetRedirect}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        {urls.length > 3 && (
          <div className="text-center py-2">
            <span className="text-sm text-gray-500">
              +{urls.length - 3} more URL{urls.length - 3 !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Process Button */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {!currentProject
            ? 'Please select or create a project first'
            : `${urls.length} URL${urls.length !== 1 ? 's' : ''} ready to process`
          }
        </div>
        <button
          onClick={handleProcess}
          disabled={isProcessing || urls.length === 0 || !currentProject}
          className="btn-primary flex items-center space-x-2"
        >
          <Play className="w-4 h-4" />
          <span>
            {isProcessing
              ? 'Processing...'
              : !currentProject
              ? 'Select Project First'
              : 'Process URLs'
            }
          </span>
        </button>
      </div>
    </div>
  );
};
