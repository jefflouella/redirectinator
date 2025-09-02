/**
 * Redirectinator Advanced - Content Script
 * Handles DOM parsing, meta refresh detection, and JavaScript redirect monitoring
 */

// Only run on regular web pages, not on extension pages or chrome:// URLs
if (window.location.protocol === 'chrome-extension:' ||
    window.location.protocol === 'moz-extension:' ||
    window.location.protocol === 'chrome:' ||
    window.location.protocol === 'about:') {
  console.log('Redirectinator Advanced: Skipping content script on extension/system page:', window.location.href);
} else {
  console.log('Redirectinator Advanced: Content script running on:', window.location.href, 'protocol:', window.location.protocol);

class RedirectDetector {
  constructor() {
    this.redirects = [];
    this.originalUrl = window.location.href;
    this.currentUrl = window.location.href;
    this.metaRefresh = null;
    this.javascriptRedirects = [];
    this.startTime = Date.now();

    this.initialize();
  }

  initialize() {
    // Detect meta refresh tags
    this.detectMetaRefresh();

    // Monitor JavaScript redirects
    this.monitorJavaScriptRedirects();

    // Monitor location changes
    this.monitorLocationChanges();

    // Monitor for page unload (potential redirect)
    this.monitorPageUnload();
  }

  /**
   * Detect meta refresh tags in the document
   */
  detectMetaRefresh() {
    // Check for meta refresh in head
    const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');

    if (metaRefresh) {
      const content = metaRefresh.getAttribute('content');
      if (content) {
        // Parse content format: "5;url=https://example.com"
        const parts = content.split(';');
        const delay = parseInt(parts[0]) || 0;
        const urlPart = parts.find(part => part.toLowerCase().startsWith('url='));

        if (urlPart) {
          const targetUrl = urlPart.substring(4); // Remove "url=" prefix

          this.metaRefresh = {
            type: 'meta_refresh',
            delay: delay,
            targetUrl: targetUrl,
            detectedAt: Date.now(),
            method: 'meta_tag_parsing',
            originalUrl: this.originalUrl
          };

          console.log('Meta refresh detected:', this.metaRefresh);
        }
      }
    }
  }

  /**
   * Monitor JavaScript redirects via safer event-based approach
   */
  monitorJavaScriptRedirects() {
    const self = this;

    try {
      // Monitor beforeunload event for potential redirects
      window.addEventListener('beforeunload', function(event) {
        if (window.location.href !== self.originalUrl) {
          const redirect = {
            type: 'javascript',
            method: 'beforeunload_redirect',
            from: self.originalUrl,
            to: window.location.href,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          };

          self.javascriptRedirects.push(redirect);
          console.log('JavaScript redirect detected (beforeunload):', redirect);
        }
      });

      // Monitor hash changes
      window.addEventListener('hashchange', function(event) {
        if (event.oldURL !== event.newURL) {
          const redirect = {
            type: 'javascript',
            method: 'hashchange',
            from: event.oldURL,
            to: event.newURL,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          };

          self.javascriptRedirects.push(redirect);
          self.currentUrl = event.newURL;
          console.log('JavaScript redirect detected (hashchange):', redirect);
        }
      });

      // Monitor popstate events (back/forward navigation)
      window.addEventListener('popstate', function(event) {
        if (window.location.href !== self.currentUrl) {
          const redirect = {
            type: 'javascript',
            method: 'popstate',
            from: self.currentUrl,
            to: window.location.href,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          };

          self.javascriptRedirects.push(redirect);
          self.currentUrl = window.location.href;
          console.log('JavaScript redirect detected (popstate):', redirect);
        }
      });

      // Enhanced Meta Refresh monitoring
      self.monitorMetaRefreshChanges();
      
      // Aggressive Meta Refresh detection
      self.aggressiveMetaRefreshDetection();

      console.log('Redirectinator Advanced: JavaScript redirect monitoring initialized (event-based)');

    } catch (error) {
      console.warn('Redirectinator Advanced: Error setting up JavaScript redirect monitoring:', error);
    }
  }

  /**
   * Monitor for Meta Refresh changes and execution
   */
  monitorMetaRefreshChanges() {
    const self = this;
    
    // Monitor DOM changes for dynamically added meta refresh tags
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if a meta refresh tag was added
              if (node.tagName === 'META' && node.getAttribute('http-equiv') === 'refresh') {
                console.log('🔍 Meta refresh tag dynamically added:', node);
                self.detectMetaRefresh();
              }
              // Check children of added nodes
              const metaRefresh = node.querySelector && node.querySelector('meta[http-equiv="refresh"]');
              if (metaRefresh) {
                console.log('🔍 Meta refresh tag found in added content:', metaRefresh);
                self.detectMetaRefresh();
              }
            }
          });
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // Enhanced Meta Refresh execution monitoring
    let lastUrl = window.location.href;
    let metaRefreshDetected = false;
    let metaRefreshTarget = null;
    let metaRefreshDelay = 0;
    
    const checkForMetaRefreshRedirect = () => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        console.log('🔍 Location changed from', lastUrl, 'to', currentUrl);
        
        // If we detected a meta refresh and the location changed, this might be the meta refresh executing
        if (metaRefreshDetected && metaRefreshTarget) {
          console.log('🔍 Potential meta refresh execution detected');
          
          // Check if this looks like a meta refresh redirect
          const isMetaRefreshRedirect = self.isMetaRefreshRedirect(lastUrl, currentUrl);
          
          if (isMetaRefreshRedirect) {
            console.log('✅ Meta refresh redirect confirmed:', { from: lastUrl, to: currentUrl, target: metaRefreshTarget });
            
            // Add this as a meta refresh redirect
            const redirect = {
              type: 'meta_refresh',
              method: 'meta_refresh_execution',
              from: lastUrl,
              to: currentUrl,
              targetUrl: metaRefreshTarget,
              delay: metaRefreshDelay,
              timestamp: Date.now(),
              userAgent: navigator.userAgent
            };
            
            self.metaRefreshRedirects = self.metaRefreshRedirects || [];
            self.metaRefreshRedirects.push(redirect);
            
            // Reset for next detection
            metaRefreshDetected = false;
            metaRefreshTarget = null;
            metaRefreshDelay = 0;
          }
        }
        
        lastUrl = currentUrl;
      }
    };

    // Check more frequently for meta refresh execution
    setInterval(checkForMetaRefreshRedirect, 100); // Increased frequency
    
    // Also check when page becomes visible (in case of background redirects)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('🔍 Page became visible, checking for meta refresh');
        self.detectMetaRefresh();
      }
    });

    // Override the detectMetaRefresh method to track targets
    const originalDetectMetaRefresh = self.detectMetaRefresh;
    self.detectMetaRefresh = function() {
      const result = originalDetectMetaRefresh.call(this);
      if (this.metaRefresh && this.metaRefresh.targetUrl) {
        metaRefreshDetected = true;
        metaRefreshTarget = this.metaRefresh.targetUrl;
        metaRefreshDelay = this.metaRefresh.delay || 0;
        console.log('🔍 Meta refresh target tracked:', { target: metaRefreshTarget, delay: metaRefreshDelay });
        
        // If there's a delay, set up a specific timer for that delay
        if (metaRefreshDelay > 0) {
          console.log(`⏰ Setting up meta refresh timer for ${metaRefreshDelay} seconds`);
          setTimeout(() => {
            console.log('⏰ Meta refresh delay completed, checking for execution');
            // Force a check after the delay
            checkForMetaRefreshRedirect();
          }, (metaRefreshDelay * 1000) + 100); // Add small buffer
        }
      }
      return result;
    };

    console.log('🔍 Enhanced meta refresh monitoring initialized');
  }

  /**
   * Check if a location change looks like a meta refresh redirect
   */
  isMetaRefreshRedirect(fromUrl, toUrl) {
    // Meta refresh redirects typically:
    // 1. Change the full URL (not just hash)
    // 2. Don't trigger beforeunload events
    // 3. Happen after a delay or immediately
    
    try {
      const fromUrlObj = new URL(fromUrl);
      const toUrlObj = new URL(toUrl);
      
      // Check if it's a full URL change (not just hash)
      const isFullUrlChange = fromUrlObj.origin + fromUrlObj.pathname !== toUrlObj.origin + toUrlObj.pathname;
      
      // Check if it's not a hash change
      const isNotHashChange = fromUrlObj.hash !== toUrlObj.hash;
      
      // Check if it's not a search param change only
      const isNotSearchOnly = fromUrlObj.search !== toUrlObj.search;
      
      return isFullUrlChange && isNotHashChange && isNotSearchOnly;
    } catch (error) {
      console.warn('Error parsing URLs for meta refresh detection:', error);
      return false;
    }
  }

  /**
   * Aggressive Meta Refresh detection - try to catch it before it executes
   */
  aggressiveMetaRefreshDetection() {
    const self = this;
    
    // Check for meta refresh tags more aggressively
    const checkForMetaRefresh = () => {
      const metaRefreshTags = document.querySelectorAll('meta[http-equiv="refresh"]');
      if (metaRefreshTags.length > 0) {
        console.log('🔍 Found', metaRefreshTags.length, 'meta refresh tags');
        
        metaRefreshTags.forEach((tag, index) => {
          const content = tag.getAttribute('content');
          if (content) {
            console.log(`🔍 Meta refresh ${index + 1} content:`, content);
            
            // Parse the content
            const parts = content.split(';');
            const delay = parseInt(parts[0]) || 0;
            const urlPart = parts.find(part => part.toLowerCase().startsWith('url='));
            
            if (urlPart) {
              const targetUrl = urlPart.substring(4);
              console.log(`🔍 Meta refresh ${index + 1} target:`, targetUrl, 'delay:', delay);
              
              // Store this meta refresh for later verification
              if (!self.detectedMetaRefreshes) {
                self.detectedMetaRefreshes = [];
              }
              
              const metaRefreshInfo = {
                delay: delay,
                targetUrl: targetUrl,
                detectedAt: Date.now(),
                tag: tag
              };
              
              self.detectedMetaRefreshes.push(metaRefreshInfo);
              console.log('🔍 Meta refresh stored for verification:', metaRefreshInfo);
              
              // If immediate redirect (no delay), set up immediate monitoring
              if (delay === 0) {
                console.log('🔍 Immediate meta refresh detected, setting up aggressive monitoring');
                self.setupImmediateMetaRefreshMonitoring(targetUrl);
              }
            }
          }
        });
      }
    };
    
    // Check immediately
    checkForMetaRefresh();
    
    // Check after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkForMetaRefresh);
    }
    
    // Check after window load
    if (document.readyState !== 'complete') {
      window.addEventListener('load', checkForMetaRefresh);
    }
    
    // Check periodically
    setInterval(checkForMetaRefresh, 1000);
    
    console.log('🔍 Aggressive meta refresh detection initialized');
  }

  /**
   * Set up monitoring for immediate meta refresh redirects
   */
  setupImmediateMetaRefreshMonitoring(targetUrl) {
    const self = this;
    let currentUrl = window.location.href;
    
    // Monitor for immediate redirects
    const immediateCheck = setInterval(() => {
      const newUrl = window.location.href;
      if (newUrl !== currentUrl) {
        console.log('🔍 Immediate redirect detected:', { from: currentUrl, to: newUrl, expected: targetUrl });
        
        // Check if this matches our expected meta refresh target
        if (newUrl === targetUrl || newUrl.includes(targetUrl.split('/').pop())) {
          console.log('✅ Immediate meta refresh redirect confirmed!');
          
          // Add this as a meta refresh redirect
          const redirect = {
            type: 'meta_refresh',
            method: 'immediate_meta_refresh',
            from: currentUrl,
            to: newUrl,
            targetUrl: targetUrl,
            delay: 0,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          };
          
          self.metaRefreshRedirects = self.metaRefreshRedirects || [];
          self.metaRefreshRedirects.push(redirect);
          
          // Stop monitoring
          clearInterval(immediateCheck);
        }
        
        currentUrl = newUrl;
      }
    }, 50); // Check very frequently for immediate redirects
    
    // Stop monitoring after 10 seconds to avoid memory leaks
    setTimeout(() => {
      clearInterval(immediateCheck);
    }, 10000);
  }

  /**
   * Monitor location changes via MutationObserver
   */
  monitorLocationChanges() {
    const self = this;

    // Monitor hash changes
    window.addEventListener('hashchange', (event) => {
      if (window.location.href !== self.currentUrl) {
        const redirect = {
          type: 'javascript',
          method: 'hashchange',
          from: self.currentUrl,
          to: window.location.href,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        };

        self.javascriptRedirects.push(redirect);
        self.currentUrl = window.location.href;

        console.log('Hash change redirect detected:', redirect);
      }
    });

    // Monitor popstate events
    window.addEventListener('popstate', (event) => {
      if (window.location.href !== self.currentUrl) {
        const redirect = {
          type: 'javascript',
          method: 'popstate',
          from: self.currentUrl,
          to: window.location.href,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        };

        self.javascriptRedirects.push(redirect);
        self.currentUrl = window.location.href;

        console.log('Popstate redirect detected:', redirect);
      }
    });
  }

  /**
   * Monitor page unload events that might indicate redirects
   */
  monitorPageUnload() {
    const self = this;

    window.addEventListener('beforeunload', () => {
      // This might be a redirect if the location changed
      if (window.location.href !== self.originalUrl && self.javascriptRedirects.length === 0) {
        const redirect = {
          type: 'javascript',
          method: 'beforeunload_redirect',
          from: self.originalUrl,
          to: window.location.href,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        };

        self.javascriptRedirects.push(redirect);
        console.log('Beforeunload redirect detected:', redirect);
      }
    });
  }

  /**
   * Get comprehensive redirect analysis results
   */
  getAnalysisResults() {
    // Perform comprehensive page analysis to catch missed redirects
    this.performComprehensiveAnalysis();
    
    return {
      originalUrl: this.originalUrl,
      finalUrl: window.location.href,
      statusCode: null, // Will be determined by background script
      metaRefresh: this.metaRefresh,
      javascriptRedirects: this.javascriptRedirects,
      metaRefreshRedirects: this.metaRefreshRedirects || [],
      hasMetaRefresh: !!this.metaRefresh || (this.metaRefreshRedirects && this.metaRefreshRedirects.length > 0),
      hasJavaScriptRedirect: this.javascriptRedirects.length > 0,
      redirectChain: this.buildRedirectChain(),
      analysisTime: Date.now() - this.startTime,
      detectedAt: new Date().toISOString()
    };
  }

  /**
   * Perform comprehensive analysis to catch missed redirects
   */
  performComprehensiveAnalysis() {
    console.log('🔍 Performing comprehensive page analysis...');
    
    // Check for any remaining meta refresh tags
    const remainingMetaRefresh = document.querySelector('meta[http-equiv="refresh"]');
    if (remainingMetaRefresh) {
      console.log('🔍 Found remaining meta refresh tag:', remainingMetaRefresh);
      this.detectMetaRefresh();
    }
    
    // Analyze the current page for clues about what happened
    this.analyzePageForRedirectClues();
    
    // Check if we're on a different page than expected
    this.checkForUnexpectedNavigation();
  }

  /**
   * Analyze page content for clues about redirects that happened
   */
  analyzePageForRedirectClues() {
    console.log('🔍 Analyzing page for redirect clues...');
    
    // Check if we're on a different page than the original
    if (window.location.href !== this.originalUrl) {
      console.log('🔍 Page URL changed from', this.originalUrl, 'to', window.location.href);
      
      // Check if this looks like it could be a meta refresh target
      const currentPage = window.location.href;
      const originalPage = this.originalUrl;
      
      // Look for evidence of meta refresh execution
      this.lookForMetaRefreshEvidence(currentPage, originalPage);
    }
    
    // Check page title and content for clues
    const pageTitle = document.title;
    const pageContent = document.body ? document.body.textContent : '';
    
    console.log('🔍 Current page title:', pageTitle);
    console.log('🔍 Page content preview:', pageContent.substring(0, 200) + '...');
    
    // Check if this looks like a different page than expected
    if (this.metaRefresh && this.metaRefresh.targetUrl) {
      const expectedTarget = this.metaRefresh.targetUrl;
      const currentUrl = window.location.href;
      
      console.log('🔍 Checking if current page matches expected meta refresh target');
      console.log('🔍 Expected:', expectedTarget);
      console.log('🔍 Current:', currentUrl);
      
      // If we're on the expected target page, this suggests meta refresh executed
      if (currentUrl === expectedTarget || currentUrl.includes(expectedTarget.split('/').pop())) {
        console.log('✅ Current page matches expected meta refresh target!');
        
        // Add this as a meta refresh redirect
        const redirect = {
          type: 'meta_refresh',
          method: 'page_analysis_confirmation',
          from: this.originalUrl,
          to: currentUrl,
          targetUrl: expectedTarget,
          delay: this.metaRefresh.delay || 0,
          timestamp: Date.now(),
          userAgent: navigator.userAgent
        };
        
        this.metaRefreshRedirects = this.metaRefreshRedirects || [];
        this.metaRefreshRedirects.push(redirect);
        
        console.log('✅ Meta refresh redirect confirmed via page analysis');
      }
    }
  }

  /**
   * Look for evidence that a meta refresh redirect occurred
   */
  lookForMetaRefreshEvidence(currentPage, originalPage) {
    try {
      const currentUrl = new URL(currentPage);
      const originalUrl = new URL(originalPage);
      
      // Check if we're on a completely different page
      if (currentUrl.origin !== originalUrl.origin || currentUrl.pathname !== originalUrl.pathname) {
        console.log('🔍 Significant page change detected - possible meta refresh execution');
        
        // Check if we have a stored meta refresh target
        if (this.metaRefresh && this.metaRefresh.targetUrl) {
          const targetUrl = new URL(this.metaRefresh.targetUrl);
          
          // Check if current page matches the meta refresh target
          if (currentUrl.origin === targetUrl.origin && currentUrl.pathname === targetUrl.pathname) {
            console.log('✅ Current page matches stored meta refresh target!');
            
            // This is strong evidence that meta refresh executed
            const redirect = {
              type: 'meta_refresh',
              method: 'evidence_analysis',
              from: originalPage,
              to: currentPage,
              targetUrl: this.metaRefresh.targetUrl,
              delay: this.metaRefresh.delay || 0,
              timestamp: Date.now(),
              userAgent: navigator.userAgent
            };
            
            this.metaRefreshRedirects = this.metaRefreshRedirects || [];
            this.metaRefreshRedirects.push(redirect);
            
            console.log('✅ Meta refresh redirect confirmed via evidence analysis');
          }
        }
      }
    } catch (error) {
      console.warn('Error analyzing URL evidence:', error);
    }
  }

  /**
   * Check for unexpected navigation that might indicate missed redirects
   */
  checkForUnexpectedNavigation() {
    // If we're on a completely different page than expected, this might be a missed redirect
    if (window.location.href !== this.originalUrl) {
      console.log('🔍 Unexpected navigation detected');
      
      // Check if this could be the result of a meta refresh we missed
      if (this.metaRefresh && this.metaRefresh.targetUrl) {
        const currentUrl = window.location.href;
        const targetUrl = this.metaRefresh.targetUrl;
        
        console.log('🔍 Current URL:', currentUrl);
        console.log('🔍 Meta refresh target:', targetUrl);
        
        // If they're similar, this might be the meta refresh execution
        if (this.urlsAreSimilar(currentUrl, targetUrl)) {
          console.log('✅ URLs are similar - possible meta refresh execution');
          
          const redirect = {
            type: 'meta_refresh',
            method: 'similarity_analysis',
            from: this.originalUrl,
            to: currentUrl,
            targetUrl: targetUrl,
            delay: this.metaRefresh.delay || 0,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          };
          
          this.metaRefreshRedirects = this.metaRefreshRedirects || [];
          this.metaRefreshRedirects.push(redirect);
          
          console.log('✅ Meta refresh redirect confirmed via similarity analysis');
        }
      }
    }
  }

  /**
   * Check if two URLs are similar (same domain, similar path)
   */
  urlsAreSimilar(url1, url2) {
    try {
      const u1 = new URL(url1);
      const u2 = new URL(url2);
      
      // Same domain
      if (u1.origin !== u2.origin) return false;
      
      // Similar path (allow for minor differences)
      const path1 = u1.pathname;
      const path2 = u2.pathname;
      
      // Exact match
      if (path1 === path2) return true;
      
      // One is a subdirectory of the other
      if (path1.startsWith(path2) || path2.startsWith(path1)) return true;
      
      // Similar filenames
      const file1 = path1.split('/').pop();
      const file2 = path2.split('/').pop();
      
      if (file1 && file2 && (file1.includes(file2) || file2.includes(file1))) return true;
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Build a comprehensive redirect chain
   */
  buildRedirectChain() {
    const chain = [];

    // Add original URL
    chain.push({
      step: 0,
      url: this.originalUrl,
      type: 'original',
      timestamp: this.startTime
    });

    // Add meta refresh redirects (executed redirects)
    if (this.metaRefreshRedirects && this.metaRefreshRedirects.length > 0) {
      this.metaRefreshRedirects.forEach((redirect, index) => {
        chain.push({
          step: chain.length,
          url: redirect.from,
          type: 'meta_refresh',
          method: redirect.method,
          targetUrl: redirect.targetUrl,
          timestamp: redirect.timestamp
        });
      });
    }
    // Fallback to static meta refresh detection
    else if (this.metaRefresh) {
      chain.push({
        step: 1,
        url: this.originalUrl,
        type: 'meta_refresh',
        method: 'meta_tag',
        delay: this.metaRefresh.delay,
        timestamp: this.metaRefresh.detectedAt
      });
    }

    // Add JavaScript redirects
    this.javascriptRedirects.forEach((redirect, index) => {
      chain.push({
        step: chain.length,
        url: redirect.to,
        type: 'javascript',
        method: redirect.method,
        timestamp: redirect.timestamp
      });
    });

    // Add final URL if different
    if (window.location.href !== this.originalUrl &&
        !chain.some(step => step.url === window.location.href)) {
      chain.push({
        step: chain.length,
        url: window.location.href,
        type: 'final',
        timestamp: Date.now()
      });
    }

    return chain;
  }
}

// Global instance
let redirectDetector = null;

/**
 * Initialize content script
 */
function initializeContentScript() {
  if (redirectDetector) {
    return; // Already initialized
  }

  console.log('Redirectinator Advanced: Initializing content script');

  try {
    redirectDetector = new RedirectDetector();

    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        console.log('Redirectinator Advanced: DOM content loaded');
      });
    } else {
      console.log('Redirectinator Advanced: DOM already loaded');
    }

    // Wait for window load
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        console.log('Redirectinator Advanced: Window loaded');
      });
    }

  } catch (error) {
    console.error('Redirectinator Advanced: Error initializing content script:', error);
    // Continue with extension API injection even if redirect detector fails
  }
}

