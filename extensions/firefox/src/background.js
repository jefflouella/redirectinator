/**
 * Redirectinator Advanced - Firefox Background Script (Manifest V2)
 * Handles URL analysis, tab management, and communication with web app
 */

// Firefox-specific API adjustments
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

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
    if (item && Date.now() - item.timestamp < 300000) {
      // 5 minutes
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
      timestamp: Date.now(),
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
      lastAnalysisTime: null,
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
    this.metrics.averageAnalysisTime =
      (currentAvg * (total - 1) + analysisTime) / total;
  }

  getHealthReport() {
    const successRate =
      this.metrics.totalAnalyses > 0
        ? (this.metrics.successfulAnalyses / this.metrics.totalAnalyses) * 100
        : 0;

    return {
      ...this.metrics,
      successRate: Math.round(successRate * 100) / 100,
      uptime: Date.now() - this.startTime,
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
 * Wait for a tab to finish loading (Firefox compatible)
 */
async function waitForTabLoad(tabId, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Tab load timeout'));
    }, timeout);

    function checkTab() {
      browserAPI.tabs.get(tabId, tab => {
        if (browserAPI.runtime.lastError) {
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
  throw new Error(
    `Failed to analyze ${url} after ${maxRetries} attempts: ${lastError.message}`
  );
}

/**
 * Core analysis implementation (Firefox compatible)
 */
async function performAnalysis(url, options = {}) {
  const cacheKey = `${url}_${JSON.stringify(options)}`;

  // Check cache first
  const cachedResult = analysisCache.get(cacheKey);
  if (cachedResult) {
    console.log('Returning cached result for:', url);
    return cachedResult;
  }

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
    extensionVersion: '1.0.0',
  };

  let tab = null;
  const webRequestListener = null;

  try {
    console.log('🔍 Starting analysis for:', url);

    // Step 1: Follow HTTP redirects manually
    console.log('🔍 Step 1: Following HTTP redirects...');
    const httpRedirects = await followHttpRedirectsFirefox(
      url,
      options.maxRedirects || 10
    );
    console.log('🔍 HTTP redirects found:', httpRedirects);

    // Step 2: Create tab and analyze for client-side redirects
    console.log('🔍 Step 2: Creating tab for client-side analysis...');
    tab = await browserAPI.tabs.create({
      url: httpRedirects.finalUrl,
      active: false,
    });

    console.log('📑 Created analysis tab:', tab.id);

    // Wait for page to load
    await new Promise(resolve => {
      browserAPI.tabs.onUpdated.addListener(
        function listener(tabId, changeInfo) {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            browserAPI.tabs.onUpdated.removeListener(listener);
            resolve();
          }
        }
      );
    });

    console.log('✅ Page loaded, waiting for client-side redirects...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Inject content script to analyze page
    const analysisResults = await browserAPI.scripting.executeScript({
      target: { tabId: tab.id },
      function: analyzePageForRedirectsFirefox,
      args: [httpRedirects.finalUrl],
    });

    const clientSideResults = analysisResults[0]?.result;
    console.log('📊 Client-side analysis results:', clientSideResults);

    // Step 3: Build comprehensive redirect chain
    const comprehensiveChain = [];
    let stepCounter = 0;

    // Add all HTTP redirects first
    httpRedirects.redirects.forEach(redirect => {
      comprehensiveChain.push({
        step: ++stepCounter,
        url: redirect.url,
        type: 'server_redirect',
        statusCode: redirect.statusCode,
        targetUrl: redirect.targetUrl,
        method: 'HTTP',
        redirectType: redirect.redirectType,
        timestamp: redirect.timestamp,
      });
    });

    // Add meta refresh redirects
    if (clientSideResults?.hasMetaRefresh && clientSideResults.metaRefresh) {
      comprehensiveChain.push({
        step: ++stepCounter,
        url: httpRedirects.finalUrl,
        type: 'client_redirect',
        statusCode: 200,
        targetUrl: clientSideResults.metaRefresh.targetUrl,
        method: 'Meta Refresh',
        delay: clientSideResults.metaRefresh.delay,
        timestamp: clientSideResults.metaRefresh.detectedAt || Date.now(),
      });
    }

    // Add JavaScript redirects
    if (
      clientSideResults?.hasJavaScriptRedirect &&
      clientSideResults.javascriptRedirects
    ) {
      clientSideResults.javascriptRedirects.forEach(jsRedirect => {
        comprehensiveChain.push({
          step: ++stepCounter,
          url: jsRedirect.from,
          type: 'javascript_redirect',
          statusCode: 200,
          targetUrl: jsRedirect.to,
          method: 'JavaScript',
          timestamp: jsRedirect.timestamp,
        });
      });
    }

    // Build final results
    const finalUrl = clientSideResults?.finalUrl || httpRedirects.finalUrl;
    const finalStatusCode = httpRedirects.finalStatusCode || 200;

    const result = {
      originalUrl: url,
      finalUrl: finalUrl,
      finalStatusCode: finalStatusCode,
      redirectCount: comprehensiveChain.length,
      redirectChain: comprehensiveChain,
      redirectChainDetails: comprehensiveChain,
      hasMetaRefresh: clientSideResults?.hasMetaRefresh || false,
      hasJavaScriptRedirect: clientSideResults?.hasJavaScriptRedirect || false,
      javascriptRedirects: clientSideResults?.javascriptRedirects || [],
      detectionMode: 'advanced',
      extensionVersion: '1.0.0',
      analysisTime: Date.now() - startTime,
      status: 'success',
    };

    // Cache the result
    analysisCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error('❌ Analysis failed:', error);

    const errorResult = {
      originalUrl: url,
      finalUrl: url,
      finalStatusCode: 0,
      redirectCount: 0,
      redirectChain: [],
      hasMetaRefresh: false,
      hasJavaScriptRedirect: false,
      javascriptRedirects: [],
      detectionMode: 'advanced',
      extensionVersion: '1.0.0',
      analysisTime: Date.now() - startTime,
      status: 'error',
      error: error.message,
    };

    return errorResult;
  } finally {
    // Clean up
    if (tab) {
      try {
        await browserAPI.tabs.remove(tab.id);
      } catch (e) {
        console.warn('Error closing tab:', e);
      }
    }
    if (webRequestListener) {
      try {
        browserAPI.webRequest.onBeforeRedirect.removeListener(
          webRequestListener
        );
      } catch (e) {
        console.warn('Error removing webRequest listener:', e);
      }
    }
  }
}

/**
 * Handle messages from web app and content scripts
 */
browserAPI.runtime.onMessage.addListener(
  async (request, sender, sendResponse) => {
    console.log('Background script received message:', request.type, request);

    if (request.type === 'WEB_APP_ANALYZE_URL') {
      console.log('Processing URL analysis request:', request.url);
      // Handle web app analysis request
      analysisQueue
        .add(request.url, request.options || {})
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

    if (request.type === 'GET_HEALTH_REPORT') {
      // Return extension health metrics
      sendResponse(healthMonitor.getHealthReport());
      return true;
    }

    if (request.type === 'PING') {
      console.log('🏓 Received PING from web app');
      sendResponse({
        type: 'PONG',
        version: '1.0.0-local',
        timestamp: Date.now(),
        status: 'active',
      });
      return true;
    }

    if (request.type === 'GET_INFO') {
      console.log('🔍 Received GET_INFO request');
      sendResponse({
        version: '1.0.0-local',
        status: 'active',
        extensionId: browserAPI.runtime.id,
        timestamp: Date.now(),
      });
      return true;
    }

    if (request.type === 'WEB_APP_ANALYZE_URL') {
      console.log(
        '🔍 Received URL analysis request from web app:',
        request.url
      );

      // Implement actual URL analysis logic
      try {
        const result = await performAdvancedUrlAnalysis(
          request.url,
          request.options || {}
        );
        sendResponse({
          type: 'ANALYZE_RESPONSE',
          success: true,
          result: result,
        });
      } catch (error) {
        console.error('❌ Advanced URL analysis failed:', error);
        sendResponse({
          type: 'ANALYZE_RESPONSE',
          success: false,
          error: error.message,
        });
      }
      return true;
    }

    if (request.type === 'CONTENT_SCRIPT_ANALYZE_URL') {
      console.log(
        '🔍 Received URL analysis request from content script:',
        request.url
      );

      // Use the old function for backward compatibility
      console.log('⚠️ Using legacy performAdvancedUrlAnalysis function');

      performAdvancedUrlAnalysis(request.url, request.options || {})
        .then(result => {
          sendResponse({ success: true, result });
        })
        .catch(error => {
          console.error('❌ Advanced URL analysis failed:', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
    }

    if (request.type === 'ANALYZE_URL_REQUEST') {
      console.log(
        '🔍 Runtime: Received ANALYZE_URL_REQUEST from content script:',
        request.url
      );

      // Handle the analysis asynchronously using the NEW tab-based method with webRequest
      performAnalysis(request.url, request.options || {})
        .then(result => {
          console.log('🔍 Runtime: Tab analysis completed, sending response');
          sendResponse({
            success: true,
            result: result,
          });
        })
        .catch(error => {
          console.error('❌ Runtime: Tab analysis failed:', error);
          sendResponse({
            success: false,
            error: error.message,
          });
        });

      // Return true to indicate we'll send a response asynchronously
      return true;
    }

    console.log('Unhandled message type:', request.type);
  }
);

/**
 * Handle web app communication via postMessage
 */
browserAPI.runtime.onConnect.addListener(port => {
  if (port.name === 'REDIRECTINATOR_WEB_APP') {
    port.onMessage.addListener(async message => {
      if (message.type === 'REDIRECTINATOR_REQUEST') {
        try {
          const result = await analysisQueue.add(
            message.url,
            message.options || {}
          );
          port.postMessage({
            type: 'REDIRECTINATOR_RESPONSE',
            requestId: message.requestId,
            result: result,
          });
        } catch (error) {
          port.postMessage({
            type: 'REDIRECTINATOR_RESPONSE',
            requestId: message.requestId,
            error: error.message,
          });
        }
      }
    });
  }
});

/**
 * Follow HTTP redirects using tab navigation to build the complete redirect chain
 */
async function followHttpRedirects(url, maxRedirects = 10) {
  console.log('🔍 Following HTTP redirects for:', url);

  const redirects = [];
  let currentUrl = url;
  let redirectCount = 0;

  try {
    while (redirectCount < maxRedirects) {
      console.log(`🔍 Checking redirect ${redirectCount + 1}: ${currentUrl}`);

      // Create a temporary tab to check for redirects
      const tab = await browserAPI.tabs.create({
        url: currentUrl,
        active: false,
      });

      // Wait for the page to load and check for redirects
      await new Promise(resolve => {
        browserAPI.tabs.onUpdated.addListener(
          function listener(tabId, changeInfo) {
            if (tabId === tab.id && changeInfo.status === 'complete') {
              browserAPI.tabs.onUpdated.removeListener(listener);
              resolve();
            }
          }
        );
      });

      // Get the final URL after any redirects
      const tabInfo = await browserAPI.tabs.get(tab.id);
      const finalUrl = tabInfo.url;

      // Close the tab
      await browserAPI.tabs.remove(tab.id);

      console.log(`🔍 Initial URL: ${currentUrl}`);
      console.log(`🔍 Final URL: ${finalUrl}`);

      // Check if there was a redirect
      if (finalUrl !== currentUrl) {
        // Determine redirect type based on URL changes
        let redirectType = 'temporary';
        let statusCode = 302; // Default to temporary redirect

        // Check for HTTP to HTTPS upgrade
        if (currentUrl.startsWith('http:') && finalUrl.startsWith('https:')) {
          redirectType = 'upgrade';
          statusCode = 307;
        }

        // Add to redirect chain
        redirects.push({
          step: redirectCount + 1,
          url: currentUrl,
          type: 'server_redirect',
          targetUrl: finalUrl,
          method: 'http',
          statusCode: statusCode,
          redirectType: redirectType,
          timestamp: Date.now(),
        });

        // Update current URL and continue
        currentUrl = finalUrl;
        redirectCount++;

        console.log(`🔍 Redirect ${redirectCount}: ${currentUrl}`);
      } else {
        // No redirect, this is the final page
        console.log(`✅ Final page reached: ${currentUrl}`);
        break;
      }
    }

    console.log(
      `🏁 HTTP redirect following complete. Found ${redirects.length} redirects`
    );
    return {
      redirects: redirects,
      finalUrl: currentUrl,
      finalStatusCode: 200,
    };
  } catch (error) {
    console.error('❌ Error following HTTP redirects:', error);
    return {
      redirects: redirects,
      finalUrl: currentUrl,
      finalStatusCode: 0,
    };
  }
}

/**
 * Perform advanced URL analysis using content script injection and redirect following
 */
async function performAdvancedUrlAnalysis(url, options = {}) {
  console.log('🔍 Starting advanced URL analysis for:', url);
  const startTime = Date.now();

  try {
    // Step 1: Follow HTTP redirects to get the full chain
    console.log('🔍 Step 1: Following HTTP redirects...');
    const httpRedirects = await followHttpRedirects(
      url,
      options.maxRedirects || 10
    );
    console.log('🔍 HTTP redirects found:', httpRedirects);

    // Step 2: Create a tab to analyze the final page for client-side redirects
    console.log('🔍 Step 2: Analyzing final page for client-side redirects...');
    const tab = await browserAPI.tabs.create({
      url: httpRedirects.finalUrl,
      active: false,
    });

    console.log('📑 Created analysis tab:', tab.id);

    // Wait for the page to load
    await new Promise(resolve => {
      browserAPI.tabs.onUpdated.addListener(
        function listener(tabId, changeInfo) {
          if (tabId === tab.id && changeInfo.status === 'complete') {
            browserAPI.tabs.onUpdated.removeListener(listener);
            resolve();
          }
        }
      );
    });

    console.log(
      '✅ Page loaded, waiting for JavaScript redirects to execute...'
    );

    // Wait additional time for JavaScript redirects to execute
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    // Check if the URL has changed due to JavaScript redirects
    const tabInfo = await browserAPI.tabs.get(tab.id);
    const currentUrl = tabInfo.url;
    console.log('🔍 Current tab URL after waiting:', currentUrl);

    // If URL changed, wait a bit more for any additional redirects
    if (currentUrl !== httpRedirects.finalUrl) {
      console.log('🔄 URL changed, waiting for additional redirects...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 more seconds
      const finalTabInfo = await browserAPI.tabs.get(tab.id);
      console.log('🔍 Final tab URL:', finalTabInfo.url);
    }

    console.log('🔍 Injecting analysis script...');

    // Inject the analysis script to detect client-side redirects
    const results = await browserAPI.scripting.executeScript({
      target: { tabId: tab.id },
      function: analyzePageForRedirects,
      args: [httpRedirects.finalUrl],
    });

    const analysisResult = results[0]?.result;
    console.log('📊 Client-side analysis results:', analysisResult);

    // Close the analysis tab
    await browserAPI.tabs.remove(tab.id);

    // Step 3: Combine HTTP redirects with client-side redirects
    const combinedRedirects = [...httpRedirects.redirects];

    // Add client-side redirects if detected
    if (analysisResult?.hasMetaRefresh) {
      combinedRedirects.push({
        step: combinedRedirects.length + 1,
        url: httpRedirects.finalUrl,
        type: 'meta_refresh',
        targetUrl: analysisResult.finalUrl,
        method: 'meta_refresh',
        statusCode: 200,
        timestamp: Date.now(),
      });
    }

    if (analysisResult?.hasJavaScriptRedirect) {
      // Add the JavaScript redirect
      combinedRedirects.push({
        step: combinedRedirects.length + 1,
        url: httpRedirects.finalUrl,
        type: 'javascript',
        targetUrl: analysisResult.finalUrl,
        method: 'javascript',
        statusCode: 200,
        timestamp: Date.now(),
      });

      // Check if the JavaScript redirect target has additional server redirects
      console.log(
        '🔍 Checking for additional redirects on JavaScript target:',
        analysisResult.finalUrl
      );
      try {
        const additionalRedirects = await followHttpRedirects(
          analysisResult.finalUrl,
          5
        );
        if (additionalRedirects.redirects.length > 0) {
          console.log(
            '🔍 Found additional redirects after JavaScript redirect:',
            additionalRedirects.redirects
          );
          // Add the additional redirects to the chain
          additionalRedirects.redirects.forEach((redirect, index) => {
            combinedRedirects.push({
              ...redirect,
              step: combinedRedirects.length + 1,
            });
          });
        }
      } catch (error) {
        console.error('❌ Error checking additional redirects:', error);
      }
    }

    const analysisTime = Date.now() - startTime;

    return {
      originalUrl: url,
      finalUrl: analysisResult?.finalUrl || httpRedirects.finalUrl,
      finalStatusCode: httpRedirects.finalStatusCode,
      redirectCount: combinedRedirects.length,
      redirectChain: combinedRedirects,
      hasMetaRefresh: analysisResult?.hasMetaRefresh || false,
      hasJavaScriptRedirect: analysisResult?.hasJavaScriptRedirect || false,
      javascriptRedirects: analysisResult?.javascriptRedirects || [],
      detectionMode: 'advanced',
      extensionVersion: '1.0.0-local',
      analysisTime: analysisTime,
      status: 'success',
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
    javascriptRedirects: [],
  };

  // Enhanced Meta Refresh detection with execution monitoring
  const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
  if (metaRefresh) {
    const content = metaRefresh.getAttribute('content');
    if (content) {
      const parts = content.split(';');
      if (parts.length > 1) {
        const delay = parseInt(parts[0]) || 0;
        const urlPart = parts.find(part =>
          part.toLowerCase().startsWith('url=')
        );

        if (urlPart) {
          const targetUrl = urlPart.substring(4); // Remove "url=" prefix

          console.log('🔍 Meta refresh detected:', {
            delay,
            targetUrl,
            originalUrl,
          });

          // Wait for the meta refresh to potentially execute
          if (delay > 0) {
            // If there's a delay, wait for it plus some buffer time
            await new Promise(resolve =>
              setTimeout(resolve, delay * 1000 + 2000)
            );
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
              timestamp: Date.now(),
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
              timestamp: Date.now(),
            });
            results.finalUrl = targetUrl;

            console.log(
              '⚠️ Meta refresh detected but not yet executed:',
              targetUrl
            );
          }
        }
      }
    }
  }

  // Enhanced JavaScript redirect detection
  const initialLocation = window.location.href;
  let finalLocation = initialLocation;
  let redirectDetected = false;

  // Monitor for location changes over time
  const checkForRedirects = () => {
    const currentLocation = window.location.href;
    if (
      currentLocation !== initialLocation &&
      currentLocation !== finalLocation
    ) {
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
        timestamp: Date.now(),
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
      timestamp: Date.now(),
    });
    results.finalUrl = window.location.href;
  }

  console.log('📊 Page analysis complete:', results);
  return results;
}

/**
 * Follow HTTP redirects manually for Firefox
 */
async function followHttpRedirectsFirefox(url, maxRedirects = 10) {
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
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
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
          console.log(
            `🔍 Redirect ${status} from ${currentUrl} to ${resolvedUrl}`
          );

          // Add to redirect chain
          redirects.push({
            step: redirectCount + 1,
            url: currentUrl,
            type: 'server_redirect',
            targetUrl: resolvedUrl,
            method: 'http',
            statusCode: status,
            redirectType: status === 301 ? 'permanent' : 'temporary',
            timestamp: Date.now(),
          });

          // Update current URL and continue
          currentUrl = resolvedUrl;
          redirectCount++;
          finalUrl = resolvedUrl;
          finalStatusCode = status;
        } else if (status >= 200 && status < 300) {
          // Success - no more redirects
          console.log(
            `✅ Final page reached: ${currentUrl} with status ${status}`
          );
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

    console.log(
      `🏁 HTTP redirect following complete. Found ${redirects.length} redirects`
    );
    return {
      redirects: redirects,
      finalUrl: finalUrl,
      finalStatusCode: finalStatusCode,
    };
  } catch (error) {
    console.error('❌ Error following HTTP redirects:', error);
    return {
      redirects: redirects,
      finalUrl: currentUrl,
      finalStatusCode: 0,
    };
  }
}

/**
 * Content script function to analyze page for redirects (Firefox compatible)
 */
async function analyzePageForRedirectsFirefox(originalUrl) {
  console.log('🔍 Analyzing page for redirects:', originalUrl);

  const results = {
    originalUrl: originalUrl,
    finalUrl: window.location.href,
    statusCode: 200,
    redirectCount: 0,
    redirectChain: [],
    hasMetaRefresh: false,
    hasJavaScriptRedirect: false,
    javascriptRedirects: [],
  };

  // Enhanced Meta Refresh detection
  const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
  if (metaRefresh) {
    const content = metaRefresh.getAttribute('content');
    if (content) {
      const parts = content.split(';');
      if (parts.length > 1) {
        const delay = parseInt(parts[0]) || 0;
        const urlPart = parts.find(part =>
          part.toLowerCase().startsWith('url=')
        );

        if (urlPart) {
          const targetUrl = urlPart.substring(4);

          console.log('🔍 Meta refresh detected:', {
            delay,
            targetUrl,
            originalUrl,
          });

          results.metaRefresh = {
            type: 'meta_refresh',
            delay: delay,
            targetUrl: targetUrl,
            detectedAt: Date.now(),
            method: 'meta_tag_parsing',
          };

          results.hasMetaRefresh = true;
          results.redirectCount++;
        }
      }
    }
  }

  // Check if location changed from original
  if (window.location.href !== originalUrl) {
    results.hasJavaScriptRedirect = true;
    results.redirectCount++;
    results.javascriptRedirects.push({
      type: 'location_change',
      method: 'javascript',
      from: originalUrl,
      to: window.location.href,
      timestamp: Date.now(),
    });
    results.finalUrl = window.location.href;
  }

  console.log('📊 Page analysis complete:', results);
  return results;
}

// Clean up on extension unload (Firefox compatible)
browserAPI.runtime.onSuspend?.addListener(() => {
  console.log('Extension suspending, cleaning up...');
  analysisCache.clear();

  // Close any remaining analysis tabs
  for (const [tabId] of activeAnalyses) {
    try {
      browserAPI.tabs.remove(tabId);
    } catch (e) {
      // Tab may already be closed
    }
  }
  activeAnalyses.clear();
});
