// Wayback Machine CDX API Service
// Handles discovery of historical URLs using the Internet Archive's CDX Server API

export interface WaybackUrl {
  timestamp: string;        // YYYYMMDDHHMMSS
  original: string;         // Original URL from Wayback
  mimeType: string;         // text/html
  statusCode: string;       // 200, 404, etc.
  redirectUrl?: string;     // If redirected
  digest: string;           // Content hash
  length: string;           // Content length
}

export interface WaybackDiscoveryParams {
  domain: string;
  fromDate: string;         // YYYYMMDD
  toDate: string;           // YYYYMMDD
  limit: number;
  filters: {
    htmlOnly: boolean;
    removeDuplicates: boolean;
    excludeSystemFiles: boolean;
  };
}

export interface WaybackDiscoveryResult {
  urls: WaybackUrl[];
  totalFound: number;
  domain: string;
  timeframe: string;
  filtersApplied: string[];
}

export class WaybackService {
  private readonly PROXY_API_BASE = '/api/wayback';

  /**
   * Discover URLs from Wayback Machine for a given domain and timeframe
   */
  async discoverUrls(params: WaybackDiscoveryParams): Promise<WaybackDiscoveryResult> {
    try {
      console.log(`Discovering URLs for ${params.domain} from ${params.fromDate} to ${params.toDate}`);

      // Build proxy API parameters
      const proxyParams = new URLSearchParams({
        domain: params.domain,
        from: params.fromDate,
        to: params.toDate,
        limit: params.limit.toString(),
      });

      // Add filters
      if (params.filters.htmlOnly) {
        proxyParams.append('filters', 'htmlOnly');
      }

      const apiUrl = `${this.PROXY_API_BASE}/discover?${proxyParams.toString()}`;
      console.log(`Making request to: ${apiUrl}`);

      // Make API request to our proxy
      const response = await fetch(apiUrl);
      
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Wayback proxy request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`Wayback proxy returned data:`, data);
      console.log(`Wayback proxy returned ${data.totalFound} results for ${params.domain}`);

      // Apply additional filters as safety net
      const filteredUrls = this.applyFilters(data.urls, params.filters);

      // Build result
      const result: WaybackDiscoveryResult = {
        urls: filteredUrls,
        totalFound: filteredUrls.length,
        domain: params.domain,
        timeframe: `${params.fromDate} to ${params.toDate}`,
        filtersApplied: this.getAppliedFilters(params.filters),
      };

      console.log(`Discovery complete: ${result.totalFound} URLs found for ${params.domain}`);
      return result;

    } catch (error) {
      console.error('Wayback discovery failed:', error);
      throw new Error(`Failed to discover URLs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Apply additional filters to the discovered URLs
   */
  private applyFilters(urls: WaybackUrl[], filters: WaybackDiscoveryParams['filters']): WaybackUrl[] {
    let filteredUrls = urls;

    // Filter by MIME type (if not already done by API)
    if (filters.htmlOnly) {
      filteredUrls = filteredUrls.filter(url => 
        url.mimeType.toLowerCase().includes('text/html')
      );
    }

    // Exclude system files
    if (filters.excludeSystemFiles) {
      filteredUrls = filteredUrls.filter(url => {
        const path = url.original.toLowerCase();
        return !path.includes('/robots.txt') &&
               !path.includes('/sitemap') &&
               !path.includes('/admin/') &&
               !path.includes('/wp-admin/') &&
               !path.includes('/wp-content/') &&
               !path.includes('/wp-includes/') &&
               !path.includes('/.well-known/') &&
               !path.includes('/cgi-bin/');
      });
    }

    // Remove duplicates (if not already done by API)
    if (filters.removeDuplicates) {
      const seen = new Set<string>();
      filteredUrls = filteredUrls.filter(url => {
        const key = url.original.toLowerCase();
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    }

    return filteredUrls;
  }

  /**
   * Get list of applied filters for display
   */
  private getAppliedFilters(filters: WaybackDiscoveryParams['filters']): string[] {
    const applied: string[] = [];

    if (filters.htmlOnly) {
      applied.push('HTML pages only');
    }
    if (filters.removeDuplicates) {
      applied.push('Duplicates removed');
    }
    if (filters.excludeSystemFiles) {
      applied.push('System files excluded');
    }

    return applied;
  }

  /**
   * Validate a domain for Wayback Machine discovery
   */
  validateDomain(domain: string): boolean {
    // Enhanced validation to support subfolders
    if (!domain || domain.trim().length === 0) {
      return false;
    }

    const trimmedDomain = domain.trim();
    
    // Check if it's a simple domain
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Check if it's a domain with subfolder
    const subfolderRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\/[a-zA-Z0-9\/\-_]+$/;
    
    return domainRegex.test(trimmedDomain) || subfolderRegex.test(trimmedDomain);
  }

  /**
   * Format domain for display
   */
  formatDomainForDisplay(domain: string): string {
    if (!domain) return '';
    
    const trimmedDomain = domain.trim();
    
    // If it's a subfolder, format it nicely
    if (trimmedDomain.includes('/')) {
      const parts = trimmedDomain.split('/');
      const baseDomain = parts[0];
      const path = parts.slice(1).join('/');
      return `${baseDomain}/${path}`;
    }
    
    return trimmedDomain;
  }

  /**
   * Get domain type for UI display
   */
  getDomainType(domain: string): 'domain' | 'subfolder' {
    if (!domain) return 'domain';
    
    const trimmedDomain = domain.trim();
    return trimmedDomain.includes('/') ? 'subfolder' : 'domain';
  }

  /**
   * Get examples for different domain types
   */
  getDomainExamples(): { domain: string; subfolder: string } {
    return {
      domain: 'example.com',
      subfolder: 'example.com/electronics'
    };
  }

  /**
   * Format date for CDX API (YYYYMMDD)
   */
  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Get month and year from date string
   */
  getMonthYear(date: Date): { month: string; year: number } {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return {
      month: months[date.getMonth()],
      year: date.getFullYear()
    };
  }

  /**
   * Get readable timeframe string
   */
  getReadableTimeframe(fromDate: string, toDate: string): string {
    const from = new Date(parseInt(fromDate.slice(0, 4)), parseInt(fromDate.slice(4, 6)) - 1, parseInt(fromDate.slice(6, 8)));
    const to = new Date(parseInt(toDate.slice(0, 4)), parseInt(toDate.slice(4, 6)) - 1, parseInt(toDate.slice(6, 8)));
    
    const fromMY = this.getMonthYear(from);
    const toMY = this.getMonthYear(to);
    
    if (fromMY.year === toMY.year && fromMY.month === toMY.month) {
      return `${fromMY.month} ${fromMY.year}`;
    } else if (fromMY.year === toMY.year) {
      return `${fromMY.month} - ${toMY.month} ${fromMY.year}`;
    } else {
      return `${fromMY.month} ${fromMY.year} - ${toMY.month} ${toMY.year}`;
    }
  }
}
