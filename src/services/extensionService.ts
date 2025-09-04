/**
 * Extension Service - Handles communication with Redirectinator Advanced browser extension
 */

interface ExtensionAnalysisOptions {
  timeout?: number;
  followRedirects?: boolean;
  maxRedirects?: number;
  maxRetries?: number;
}

interface ExtensionAnalysisResult {
  originalUrl: string;
  finalUrl: string;
  finalStatusCode: number | null;
  redirectCount: number;
  redirectChain: Array<{
    step: number;
    url: string;
    type: string;
    statusCode?: number;
    targetUrl?: string;
    method: string;
    timestamp: number;
  }>;
  hasMetaRefresh: boolean;
  hasJavaScriptRedirect: boolean;
  metaRefresh?: {
    type: string;
    delay: number;
    targetUrl: string;
    method: string;
  };
  javascriptRedirects: Array<{
    type: string;
    method: string;
    from: string;
    to: string;
    timestamp: number;
  }>;
  detectionMode: 'default' | 'advanced';
  extensionVersion?: string;
  analysisTime: number;
  status: 'success' | 'error';
  error?: string;
}

declare global {
  interface Window {
    redirectinatorExtension?: {
      analyzeUrl: (url: string, options?: ExtensionAnalysisOptions) => Promise<ExtensionAnalysisResult>;
      isAvailable: () => boolean;
      getVersion: () => string;
    };
  }
}

