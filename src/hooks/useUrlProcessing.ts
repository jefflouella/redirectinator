import { useState, useCallback, useEffect, useRef } from 'react';
import { RedirectResult, ProcessingStatus, Project } from '@/types';
import { storageService } from '@/services/storage';
import { RedirectChecker } from '@/services/redirectChecker';
import { useAnalytics } from './useAnalytics';

export const useUrlProcessing = (
  currentProject: Project | null,
  onResultSaved?: (results: RedirectResult[]) => void,
  mode: 'default' | 'advanced' = 'default'
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

  // Analytics tracking
  const {
    trackRedirectTest,
    trackRedirectTestComplete,
    trackRedirectResult,
    trackRedirectBatch,
    trackRedirectError,
    trackPerformance,
  } = useAnalytics();

  const processUrls = useCallback(
    async (urls: Array<{ startingUrl: string; targetRedirect: string }>) => {
      if (!currentProject) {
        console.warn(
          'No project selected - this should not happen due to UI validation'
        );
        return;
      }

      // Reset stopping state
      isStoppingRef.current = false;

      const startTime = Date.now();
      const testType = urls.length === 1 ? 'single' : urls.length <= 10 ? 'batch' : 'bulk';
      const totalBatches = Math.ceil(urls.length / currentProject.settings.batchSize);

      // Track redirect test start
      trackRedirectTest(testType, urls.length, mode, 'manual');

      setProcessingStatus(prev => ({
        ...prev,
        isProcessing: true,
        isStopping: false,
        totalUrls: urls.length,
        processedUrls: 0,
        currentBatch: 0,
        totalBatches,
        errors: [],
        startTime,
      }));

      const checker = new RedirectChecker(currentProject.settings);
      checker.setMode(mode); // Set the detection mode
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
          const batchNumber = Math.floor(i / batchSize) + 1;

          setProcessingStatus(prev => ({
            ...prev,
            currentBatch: batchNumber,
            currentUrl: batch[0]?.startingUrl,
          }));

          const batchResults = await checker.checkBatch(batch);
          newResults.push(...batchResults);

          // Track batch completion
          trackRedirectBatch(batchNumber, batch.length, totalBatches, mode);

          // Track individual redirect results
          batchResults.forEach(result => {
            trackRedirectResult(
              result.result,
              result.numberOfRedirects,
              result.domainChanges,
              result.httpsUpgrade,
              result.responseTime,
              mode
            );
          });

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

        // Calculate results summary for analytics
        const resultsSummary = {
          successful: newResults.filter(r => r.result !== 'error').length,
          errors: newResults.filter(r => r.result === 'error').length,
          redirects: newResults.filter(r => r.result === 'redirect').length,
          loops: newResults.filter(r => r.result === 'loop').length,
          direct: newResults.filter(r => r.result === 'direct').length,
        };

        const processingTime = Date.now() - startTime;

        // Track redirect test completion
        trackRedirectTestComplete(testType, urls.length, resultsSummary, processingTime, mode);

        // Track performance metrics
        trackPerformance('total_processing_time', processingTime);
        trackPerformance('urls_per_second', urls.length / (processingTime / 1000));
        trackPerformance('average_response_time', newResults.reduce((sum, r) => sum + r.responseTime, 0) / newResults.length);

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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Track redirect test error
        trackRedirectError('processing_error', errorMessage, mode, urls.length);

        setProcessingStatus(prev => ({
          ...prev,
          errors: [
            ...prev.errors,
            errorMessage,
          ],
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
    },
    [currentProject, onResultSaved]
  );

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
      if (
        processingStatus.isProcessing &&
        (e.key === 'Escape' || (e.ctrlKey && e.key === 'c'))
      ) {
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
