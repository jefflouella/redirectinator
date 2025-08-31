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

  const loadInitialData = useCallback(async () => {
    try {
      // Load projects
      const savedProjects = await storageService.getAllProjects();
      setProjects(savedProjects);

      // Load most recent project
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
      setProjects(prev => prev.filter(p => p.id !== projectId));

      if (currentProject?.id === projectId) {
        setCurrentProject(null);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  }, [currentProject]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    currentProject,
    projects,
    loadProject,
    saveCurrentProject,
    createNewProject,
    deleteProject,
  };
};
