// Popup script for Redirectinator Advanced extension
document.addEventListener('DOMContentLoaded', function() {
  const statusElement = document.getElementById('status');
  
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
  } else {
    statusElement.textContent = 'Extension not detected';
    statusElement.className = 'status unavailable';
  }
});
