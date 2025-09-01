export interface SEMrushDiscoveryParams {
  domain: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string;   // YYYY-MM-DD format
  country?: string;  // Default: 'us'
  device?: 'desktop' | 'mobile'; // Default: 'desktop'
  limit?: number;    // Default: 1000
}

export interface SEMrushPage {
  url: string;
  organicTraffic: number;
  organicKeywords: number;
  organicPosition: number;
  lastSeen: string;
  firstSeen: string;
}

export interface SEMrushDiscoveryResult {
  pages: SEMrushPage[];
  totalFound: number;
  domain: string;
  timeframe: string;
  country: string;
  device: string;
}

export class SEMrushService {
  private readonly API_BASE = 'https://api.semrush.com/';
  private readonly PROXY_BASE = '/api/semrush';
  
  // Get the base URL for API calls
  private getApiBaseUrl(): string {
    // Since we're running everything on the same port now
    return '';
  }
  
  /**
   * Get stored API key from browser storage
   */
  private async getApiKey(): Promise<string | null> {
    try {
      const stored = localStorage.getItem('semrush_api_key');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to retrieve SEMrush API key:', error);
      return null;
    }
  }

  /**
   * Get remaining SEMrush API units via backend proxy
   */
  async getRemainingUnits(): Promise<number | null> {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) return null;
      const resp = await fetch(`/api/semrush/units?key=${encodeURIComponent(apiKey)}`);
      if (!resp.ok) return null;
      const data = await resp.json();
      return typeof data.remaining === 'number' ? data.remaining : null;
    } catch (e) {
      console.error('Failed to fetch SEMrush remaining units:', e);
      return null;
    }
  }

  /**
   * Store API key securely in browser storage
   */
  async storeApiKey(apiKey: string): Promise<void> {
    try {
      localStorage.setItem('semrush_api_key', JSON.stringify(apiKey));
    } catch (error) {
      console.error('Failed to store SEMrush API key:', error);
      throw new Error('Failed to store API key securely');
    }
  }

  /**
   * Check if API key is configured
   */
  async hasApiKey(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    return !!apiKey;
  }

  /**
   * Discover top-performing pages from SEMrush historical data
   */
  async discoverTopPages(params: SEMrushDiscoveryParams): Promise<SEMrushDiscoveryResult> {
    try {
      const apiKey = await this.getApiKey();
      if (!apiKey) {
        throw new Error('SEMrush API key not configured. Please add your API key in settings.');
      }

      console.log(`Discovering top pages for ${params.domain} from ${params.startDate} to ${params.endDate}`);
      // SEMrush expects display_date as YYYYMM15 (15th of the month). Normalize here.
      const endDate = new Date(params.endDate || '');
      const normalizedDisplayDate = `${endDate.getFullYear()}${String(endDate.getMonth() + 1).padStart(2, '0')}15`;
      console.log(`Using display_date: ${normalizedDisplayDate} for SEMrush API call`);

      // Build API parameters - using correct format from SEMrush documentation
      const apiParams = new URLSearchParams({
        key: apiKey,
        type: 'domain_organic',
        display_limit: (params.limit || 1000).toString(),
        export_columns: 'Ph,Po,Nq,Cp,Ur,Tr,Tc,Co,Nr,Td', // Standard columns for organic pages
        database: params.country || 'us',
        domain: params.domain,
        display_date: normalizedDisplayDate, // Use normalized end date as the reference date (YYYYMMDD)
      });

      // Make API request through our proxy
      try {
        const response = await fetch(`${this.getApiBaseUrl()}${this.PROXY_BASE}?${apiParams.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `SEMrush API request failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.text();
        console.log('SEMrush API response data:', data.substring(0, 500)); // Log first 500 chars
        
        // Check for SEMrush error responses
        if (data.includes('ERROR') || data.includes('NOTHING FOUND')) {
          console.warn('SEMrush API returned error:', data);
          const domain = params.domain;
          const suggestion = domain.includes('.') ? '' : ` Try adding ".com" (e.g., "${domain}.com")`;
          throw new Error(`No data found for domain "${domain}". Please check the domain name and try again.${suggestion}`);
        }
        
        // Parse SEMrush CSV response
        const pages = this.parseSEMrushResponse(data);
        
        // Remove duplicates based on URL, keeping the one with the best position
        const uniquePages = this.removeDuplicateUrls(pages);
        const duplicateCount = pages.length - uniquePages.length;

        // Build result
        const result: SEMrushDiscoveryResult = {
          pages: uniquePages,
          totalFound: uniquePages.length,
          domain: params.domain,
          timeframe: `Organic pages as of ${params.endDate}`,
          country: params.country || 'us',
          device: params.device || 'desktop',
        };

        if (duplicateCount > 0) {
          console.log(`SEMrush discovery complete: ${result.totalFound} unique pages found for ${params.domain} (${duplicateCount} duplicates removed)`);
        } else {
          console.log(`SEMrush discovery complete: ${result.totalFound} pages found for ${params.domain}`);
        }
        return result;

      } catch (fetchError) {
        // Check if this is a CORS error (fallback for direct API calls)
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          throw new Error(
            'Network Error: Unable to reach SEMrush API. ' +
            'Please ensure the backend server is running and try again.'
          );
        }
        throw fetchError;
      }

    } catch (error) {
      console.error('SEMrush discovery failed:', error);
      throw new Error(`Failed to discover pages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Parse SEMrush CSV response
   * Based on SEMrush API documentation: Ph,Po,Nq,Cp,Ur,Tr,Tc,Co,Nr,Td
   */
  private parseSEMrushResponse(csvData: string): SEMrushPage[] {
    const lines = csvData.trim().split('\n');
    const pages: SEMrushPage[] = [];
    
    console.log(`Parsing SEMrush response: ${lines.length} lines`);
    if (lines.length > 0) {
      console.log('First line (header):', lines[0]);
      if (lines.length > 1) {
        console.log('Second line (first data):', lines[1]);
      }
    }

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Try both semicolon and comma separators
      let columns = line.split(';');
      if (columns.length < 10) {
        columns = line.split(',');
      }
      
      if (columns.length >= 10) {
        const page: SEMrushPage = {
          url: columns[4] || '', // Ur - URL
          organicTraffic: parseInt(columns[5]) || 0, // Tr - Traffic
          organicKeywords: parseInt(columns[6]) || 0, // Tc - Traffic Cost
          organicPosition: parseFloat(columns[1]) || 0, // Po - Position
          lastSeen: new Date().toISOString().split('T')[0], // Current date as fallback
          firstSeen: new Date().toISOString().split('T')[0], // Current date as fallback
        };

        // Only include pages with valid URLs
        if (page.url && page.url.startsWith('http')) {
          pages.push(page);
        }
      }
    }

    return pages;
  }

  /**
   * Remove duplicate URLs, keeping the one with the best (lowest) position
   */
  private removeDuplicateUrls(pages: SEMrushPage[]): SEMrushPage[] {
    const urlMap = new Map<string, SEMrushPage>();
    
    pages.forEach(page => {
      if (!page.url) return;
      
      const existingPage = urlMap.get(page.url);
      
      if (!existingPage) {
        // First occurrence of this URL
        urlMap.set(page.url, page);
      } else {
        // URL already exists, keep the one with better position (lower number)
        if (page.organicPosition > 0 && (existingPage.organicPosition === 0 || page.organicPosition < existingPage.organicPosition)) {
          urlMap.set(page.url, page);
        }
      }
    });
    
    return Array.from(urlMap.values());
  }

  /**
   * Validate API key format
   * Note: SEMrush API has CORS restrictions, so we can only validate the format
   */
  async validateApiKeyFormat(apiKey: string): Promise<{ isValid: boolean; error?: string }> {
    try {
      // SEMrush API keys can vary in format, but they're typically alphanumeric
      // Let's be more flexible and just check for reasonable length and characters
      const trimmedKey = apiKey.trim();
      
      if (!trimmedKey) {
        return {
          isValid: false,
          error: 'API key cannot be empty'
        };
      }
      
      if (trimmedKey.length < 10) {
        return {
          isValid: false,
          error: 'API key appears too short. SEMrush API keys are typically longer.'
        };
      }
      
      if (trimmedKey.length > 100) {
        return {
          isValid: false,
          error: 'API key appears too long. Please check your key.'
        };
      }
      
      // Check for basic alphanumeric format (allowing some special characters that might be valid)
      const hasValidCharacters = /^[a-zA-Z0-9\-_]+$/.test(trimmedKey);
      
      if (!hasValidCharacters) {
        return {
          isValid: false,
          error: 'API key contains invalid characters. Use only letters, numbers, hyphens, and underscores.'
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('API key validation failed:', error);
      return {
        isValid: false,
        error: 'Failed to validate API key format'
      };
    }
  }
}
