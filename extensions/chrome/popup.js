// Popup script for Redirectinator Advanced extension
document.addEventListener('DOMContentLoaded', function() {
  const statusElement = document.getElementById('status');
  const clearCacheButton = document.getElementById('clear-cache');
  const cacheStatusElement = document.getElementById('cache-status');
  
  // Check if we can access chrome APIs (extension is loaded)
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    statusElement.textContent = 'Extension is active and ready!';
    statusElement.className = 'status available';
    
    // Try to get extension info
    chrome.runtime.sendMessage({ type: 'GET_INFO' }, (response) => {
      if (chrome.runtime.lastError) {
        // Background script might not be ready yet
        return;
      }
      
      if (response && response.version) {
        statusElement.textContent = `Extension v${response.version} is active!`;
      }
    });
    
    // Add cache clearing functionality
    clearCacheButton.addEventListener('click', function() {
      clearCacheButton.disabled = true;
      clearCacheButton.textContent = 'Clearing...';
      cacheStatusElement.textContent = 'Clearing analysis cache...';
      
      chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' }, (response) => {
        if (chrome.runtime.lastError) {
          cacheStatusElement.textContent = 'Error: Could not clear cache';
          clearCacheButton.disabled = false;
          clearCacheButton.textContent = 'Clear Analysis Cache';
          return;
        }
        
        if (response && response.success) {
          cacheStatusElement.textContent = '✅ Cache cleared successfully!';
          clearCacheButton.style.backgroundColor = '#10b981';
          clearCacheButton.textContent = 'Cache Cleared!';
          
          // Reset button after 3 seconds
          setTimeout(() => {
            clearCacheButton.disabled = false;
            clearCacheButton.style.backgroundColor = '#ef4444';
            clearCacheButton.textContent = 'Clear Analysis Cache';
            cacheStatusElement.textContent = 'Cache will be cleared when clicked';
          }, 3000);
        } else {
          cacheStatusElement.textContent = 'Error: Failed to clear cache';
          clearCacheButton.disabled = false;
          clearCacheButton.textContent = 'Clear Analysis Cache';
        }
      });
    });
    
  } else {
    statusElement.textContent = 'Extension not detected';
    statusElement.className = 'status unavailable';
    clearCacheButton.disabled = true;
    cacheStatusElement.textContent = 'Extension not available';
  }
});