/**
 * Handle messages from background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'START_ANALYSIS') {
    try {
      if (!redirectDetector) {
        initializeContentScript();
      }

      // Wait a moment for initialization
      setTimeout(() => {
        const results = redirectDetector.getAnalysisResults();

        // Send results back to background script
        chrome.runtime.sendMessage({
          type: 'CONTENT_ANALYSIS_COMPLETE',
          tabId: request.tabId,
          data: results
        });

        sendResponse({ success: true });

      }, 1000); // Give time for redirects to occur

    } catch (error) {
      console.error('Error in content script analysis:', error);
      sendResponse({ success: false, error: error.message });
    }

    return true; // Keep message channel open
  }

  if (request.type === 'GET_REDIRECT_DATA') {
    if (redirectDetector) {
      sendResponse({
        success: true,
        data: redirectDetector.getAnalysisResults()
      });
    } else {
      sendResponse({
        success: false,
        error: 'Content script not initialized'
      });
    }
    return true;
  }
});

/**
 * Handle custom events from the injected communication bridge
 */
window.addEventListener('RedirectinatorRequest', function(event) {
  const request = event.detail;
  console.log('🔗 Content script received request from bridge:', request);

  if (request.type === 'ANALYZE_URL') {
    // Handle URL analysis request from the bridge
    chrome.runtime.sendMessage({
      type: 'WEB_APP_ANALYZE_URL',
      url: request.url,
      options: request.options,
      requestId: request.requestId
    }, (response) => {
      // Send response back to the bridge via custom event
      const responseEvent = new CustomEvent('RedirectinatorResponse', {
        detail: {
          type: 'ANALYZE_RESPONSE',
          requestId: request.requestId,
          success: response && response.success,
          result: response ? response.result : null,
          error: response ? response.error : 'Analysis failed'
        }
      });
      window.dispatchEvent(responseEvent);
    });
  }
});

