import React, { useState } from 'react';
import { Project } from '@/types';
import {
  Plus,
  FolderOpen,
  Trash2,
  Calendar,
  FileText,
  Clock,
  MoreVertical,
  Download,
  Upload,
  BarChart3
} from 'lucide-react';
import { storageService } from '@/services/storage';

interface ProjectManagerProps {
  projects: Project[];
  currentProject: Project | null;
  onCreateProject: (name: string, description?: string) => Promise<Project>;
  onLoadProject: (projectId: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onGoToDashboard: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  currentProject,
  onCreateProject,
  onLoadProject,
  onDeleteProject,
  onGoToDashboard
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreateProject(newProjectName.trim(), newProjectDescription.trim());
      setShowCreateModal(false);
      setNewProjectName('');
      setNewProjectDescription('');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportProject = async (project: Project) => {
    try {
      const data = await storageService.exportProjectData(project.id);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export project:', error);
    }
  };

  const importProject = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await storageService.importProjectData(text);
      // Refresh the page to show the imported project
      window.location.reload();
    } catch (error) {
      console.error('Failed to import project:', error);
      alert('Failed to import project. Please check the file format.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-tech-900">Project Manager</h2>
        
        <div className="flex items-center space-x-2">
          <input
            type="file"
            accept=".json"
            onChange={importProject}
            className="hidden"
            id="import-project"
          />
          <label
            htmlFor="import-project"
            className="btn-secondary flex items-center space-x-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </label>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className={`card cursor-pointer transition-all duration-200 hover:shadow-tech-lg ${
              currentProject?.id === project.id
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onLoadProject(project.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-primary-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-tech-900 truncate">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-tech-600 truncate">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <button className="p-1 text-tech-400 hover:text-tech-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2 text-tech-600">
                  <FileText className="w-4 h-4" />
                  <span>{project.results.length} results</span>
                </div>
                <div className="flex items-center space-x-2 text-tech-600">
                  <Clock className="w-4 h-4" />
                  <span>{project.urls.length} URLs</span>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-1 text-xs text-tech-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-3 h-3" />
                  <span>Created: {formatDate(project.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3" />
                  <span>Updated: {formatDate(project.updatedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 pt-2 border-t border-tech-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoadProject(project.id);
                    onGoToDashboard();
                  }}
                  className="flex-1 btn-primary flex items-center justify-center space-x-1 py-1 text-xs"
                >
                  <BarChart3 className="w-3 h-3" />
                  <span>Go To Dashboard</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportProject(project);
                  }}
                  className="btn-secondary flex items-center justify-center space-x-1 py-1 text-xs"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteProject(project.id);
                  }}
                  className="p-1 text-tech-400 hover:text-error-600 transition-colors"
                  title="Delete project"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-tech-400 mb-4">
            <FolderOpen className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-tech-900 mb-2">No projects yet</h3>
          <p className="text-tech-600 mb-6">
            Create your first project to start analyzing URL redirects
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Project</span>
          </button>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-tech-900 mb-4">
              Create New Project
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tech-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Redirect Analysis"
                  className="input-field"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-tech-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Brief description of this project..."
                  rows={3}
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary"
                disabled={isCreating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim() || isCreating}
                className="btn-primary"
              >
                {isCreating ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