class ExtensionService {
  private static instance: ExtensionService;
  private extensionPort: chrome.runtime.Port | null = null;
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (value: any) => void;
    timeout: NodeJS.Timeout;
  }>();
  private isExtensionAvailable = false;
  private extensionVersion: string | null = null;

  private constructor() {
    this.initialize();
  }

  static getInstance(): ExtensionService {
    if (!ExtensionService.instance) {
      ExtensionService.instance = new ExtensionService();
    }
    return ExtensionService.instance;
  }

  private initialize() {
    // Check if extension is available
    this.checkExtensionAvailability();

    // Set up postMessage listener for extension communication
    window.addEventListener('message', this.handlePostMessage.bind(this));

    // Periodically check for extension availability - reduced frequency to reduce noise
    setInterval(() => {
      this.checkExtensionAvailability();
    }, 15000); // Check every 15 seconds instead of 5
  }

  private checkExtensionAvailability(): void {
    // Only log in development mode and reduce verbosity
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      console.log('🔍 Extension Service: Starting availability check...');
    }

    // Method 1: Check for global extension object (injected by content script bridge)
    if (window.redirectinatorExtension?.isAvailable?.()) {
      this.isExtensionAvailable = true;
      this.extensionVersion = window.redirectinatorExtension.getVersion?.() || 'unknown';
      if (isDev) {
        console.log('✅ Extension detected via global object:', this.extensionVersion);
      }
      return;
    } else if (isDev) {
      console.log('❌ Global object method failed - bridge not injected yet');
    }

    // Method 2: Try to communicate with background script directly (for file:// or if web app is extension)
    if (isDev) {
      console.log('🔍 Trying direct background communication...');
    }
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'PING' }, (response) => {
        if (!chrome.runtime.lastError && response) {
          if (isDev) {
            console.log('✅ Background script responded:', response);
          }
          this.isExtensionAvailable = true;
          this.extensionVersion = response.version || 'connected';
        } else if (isDev) {
          console.log('❌ Background communication failed');
        }
      });
    }

    // Method 3: Check for extension via postMessage (content script communication)
    if (isDev) {
      console.log('🔍 Trying postMessage method...');
    }
    this.checkViaPostMessage();

    // Method 4: Try to detect extension via content script ping
    if (isDev) {
      console.log('🔍 Trying content script ping...');
    }
    this.pingContentScript();

    // Method 5: Check if we already received a PONG response (extension is communicating)
    if (this.extensionVersion && this.extensionVersion.includes('pong')) {
      if (isDev) {
        console.log('✅ Extension already detected via previous PONG response');
      }
      this.isExtensionAvailable = true;
      return;
    }

    if (isDev) {
      console.log('🏁 Extension availability check complete. Available:', this.isExtensionAvailable, 'Version:', this.extensionVersion);
    }
  }

  private checkViaPostMessage(): void {
    // Send a ping to check if extension is listening
    window.postMessage({
      type: 'REDIRECTINATOR_PING',
      timestamp: Date.now()
    }, '*');

    // Set a timeout to mark as unavailable if no response
    setTimeout(() => {
      if (!this.isExtensionAvailable) {
        this.isExtensionAvailable = false;
      }
    }, 1000);
  }

  private pingContentScript(): void {
    // Send a specific ping that the content script will respond to
    window.postMessage({
      type: 'REDIRECTINATOR_CONTENT_SCRIPT_PING',
      timestamp: Date.now(),
      requestId: 'ping_' + Date.now()
    }, '*');

    // Set a timeout to mark as unavailable if no response
    setTimeout(() => {
      if (!this.isExtensionAvailable && process.env.NODE_ENV === 'development') {
        console.log('⏰ Content script ping timeout - no response received');
      }
    }, 2000);
  }

  private handlePostMessage(event: MessageEvent): void {
    // Only accept messages from the same origin or extension
    if (event.source !== window && event.origin !== window.location.origin) {
      return;
    }

    const isDev = process.env.NODE_ENV === 'development';

    if (event.data?.type === 'REDIRECTINATOR_EXTENSION_READY') {
      this.isExtensionAvailable = true;
      this.extensionVersion = event.data.version || 'unknown';
      if (isDev) {
        console.log('Redirectinator Advanced extension detected:', this.extensionVersion);
      }
    }

    if (event.data?.type === 'REDIRECTINATOR_PONG') {
      if (isDev) {
        console.log('🏓 Received PONG from extension:', event.data);
      }
      this.isExtensionAvailable = true;
      this.extensionVersion = event.data.version || 'pong-detected';
    }

    if (event.data?.type === 'REDIRECTINATOR_CONTENT_SCRIPT_PONG') {
      if (isDev) {
        console.log('🏓 Received content script PONG from extension:', event.data);
      }
      this.isExtensionAvailable = true;
      this.extensionVersion = event.data.version || 'content-script-detected';
    }

    if (event.data?.type === 'REDIRECTINATOR_RESPONSE') {
      const pendingRequest = this.pendingRequests.get(event.data.requestId);
      if (pendingRequest) {
        clearTimeout(pendingRequest.timeout);
        this.pendingRequests.delete(event.data.requestId);

        if (event.data.error) {
          pendingRequest.reject(new Error(event.data.error));
        } else {
          pendingRequest.resolve(event.data.result);
        }
      }
    }
  }

  private handleExtensionMessage(message: any): void {
    if (message.type === 'REDIRECTINATOR_RESPONSE') {
      const pendingRequest = this.pendingRequests.get(message.requestId);
      if (pendingRequest) {
        clearTimeout(pendingRequest.timeout);
        this.pendingRequests.delete(message.requestId);

        if (message.error) {
          pendingRequest.reject(new Error(message.error));
        } else {
          pendingRequest.resolve(message.result);
        }
      }
    }
  }

  /**
   * Check if the extension is available and ready
   */
  isAvailable(): boolean {
    return this.isExtensionAvailable;
  }

  /**
   * Get the extension version
   */
  getVersion(): string | null {
    return this.extensionVersion;
  }

  /**
   * Analyze a URL using the extension (if available)
   */
  async analyzeUrl(url: string, options: ExtensionAnalysisOptions = {}): Promise<ExtensionAnalysisResult> {
    if (!this.isExtensionAvailable) {
      throw new Error('Redirectinator Advanced extension is not available');
    }

    const requestId = this.generateRequestId();

    return new Promise((resolve, reject) => {
      // Set up timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Extension analysis timeout'));
      }, (options.timeout || 15000) + 2000); // Add 2 second buffer

      // Store the promise handlers
      this.pendingRequests.set(requestId, {
        resolve,
        reject,
        timeout
      });

      // Try different communication methods in order of preference
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        // Method 1: Direct runtime communication (works if extension is loaded)
        console.log('🔗 Using direct runtime communication for URL analysis');
        chrome.runtime.sendMessage({
          type: 'ANALYZE_URL_REQUEST',
          url: url,
          options: options,
          requestId: requestId
        }, (response) => {
          clearTimeout(timeout);
          this.pendingRequests.delete(requestId);

          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }

          if (response && response.success) {
            resolve(response.result);
          } else {
            reject(new Error(response?.error || 'Analysis failed'));
          }
        });

      } else if (this.extensionPort) {
        // Method 2: Port communication (legacy)
        console.log('🔗 Using port communication for URL analysis');
        this.extensionPort.postMessage({
          type: 'REDIRECTINATOR_REQUEST',
          requestId,
          url,
          options
        });

      } else {
        // Method 3: PostMessage communication (primary method for web apps)
        console.log('🔗 Using postMessage communication for URL analysis');
        window.postMessage({
          type: 'REDIRECTINATOR_REQUEST',
          requestId,
          url,
          options
        }, '*');
      }
    });
  }

  /**
   * Get extension health report
   */
  async getHealthReport(): Promise<any> {
    if (!this.isExtensionAvailable) {
      return null;
    }

    return new Promise((resolve) => {
      if (this.extensionPort) {
        // For now, just resolve with null since health report response handling is not implemented
        resolve(null);
      } else {
        resolve(null);
      }
    });
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.extensionPort) {
      this.extensionPort.disconnect();
      this.extensionPort = null;
    }

    // Clear all pending requests
    for (const [requestId, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Extension service destroyed'));
    }
    this.pendingRequests.clear();

    this.isExtensionAvailable = false;
    this.extensionVersion = null;
  }
}

// Export singleton instance
export const extensionService = ExtensionService.getInstance();
export default extensionService;