/**
 * Make extension detectable by web app
 */
function injectExtensionAPI() {
  try {
    console.log('Redirectinator Advanced: Starting extension API injection...');

    // Method 1: Try to inject global object directly (may not work due to isolated world)
    window.redirectinatorExtension = {
      isAvailable: () => {
        console.log('Redirectinator Advanced: isAvailable() called');
        return true;
      },
      getVersion: () => {
        console.log('Redirectinator Advanced: getVersion() called');
        return '1.0.0-local';
      },
      analyzeUrl: async (url, options = {}) => {
        console.log('Redirectinator Advanced: analyzeUrl() called with:', url, options);
        return new Promise((resolve, reject) => {
          const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Send message to background script
          chrome.runtime.sendMessage({
            type: 'WEB_APP_ANALYZE_URL',
            url: url,
            options: options,
            requestId: requestId
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Redirectinator Advanced: Runtime error:', chrome.runtime.lastError);
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }

            console.log('Redirectinator Advanced: Background response:', response);
            if (response && response.success) {
              resolve(response.result);
            } else {
              reject(new Error(response?.error || 'Unknown error'));
            }
          });
        });
      }
    };

    console.log('Redirectinator Advanced: Attempted global extension object injection');

    // Method 2: Inject a script that can communicate with the page (bypasses isolated world)
    // DISABLED due to CSP script-src restrictions - using postMessage instead
    console.log('🔗 Bridge injection disabled due to CSP - using postMessage communication');
    
    // The extension is already communicating via postMessage, so we don't need the bridge

    // Also send a message to let the web app know extension is ready
    window.postMessage({
      type: 'REDIRECTINATOR_EXTENSION_READY',
      version: '1.0.0-local',
      source: 'content_script'
    }, '*');

    console.log('Redirectinator Advanced: Extension ready message sent');

    // Add a visual indicator that extension is loaded (for debugging)
    // Only add if document.body is available
    if (document.body) {
      addVisualIndicator();
    } else {
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addVisualIndicator);
      } else {
        // DOM already loaded, try to add indicator
        setTimeout(addVisualIndicator, 100);
      }
    }

  } catch (error) {
    console.error('Redirectinator Advanced: Error injecting extension API:', error);
  }
}

