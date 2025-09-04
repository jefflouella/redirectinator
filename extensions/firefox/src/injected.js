/**
 * Redirectinator Advanced - Injected Script
 * This script is injected into web pages for additional analysis capabilities
 */

(function() {
  'use strict';

  // Only run if we're in the context of a redirectinator analysis
  if (window.location.protocol === 'chrome-extension:' ||
      window.location.protocol === 'moz-extension:') {
    return; // Don't run in extension context
  }

  const REDIRECTINATOR_ANALYSIS = '__REDIRECTINATOR_ANALYSIS__';

  // Check if we're already analyzing this page
  if (window[REDIRECTINATOR_ANALYSIS]) {
    return;
  }

  window[REDIRECTINATOR_ANALYSIS] = {
    startTime: Date.now(),
    originalUrl: window.location.href,
    redirects: [],
    metaRefresh: null,
    initialized: false
  };

  /**
   * Enhanced redirect detection for complex scenarios
   */
  class AdvancedRedirectDetector {
    constructor() {
      this.analysis = window[REDIRECTINATOR_ANALYSIS];
      this.initialize();
    }

    initialize() {
      if (this.analysis.initialized) return;

      // Detect meta refresh with enhanced parsing
      this.detectMetaRefresh();

      // Monitor various redirect methods
      this.monitorLocationMethods();
      this.monitorHistoryMethods();
      this.monitorFormSubmissions();

      // Monitor dynamic script injection
      this.monitorScriptInjection();

      this.analysis.initialized = true;
    }

    detectMetaRefresh() {
      const metaTags = document.getElementsByTagName('meta');
      for (let i = 0; i < metaTags.length; i++) {
        const meta = metaTags[i];
        if (meta.getAttribute('http-equiv')?.toLowerCase() === 'refresh') {
          const content = meta.getAttribute('content');
          if (content) {
            const parts = content.split(';');
            const delay = parseInt(parts[0]) || 0;
            const urlPart = parts.find(part => part.toLowerCase().startsWith('url='));

            if (urlPart) {
              this.analysis.metaRefresh = {
                type: 'meta_refresh',
                delay: delay,
                targetUrl: urlPart.substring(4),
                detectedAt: Date.now(),
                method: 'meta_tag_enhanced'
              };
            }
          }
        }
      }
    }

    monitorLocationMethods() {
      const self = this;
      
      try {
        const originalAssign = window.location.assign;
        if (originalAssign && typeof originalAssign === 'function') {
          window.location.assign = function(url) {
            self.recordRedirect('location_assign', window.location.href, url);
            return originalAssign.call(this, url);
          };
        }
      } catch (error) {
        console.log('Redirectinator Advanced: Could not override location.assign:', error.message);
      }

      try {
        const originalReplace = window.location.replace;
        if (originalReplace && typeof originalReplace === 'function') {
          window.location.replace = function(url) {
            self.recordRedirect('location_replace', window.location.href, url);
            return originalReplace.call(this, url);
          };
        }
      } catch (error) {
        console.log('Redirectinator Advanced: Could not override location.replace:', error.message);
      }
    }

    monitorHistoryMethods() {
      const self = this;
      
      try {
        const originalPushState = history.pushState;
        if (originalPushState && typeof originalPushState === 'function') {
          history.pushState = function(state, title, url) {
            self.recordRedirect('history_pushState', window.location.href, url);
            return originalPushState.call(this, state, title, url);
          };
        }
      } catch (error) {
        console.log('Redirectinator Advanced: Could not override history.pushState:', error.message);
      }

      try {
        const originalReplaceState = history.replaceState;
        if (originalReplaceState && typeof originalReplaceState === 'function') {
          history.replaceState = function(state, title, url) {
            self.recordRedirect('history_replaceState', window.location.href, url);
            return originalReplaceState.call(this, state, title, url);
          };
        }
      } catch (error) {
        console.log('Redirectinator Advanced: Could not override history.replaceState:', error.message);
      }
    }

    monitorFormSubmissions() {
      const self = this;
      document.addEventListener('submit', function(event) {
        const form = event.target;
        if (form && form.tagName === 'FORM') {
          const action = form.getAttribute('action') || window.location.href;
          self.recordRedirect('form_submit', window.location.href, action);
        }
      });
    }

    monitorScriptInjection() {
      const self = this;
      
      try {
        const originalCreateElement = document.createElement;
        if (originalCreateElement && typeof originalCreateElement === 'function') {
          document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);

            if (tagName?.toLowerCase() === 'script') {
              try {
                const originalSrc = Object.getOwnPropertyDescriptor(element, 'src');
                if (originalSrc && originalSrc.configurable) {
                  Object.defineProperty(element, 'src', {
                    get: function() {
                      return originalSrc.get.call(this);
                    },
                    set: function(value) {
                      // Check if this might be a redirect script
                      if (value && (
                        value.includes('redirect') ||
                        value.includes('location') ||
                        value.includes('window.location')
                      )) {
                        self.recordRedirect('script_injection', window.location.href, value);
                      }
                      originalSrc.set.call(this, value);
                    }
                  });
                }
              } catch (srcError) {
                console.log('Redirectinator Advanced: Could not override script src property:', srcError.message);
              }
            }

            return element;
          };
        }
      } catch (error) {
        console.log('Redirectinator Advanced: Could not override document.createElement:', error.message);
      }
    }

    recordRedirect(method, from, to) {
      const redirect = {
        method: method,
        from: from,
        to: to,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      };

      this.analysis.redirects.push(redirect);

      // Send to content script if available
      if (window.postMessage) {
        window.postMessage({
          type: 'REDIRECTINATOR_REDIRECT_DETECTED',
          redirect: redirect
        }, '*');
      }
    }

    getAnalysisResults() {
      return {
        ...this.analysis,
        finalUrl: window.location.href,
        analysisTime: Date.now() - this.analysis.startTime,
        completedAt: new Date().toISOString()
      };
    }
  }

  // Initialize the detector
  try {
    new AdvancedRedirectDetector();
  } catch (error) {
    console.warn('Redirectinator Advanced: Error initializing injected script:', error);
  }

  // Expose analysis results globally for content script access
  window[REDIRECTINATOR_ANALYSIS].getResults = function() {
    return window[REDIRECTINATOR_ANALYSIS];
  };

})();
