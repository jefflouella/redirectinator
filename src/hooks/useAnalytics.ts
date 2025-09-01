import { useCallback, useEffect } from 'react';
import { analytics } from '@/services/analytics';

export const useAnalytics = () => {
  // Track page views on route changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    analytics.trackPageView(currentPath);
  }, []);

  const trackFeatureUsage = useCallback((feature: string, details?: Record<string, any>) => {
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

  return {
    trackFeatureUsage,
    trackUrlProcessing,
    trackUrlDiscovery,
    trackProjectCreation,
    trackExport,
    trackError,
    trackPerformance,
    isEnabled: analytics.isAnalyticsEnabled(),
    setEnabled: analytics.setEnabled.bind(analytics)
  };
};
