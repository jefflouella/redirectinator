/**
 * Redirectinator Advanced - Background Script
 * Handles URL analysis, tab management, and communication with web app
 */

// Background script initialization
console.log('🔧 Redirectinator Advanced Background Script Loading...');

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('🔧 Redirectinator Advanced: Extension installed/reloaded');
});

// Get extension info
chrome.management.getSelf((info) => {
  console.log('🔧 Redirectinator Advanced Background Script Loaded Successfully');
  console.log('🔧 Extension ID:', info.id);
  console.log('🔧 Manifest:', info.manifest);
});

// Track redirects during navigation (global scope)
const navigationRedirects = new Map();

// Track analysis results from each navigation step
const analysisResults = new Map();

// Tab management system (like Redirect Path extension)
const tabs = {};

// Record client details (like Redirect Path extension)
function recordClientDetails(request, sender) {
  var tabId = sender.tab.id;
  var tab = getTab(tabId);

  if (request.userClicked) {
    tab.userClicked = true;
    console.log('🔍 User click recorded for tab:', tabId);
  } else if (request.metaRefreshDetails) {
    tab.meta[sender.tab.url] = request.metaRefreshDetails;
    console.log('🔍 Meta refresh recorded for tab:', tabId, request.metaRefreshDetails);
  }

  setTab(tabId, tab);
}

// Get tab data (like Redirect Path extension)
function getTab(tabId) {
  if (typeof(tabs[tabId]) != 'undefined') {
    return tabs[tabId];
  }

  // Not seen this tab, init it
  return {
    path: [],
    meta: {},
    serverClientSyncPath: {
      client: {},
      server: {}
    },
    previousClientRequest: null,
    userClicked: false
  };
}

// Set tab data (like Redirect Path extension)
function setTab(tabId, tab) {
  tabs[tabId] = tab;
}

// Get client request by URL (like Redirect Path extension)
function getClientRequestByUrl(tabId, url) {
  var tab = getTab(tabId);
  return tab.serverClientSyncPath.client[url] || null;
}

// Get server request by URL (like Redirect Path extension)
function getServerRequestByUrl(tabId, url) {
  var tab = getTab(tabId);
  return tab.serverClientSyncPath.server[url] || null;
}

// Set client request by URL (like Redirect Path extension)
function setClientRequestByUrl(tabId, request) {
  var tab = getTab(tabId);
  tab.serverClientSyncPath.client[request.url] = request;
  setTab(tabId, tab);
}

// Set server request by URL (like Redirect Path extension)
function setServerRequestByUrl(tabId, request) {
  var tab = getTab(tabId);
  tab.serverClientSyncPath.server[request.url] = request;
  setTab(tabId, tab);
}

// Server-client path sync (like Redirect Path extension)
function onServerClientPathSync(tabId, url) {
  // This "event" will execute when both final client (webNavigation) and server (webRequest) events have been received.
  // We need data from both of the callbacks to determine what type of redirect this was, and if we need to reset the path etc.

  var currentClientRequestDetails = getClientRequestByUrl(tabId, url);
  var currentServerRequestDetails = getServerRequestByUrl(tabId, url);

  // Both populated, we're clear to proceed.
  if (currentClientRequestDetails && currentServerRequestDetails) {
    console.log('🔍 Server-client sync for URL:', url);
    
    // Build the pathItem object with what we know so far
    var pathItem = {
      type: 'normal',
      redirect_type: 'none',
      status_code: currentServerRequestDetails.statusCode,
      url: currentServerRequestDetails.url,
      ip: (currentServerRequestDetails.ip) ? currentServerRequestDetails.ip : '(not available)',
      headers: currentServerRequestDetails.responseHeaders,
      status_line: currentServerRequestDetails.statusLine
    };

    var tab = getTab(tabId);

    // Forward/back can get trapped by JS (pushState) so if we pick up that
    // qualifier mark it as user generated (which it is)
    if (currentClientRequestDetails.transitionQualifiers.indexOf('forward_back') !== -1) {
      tab.userClicked = true;
    }

    // We got here from a client redirect, so the path hasn't ended yet. Also the user hasn't fired any click events
    // on this page.
    if (currentClientRequestDetails.transitionQualifiers.indexOf('client_redirect') !== -1 && tab.userClicked !== true) {
      tab = setClientRedirectData(tab, currentClientRequestDetails);
    }

    tab.userClicked = false;

    // Every time the path "syncs" like this, we can discard any of the meta data about
    // the previous URLs in the path, we will "render" it down in to the path anyway.
    tab.serverClientSyncPath = {
      client: {},
      server: {}
    };

    recordPathItem(tabId, pathItem);
    tab.previousClientRequest = currentClientRequestDetails;
    setTab(tabId, tab);
  }
}

