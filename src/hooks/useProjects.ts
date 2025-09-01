import { useState, useEffect, useCallback } from 'react';
import { Project, AppSettings } from '@/types';
import { storageService } from '@/services/storage';

export const useProjects = (settings: AppSettings) => {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const loadProject = useCallback(async (projectId: string) => {
    try {
      const project = await storageService.getProject(projectId);
      if (project) {
        setCurrentProject(project);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  }, []);

  const createDefaultProject = useCallback(async (): Promise<Project> => {
    const defaultProject: Project = {
      id: crypto.randomUUID(),
      name: 'My First Project',
      description: 'Default project for URL redirect analysis',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      urls: [],
      settings: {
        batchSize: settings.defaultBatchSize,
        delayBetweenRequests: settings.defaultDelay,
        timeout: settings.defaultTimeout,
        followRedirects: false,
        maxRedirects: 10,
        includeHeaders: false,
      },
      results: [],
    };

    try {
      await storageService.saveProject(defaultProject);
      return defaultProject;
    } catch (error) {
      console.error('Failed to create default project:', error);
      throw error;
    }
  }, [settings]);

  const loadInitialData = useCallback(async () => {
    try {
      // Load projects
      const savedProjects = await storageService.getAllProjects();
      setProjects(savedProjects);

      // Load most recent project if any exist
      if (savedProjects.length > 0) {
        const mostRecent = savedProjects.sort((a, b) => b.updatedAt - a.updatedAt)[0];
        // Load project directly without using the loadProject function to avoid circular dependency
        const project = await storageService.getProject(mostRecent.id);
        if (project) {
          setCurrentProject(project);
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
      // Could add error state here if needed
    }
  }, []);

  const saveCurrentProject = useCallback(async (results: Array<{ id: string; [key: string]: unknown }>) => {
    if (currentProject) {
      try {
        const updatedProject = {
          ...currentProject,
          updatedAt: Date.now(),
          results: results,
        };
        await storageService.saveProject(updatedProject);
        await storageService.saveResults(results, currentProject.id);
        setCurrentProject(updatedProject);
      } catch (error) {
        console.error('Failed to save project:', error);
      }
    }
  }, [currentProject]);

  const createNewProject = useCallback(async (name: string, description?: string): Promise<Project> => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      urls: [],
      settings: {
        batchSize: settings.defaultBatchSize,
        delayBetweenRequests: settings.defaultDelay,
        timeout: settings.defaultTimeout,
        followRedirects: false,
        maxRedirects: 10,
        includeHeaders: false,
      },
      results: [],
    };

    try {
      await storageService.saveProject(newProject);
      setProjects(prev => [...prev, newProject]);
      setCurrentProject(newProject);
      return newProject;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }, [settings]);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await storageService.deleteProject(projectId);
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);

      if (currentProject?.id === projectId) {
        // If we deleted the current project and no projects remain, set current to null
        if (updatedProjects.length === 0) {
          setCurrentProject(null);
        } else {
          // Load the first available project as current
          setCurrentProject(updatedProjects[0]);
        }
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }, [currentProject, projects]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    try {
      const projectToUpdate = projects.find(p => p.id === projectId);
      if (!projectToUpdate) {
        throw new Error('Project not found');
      }

      const updatedProject = {
        ...projectToUpdate,
        ...updates,
        updatedAt: Date.now(),
      };

      await storageService.saveProject(updatedProject);
      
      setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      
      if (currentProject?.id === projectId) {
        setCurrentProject(updatedProject);
      }
      
      return updatedProject;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }, [projects, currentProject]);

  return {
    currentProject,
    projects,
    loadProject,
    saveCurrentProject,
    createNewProject,
    deleteProject,
    updateProject,
    setCurrentProject,
  };
};
