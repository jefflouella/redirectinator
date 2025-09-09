// Google Analytics service for privacy-focused tracking
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
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
  private static instance: AnalyticsService | null = null;
  private isEnabled: boolean = true;

  private constructor() {
    // Check if gtag is available (only in browser environment)
    if (typeof window !== 'undefined') {
      this.isEnabled = typeof window.gtag === 'function';
    } else {
      this.isEnabled = false;
    }
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
    if (!this.isEnabled || typeof window === 'undefined' || !window.gtag)
      return;

    try {
      window.gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters,
      });
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }
  }

  /**
   * Track page views
   */
  public trackPageView(page: string): void {
    if (!this.isEnabled || typeof window === 'undefined' || !window.gtag)
      return;

    try {
      window.gtag('config', 'G-WL1D9YFCH9', {
        page_path: page,
        page_title: `Redirectinator - ${page}`,
      });
    } catch (error) {
      console.warn('Analytics page view tracking failed:', error);
    }
  }

  /**
   * Track feature usage with specific action names
   */
  public trackFeatureUsage(
    feature: string,
    details?: Record<string, unknown>
  ): void {
    // Use more specific action names for better analytics granularity
    const actionMap: Record<string, string> = {
      semrush_api_key_added: 'api_key_added',
      semrush_api_key_removed: 'api_key_removed',
      semrush_api_key_validation_failed: 'api_key_validation_failed',
      semrush_api_key_error: 'api_key_error',
      semrush_api_key_removal_error: 'api_key_removal_error',
      csv_upload: 'file_upload_csv',
      xml_sitemap_upload: 'file_upload_xml',
      input_method_selected: 'input_method_changed',
      setting_changed: 'settings_updated',
      tab_navigation: 'tab_switched',
      processing_stopped: 'processing_cancelled',
      results_cleared: 'results_reset',
      copy_to_clipboard: 'content_copied',
      search_performed: 'search_executed',
      filter_applied: 'filter_used',
      url_selected: 'url_interaction',
      bulk_action: 'bulk_operation',
      duplicate_removal: 'cleanup_duplicates',
      parameter_filter: 'parameter_filtered',
    };

    const action = actionMap[feature] || 'feature_used';

    this.trackEvent({
      action: action,
      category: 'engagement',
      label: feature,
      custom_parameters: {
        feature_name: feature,
        feature_category: this.getFeatureCategory(feature),
        ...details,
      },
    });
  }

  /**
   * Get category for a feature
   */
  private getFeatureCategory(feature: string): string {
    if (feature.includes('api_key') || feature.includes('semrush')) {
      return 'api_management';
    }
    if (feature.includes('upload') || feature.includes('file')) {
      return 'data_import';
    }
    if (feature.includes('input_method') || feature.includes('tab')) {
      return 'navigation';
    }
    if (feature.includes('processing') || feature.includes('url_')) {
      return 'data_processing';
    }
    if (
      feature.includes('copy') ||
      feature.includes('search') ||
      feature.includes('filter')
    ) {
      return 'data_interaction';
    }
    if (feature.includes('export') || feature.includes('download')) {
      return 'data_export';
    }
    if (feature.includes('setting') || feature.includes('config')) {
      return 'configuration';
    }
    return 'general';
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
        processing_method: method,
      },
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
        url_count: urlCount,
      },
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
        feature_used: 'project_management',
      },
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
        result_count: resultCount,
      },
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
        error_context: context,
      },
    });
  }

  /**
   * Track copy actions
   */
  public trackCopyAction(contentType: string, context?: string): void {
    this.trackEvent({
      action: 'content_copied',
      category: 'data_interaction',
      label: contentType,
      custom_parameters: {
        content_type: contentType,
        copy_context: context,
        feature_category: 'data_interaction',
      },
    });
  }

  /**
   * Track search actions
   */
  public trackSearch(
    query: string,
    context: string,
    resultCount?: number
  ): void {
    this.trackEvent({
      action: 'search_executed',
      category: 'data_interaction',
      label: context,
      value: resultCount,
      custom_parameters: {
        search_query: query.length > 0 ? 'has_query' : 'empty_query',
        search_context: context,
        result_count: resultCount,
        feature_category: 'data_interaction',
      },
    });
  }

  /**
   * Track filtering actions
   */
  public trackFilter(
    filterType: string,
    filterValue: string,
    resultCount?: number
  ): void {
    this.trackEvent({
      action: 'filter_used',
      category: 'data_interaction',
      label: filterType,
      value: resultCount,
      custom_parameters: {
        filter_type: filterType,
        filter_value: filterValue,
        result_count: resultCount,
        feature_category: 'data_interaction',
      },
    });
  }

  /**
   * Track bulk operations
   */
  public trackBulkAction(
    action: string,
    itemCount: number,
    context?: string
  ): void {
    this.trackEvent({
      action: 'bulk_operation',
      category: 'data_processing',
      label: action,
      value: itemCount,
      custom_parameters: {
        bulk_action_type: action,
        item_count: itemCount,
        bulk_context: context,
        feature_category: 'data_processing',
      },
    });
  }

  /**
   * Track cleanup actions
   */
  public trackCleanup(
    action: string,
    itemsAffected: number,
    context?: string
  ): void {
    this.trackEvent({
      action: 'cleanup_operation',
      category: 'data_processing',
      label: action,
      value: itemsAffected,
      custom_parameters: {
        cleanup_action: action,
        items_affected: itemsAffected,
        cleanup_context: context,
        feature_category: 'data_processing',
      },
    });
  }

  /**
   * Track user interface interactions
   */
  public trackUIInteraction(
    interaction: string,
    element: string,
    context?: string
  ): void {
    this.trackEvent({
      action: 'ui_interaction',
      category: 'navigation',
      label: interaction,
      custom_parameters: {
        interaction_type: interaction,
        ui_element: element,
        interaction_context: context,
        feature_category: 'navigation',
      },
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
        metric_value: value,
      },
    });
  }

  /**
   * Track redirect test execution
   */
  public trackRedirectTest(
    testType: 'single' | 'batch' | 'bulk',
    urlCount: number,
    mode: 'default' | 'advanced',
    source: 'manual' | 'upload' | 'wayback' | 'semrush'
  ): void {
    this.trackEvent({
      action: 'redirect_test_started',
      category: 'redirect_testing',
      label: `${testType}_${mode}`,
      value: urlCount,
      custom_parameters: {
        test_type: testType,
        url_count: urlCount,
        detection_mode: mode,
        test_source: source,
        feature_category: 'redirect_testing',
      },
    });
  }

  /**
   * Track redirect test completion
   */
  public trackRedirectTestComplete(
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
  ): void {
    this.trackEvent({
      action: 'redirect_test_completed',
      category: 'redirect_testing',
      label: `${testType}_${mode}`,
      value: urlCount,
      custom_parameters: {
        test_type: testType,
        url_count: urlCount,
        detection_mode: mode,
        successful_checks: results.successful,
        error_count: results.errors,
        redirect_count: results.redirects,
        loop_count: results.loops,
        direct_count: results.direct,
        processing_time_ms: Math.round(processingTime),
        success_rate: Math.round((results.successful / urlCount) * 100),
        feature_category: 'redirect_testing',
      },
    });
  }

  /**
   * Track individual redirect check results
   */
  public trackRedirectResult(
    result: 'direct' | 'redirect' | 'error' | 'loop',
    redirectCount: number,
    hasDomainChange: boolean,
    hasHttpsUpgrade: boolean,
    responseTime: number,
    mode: 'default' | 'advanced'
  ): void {
    this.trackEvent({
      action: 'redirect_result',
      category: 'redirect_testing',
      label: result,
      value: redirectCount,
      custom_parameters: {
        result_type: result,
        redirect_count: redirectCount,
        has_domain_change: hasDomainChange,
        has_https_upgrade: hasHttpsUpgrade,
        response_time_ms: Math.round(responseTime),
        detection_mode: mode,
        feature_category: 'redirect_testing',
      },
    });
  }

  /**
   * Track redirect processing batch
   */
  public trackRedirectBatch(
    batchNumber: number,
    batchSize: number,
    totalBatches: number,
    mode: 'default' | 'advanced'
  ): void {
    this.trackEvent({
      action: 'redirect_batch_processed',
      category: 'redirect_testing',
      label: `batch_${batchNumber}_of_${totalBatches}`,
      value: batchSize,
      custom_parameters: {
        batch_number: batchNumber,
        batch_size: batchSize,
        total_batches: totalBatches,
        detection_mode: mode,
        progress_percentage: Math.round((batchNumber / totalBatches) * 100),
        feature_category: 'redirect_testing',
      },
    });
  }

  /**
   * Track redirect test errors
   */
  public trackRedirectError(
    errorType: string,
    context: string,
    mode: 'default' | 'advanced',
    urlCount?: number
  ): void {
    this.trackEvent({
      action: 'redirect_test_error',
      category: 'error',
      label: errorType,
      value: urlCount || 1,
      custom_parameters: {
        error_type: errorType,
        error_context: context,
        detection_mode: mode,
        affected_url_count: urlCount || 1,
        feature_category: 'redirect_testing',
      },
    });
  }

  /**
   * Track detailed UI interactions
   */
  public trackDetailedUIInteraction(
    element: string,
    action: string,
    context?: string,
    metadata?: Record<string, any>
  ): void {
    this.trackEvent({
      action: 'ui_interaction_detailed',
      category: 'navigation',
      label: `${element}_${action}`,
      custom_parameters: {
        ui_element: element,
        interaction_action: action,
        interaction_context: context,
        feature_category: 'navigation',
        ...metadata,
      },
    });
  }

  /**
   * Track mode switching
   */
  public trackModeSwitch(
    fromMode: 'default' | 'advanced',
    toMode: 'default' | 'advanced',
    context?: string
  ): void {
    this.trackEvent({
      action: 'mode_switched',
      category: 'configuration',
      label: `${fromMode}_to_${toMode}`,
      custom_parameters: {
        from_mode: fromMode,
        to_mode: toMode,
        switch_context: context,
        feature_category: 'configuration',
      },
    });
  }

  /**
   * Track project statistics
   */
  public trackProjectStats(
    projectId: string,
    urlCount: number,
    resultCount: number,
    hasResults: boolean
  ): void {
    this.trackEvent({
      action: 'project_stats',
      category: 'project_management',
      label: hasResults ? 'with_results' : 'empty',
      value: urlCount,
      custom_parameters: {
        project_id: projectId,
        url_count: urlCount,
        result_count: resultCount,
        has_results: hasResults,
        feature_category: 'project_management',
      },
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
