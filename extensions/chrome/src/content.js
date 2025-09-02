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

    // Also monitor for location changes that might indicate meta refresh execution
    let lastUrl = window.location.href;
    const checkForMetaRefreshRedirect = () => {
      if (window.location.href !== lastUrl) {
        console.log('🔍 Location changed, checking for meta refresh execution');
        // Re-detect meta refresh in case it was added after initial load
        self.detectMetaRefresh();
        lastUrl = window.location.href;
      }
    };

    // Check periodically for location changes
    setInterval(checkForMetaRefreshRedirect, 1000);
    
    // Also check when page becomes visible (in case of background redirects)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        console.log('🔍 Page became visible, checking for meta refresh');
        self.detectMetaRefresh();
      }
    });

    console.log('🔍 Meta refresh monitoring initialized');
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
    return {
      originalUrl: this.originalUrl,
      finalUrl: window.location.href,
      statusCode: null, // Will be determined by background script
      metaRefresh: this.metaRefresh,
      javascriptRedirects: this.javascriptRedirects,
      hasMetaRefresh: !!this.metaRefresh,
      hasJavaScriptRedirect: this.javascriptRedirects.length > 0,
      redirectChain: this.buildRedirectChain(),
      analysisTime: Date.now() - this.startTime,
      detectedAt: new Date().toISOString()
    };
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

    // Add meta refresh if detected
    if (this.metaRefresh) {
      chain.push({
        step: 1,
        url: this.metaRefresh.targetUrl,
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
    
    // Try multiple communication methods with robust fallbacks
    const tryCommunication = async () => {
      try {
        // Method 1: Check if extension context is valid
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.id) {
          throw new Error('Extension context invalid - please reload the extension');
        }
        
        // Method 2: Try port communication first
        console.log('🔍 Attempting port communication...');
        try {
          const port = chrome.runtime.connect({ name: 'CONTENT_SCRIPT_ANALYZE' });
          
          // Set up response listener
          port.onMessage.addListener((response) => {
            console.log('🔍 Port message received:', response);
            
            if (response.type === 'ANALYSIS_RESPONSE') {
              console.log('🔍 Analysis response received:', response);
              
              // Send the response back to the web app
              console.log('🔍 Sending response to web app...');
              const responseMessage = {
                type: 'REDIRECTINATOR_RESPONSE',
                requestId: event.data.requestId,
                success: response.success,
                result: response.result,
                error: response.error
              };
              console.log('🔍 Response message:', responseMessage);
              window.postMessage(responseMessage, '*');
              console.log('🔍 Response sent to web app');
              
              // Close the port
              port.disconnect();
            }
          });
          
          // Send the analysis request
          console.log('🔍 Sending analysis request via port...');
          port.postMessage({
            type: 'CONTENT_SCRIPT_ANALYZE_URL',
            url: event.data.url,
            options: event.data.options,
            requestId: event.data.requestId
          });
          
          // Handle port errors
          port.onDisconnect.addListener(() => {
            console.log('🔍 Port disconnected');
            if (chrome.runtime.lastError) {
              console.error('❌ Port error:', chrome.runtime.lastError);
              // Try fallback method
              tryFallbackCommunication();
            }
          });
          
          // Set timeout for port communication
          setTimeout(() => {
            if (port) {
              console.log('⏰ Port communication timeout, trying fallback...');
              port.disconnect();
              tryFallbackCommunication();
            }
          }, 10000); // 10 second timeout
          
          return; // Success, exit early
          
        } catch (portError) {
          console.log('⚠️ Port communication failed, trying fallback...');
          tryFallbackCommunication();
        }
        
      } catch (error) {
        console.error('❌ All communication methods failed:', error);
        window.postMessage({
          type: 'REDIRECTINATOR_RESPONSE',
          requestId: event.data.requestId,
          success: false,
          error: error.message || 'All communication methods failed'
        }, '*');
      }
    };
    
    // Fallback communication method
    const tryFallbackCommunication = async () => {
      console.log('🔄 Trying fallback communication method...');
      try {
        // Method 3: Try direct runtime message
        const response = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({
            type: 'CONTENT_SCRIPT_ANALYZE_URL',
            url: event.data.url,
            options: event.data.options,
            requestId: event.data.requestId
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
        
        console.log('✅ Fallback communication successful:', response);
        window.postMessage({
          type: 'REDIRECTINATOR_RESPONSE',
          requestId: event.data.requestId,
          success: true,
          result: response,
          error: undefined
        }, '*');
        
      } catch (fallbackError) {
        console.error('❌ Fallback communication also failed:', fallbackError);
        window.postMessage({
          type: 'REDIRECTINATOR_RESPONSE',
          requestId: event.data.requestId,
          success: false,
          error: `All communication methods failed: ${fallbackError.message}`
        }, '*');
      }
    };
    
    // Start the communication process
    tryCommunication();
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
