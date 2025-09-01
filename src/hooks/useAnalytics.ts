import { useCallback, useEffect } from 'react';
import { analytics } from '@/services/analytics';

export const useAnalytics = () => {
  // Track page views on route changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    analytics.trackPageView(currentPath);
  }, []);

  const trackFeatureUsage = useCallback((feature: string, details?: Record<string, unknown>) => {
    analytics.trackFeatureUsage(feature, details);
  }, []);

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

  const trackCopyAction = useCallback((contentType: string, context?: string) => {
    analytics.trackCopyAction(contentType, context);
  }, []);

  const trackSearch = useCallback((query: string, context: string, resultCount?: number) => {
    analytics.trackSearch(query, context, resultCount);
  }, []);

  const trackFilter = useCallback((filterType: string, filterValue: string, resultCount?: number) => {
    analytics.trackFilter(filterType, filterValue, resultCount);
  }, []);

  const trackBulkAction = useCallback((action: string, itemCount: number, context?: string) => {
    analytics.trackBulkAction(action, itemCount, context);
  }, []);

  const trackCleanup = useCallback((action: string, itemsAffected: number, context?: string) => {
    analytics.trackCleanup(action, itemsAffected, context);
  }, []);

  const trackUIInteraction = useCallback((interaction: string, element: string, context?: string) => {
    analytics.trackUIInteraction(interaction, element, context);
  }, []);

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
    isEnabled: analytics.isAnalyticsEnabled(),
    setEnabled: analytics.setEnabled.bind(analytics)
  };
};
