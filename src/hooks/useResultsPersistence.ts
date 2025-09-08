import { useState, useEffect, useCallback } from 'react';
import { RedirectResult } from '@/types';
import { storageService } from '@/services/storage';

interface UseResultsPersistenceProps {
  projectId: string | null;
}

export const useResultsPersistence = ({
  projectId,
}: UseResultsPersistenceProps) => {
  const [results, setResults] = useState<RedirectResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processedUrls, setProcessedUrls] = useState<Set<string>>(new Set());

  // Load results from IndexedDB
  const loadResults = useCallback(async () => {
    if (!projectId) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Use the existing storage service to load results
      const projectResults = await storageService.getProjectResults(projectId);
      setResults(projectResults || []);

      // Track which URLs have been processed
      const processed = new Set(
        projectResults.map(result => result.startingUrl)
      );
      setProcessedUrls(processed);
    } catch (error) {
      console.error('Error loading results:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Save results to IndexedDB
  const saveResults = useCallback(
    async (newResults: RedirectResult[]) => {
      if (!projectId) return;

      try {
        // Use the existing storage service to save results
        await storageService.saveResults(newResults, projectId);
        setResults(newResults);

        // Update processed URLs tracking
        const processed = new Set(newResults.map(result => result.startingUrl));
        setProcessedUrls(processed);
      } catch (error) {
        console.error('Error saving results:', error);
      }
    },
    [projectId]
  );

  // Add single result
  const addResult = useCallback(
    async (result: RedirectResult) => {
      if (!projectId) return;

      try {
        // Add to existing results and save
        const newResults = [...results, result];
        await storageService.saveResults(newResults, projectId);
        setResults(newResults);

        // Update processed URLs tracking
        setProcessedUrls(prev => new Set([...prev, result.startingUrl]));
      } catch (error) {
        console.error('Error adding result:', error);
      }
    },
    [projectId, results]
  );

  // Update existing result
  const updateResult = useCallback(
    async (index: number, updatedResult: RedirectResult) => {
      if (!projectId) return;

      try {
        const newResults = results.map((result, i) =>
          i === index ? updatedResult : result
        );
        await storageService.saveResults(newResults, projectId);
        setResults(newResults);
      } catch (error) {
        console.error('Error updating result:', error);
      }
    },
    [projectId, results]
  );

  // Clear all results for current project
  const clearResults = useCallback(async () => {
    if (!projectId) return;

    try {
      await storageService.saveResults([], projectId);
      setResults([]);
      setProcessedUrls(new Set());
    } catch (error) {
      console.error('Error clearing results:', error);
    }
  }, [projectId]);

  // Load results when project changes
  useEffect(() => {
    loadResults();
  }, [loadResults]);

  // Get unprocessed URLs from a list of URLs
  const getUnprocessedUrls = useCallback(
    (urls: Array<{ startingUrl: string; targetRedirect: string }>) => {
      return urls.filter(url => !processedUrls.has(url.startingUrl));
    },
    [processedUrls]
  );

  // Get progress statistics
  const getProgressStats = useCallback(
    (totalUrls: number) => {
      const processed = processedUrls.size;
      const remaining = totalUrls - processed;
      const percentage =
        totalUrls > 0 ? Math.round((processed / totalUrls) * 100) : 0;

      return {
        processed,
        remaining,
        percentage,
        isComplete: processed >= totalUrls,
      };
    },
    [processedUrls]
  );

  // Mark URL as processed (for progress tracking)
  const markUrlProcessed = useCallback((startingUrl: string) => {
    setProcessedUrls(prev => new Set([...prev, startingUrl]));
  }, []);

  return {
    results,
    isLoading,
    processedUrls,
    saveResults,
    addResult,
    updateResult,
    clearResults,
    loadResults,
    getUnprocessedUrls,
    getProgressStats,
    markUrlProcessed,
  };
};