// Set client redirect data (like Redirect Path extension)
function setClientRedirectData(tab, currentClientRequestDetails) {
  // Btw, we're editing the pathItem for the PREVIOUS client request to set the details of the
  // client request it initiated. Get the path, as well as the previous client
  // request to match urls and what not.
  if (tab.previousClientRequest) {
    var indexToModify = tab.path.map(function (el, idx) {
      return el.url;
    }).lastIndexOf(tab.previousClientRequest.url);

    // lastIndexOf above so we get the most recent client url. This only matters
    // in a refresh scenario where using indexOf doesn't work.

    var pathItemToModify = tab.path[indexToModify];

    pathItemToModify.type = 'client_redirect';
    pathItemToModify.redirect_type = 'javascript';

    // Default, set the redirect url to the current client URL, but this
    // won't be correct if we got here via a server redirect. The next
    // if takes care of that
    pathItemToModify.redirect_url = currentClientRequestDetails.url;

    // Set the redirect URL to the URL that came right after the last
    // client request in the path if there is such a thing. Picks up
    // client > server redirects.
    if (tab.path[(indexToModify + 1)]) {
      pathItemToModify.redirect_url = tab.path[(indexToModify + 1)].url;
    }

    if (typeof(tab.meta[tab.previousClientRequest.url]) !== 'undefined') {
      var metaInformation = tab.meta[tab.previousClientRequest.url];

      pathItemToModify.redirect_type = 'meta'
      pathItemToModify.redirect_url = metaInformation.url;
      pathItemToModify.meta_timer = metaInformation.timer;
    }

    tab.path[indexToModify] = pathItemToModify;
  }

  return tab;
}

// Record path item (like Redirect Path extension)
function recordPathItem(tabId, pathItem) {
  if (tabId > 0) {
    var tab = getTab(tabId);

    tab.lastactive = new Date().getTime();

    // Fill in optional stuff
    pathItem.redirect_url = pathItem.redirect_url || null;
    pathItem.meta_timer = pathItem.meta_timer || null;

    tab.path.push(pathItem);

    // Limit the path to 20 steps.
    if (tab.path.length > 20) {
      var step = tab.path.shift();
      console.info(tabId, 'Path was too long - removed the first step on the path', step);
    }

    setTab(tabId, tab);
    
    console.log('🔍 Path item recorded:', pathItem);
  }
}

// Set up webRequest listeners to capture HTTP redirects (following Redirect Path extension pattern)
console.log('🔍 Setting up WebRequest API listeners for redirect detection...');

try {
  // Define request filter for main frame requests only
  const REQUEST_FILTER = {'urls': ['<all_urls>'], 'types': ['main_frame']};
  const EXTRA_INFO = ['responseHeaders'];

  // Listen for redirects using webRequest API (like Redirect Path extension)
  chrome.webRequest.onBeforeRedirect.addListener((details) => {
    if (details.frameType == "outermost_frame") { 
      console.log('🔍 HTTP redirect detected via webRequest:', {
        from: details.url,
        to: details.redirectUrl,
        statusCode: details.statusCode,
        type: details.type,
        tabId: details.tabId
      });
      
      recordPathItem(details.tabId, {
        type: 'server_redirect',
        redirect_type: details.statusCode,
        status_code: details.statusCode,
        url: details.url,
        redirect_url: details.redirectUrl,
        ip: (details.ip) ? details.ip : '(not available)',
        headers: details.responseHeaders,
        status_line: details.statusLine
      });
    }
  }, REQUEST_FILTER, EXTRA_INFO);

  // Listen for completed requests (like Redirect Path extension)
  chrome.webRequest.onCompleted.addListener((details) => {
    if (details.frameType == "outermost_frame") {
      console.log('🔍 Request completed:', details.url, 'Status:', details.statusCode);
      setServerRequestByUrl(details.tabId, details);
      onServerClientPathSync(details.tabId, details.url);
    }
  }, REQUEST_FILTER, EXTRA_INFO);

  // Also use webNavigation for additional navigation events (like Redirect Path extension)
  if (chrome.webNavigation && chrome.webNavigation.onCommitted) {
    chrome.webNavigation.onCommitted.addListener(async (details) => {
      if (details.frameId === 0) { // Main frame only
        console.log('🔍 Navigation committed:', details.url, 'Type:', details.transitionType);
        
        // Set client request by URL (like Redirect Path extension)
        setClientRequestByUrl(details.tabId, details);
        
        // Sync server and client data (like Redirect Path extension)
        onServerClientPathSync(details.tabId, details.url);
      }
    });
  }
  
  console.log('✅ WebRequest API listeners initialized successfully');
} catch (error) {
  console.warn('⚠️ Error setting up WebRequest API listeners:', error);
  console.log('🔄 Falling back to basic redirect detection methods');
}

class UrlAnalysisQueue {
  constructor(maxConcurrent = 3) {
    this.queue = [];
    this.running = 0;
    this.maxConcurrent = maxConcurrent;
  }

  async add(url, options) {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, options, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.running >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    const { url, options, resolve, reject } = this.queue.shift();
    this.running++;

    try {
      const result = await analyzeUrlComprehensive(url, options);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.processQueue();
    }
  }
}

class AnalysisCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < 300000) { // 5 minutes
      return item.data;
    }
    this.cache.delete(key);
    return null;
  }

  set(key, data) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
  }
}

class ExtensionHealthMonitor {
  constructor() {
    this.startTime = Date.now();
    this.metrics = {
      totalAnalyses: 0,
      successfulAnalyses: 0,
      failedAnalyses: 0,
      averageAnalysisTime: 0,
      lastAnalysisTime: null
    };
  }

  recordAnalysis(success, analysisTime) {
    this.metrics.totalAnalyses++;
    this.metrics.lastAnalysisTime = Date.now();

    if (success) {
      this.metrics.successfulAnalyses++;
    } else {
      this.metrics.failedAnalyses++;
    }

    // Update average analysis time
    const currentAvg = this.metrics.averageAnalysisTime;
    const total = this.metrics.totalAnalyses;
    this.metrics.averageAnalysisTime = (currentAvg * (total - 1) + analysisTime) / total;
  }

