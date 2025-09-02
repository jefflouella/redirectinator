import { RedirectResult, ProjectSettings } from '@/types';

interface CheckResult {
  finalUrl: string;
  finalStatusCode: number;
  statusChain: string[];
  redirectCount: number;
  redirectChain: string[];
  hasLoop: boolean;
  hasMixedTypes: boolean;
  domainChanges: boolean;
  httpsUpgrade: boolean;
  method?: string;
  blockedReason?: string;
  affiliateService?: string;
  suggestedDirectUrl?: string;
  needsManualOverride?: boolean;
  suggestedFinalUrl?: string;
}

export class RedirectChecker {
  private settings: ProjectSettings;
  private mode: 'default' | 'advanced';

  constructor(settings: ProjectSettings) {
    this.settings = settings;
    this.mode = 'default'; // Default to default mode for speed
  }

  // Set the detection mode
  setMode(mode: 'default' | 'advanced') {
    this.mode = mode;
    console.log(`Redirect detection mode set to: ${mode}`);
  }

  // Get current mode
  getMode(): 'default' | 'advanced' {
    return this.mode;
  }

  // Toggle between modes
  toggleMode() {
    this.mode = this.mode === 'default' ? 'advanced' : 'default';
    console.log(`Redirect detection mode toggled to: ${this.mode}`);
    return this.mode;
  }

