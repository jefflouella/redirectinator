import { useCallback, useEffect } from 'react';
import { analytics } from '@/services/analytics';

export const useAnalytics = () => {
  // Track page views on route changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      analytics.trackPageView(currentPath);
    }
  }, []);

  const trackFeatureUsage = useCallback(
    (feature: string, details?: Record<string, unknown>) => {
      analytics.trackFeatureUsage(feature, details);
    },
    []
  );

  const trackUrlProcessing = useCallback((urlCount: number, method: string) => {
    analytics.trackUrlProcessing(urlCount, method);
  }, []);

  const trackUrlDiscovery = useCallback((source: string, urlCount: number) => {
    analytics.trackUrlDiscovery(source, urlCount);
  }, []);

  const trackProjectCreation = useCallback(() => {
    analytics.trackProjectCreation();
  }, []);

  const trackExport = useCallback((format: string, resultCount: number) => {
    analytics.trackExport(format, resultCount);
  }, []);

  const trackError = useCallback((errorType: string, context?: string) => {
    analytics.trackError(errorType, context);
  }, []);

  const trackPerformance = useCallback((metric: string, value: number) => {
    analytics.trackPerformance(metric, value);
  }, []);

  const trackCopyAction = useCallback(
    (contentType: string, context?: string) => {
      analytics.trackCopyAction(contentType, context);
    },
    []
  );

  const trackSearch = useCallback(
    (query: string, context: string, resultCount?: number) => {
      analytics.trackSearch(query, context, resultCount);
    },
    []
  );

  const trackFilter = useCallback(
    (filterType: string, filterValue: string, resultCount?: number) => {
      analytics.trackFilter(filterType, filterValue, resultCount);
    },
    []
  );

  const trackBulkAction = useCallback(
    (action: string, itemCount: number, context?: string) => {
      analytics.trackBulkAction(action, itemCount, context);
    },
    []
  );

  const trackCleanup = useCallback(
    (action: string, itemsAffected: number, context?: string) => {
      analytics.trackCleanup(action, itemsAffected, context);
    },
    []
  );

  const trackUIInteraction = useCallback(
    (interaction: string, element: string, context?: string) => {
      analytics.trackUIInteraction(interaction, element, context);
    },
    []
  );

  // New redirect testing analytics methods
  const trackRedirectTest = useCallback(
    (
      testType: 'single' | 'batch' | 'bulk',
      urlCount: number,
      mode: 'default' | 'advanced',
      source: 'manual' | 'upload' | 'wayback' | 'semrush'
    ) => {
      analytics.trackRedirectTest(testType, urlCount, mode, source);
    },
    []
  );

  const trackRedirectTestComplete = useCallback(
    (
      testType: 'single' | 'batch' | 'bulk',
      urlCount: number,
      results: {
        successful: number;
        errors: number;
        redirects: number;
        loops: number;
        direct: number;
      },
      processingTime: number,
      mode: 'default' | 'advanced'
    ) => {
      analytics.trackRedirectTestComplete(testType, urlCount, results, processingTime, mode);
    },
    []
  );

  const trackRedirectResult = useCallback(
    (
      result: 'direct' | 'redirect' | 'error' | 'loop',
      redirectCount: number,
      hasDomainChange: boolean,
      hasHttpsUpgrade: boolean,
      responseTime: number,
      mode: 'default' | 'advanced'
    ) => {
      analytics.trackRedirectResult(result, redirectCount, hasDomainChange, hasHttpsUpgrade, responseTime, mode);
    },
    []
  );

  const trackRedirectBatch = useCallback(
    (
      batchNumber: number,
      batchSize: number,
      totalBatches: number,
      mode: 'default' | 'advanced'
    ) => {
      analytics.trackRedirectBatch(batchNumber, batchSize, totalBatches, mode);
    },
    []
  );

  const trackRedirectError = useCallback(
    (
      errorType: string,
      context: string,
      mode: 'default' | 'advanced',
      urlCount?: number
    ) => {
      analytics.trackRedirectError(errorType, context, mode, urlCount);
    },
    []
  );

  const trackDetailedUIInteraction = useCallback(
    (
      element: string,
      action: string,
      context?: string,
      metadata?: Record<string, any>
    ) => {
      analytics.trackDetailedUIInteraction(element, action, context, metadata);
    },
    []
  );

  const trackModeSwitch = useCallback(
    (
      fromMode: 'default' | 'advanced',
      toMode: 'default' | 'advanced',
      context?: string
    ) => {
      analytics.trackModeSwitch(fromMode, toMode, context);
    },
    []
  );

  const trackProjectStats = useCallback(
    (
      projectId: string,
      urlCount: number,
      resultCount: number,
      hasResults: boolean
    ) => {
      analytics.trackProjectStats(projectId, urlCount, resultCount, hasResults);
    },
    []
  );

  return {
    trackFeatureUsage,
    trackUrlProcessing,
    trackUrlDiscovery,
    trackProjectCreation,
    trackExport,
    trackError,
    trackPerformance,
    trackCopyAction,
    trackSearch,
    trackFilter,
    trackBulkAction,
    trackCleanup,
    trackUIInteraction,
    // New redirect testing analytics
    trackRedirectTest,
    trackRedirectTestComplete,
    trackRedirectResult,
    trackRedirectBatch,
    trackRedirectError,
    trackDetailedUIInteraction,
    trackModeSwitch,
    trackProjectStats,
    isEnabled: analytics.isAnalyticsEnabled(),
    setEnabled: analytics.setEnabled.bind(analytics),
  };
};
