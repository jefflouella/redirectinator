import { useState, useCallback, useEffect, useRef } from 'react';
import { RedirectResult, ProcessingStatus, Project } from '@/types';
import { storageService } from '@/services/storage';
import { RedirectChecker } from '@/services/redirectChecker';

export const useUrlProcessing = (
  currentProject: Project | null,
  onResultSaved?: (results: RedirectResult[]) => void
) => {
  const [results, setResults] = useState<RedirectResult[]>([]);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    isProcessing: false,
    isStopping: false,
    currentBatch: 0,
    totalBatches: 0,
    processedUrls: 0,
    totalUrls: 0,
    errors: [],
  });

  // Use ref to track stopping state so the async loop can see updates
  const isStoppingRef = useRef(false);

  const processUrls = useCallback(async (urls: Array<{ startingUrl: string; targetRedirect: string }>) => {
    if (!currentProject) {
      console.warn('No project selected - this should not happen due to UI validation');
      return;
    }

    // Reset stopping state
    isStoppingRef.current = false;

    setProcessingStatus(prev => ({
      ...prev,
      isProcessing: true,
      isStopping: false,
      totalUrls: urls.length,
      processedUrls: 0,
      currentBatch: 0,
      totalBatches: Math.ceil(urls.length / currentProject.settings.batchSize),
      errors: [],
      startTime: Date.now(),
    }));

    const checker = new RedirectChecker(currentProject.settings);
    const batchSize = currentProject.settings.batchSize;
    const newResults: RedirectResult[] = [];

    try {
      for (let i = 0; i < urls.length; i += batchSize) {
        // Check if processing should be stopped using the ref
        if (isStoppingRef.current) {
          console.log('Processing stopped by user request');
          break;
        }

        const batch = urls.slice(i, i + batchSize);

        setProcessingStatus(prev => ({
          ...prev,
          currentBatch: Math.floor(i / batchSize) + 1,
          currentUrl: batch[0]?.startingUrl,
        }));

        const batchResults = await checker.checkBatch(batch);
        newResults.push(...batchResults);

        setProcessingStatus(prev => ({
          ...prev,
          processedUrls: newResults.length,
        }));

        // Update results in real-time
        setResults([...newResults]);

        // Add delay between batches
        if (i + batchSize < urls.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Save final results
      await storageService.saveResults(newResults, currentProject.id);
      setResults(newResults);
      
      // Notify parent component about saved results
      onResultSaved?.(newResults);

      // Update project
      const updatedProject = {
        ...currentProject,
        updatedAt: Date.now(),
        urls: urls.map((url, _index) => ({
          id: crypto.randomUUID(),
          startingUrl: url.startingUrl,
          targetRedirect: url.targetRedirect,
        })),
      };
      await storageService.saveProject(updatedProject);

    } catch (error) {
      setProcessingStatus(prev => ({
        ...prev,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error'],
      }));
    } finally {
      // Reset the stopping ref
      isStoppingRef.current = false;
      setProcessingStatus(prev => ({
        ...prev,
        isProcessing: false,
        isStopping: false,
        currentUrl: undefined,
      }));
    }
  }, [currentProject]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const stopProcessing = useCallback(() => {
    // Update both the ref and the state
    isStoppingRef.current = true;
    setProcessingStatus(prev => ({
      ...prev,
      isStopping: true,
    }));
  }, []);

  // Add keyboard shortcut for stopping (Ctrl+C or Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (processingStatus.isProcessing && (e.key === 'Escape' || (e.ctrlKey && e.key === 'c'))) {
        e.preventDefault();
        stopProcessing();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [processingStatus.isProcessing, stopProcessing]);

  return {
    results,
    processingStatus,
    processUrls,
    stopProcessing,
    clearResults,
  };
};