  async checkRedirect(startingUrl: string, targetRedirect: string = ''): Promise<RedirectResult> {
    const startTime = performance.now();
    const id = crypto.randomUUID();
    
    try {
      const result = await this.performRedirectCheck(startingUrl);
      const responseTime = Math.round(performance.now() - startTime);
      
      return {
        id,
        startingUrl,
        targetRedirect,
        finalUrl: result.finalUrl,
        result: this.determineResult(result, targetRedirect),
        httpStatus: result.statusChain.join(' → '),
        finalStatusCode: result.finalStatusCode,
        numberOfRedirects: result.redirectCount,
        responseTime,
        hasRedirectLoop: result.hasLoop,
        mixedRedirectTypes: result.hasMixedTypes,
        fullRedirectChain: result.redirectChain,
        statusChain: result.statusChain,
        domainChanges: result.domainChanges,
        httpsUpgrade: result.httpsUpgrade,
        needsManualOverride: result.needsManualOverride,
        suggestedFinalUrl: result.suggestedFinalUrl,
        blockedReason: result.blockedReason,
        affiliateService: result.affiliateService,
        suggestedDirectUrl: result.suggestedDirectUrl,
        timestamp: Date.now(),
        // New fields for enhanced redirect tracking
        redirectTypes: result.redirectTypes,
        redirectChainDetails: result.redirectChainDetails,
        hasMetaRefresh: result.hasMetaRefresh,
        hasJavaScriptRedirect: result.hasJavaScriptRedirect,
      };
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      
      return {
        id,
        startingUrl,
        targetRedirect,
        finalUrl: '',
        result: 'error',
        httpStatus: 'Error',
        finalStatusCode: 0,
        numberOfRedirects: 0,
        responseTime,
        hasRedirectLoop: false,
        mixedRedirectTypes: false,
        fullRedirectChain: [],
        statusChain: [],
        domainChanges: false,
        httpsUpgrade: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  private async performRedirectCheck(url: string) {
    // Check if this is an affiliate link that needs server-side processing
    const isAffiliateLink = this.isAffiliateLink(url);
    
    if (isAffiliateLink) {
      console.log(`Affiliate link detected: ${url}, using server-side processing`);
      return await this.performServerSideCheck(url);
    }

    // For now, use server-side for all URLs due to CORS restrictions
    // In the future, we can enable client-side for same-origin requests
    console.log(`URL detected: ${url}, using server-side processing (CORS bypass)`);
    return await this.performServerSideCheck(url);
  }

  private isAffiliateLink(url: string): boolean {
    // Comprehensive affiliate link patterns
    const affiliatePatterns = [
      // Major Affiliate Networks
      'go.linkby.com', 'prf.hn', 'partnerize.com', 'skimlinks.com', 'viglink.com', 'outbrain.com',
      'amazon.com/dp', 'amzn.to', 'amazon.com/gp', 'clickbank.com', 'clickbank.net',
      'commissionjunction.com', 'cj.com', 'shareasale.com', 'shareasale.net',
      'rakuten.com', 'rakuten.co.jp', 'ebates.com', 'awin.com', 'affiliatewindow.com',
      'impact.com', 'impactradius.com', 'flexoffers.com', 'pepperjam.com', 'avantlink.com',
      'linksynergy.com', 'linksynergy.net', 'performics.com', 'tradedoubler.com',
      'webgains.com', 'affiliatefuture.com', 'affiliatewindow.co.uk', 'dgmpro.com',
      
      // URL Shorteners (often used for affiliate links)
      'bit.ly', 't.co', 'tinyurl.com', 'ow.ly', 'buff.ly', 'is.gd', 'v.gd', 'shorturl.at',
      'rb.gy', 'cutt.ly', 'short.io', 'tiny.cc', 'shorten.asia', 'goo.gl', 't.ly',
      'short.cm', 'adf.ly', 'sh.st', 'bc.vc', 'adfly.com',
      
      // Social Media Affiliate Links
      'instagram.com/affiliate', 'facebook.com/affiliate', 'twitter.com/affiliate', 'pinterest.com/affiliate',
      
      // E-commerce Platform Affiliates
      'shopify.com/affiliate', 'woocommerce.com/affiliate', 'bigcommerce.com/affiliate', 'magento.com/affiliate',
      
      // Travel Affiliate Networks
      'booking.com/affiliate', 'expedia.com/affiliate', 'hotels.com/affiliate', 'tripadvisor.com/affiliate', 'kayak.com/affiliate',
      
      // Financial Affiliate Networks
      'creditkarma.com/affiliate', 'nerdwallet.com/affiliate', 'bankrate.com/affiliate', 'lendingtree.com/affiliate',
      
      // Technology Affiliate Networks
      'microsoft.com/affiliate', 'adobe.com/affiliate', 'autodesk.com/affiliate', 'intuit.com/affiliate',
      
      // Gaming Affiliate Networks
      'steam.com/affiliate', 'epicgames.com/affiliate', 'origin.com/affiliate', 'battle.net/affiliate',
      
      // Education Affiliate Networks
      'coursera.org/affiliate', 'udemy.com/affiliate', 'skillshare.com/affiliate', 'masterclass.com/affiliate',
      
      // Health & Fitness Affiliate Networks
      'myfitnesspal.com/affiliate', 'fitbit.com/affiliate', 'garmin.com/affiliate', 'strava.com/affiliate',
      
      // Fashion & Beauty Affiliate Networks
      'sephora.com/affiliate', 'ulta.com/affiliate', 'nordstrom.com/affiliate', 'macys.com/affiliate',
      
      // Food & Beverage Affiliate Networks
      'hellofresh.com/affiliate', 'blueapron.com/affiliate', 'instacart.com/affiliate', 'doordash.com/affiliate',
      
      // Subscription Service Affiliate Networks
      'netflix.com/affiliate', 'spotify.com/affiliate', 'hulu.com/affiliate', 'disneyplus.com/affiliate',
      
      // Home & Garden Affiliate Networks
      'wayfair.com/affiliate', 'overstock.com/affiliate', 'homedepot.com/affiliate', 'lowes.com/affiliate',
      
      // Automotive Affiliate Networks
      'carmax.com/affiliate', 'cargurus.com/affiliate', 'autotrader.com/affiliate', 'cars.com/affiliate',
      
      // Insurance Affiliate Networks
      'geico.com/affiliate', 'progressive.com/affiliate', 'statefarm.com/affiliate', 'allstate.com/affiliate',
      
      // Real Estate Affiliate Networks
      'zillow.com/affiliate', 'realtor.com/affiliate', 'redfin.com/affiliate', 'trulia.com/affiliate',
      
      // Job & Career Affiliate Networks
      'indeed.com/affiliate', 'linkedin.com/affiliate', 'monster.com/affiliate', 'careerbuilder.com/affiliate',
      
      // Pet & Animal Affiliate Networks
      'chewy.com/affiliate', 'petco.com/affiliate', 'petsmart.com/affiliate', 'petfinder.com/affiliate',
      
      // Sports & Outdoor Affiliate Networks
      'rei.com/affiliate', 'dickssportinggoods.com/affiliate', 'basspro.com/affiliate', 'cabelas.com/affiliate',
      
      // Baby & Kids Affiliate Networks
      'buybuybaby.com/affiliate', 'babiesrus.com/affiliate', 'toysrus.com/affiliate', 'target.com/affiliate',
      
      // Office & Business Affiliate Networks
      'staples.com/affiliate', 'officedepot.com/affiliate', 'quill.com/affiliate', 'newegg.com/affiliate'
    ];

    const urlLower = url.toLowerCase();
    return affiliatePatterns.some(pattern => urlLower.includes(pattern));
  }

  private async performClientSideCheck(url: string) {
    const originalDomain = new URL(url).hostname;
    const originalProtocol = new URL(url).protocol;

    try {
      const redirectChain: string[] = [];
      const statusChain: string[] = [];
      let redirectCount = 0;
      let hasLoop = false;
      let hasMixedTypes = false;
      let domainChanges = false;
      let httpsUpgrade = false;

      let currentUrl = url;
      const visitedUrls = new Set<string>();
      const redirectTypes = new Set<number>();
      let finalUrl = url;
      let finalStatusCode = 0;

      while (redirectCount < this.settings.maxRedirects) {
        if (visitedUrls.has(currentUrl)) {
          hasLoop = true;
          break;
        }
        visitedUrls.add(currentUrl);

        try {
          const response = await fetch(currentUrl, {
            method: 'HEAD',
            redirect: 'manual',
            signal: AbortSignal.timeout(this.settings.timeout),
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });

          const status = response.status;
          statusChain.push(status.toString());
          redirectTypes.add(status);
          finalStatusCode = status;

          if (status >= 200 && status < 300) {
            // Success - no more redirects
            finalUrl = currentUrl;
            break;
          } else if (status >= 300 && status < 400) {
            // Redirect
            redirectCount++;
            redirectChain.push(currentUrl);

            const location = response.headers.get('location');
            if (!location) {
              throw new Error('Redirect response missing Location header');
            }

            const newUrl = new URL(location, currentUrl);
            currentUrl = newUrl.toString();
            finalUrl = currentUrl;

            // Check for domain changes and HTTPS upgrades
            const newDomain = new URL(currentUrl).hostname;
            if (newDomain !== originalDomain) {
              domainChanges = true;
            }
            if (originalProtocol === 'http:' && currentUrl.startsWith('https:')) {
              httpsUpgrade = true;
            }
          } else {
            // Error status - try GET as fallback
            try {
              const getResponse = await fetch(currentUrl, {
                method: 'GET',
                redirect: 'manual',
                signal: AbortSignal.timeout(this.settings.timeout),
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
              });

              const getStatus = getResponse.status;
              statusChain[statusChain.length - 1] = getStatus.toString();
              finalStatusCode = getStatus;

              if (getStatus >= 200 && getStatus < 300) {
                finalUrl = currentUrl;
                break;
              } else if (getStatus >= 300 && getStatus < 400) {
                const location = getResponse.headers.get('location');
                if (location) {
                  redirectCount++;
                  redirectChain.push(currentUrl);
                  const newUrl = new URL(location, currentUrl);
                  currentUrl = newUrl.toString();
                  finalUrl = currentUrl;
                  continue;
                }
              }
            } catch (getError) {
              console.warn(`GET fallback failed for ${currentUrl}:`, getError);
            }
            break;
          }
        } catch (error) {
          console.warn(`Client-side request failed for ${currentUrl}:`, error);
          return null; // Indicate failure to trigger server-side fallback
        }
      }

      // Check for mixed redirect types
      hasMixedTypes = redirectTypes.size > 1;

      return {
        finalUrl,
        finalStatusCode,
        statusChain,
        redirectCount,
        redirectChain,
        hasLoop,
        hasMixedTypes,
        domainChanges,
        httpsUpgrade
      };

    } catch (error) {
      console.warn(`Client-side redirect check failed for ${url}:`, error);
      return null;
    }
  }

  private async performServerSideCheck(url: string) {
    try {
      // Try proxy server for comprehensive redirect analysis
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.settings.timeout);

      // Use mode-based logic instead of automatic detection
      const usePuppeteer = this.mode === 'advanced';
      
      console.log(`DEBUG: Frontend mode=${this.mode}, usePuppeteer=${usePuppeteer}, type=${typeof usePuppeteer}`);

      // Try to connect to the backend server via proxy
      let proxyResponse = null;
      try {
        const requestBody = {
          url,
          method: 'GET',
          followRedirects: false,
          maxRedirects: this.settings.maxRedirects,
          usePuppeteer: usePuppeteer
        };
        
        console.log(`DEBUG: Sending request body:`, requestBody);
        
        proxyResponse = await fetch('/api/check-redirect', {
          method: 'POST',
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        console.log(`Connected to backend server via proxy${usePuppeteer ? ' with Advanced mode (Puppeteer)' : ' with Default mode'}`);
      } catch (error) {
        console.error('Failed to connect to backend server via proxy:', error);
        throw error;
      }

      if (proxyResponse && proxyResponse.ok) {
        const data = await proxyResponse.json();
        console.log(`Backend server successfully analyzed ${url} in ${this.mode} mode:`, data);
        clearTimeout(timeoutId);
        return data;
      }

      console.warn(`Backend server not available for ${url}`);
      throw new Error('Server-side processing not available');

    } catch (error) {
      console.error(`Server-side redirect check failed for ${url}:`, error);
      throw error;
    }
  }



  private determineResult(checkResult: CheckResult, targetRedirect: string): 'direct' | 'redirect' | 'error' | 'loop' {
    // Debug logging
    console.log('determineResult called with:', {
      redirectCount: checkResult.redirectCount,
      targetRedirect: targetRedirect,
      finalStatusCode: checkResult.finalStatusCode,
      method: checkResult.method
    });

    // Check if this is a blocked affiliate link (server returns method: 'BLOCKED_AFFILIATE')
    if (checkResult.method === 'BLOCKED_AFFILIATE') {
      return 'error'; // Use 'error' type but we'll display it as 'blocked' in the UI
    }

    if (checkResult.hasLoop) {
      return 'loop';
    }

    if (checkResult.finalStatusCode === 0) {
      return 'error';
    }

    if (checkResult.redirectCount === 0) {
      console.log('No redirects, returning direct');
      return 'direct';
    }

    // If no target redirect specified (Wayback discovery), check if there were any redirects
    if (!targetRedirect) {
      const result = checkResult.redirectCount > 0 ? 'redirect' : 'direct';
      console.log(`No target redirect specified, redirectCount: ${checkResult.redirectCount}, returning: ${result}`);
      return result;
    }

    // Check if final URL matches target
    try {
      const finalUrl = new URL(checkResult.finalUrl);
      const targetUrl = new URL(targetRedirect);
      
      if (finalUrl.hostname === targetUrl.hostname && finalUrl.pathname === targetUrl.pathname) {
        return 'redirect';
      }
    } catch (error) {
      // If URL parsing fails, treat as error
      return 'error';
    }

    return 'error';
  }

  async checkBatch(urls: Array<{ startingUrl: string; targetRedirect: string }>): Promise<RedirectResult[]> {
    const results: RedirectResult[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const { startingUrl, targetRedirect } = urls[i];
      
      // Add delay between requests if specified
      if (i > 0 && this.settings.delayBetweenRequests > 0) {
        await new Promise(resolve => setTimeout(resolve, this.settings.delayBetweenRequests));
      }
      
      const result = await this.checkRedirect(startingUrl, targetRedirect);
      results.push(result);
    }
    
    return results;
  }
}
