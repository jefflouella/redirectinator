// Google Analytics service for privacy-focused tracking
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, any>;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private isEnabled: boolean = true;

  private constructor() {
    // Check if gtag is available
    this.isEnabled = typeof window !== 'undefined' && typeof window.gtag === 'function';
  }

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Track a custom event
   */
  public trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled) return;

    try {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  /**
   * Track page views
   */
  public trackPageView(page: string): void {
    if (!this.isEnabled) return;

    try {
      window.gtag('config', 'G-WL1D9YFCH9', {
        page_path: page,
        page_title: `Redirectinator - ${page}`
      });
    } catch (error) {
      console.warn('Analytics page view tracking failed:', error);
    }
  }

  /**
   * Track feature usage
   */
  public trackFeatureUsage(feature: string, details?: Record<string, any>): void {
    this.trackEvent({
      action: 'feature_used',
      category: 'engagement',
      label: feature,
      custom_parameters: {
        feature_used: feature,
        ...details
      }
    });
  }

  /**
   * Track URL processing
   */
  public trackUrlProcessing(urlCount: number, method: string): void {
    this.trackEvent({
      action: 'url_processing',
      category: 'engagement',
      label: method,
      value: urlCount,
      custom_parameters: {
        feature_used: 'url_processing',
        url_count: urlCount,
        processing_method: method
      }
    });
  }

  /**
   * Track URL discovery
   */
  public trackUrlDiscovery(source: string, urlCount: number): void {
    this.trackEvent({
      action: 'url_discovery',
      category: 'engagement',
      label: source,
      value: urlCount,
      custom_parameters: {
        feature_used: 'url_discovery',
        discovery_source: source,
        url_count: urlCount
      }
    });
  }

  /**
   * Track project creation
   */
  public trackProjectCreation(): void {
    this.trackEvent({
      action: 'project_created',
      category: 'engagement',
      custom_parameters: {
        feature_used: 'project_management'
      }
    });
  }

  /**
   * Track export usage
   */
  public trackExport(format: string, resultCount: number): void {
    this.trackEvent({
      action: 'export_used',
      category: 'engagement',
      label: format,
      value: resultCount,
      custom_parameters: {
        feature_used: 'export',
        export_format: format,
        result_count: resultCount
      }
    });
  }

  /**
   * Track error events
   */
  public trackError(errorType: string, context?: string): void {
    this.trackEvent({
      action: 'error',
      category: 'error',
      label: errorType,
      custom_parameters: {
        error_type: errorType,
        error_context: context
      }
    });
  }

  /**
   * Track performance metrics
   */
  public trackPerformance(metric: string, value: number): void {
    this.trackEvent({
      action: 'performance',
      category: 'performance',
      label: metric,
      value: Math.round(value),
      custom_parameters: {
        performance_metric: metric,
        metric_value: value
      }
    });
  }

  /**
   * Enable/disable analytics
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Get analytics status
   */
  public isAnalyticsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Export singleton instance
export const analytics = AnalyticsService.getInstance();