function injectCommunicationBridge() {
  try {
    console.log('Redirectinator Advanced: Injecting communication bridge...');

    // Create a script that will be injected into the page context (not isolated world)
    const bridgeScript = `
      (function() {
        console.log('🔗 Redirectinator Communication Bridge Loaded');

        // Create the extension API in the page's global context
        window.redirectinatorExtension = {
          isAvailable: function() {
            console.log('🔗 Extension isAvailable called');
            return true;
          },
          getVersion: function() {
            console.log('🔗 Extension getVersion called');
            return '1.0.0-bridge';
          },
          analyzeUrl: function(url, options) {
            console.log('🔗 Extension analyzeUrl called:', url);
            return new Promise(function(resolve, reject) {
              // Send message to content script via custom event
              var event = new CustomEvent('RedirectinatorRequest', {
                detail: {
                  type: 'ANALYZE_URL',
                  url: url,
                  options: options || {},
                  requestId: 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
                }
              });
              window.dispatchEvent(event);

              // Listen for response
              var responseHandler = function(e) {
                if (e.detail.type === 'ANALYZE_RESPONSE' && e.detail.requestId === event.detail.requestId) {
                  window.removeEventListener('RedirectinatorResponse', responseHandler);
                  if (e.detail.success) {
                    resolve(e.detail.result);
                  } else {
                    reject(new Error(e.detail.error || 'Analysis failed'));
                  }
                }
              };
              window.addEventListener('RedirectinatorResponse', responseHandler);

              // Timeout after 30 seconds
              setTimeout(function() {
                window.removeEventListener('RedirectinatorResponse', responseHandler);
                reject(new Error('Analysis timeout'));
              }, 30000);
            });
          }
        };

        console.log('🔗 Redirectinator extension API injected via bridge');
      })();
    `;

    // Create a blob URL to avoid CSP inline script restrictions
    const blob = new Blob([bridgeScript], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    
    console.log('🔗 Created blob URL:', blobUrl);
    console.log('🔗 Bridge script content length:', bridgeScript.length);

    // Inject the script into the page using blob URL (CSP compliant)
    const script = document.createElement('script');
    script.src = blobUrl;
    script.setAttribute('data-redirectinator-bridge', 'true');

    // Clean up the blob URL after script loads
    script.onload = function() {
      console.log('✅ Communication bridge script loaded successfully');
      URL.revokeObjectURL(blobUrl);
      console.log('🔗 Communication bridge blob URL cleaned up');
      
      // Verify the bridge was injected
      setTimeout(() => {
        if (window.redirectinatorExtension) {
          console.log('✅ Bridge verification successful - window.redirectinatorExtension exists');
        } else {
          console.warn('⚠️ Bridge verification failed - window.redirectinatorExtension not found');
        }
      }, 100);
    };

    script.onerror = function(error) {
      console.error('❌ Communication bridge failed to load:', error);
      URL.revokeObjectURL(blobUrl);
    };

    // Inject at the beginning of head to ensure it loads early
    if (document.head) {
      document.head.insertBefore(script, document.head.firstChild);
      console.log('Redirectinator Advanced: Communication bridge injected (blob URL)');
    } else {
      // If head is not available yet, wait for it
      const injectWhenReady = function() {
        if (document.head && !document.querySelector('script[data-redirectinator-bridge]')) {
          document.head.insertBefore(script, document.head.firstChild);
          console.log('Redirectinator Advanced: Communication bridge injected (delayed, blob URL)');
        }
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectWhenReady);
      } else {
        setTimeout(injectWhenReady, 100);
      }
    }

  } catch (error) {
    console.warn('Redirectinator Advanced: Error injecting communication bridge:', error);
  }
}

