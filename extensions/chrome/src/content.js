/**
 * Redirectinator Advanced - Content Script
 * Based on Redirect Path extension approach
 */

console.log('🔍 Redirectinator Advanced: Content script loaded');

// Only run on regular web pages, not on extension pages or chrome:// URLs
if (
  window.location.protocol === 'chrome-extension:' ||
  window.location.protocol === 'moz-extension:' ||
  window.location.protocol === 'chrome:' ||
  window.location.protocol === 'about:'
) {
  console.log(
    'Redirectinator Advanced: Skipping content script on extension/system page:',
    window.location.href
  );
} else {
  console.log(
    '🔍 Redirectinator Advanced: Content script running on:',
    window.location.href
  );

  // -------- Bridge to web app (postMessage) so the site can detect and use the extension --------
  // Notify page that the content script bridge is ready
  try {
    window.postMessage(
      {
        type: 'REDIRECTINATOR_EXTENSION_READY',
        version: '1.0.0-local',
        timestamp: Date.now(),
      },
      '*'
    );
  } catch (e) {
    // no-op
  }

  // Listen for messages from the page
  window.addEventListener('message', event => {
    if (event.source !== window) return; // only accept same-page messages
    const data = event.data || {};

    // Health ping from the app -> respond so it knows the bridge exists
    if (data.type === 'REDIRECTINATOR_CONTENT_SCRIPT_PING') {
      try {
        window.postMessage(
          {
            type: 'REDIRECTINATOR_CONTENT_SCRIPT_PONG',
            version: '1.0.0-local',
            timestamp: Date.now(),
          },
          '*'
        );
      } catch (_) {}
      return;
    }

    // Analysis request from the web app -> relay to background and return the result
    if (data.type === 'REDIRECTINATOR_REQUEST' && data.url) {
      const requestId =
        data.requestId ||
        'req_' + Date.now() + '_' + Math.random().toString(36).slice(2);
      chrome.runtime.sendMessage(
        {
          type: 'ANALYZE_URL_REQUEST',
          url: data.url,
          options: data.options || {},
          requestId,
        },
        response => {
          // Normalize background response and post back to page
          const payload = {
            type: 'REDIRECTINATOR_RESPONSE',
            requestId,
            result: response && response.success ? response.result : undefined,
            error:
              response && !response.success
                ? response.error || 'Unknown error'
                : undefined,
          };
          try {
            window.postMessage(payload, '*');
          } catch (_) {}
        }
      );
      return;
    }
  });

  // Initialize content script when DOM is ready (like Redirect Path extension)
  document.addEventListener('DOMContentLoaded', function (event) {
    console.log('🔍 Redirectinator Advanced: DOMContentLoaded event fired');

    // Record the time this fired (like Redirect Path)
    chrome.runtime.sendMessage({
      name: 'metaRefreshDetect',
      DOMContentLoaded: true,
    });

    // Detect meta refresh tags (exactly like Redirect Path extension)
    const metaRefresh = document.querySelectorAll("meta[http-equiv='refresh']");
    if (metaRefresh.length) {
      console.log('🔍 Found meta refresh tags:', metaRefresh.length);

      // Get the last element in case there are more than one (like Redirect Path)
      const metaRefreshElement = metaRefresh.item(metaRefresh.length - 1);
      const metaRefreshContent = metaRefreshElement.getAttribute('content');

      // Parse the content (like Redirect Path)
      const metaRefreshParts = metaRefreshContent.split(/;\s?url\s?=\s?/i);
      const metaRefreshTimer = metaRefreshParts[0];
      const metaRefreshUrl =
        typeof metaRefreshParts[1] != 'undefined' ? metaRefreshParts[1] : null;

      // We only care if the meta refresh has a URL and it's not the same as the current page
      if (metaRefreshUrl) {
        console.log('🔍 Meta refresh detected:', {
          timer: metaRefreshTimer,
          url: metaRefreshUrl,
        });

        // Tell the background page that this was a meta refresh (like Redirect Path)
        chrome.runtime.sendMessage({
          name: 'metaRefreshDetect',
          metaRefreshDetails: {
            url: qualifyURL(metaRefreshUrl),
            timer: metaRefreshTimer,
          },
        });
      }
    }

    // Make a relative URL an explicit URL using the magic of DOM (like Redirect Path)
    function qualifyURL(url) {
      const a = document.createElement('a');
      a.href = url;
      return a.href;
    }

    // Collect click events for the page (like Redirect Path)
    // We're binding to the root and so picking up click events on every element
    document.documentElement.addEventListener('click', function () {
      console.log('🔍 User click detected');
      chrome.runtime.sendMessage({
        name: 'metaRefreshDetect',
        userClicked: true,
      });
    });
  });

  // Handle messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_ANALYSIS_RESULTS') {
      console.log('🔍 Content script: Received GET_ANALYSIS_RESULTS request');

      // Return current analysis results
      sendResponse({
        data: {
          originalUrl: window.location.href,
          finalUrl: window.location.href,
          statusCode: null,
          metaRefresh: null,
          javascriptRedirects: [],
          hasMetaRefresh: false,
          hasJavaScriptRedirect: false,
          detectionMode: 'advanced',
          analysisTime: Date.now(),
        },
      });
    }

    if (message.type === 'START_ANALYSIS') {
      console.log('🔍 Content script: Received START_ANALYSIS request');

      // Send analysis complete message
      chrome.runtime.sendMessage({
        type: 'CONTENT_ANALYSIS_COMPLETE',
        tabId: message.tabId,
        data: {
          originalUrl: message.originalUrl || window.location.href,
          finalUrl: window.location.href,
          statusCode: null,
          metaRefresh: null,
          javascriptRedirects: [],
          hasMetaRefresh: false,
          hasJavaScriptRedirect: false,
          detectionMode: 'advanced',
          analysisTime: Date.now(),
        },
      });
    }
  });
}