  getHealthReport() {
    const successRate = this.metrics.totalAnalyses > 0
      ? (this.metrics.successfulAnalyses / this.metrics.totalAnalyses) * 100
      : 0;

    return {
      ...this.metrics,
      successRate: Math.round(successRate * 100) / 100,
      uptime: Date.now() - this.startTime
    };
  }
}

// Global instances
const analysisQueue = new UrlAnalysisQueue();
const analysisCache = new AnalysisCache();
const healthMonitor = new ExtensionHealthMonitor();

// Tab tracking for analysis
const activeAnalyses = new Map();

/**
 * Wait for a tab to finish loading
 */
async function waitForTabLoad(tabId, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Tab load timeout'));
    }, timeout);

    function checkTab() {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          clearTimeout(timeoutId);
          reject(new Error('Tab no longer exists'));
          return;
        }

        if (tab.status === 'complete') {
          clearTimeout(timeoutId);
          resolve(tab);
        } else {
          setTimeout(checkTab, 100);
        }
      });
    }

    checkTab();
  });
}

/**
 * Comprehensive URL analysis function
 */
async function analyzeUrlComprehensive(url, options = {}) {
  const maxRetries = options.maxRetries || 2;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await performAnalysis(url, options);
    } catch (error) {
      lastError = error;
      console.warn(`Analysis attempt ${attempt} failed for ${url}:`, error);

      if (attempt < maxRetries) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // All attempts failed
  throw new Error(`Failed to analyze ${url} after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Core analysis implementation
 */
async function performAnalysis(url, options = {}) {
  console.log('🔍 performAnalysis called with:', url, options);
  
  try {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    console.log('🔍 Cache key created:', cacheKey);

    // Check cache first
    const cachedResult = analysisCache.get(cacheKey);
    if (cachedResult) {
      console.log('Returning cached result for:', url);
      return cachedResult;
    }
    console.log('🔍 No cached result found, proceeding with analysis');

    const startTime = Date.now();
    const results = {
      originalUrl: url,
      startTime,
      redirectChain: [],
      httpRedirects: [],
      metaRefresh: null,
      javascriptRedirects: [],
      finalUrl: url,
      finalStatusCode: null,
      analysisTime: 0,
      status: 'pending',
      detectionMode: 'advanced',
      extensionVersion: '1.0.0'
    };
    console.log('🔍 Results object created');

    let tab = null;
    console.log('🔍 Variables initialized');

    try {
      console.log('🔍 Starting analysis for:', url);

      // Step 1: Follow HTTP redirects first to get the full chain
      console.log('🔍 Step 1: Following HTTP redirects...');
      const httpRedirects = await followHttpRedirects(url, options.maxRedirects || 10);
      console.log('🔍 HTTP redirects found:', httpRedirects);

      // Step 2: Create tab with ORIGINAL URL to capture meta refresh and JavaScript redirects
      console.log('🔍 Step 2: Creating tab with original URL for early detection...');
      try {
        tab = await chrome.tabs.create({
          url: url, // Use original URL, not final URL
          active: false
        });
        console.log('🔍 Tab created with ID:', tab.id, 'and original URL:', url);
      } catch (tabError) {
        console.error('❌ Failed to create tab:', tabError);
        throw new Error(`Failed to create analysis tab: ${tabError.message}`);
      }
      
      // Store analysis reference
      activeAnalyses.set(tab.id, results);

      // Inject content script IMMEDIATELY after tab creation to ensure it runs on original page
      console.log('🔍 Injecting content script IMMEDIATELY after tab creation for original page detection...');
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['src/content.js']
        });
        console.log('✅ Content script injected successfully into original page');
      } catch (injectError) {
        console.error('❌ Failed to inject content script:', injectError);
        // Continue without content script analysis
      }

      // Wait for page to load and navigate through redirects
      console.log('🔍 Waiting for tab to load and navigate through redirects...');
      try {
        await waitForTabLoad(tab.id, options.timeout || 15000);
        console.log('✅ Tab loaded successfully');
      } catch (loadError) {
        console.error('❌ Tab load failed:', loadError);
        throw new Error(`Tab load timeout: ${loadError.message}`);
      }

      // Get final URL from tab after all redirects
      const tabInfo = await chrome.tabs.get(tab.id);
      results.finalUrl = tabInfo.url;
      console.log('🔍 Final URL after navigation:', results.finalUrl);

      // Store HTTP redirects from the chain following
      results.httpRedirects = httpRedirects.redirects || [];
      console.log('🔍 HTTP redirects stored:', results.httpRedirects.length);

    // Wait for content script to initialize and analyze the original page
    console.log('🔍 Waiting for content script to analyze original page...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Give more time for detection

    // Get analysis results from content script BEFORE navigation
    console.log('🔍 Requesting analysis from content script on original page...');
    let analysisResults = {};
    try {
      analysisResults = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.warn('⏰ Content script analysis timeout on original page');
          resolve({}); // Resolve with empty results instead of rejecting
        }, 10000);

        function messageHandler(message) {
          if (message.type === 'CONTENT_ANALYSIS_COMPLETE' && message.tabId === tab.id) {
            console.log('✅ Content script analysis complete on original page:', message.data);
            clearTimeout(timeout);
            chrome.runtime.onMessage.removeListener(messageHandler);
            resolve(message.data);
          }
        }

        chrome.runtime.onMessage.addListener(messageHandler);

        // Request analysis from content script
        try {
          chrome.tabs.sendMessage(tab.id, {
            type: 'START_ANALYSIS',
            tabId: tab.id,
            originalUrl: url
          });
        } catch (sendError) {
          console.error('❌ Failed to send message to content script:', sendError);
          clearTimeout(timeout);
          resolve({}); // Continue with empty analysis results
        }
      });
    } catch (analysisError) {
      console.error('❌ Content script analysis failed:', analysisError);
      analysisResults = {}; // Continue with empty analysis results
    }

    // Store the analysis results from the original page
    console.log('🔍 Analysis results from original page:', analysisResults);

    // Build comprehensive redirect chain
    console.log('🔍 Building comprehensive redirect chain...');
    const redirectChain = [];
    
    // Add original URL
    redirectChain.push({
      step: 0,
      url: url,
      type: 'original',
      statusCode: null,
      timestamp: startTime
    });

    // Add HTTP redirects from the chain following
    if (results.httpRedirects && results.httpRedirects.length > 0) {
      results.httpRedirects.forEach((redirect, index) => {
        redirectChain.push({
          step: redirectChain.length,
          url: redirect.url,
          type: 'http_redirect',
          statusCode: redirect.statusCode,
          method: redirect.method || 'GET',
          from: redirect.from || redirect.url,
          targetUrl: redirect.targetUrl || redirect.to,
          timestamp: redirect.timestamp || Date.now()
        });
      });
    }

    // Add HTTP redirects captured during navigation via webRequest
    const tabNavigationRedirects = navigationRedirects.get(tab.id) || [];
    if (tabNavigationRedirects.length > 0) {
      console.log('🔍 Adding webRequest-captured redirects:', tabNavigationRedirects.length);
      tabNavigationRedirects.forEach((redirect, index) => {
        redirectChain.push({
          step: redirectChain.length,
          url: redirect.url,
          type: 'http_redirect',
          statusCode: redirect.statusCode,
          method: redirect.method || 'GET',
          from: redirect.url,
          targetUrl: redirect.targetUrl,
          timestamp: redirect.timestamp
        });
      });
    }

    // Add redirects derived from Redirect Path style tab path data
    try {
      const tabData = getTab(tab.id);
      if (tabData && Array.isArray(tabData.path) && tabData.path.length > 0) {
        console.log('🔍 Merging Redirect Path tab path items:', tabData.path.length);
        tabData.path.forEach((item) => {
          if (item.type === 'server_redirect') {
            redirectChain.push({
              step: redirectChain.length,
              url: item.url,
              type: 'http_redirect',
              statusCode: item.status_code,
              method: 'GET',
              from: item.url,
              targetUrl: item.redirect_url || undefined,
              timestamp: Date.now()
            });
          } else if (item.type === 'client_redirect') {
            if (item.redirect_type === 'meta') {
              redirectChain.push({
                step: redirectChain.length,
                url: item.redirect_url || item.url,
                type: 'meta_refresh',
                method: 'meta',
                from: item.url,
                targetUrl: item.redirect_url || undefined,
                delay: item.meta_timer ? parseInt(item.meta_timer) || 0 : undefined,
                timestamp: Date.now()
              });
            } else {
              // javascript
              redirectChain.push({
                step: redirectChain.length,
                url: item.redirect_url || item.url,
                type: 'javascript',
                method: 'javascript',
                from: item.url,
                targetUrl: item.redirect_url || undefined,
                timestamp: Date.now()
              });
            }
          }
        });
      }
    } catch (mergeErr) {
      console.warn('⚠️ Failed to merge tab path items:', mergeErr);
    }

    // Add meta refresh redirects from content script
    if (analysisResults.metaRefreshRedirects && analysisResults.metaRefreshRedirects.length > 0) {
      analysisResults.metaRefreshRedirects.forEach(redirect => {
        redirectChain.push({
          step: redirectChain.length,
          url: redirect.to,
          type: 'meta_refresh',
          method: redirect.method,
          from: redirect.from,
          targetUrl: redirect.targetUrl,
          delay: redirect.delay,
          timestamp: redirect.timestamp
        });
      });
    }

    // Add JavaScript redirects from content script
    if (analysisResults.javascriptRedirects && analysisResults.javascriptRedirects.length > 0) {
      analysisResults.javascriptRedirects.forEach(redirect => {
        redirectChain.push({
          step: redirectChain.length,
          url: redirect.to,
          type: 'javascript',
          method: redirect.method,
          from: redirect.from,
          timestamp: redirect.timestamp
        });
      });
    }

    // Add final URL if not already included
    if (!redirectChain.some(step => step.url === results.finalUrl)) {
      redirectChain.push({
        step: redirectChain.length,
        url: results.finalUrl,
        type: 'final',
        statusCode: 200, // Assume successful final load
        timestamp: Date.now()
      });
    }

    // Process results
    results.redirectChain = redirectChain;
    results.metaRefresh = analysisResults.metaRefresh;
    results.javascriptRedirects = analysisResults.javascriptRedirects || [];
    results.metaRefreshRedirects = analysisResults.metaRefreshRedirects || [];
    results.hasMetaRefresh = !!(results.metaRefresh || (results.metaRefreshRedirects && results.metaRefreshRedirects.length > 0));
    results.hasJavaScriptRedirect = results.javascriptRedirects.length > 0;
    results.status = 'success';

    console.log('✅ Analysis complete. Chain length:', redirectChain.length);
    console.log('🔗 Final redirect chain:', redirectChain);

  } catch (error) {
    console.error('❌ Analysis error:', error);
    results.status = 'error';
    results.error = error.message;
  } finally {
    // Clean up tab
    if (tab?.id) {
      try {
        await chrome.tabs.remove(tab.id);
        console.log('🔍 Analysis tab removed');
      } catch (e) {
        console.warn('Could not remove tab:', e);
      }
      activeAnalyses.delete(tab.id);
      navigationRedirects.delete(tab.id); // Clean up navigation redirects
    }

    results.analysisTime = Date.now() - startTime;

    // Record metrics
    healthMonitor.recordAnalysis(results.status === 'success', results.analysisTime);

    // Cache successful results
    if (results.status === 'success') {
      analysisCache.set(cacheKey, results);
    }
  }

    return results;
  
  } catch (outerError) {
    console.error('❌ CRITICAL: Outer error in performAnalysis:', outerError);
    console.error('❌ CRITICAL: Outer error stack:', outerError.stack);
    
    // Return a basic error result instead of throwing
    return {
      originalUrl: url,
      startTime: Date.now(),
      redirectChain: [],
      httpRedirects: [],
      metaRefresh: null,
      javascriptRedirects: [],
      finalUrl: url,
      finalStatusCode: null,
      analysisTime: 0,
      status: 'error',
      error: `Critical error: ${outerError.message}`,
      detectionMode: 'advanced',
      extensionVersion: '1.0.0'
    };
  }
}

/**
 * Handle messages from web app and content scripts
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('🔍 Background script received message:', request.type, request);
  console.log('🔍 Sender:', sender);
  console.log('🔍 Message details:', { type: request.type, hasType: !!request.type, keys: Object.keys(request) });

  if (request.type === 'WEB_APP_ANALYZE_URL') {
    console.log('Processing URL analysis request:', request.url);
    // Handle web app analysis request
    analysisQueue.add(request.url, request.options || {})
      .then(result => {
        console.log('Analysis completed successfully:', result);
        sendResponse({ success: true, result });
      })
      .catch(error => {
        console.error('Analysis failed:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // Keep message channel open for async response
  }

  if (request.type === 'CONTENT_ANALYSIS_COMPLETE') {
    // Handle content script analysis completion
    const analysis = activeAnalyses.get(request.tabId);
    if (analysis) {
      // Process and store results
      Object.assign(analysis, request.data);
    }
    sendResponse({ received: true });
    return true;
  }

  // Handle meta refresh detection (like Redirect Path extension)
  if (request.name === 'metaRefreshDetect') {
    console.log('🔍 Received metaRefreshDetect message:', request);
    recordClientDetails(request, sender);
    sendResponse({ received: true });
    return true;
  }

  if (request.type === 'GET_HEALTH_REPORT') {
    // Return extension health metrics
    sendResponse(healthMonitor.getHealthReport());
    return true;
  }

  if (request.type === 'CLEAR_CACHE') {
    // Clear the analysis cache
    try {
      analysisCache.clear();
      console.log('🧹 Analysis cache cleared via popup request');
      sendResponse({ success: true, message: 'Cache cleared successfully' });
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }

  if (request.type === 'PING') {
    console.log('🏓 Received PING from web app - responding with PONG');
    const response = {
      type: 'PONG',
      version: '1.0.0-local',
      timestamp: Date.now(),
      status: 'active',
      extensionId: chrome.runtime.id
    };
    console.log('🏓 Sending PONG response:', response);
    sendResponse(response);
    return true;
  }

  // Handle ANALYZE_URL_REQUEST (for main app communication)
  if (request.type === 'ANALYZE_URL_REQUEST') {
    console.log('🔍 Runtime: Received ANALYZE_URL_REQUEST from main app:', request.url);
    
    const responseTabId = sender?.tab?.id;
    const requestId = request.requestId;

    try {
      console.log('🔍 Runtime: Starting performAnalysis for main app...');

      // Perform the analysis
      performAnalysis(request.url, request.options || {})
        .then(result => {
          console.log('🔍 Runtime: Analysis completed successfully for main app');
          
          // Send response via sendResponse for runtime messages
          sendResponse({
            success: true,
            result: result
          });
        })
        .catch(error => {
          console.error('❌ Runtime: Analysis failed for main app:', error);
          
          // Send error response via sendResponse for runtime messages
          sendResponse({
            success: false,
            error: error.message
          });
        });

      // Return true to keep message channel open for async response
      return true;
    } catch (syncError) {
      console.error('❌ Runtime: Synchronous error in ANALYZE_URL_REQUEST handler:', syncError);
      
      // Send synchronous error response
      sendResponse({
        success: false,
        error: `Synchronous error: ${syncError.message}`
      });
      return true;
    }
  }

  if (request.type === 'GET_INFO') {
    console.log('🔍 Received GET_INFO request');
    sendResponse({
      version: '1.0.0-local',
      status: 'active',
      extensionId: chrome.runtime.id,
      timestamp: Date.now()
    });
    return true;
  }

  if (request.type === 'CONTENT_SCRIPT_ANALYZE_URL') {
    console.log('🔍 Received URL analysis request from content script:', request.url);
    console.log('🔍 Request details:', request);
    console.log('🔍 Sender:', sender);

    // Use the old function for backward compatibility
    console.log('⚠️ Using legacy performAdvancedUrlAnalysis function');

    console.log('🔍 Starting performAdvancedUrlAnalysis...');
    performAdvancedUrlAnalysis(request.url, request.options || {})
      .then((result) => {
        console.log('🔍 Analysis completed successfully, sending response:', result);
        sendResponse({ success: true, result });
        console.log('🔍 Response sent successfully');
      })
      .catch((error) => {
        console.error('❌ Advanced URL analysis failed:', error);
        console.error('❌ Error details:', error.message, error.stack);
        sendResponse({ success: false, error: error.message });
        console.log('🔍 Error response sent');
      });

    // Keep the message channel open for async response
    return true;
  }

  // ANALYZE_URL_REQUEST handler moved above to handle both main app and content script requests

  if (request.type === 'TEST_CONNECTION') {
    console.log('🧪 Received TEST_CONNECTION from web app');
    sendResponse({
      type: 'CONNECTION_OK',
      message: 'Background script is responding',
      timestamp: Date.now()
    });
    return true;
  }

  console.log('Unhandled message type:', request.type);
});

/**
 * Follow HTTP redirects using fetch requests to build the complete redirect chain
 */
async function followHttpRedirects(url, maxRedirects = 10) {
  console.log('🔍 Following HTTP redirects for:', url);
  
  const redirects = [];
  let currentUrl = url;
  let redirectCount = 0;
  let finalUrl = url;
  let finalStatusCode = 200;
  
  try {
    // Follow redirects step by step
    while (redirectCount < maxRedirects) {
      console.log(`🔍 Checking redirect ${redirectCount + 1}: ${currentUrl}`);
      
      try {
        // Make a HEAD request to check for redirects
        const response = await fetch(currentUrl, {
          method: 'HEAD',
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        
        const status = response.status;
        console.log(`🔍 Response status: ${status} for ${currentUrl}`);
        
        if (status >= 300 && status < 400) {
          // This is a redirect
          const location = response.headers.get('location');
          if (!location) {
            console.log('⚠️ Redirect response missing Location header');
            break;
          }
          
          // Resolve relative URLs
          const resolvedUrl = new URL(location, currentUrl).href;
          console.log(`🔍 Redirect ${status} from ${currentUrl} to ${resolvedUrl}`);
          
          // Add to redirect chain
          redirects.push({
            step: redirectCount + 1,
            url: currentUrl,
            type: 'server_redirect',
            targetUrl: resolvedUrl,
            method: 'http',
            statusCode: status,
            redirectType: status === 301 ? 'permanent' : 'temporary',
            timestamp: Date.now()
          });
          
          // Update current URL and continue
          currentUrl = resolvedUrl;
          redirectCount++;
          finalUrl = resolvedUrl;
          finalStatusCode = status;
          
        } else if (status >= 200 && status < 300) {
          // Success - no more redirects
          console.log(`✅ Final page reached: ${currentUrl} with status ${status}`);
          finalUrl = currentUrl;
          finalStatusCode = status;
          break;
        } else {
          // Error status
          console.log(`❌ Error status ${status} for ${currentUrl}`);
          finalUrl = currentUrl;
          finalStatusCode = status;
          break;
        }
        
      } catch (error) {
        console.error(`❌ Error checking ${currentUrl}:`, error);
        break;
      }
    }
    
    console.log(`🏁 HTTP redirect following complete. Found ${redirects.length} redirects`);
    return {
      redirects: redirects,
      finalUrl: finalUrl,
      finalStatusCode: finalStatusCode
    };
    
  } catch (error) {
    console.error('❌ Error following HTTP redirects:', error);
    return {
      redirects: redirects,
      finalUrl: currentUrl,
      finalStatusCode: 0
    };
  }
}

/**
 * Perform advanced URL analysis using content script injection and redirect following
 */
async function performAdvancedUrlAnalysis(url, options = {}) {
  console.log('🔍 Starting advanced URL analysis for:', url);
  console.log('🔍 Options:', options);
  console.log('🔍 Function called successfully');
  const startTime = Date.now();
  
  try {
    // Step 1: Follow HTTP redirects to get the full server-side chain
    console.log('🔍 Step 1: Following HTTP redirects...');
    const httpRedirects = await followHttpRedirects(url, options.maxRedirects || 10);
    console.log('🔍 HTTP redirects found:', httpRedirects);
    
    // Step 2: Create a tab to analyze the final page for client-side redirects
    console.log('🔍 Step 2: Analyzing final page for client-side redirects...');
    const tab = await chrome.tabs.create({
      url: httpRedirects.finalUrl,
      active: false
    });
    
    console.log('📑 Created analysis tab:', tab.id);
    
    // Wait for the page to load
    await new Promise((resolve) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          resolve();
        }
      });
    });
    
    console.log('✅ Page loaded, waiting for JavaScript redirects to execute...');
    
    // Wait additional time for JavaScript redirects to execute
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    
    // Check if the URL has changed due to JavaScript redirects
    const tabInfo = await chrome.tabs.get(tab.id);
    const currentUrl = tabInfo.url;
    console.log('🔍 Current tab URL after waiting:', currentUrl);
    
    // If URL changed, wait a bit more for any additional redirects
    if (currentUrl !== httpRedirects.finalUrl) {
      console.log('🔄 URL changed, waiting for additional redirects...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 more seconds
      const finalTabInfo = await chrome.tabs.get(tab.id);
      console.log('🔍 Final tab URL:', finalTabInfo.url);
    }
    
    console.log('🔍 Injecting analysis script...');
    
    // Inject the analysis script to detect client-side redirects
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: analyzePageForRedirects,
      args: [httpRedirects.finalUrl]
    });
    
    const analysisResult = results[0]?.result;
    console.log('📊 Client-side analysis results:', analysisResult);
    
    // Close the analysis tab
    await chrome.tabs.remove(tab.id);
    
    // Step 3: Build comprehensive redirect chain
    const comprehensiveChain = [];
    let stepCounter = 0;
    
    // Add all HTTP redirects first
    httpRedirects.redirects.forEach((redirect) => {
      comprehensiveChain.push({
        step: ++stepCounter,
        url: redirect.url,
        type: 'server_redirect',
        statusCode: redirect.statusCode,
        targetUrl: redirect.targetUrl,
        method: 'HTTP',
        redirectType: redirect.redirectType,
        timestamp: redirect.timestamp
      });
    });
    
    // Add meta refresh redirects
    if (analysisResult?.hasMetaRefresh && analysisResult.metaRefresh) {
      comprehensiveChain.push({
        step: ++stepCounter,
        url: httpRedirects.finalUrl,
        type: 'client_redirect',
        statusCode: 200,
        targetUrl: analysisResult.metaRefresh.targetUrl,
        method: 'Meta Refresh',
        delay: analysisResult.metaRefresh.delay,
        timestamp: analysisResult.metaRefresh.detectedAt || Date.now()
      });
      
      // If meta refresh target is different from current final URL, check for more redirects
      if (analysisResult.metaRefresh.targetUrl !== analysisResult.finalUrl) {
        console.log('🔍 Checking for additional redirects after meta refresh...');
        try {
          const metaTargetRedirects = await followHttpRedirects(analysisResult.metaRefresh.targetUrl, 5);
          metaTargetRedirects.redirects.forEach((redirect) => {
            comprehensiveChain.push({
              step: ++stepCounter,
              url: redirect.url,
              type: 'server_redirect',
              statusCode: redirect.statusCode,
              targetUrl: redirect.targetUrl,
              method: 'HTTP',
              redirectType: redirect.redirectType,
              timestamp: redirect.timestamp
            });
          });
        } catch (error) {
          console.error('❌ Error checking meta refresh target redirects:', error);
        }
      }
    }
    
    // Add JavaScript redirects
    if (analysisResult?.hasJavaScriptRedirect && analysisResult.javascriptRedirects) {
      analysisResult.javascriptRedirects.forEach((jsRedirect) => {
        comprehensiveChain.push({
          step: ++stepCounter,
          url: jsRedirect.from,
          type: 'javascript_redirect',
          statusCode: 200,
          targetUrl: jsRedirect.to,
          method: 'JavaScript',
          timestamp: jsRedirect.timestamp
        });
      });
    }
    
    // Determine final URL and status
    let finalUrl = httpRedirects.finalUrl;
    let finalStatusCode = httpRedirects.finalStatusCode;
    
    if (analysisResult?.finalUrl && analysisResult.finalUrl !== httpRedirects.finalUrl) {
      finalUrl = analysisResult.finalUrl;
      finalStatusCode = 200; // Client-side redirects typically result in 200
    }
    
    // Build redirect types summary
    const redirectTypes = [];
    const statusCodes = new Set();
    
    comprehensiveChain.forEach(step => {
      if (step.statusCode) {
        statusCodes.add(step.statusCode);
      }
      
      if (step.type === 'server_redirect') {
        redirectTypes.push({
          type: 'http',
          statusCode: step.statusCode,
          url: step.url,
          targetUrl: step.targetUrl
        });
      } else if (step.type === 'client_redirect') {
        redirectTypes.push({
          type: 'meta',
          url: step.url,
          targetUrl: step.targetUrl,
          delay: step.delay
        });
      } else if (step.type === 'javascript_redirect') {
        redirectTypes.push({
          type: 'javascript',
          url: step.url,
          targetUrl: step.targetUrl
        });
      }
    });
    
    const analysisTime = Date.now() - startTime;
    
    return {
      originalUrl: url,
      finalUrl: finalUrl,
      finalStatusCode: finalStatusCode,
      redirectCount: comprehensiveChain.length,
      redirectChain: comprehensiveChain,
      redirectChainDetails: comprehensiveChain,
      redirectTypes: redirectTypes,
      hasMetaRefresh: analysisResult?.hasMetaRefresh || false,
      hasJavaScriptRedirect: analysisResult?.hasJavaScriptRedirect || false,
      javascriptRedirects: analysisResult?.javascriptRedirects || [],
      detectionMode: 'advanced',
      extensionVersion: '1.0.0-local',
      analysisTime: analysisTime,
      status: 'success'
    };
    
  } catch (error) {
    console.error('❌ Advanced analysis failed:', error);
    throw error;
  }
}

/**
 * Content script function to analyze page for redirects with enhanced JavaScript detection
 */
async function analyzePageForRedirects(originalUrl) {
  console.log('🔍 Analyzing page for redirects:', originalUrl);
  
  const results = {
    originalUrl: originalUrl,
    finalUrl: window.location.href,
    statusCode: 200, // We can't get HTTP status from content script
    redirectCount: 0,
    redirectChain: [],
    hasMetaRefresh: false,
    hasJavaScriptRedirect: false,
    javascriptRedirects: []
  };
  
  // Enhanced Meta Refresh detection with execution monitoring
  const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
  if (metaRefresh) {
    const content = metaRefresh.getAttribute('content');
    if (content) {
      const parts = content.split(';');
      if (parts.length > 1) {
        const delay = parseInt(parts[0]) || 0;
        const urlPart = parts.find(part => part.toLowerCase().startsWith('url='));
        
        if (urlPart) {
          const targetUrl = urlPart.substring(4); // Remove "url=" prefix
          
          console.log('🔍 Meta refresh detected:', { delay, targetUrl, originalUrl });
          
          // Wait for the meta refresh to potentially execute
          if (delay > 0) {
            // If there's a delay, wait for it plus some buffer time
            await new Promise(resolve => setTimeout(resolve, (delay * 1000) + 2000));
          } else {
            // If no delay, wait a bit for immediate redirects
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
          
          // Check if the location changed due to meta refresh
          const currentLocation = window.location.href;
          console.log('🔍 Location after meta refresh wait:', currentLocation);
          
          if (currentLocation !== originalUrl) {
            results.hasMetaRefresh = true;
            results.redirectCount++;
            results.redirectChain.push({
              step: 1,
              url: originalUrl,
              type: 'meta_refresh',
              targetUrl: currentLocation,
              method: 'meta_refresh',
              delay: delay,
              timestamp: Date.now()
            });
            results.finalUrl = currentLocation;
            
            console.log('✅ Meta refresh redirect confirmed:', currentLocation);
          } else {
            // Meta refresh was detected but didn't execute yet
            results.hasMetaRefresh = true;
            results.redirectCount++;
            results.redirectChain.push({
              step: 1,
              url: originalUrl,
              type: 'meta_refresh',
              targetUrl: targetUrl,
              method: 'meta_refresh',
              delay: delay,
              timestamp: Date.now()
            });
            results.finalUrl = targetUrl;
            
            console.log('⚠️ Meta refresh detected but not yet executed:', targetUrl);
          }
        }
      }
    }
  }
  
  // Enhanced JavaScript redirect detection
  let initialLocation = window.location.href;
  let finalLocation = initialLocation;
  let redirectDetected = false;
  
  // Monitor for location changes over time
  const checkForRedirects = () => {
    const currentLocation = window.location.href;
    if (currentLocation !== initialLocation && currentLocation !== finalLocation) {
      console.log('🔍 JavaScript redirect detected:', currentLocation);
      finalLocation = currentLocation;
      redirectDetected = true;
      
      results.hasJavaScriptRedirect = true;
      results.redirectCount++;
      results.javascriptRedirects.push({
        type: 'location_change',
        method: 'javascript',
        from: initialLocation,
        to: currentLocation,
        timestamp: Date.now()
      });
      
      results.finalUrl = currentLocation;
    }
  };
  
  // Check immediately
  checkForRedirects();
  
  // Check after a short delay to catch delayed redirects
  setTimeout(checkForRedirects, 1000);
  
  // Check after a longer delay for very delayed redirects
  setTimeout(checkForRedirects, 3000);
  
  // Also check for any existing location differences
  if (window.location.href !== originalUrl) {
    results.hasJavaScriptRedirect = true;
    results.redirectCount++;
    results.javascriptRedirects.push({
      type: 'location_change',
      method: 'javascript',
      from: originalUrl,
      to: window.location.href,
      timestamp: Date.now()
    });
    results.finalUrl = window.location.href;
  }
  
  console.log('📊 Page analysis complete:', results);
  return results;
}

/**
 * Handle web app communication via postMessage
 */
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'REDIRECTINATOR_WEB_APP') {
    port.onMessage.addListener(async (message) => {
      if (message.type === 'REDIRECTINATOR_REQUEST') {
        try {
          const result = await analysisQueue.add(message.url, message.options || {});
          port.postMessage({
            type: 'REDIRECTINATOR_RESPONSE',
            requestId: message.requestId,
            result: result
          });
        } catch (error) {
          port.postMessage({
            type: 'REDIRECTINATOR_RESPONSE',
            requestId: message.requestId,
            error: error.message
          });
        }
      }
    });
  }
  
  if (port.name === 'CONTENT_SCRIPT_ANALYZE') {
    console.log('🔗 Content script port connected for analysis');
    
    port.onMessage.addListener(async (message) => {
      if (message.type === 'CONTENT_SCRIPT_ANALYZE_URL') {
        console.log('🔍 Port: Received URL analysis request:', message.url);
        
        try {
          console.log('🔍 Port: Starting analysis...');
          const result = await performAdvancedUrlAnalysis(message.url, message.options || {});
          console.log('🔍 Port: Analysis completed, sending response');
          
          port.postMessage({
            type: 'ANALYSIS_RESPONSE',
            success: true,
            result: result
          });
          
          console.log('🔍 Port: Response sent successfully');
        } catch (error) {
          console.error('❌ Port: Analysis failed:', error);
          
          port.postMessage({
            type: 'ANALYSIS_RESPONSE',
            success: false,
            error: error.message
          });
          
          console.log('🔍 Port: Error response sent');
        }
      }
    });
    
    port.onDisconnect.addListener(() => {
      console.log('🔗 Content script port disconnected');
    });
  }
});



// Clean up on extension unload
chrome.runtime.onSuspend.addListener(() => {
  console.log('Extension suspending, cleaning up...');
  analysisCache.clear();

  // Close any remaining analysis tabs
  for (const [tabId] of activeAnalyses) {
    try {
      chrome.tabs.remove(tabId);
    } catch (e) {
      // Tab may already be closed
    }
  }
  activeAnalyses.clear();
});
