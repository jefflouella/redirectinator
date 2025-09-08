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