function addVisualIndicator() {
  try {
    // Double-check document.body is available
    if (!document.body) {
      console.warn('Redirectinator Advanced: document.body not available, skipping visual indicator');
      return;
    }

    // Check if indicator already exists
    if (document.getElementById('redirectinator-extension-indicator')) {
      return;
    }

    const indicator = document.createElement('div');
    indicator.id = 'redirectinator-extension-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #4285f4;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      opacity: 0.8;
      pointer-events: none;
    `;
    indicator.textContent = '🔍 RA Extension Active';

    document.body.appendChild(indicator);
    console.log('Redirectinator Advanced: Visual indicator added');

    // Auto-hide after 3 seconds
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
        console.log('Redirectinator Advanced: Visual indicator removed');
      }
    }, 3000);
  } catch (error) {
    console.warn('Redirectinator Advanced: Error adding visual indicator:', error);
  }
}

// Listen for messages from the web app
window.addEventListener('message', (event) => {
  // Only accept messages from the same origin
  if (event.source !== window) return;

  if (event.data?.type === 'REDIRECTINATOR_PING') {
    // Log ping responses (can be disabled if too noisy)
    console.log('🏓 Received ping from web app, responding...');
    try {
      const extensionId = typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.id : undefined;
      window.postMessage({
        type: 'REDIRECTINATOR_PONG',
        timestamp: Date.now(),
        extensionId: extensionId,
        version: '1.0.0-local'
      }, '*');
    } catch (error) {
      console.error('❌ Error responding to ping:', error);
    }
  }

  if (event.data?.type === 'REDIRECTINATOR_CONTENT_SCRIPT_PING') {
    // Log content script ping responses (can be disabled if too noisy)
    console.log('🏓 Received content script ping from web app, responding...');
    try {
      const extensionId = typeof chrome !== 'undefined' && chrome.runtime ? chrome.runtime.id : undefined;
      window.postMessage({
        type: 'REDIRECTINATOR_CONTENT_SCRIPT_PONG',
        timestamp: Date.now(),
        extensionId: extensionId,
        version: '1.0.0-local',
        requestId: event.data.requestId
      }, '*');
    } catch (error) {
      console.error('❌ Error responding to content script ping:', error);
    }
  }

    if (event.data?.type === 'REDIRECTINATOR_REQUEST') {
      console.log('🔍 Received URL analysis request from web app:', event.data);
      
      try {
        // Perform comprehensive analysis directly in content script
        console.log('🔍 Starting comprehensive analysis...');
        this.performComprehensiveAnalysis();
        
        // Get the analysis results
        const analysisResults = this.getAnalysisResults();
        console.log('🔍 Comprehensive analysis results:', analysisResults);
        
        // Send results back to the web app
        const responseMessage = {
          type: 'REDIRECTINATOR_RESPONSE',
          requestId: event.data.requestId,
          success: true,
          result: analysisResults,
          error: undefined
        };
        
        console.log('🔍 Sending analysis results to web app:', responseMessage);
        window.postMessage(responseMessage, '*');
        console.log('🔍 Analysis results sent to web app');
        
      } catch (error) {
        console.error('❌ Analysis failed:', error);
        window.postMessage({
          type: 'REDIRECTINATOR_RESPONSE',
          requestId: event.data.requestId,
          success: false,
          error: error.message || 'Analysis failed'
        }, '*');
      }
    }
});

/**
 * Initialize on script load
 */
initializeContentScript();
injectExtensionAPI();
// injectCommunicationBridge(); // Temporarily disabled due to CSP restrictions

/**
 * Send extension ready message to web app
 */
function sendExtensionReady() {
  try {
    window.postMessage({
      type: 'REDIRECTINATOR_EXTENSION_READY',
      timestamp: Date.now(),
      extensionId: chrome.runtime?.id || 'unknown',
      version: '1.0.0-local'
    }, '*');
    console.log('🔗 Extension ready message sent');
  } catch (error) {
    console.error('❌ Error sending extension ready message:', error);
  }
}

/**
 * Add visual indicator that extension is loaded
 */
function addVisualIndicator() {
  try {
    // Create a small, unobtrusive indicator
    const indicator = document.createElement('div');
    indicator.id = 'redirectinator-extension-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 8px;
      height: 8px;
      background: #4CAF50;
      border-radius: 50%;
      z-index: 999999;
      opacity: 0.7;
      pointer-events: none;
    `;
    
    document.body.appendChild(indicator);
    console.log('✅ Visual indicator added');
  } catch (error) {
    console.error('❌ Error adding visual indicator:', error);
  }
}

/**
 * Remove visual indicator
 */
function removeVisualIndicator() {
  try {
    const indicator = document.getElementById('redirectinator-extension-indicator');
    if (indicator) {
      indicator.remove();
      console.log('✅ Visual indicator removed');
    }
  } catch (error) {
    console.error('❌ Error removing visual indicator:', error);
  }
}

// Send ready message when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    sendExtensionReady();
    addVisualIndicator();
  });
} else {
  sendExtensionReady();
  addVisualIndicator();
}

// Send ready message when window loads
window.addEventListener('load', () => {
  console.log('Redirectinator Advanced: Window loaded');
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  removeVisualIndicator();
});

} // End of protocol check conditional
