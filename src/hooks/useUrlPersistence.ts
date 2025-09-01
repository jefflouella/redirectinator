import { useState, useEffect, useCallback } from 'react';
import { Project } from '@/types';
import { storageService } from '@/services/storage';

interface UrlData {
  startingUrl: string;
  targetRedirect: string;
}

interface DuplicateInfo {
  hasDuplicates: boolean;
  duplicateCount: number;
  uniqueCount: number;
  totalCount: number;
}

interface UseUrlPersistenceProps {
  currentProject: Project | null;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export const useUrlPersistence = ({ currentProject, onProjectUpdate }: UseUrlPersistenceProps) => {
  const [urls, setUrls] = useState<UrlData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load URLs from current project
  useEffect(() => {
    if (currentProject) {
      setIsLoading(true);
      try {
        // Convert project URLs to component format
        const projectUrls: UrlData[] = currentProject.urls.map(urlEntry => ({
          startingUrl: urlEntry.startingUrl,
          targetRedirect: urlEntry.targetRedirect,
        }));
        setUrls(projectUrls);
      } catch (error) {
        console.error('Failed to load project URLs:', error);
        setUrls([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setUrls([]);
    }
  }, [currentProject, currentProject?.urls?.length, currentProject?.updatedAt]); // Also depend on URLs length and updatedAt to refresh when URLs are added

  // Auto-save URLs to project
  const saveUrlsToProject = useCallback(async (newUrls: UrlData[]) => {
    if (!currentProject) return;

    try {
      const updatedProject = {
        ...currentProject,
        updatedAt: Date.now(),
        urls: newUrls.map((url, index) => ({
          id: `url_${index}_${Date.now()}`,
          startingUrl: url.startingUrl,
          targetRedirect: url.targetRedirect,
        })),
      };

      await storageService.saveProject(updatedProject);
      console.log(`Auto-saved ${newUrls.length} URLs to project: ${currentProject.name}`);
      
      // Notify parent component about the project update
      onProjectUpdate?.(updatedProject);
    } catch (error) {
      console.error('Failed to auto-save URLs:', error);
    }
  }, [currentProject, onProjectUpdate]);

  // Detect duplicates
  const detectDuplicates = useCallback((urlList: UrlData[] = urls): DuplicateInfo => {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    
    urlList.forEach(url => {
      const normalizedUrl = url.startingUrl.toLowerCase().trim();
      if (seen.has(normalizedUrl)) {
        duplicates.add(normalizedUrl);
      } else {
        seen.add(normalizedUrl);
      }
    });

    const uniqueCount = seen.size;
    const duplicateCount = duplicates.size;
    const totalCount = urlList.length;

    return {
      hasDuplicates: duplicateCount > 0,
      duplicateCount,
      uniqueCount,
      totalCount
    };
  }, [urls]);

  // Clean duplicates - keep the first occurrence of each URL
  const cleanDuplicates = useCallback(() => {
    const seen = new Set<string>();
    const cleanedUrls: UrlData[] = [];
    
    urls.forEach(url => {
      const normalizedUrl = url.startingUrl.toLowerCase().trim();
      if (!seen.has(normalizedUrl)) {
        seen.add(normalizedUrl);
        cleanedUrls.push(url);
      }
    });

    if (cleanedUrls.length < urls.length) {
      setUrls(cleanedUrls);
      saveUrlsToProject(cleanedUrls);
      console.log(`Cleaned ${urls.length - cleanedUrls.length} duplicate URLs`);
    }
  }, [urls, saveUrlsToProject]);

  // Add URL with auto-save
  const addUrl = useCallback((url: UrlData) => {
    setUrls(prev => {
      const newUrls = [...prev, url];
      // Auto-save after adding
      saveUrlsToProject(newUrls);
      return newUrls;
    });
  }, [saveUrlsToProject]);

  // Remove URL with auto-save
  const removeUrl = useCallback((index: number) => {
    setUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Auto-save after removing
      saveUrlsToProject(newUrls);
      return newUrls;
    });
  }, [saveUrlsToProject]);

  // Update all URLs with auto-save
  const setAllUrls = useCallback((newUrls: UrlData[]) => {
    setUrls(newUrls);
    saveUrlsToProject(newUrls);
  }, [saveUrlsToProject]);

  // Clear all URLs
  const clearUrls = useCallback(() => {
    setUrls([]);
    saveUrlsToProject([]);
  }, [saveUrlsToProject]);

  // Refresh URLs from project (useful when URLs are added from other components)
  const refreshUrls = useCallback(() => {
    if (currentProject) {
      setIsLoading(true);
      try {
        const projectUrls: UrlData[] = currentProject.urls.map(urlEntry => ({
          startingUrl: urlEntry.startingUrl,
          targetRedirect: urlEntry.targetRedirect,
        }));
        setUrls(projectUrls);
      } catch (error) {
        console.error('Failed to refresh project URLs:', error);
        setUrls([]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [currentProject]);

  return {
    urls,
    isLoading,
    addUrl,
    removeUrl,
    setAllUrls,
    clearUrls,
    refreshUrls,
    detectDuplicates,
    cleanDuplicates,
  };
};
