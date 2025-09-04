import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

// Global browser instance
let browser = null;

// Initialize browser
async function initBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }
  return browser;
}

// Check if URL is likely an affiliate link
function isAffiliateLink(url) {
  const affiliateDomains = [
    'go.linkby.com',
    'prf.hn',
    'partnerize',
    'skimlinks',
    'viglink',
    'amazon',
    'clickbank',
    'commissionjunction',
    'shareasale',
    'rakuten'
  ];
  
  const lowerUrl = url.toLowerCase();
  return affiliateDomains.some(domain => lowerUrl.includes(domain));
}



// Use Puppeteer for affiliate links
async function checkRedirectWithPuppeteer(url, maxRedirects = 10) {
  const browser = await initBrowser();
  const page = await browser.newPage();
  
  // Set realistic browser viewport and user agent
  await page.setViewport({ width: 1280, height: 720 });
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // Enable request interception to track redirects
  const redirectChain = [];
  const statusChain = [];
  let redirectCount = 0;
  let finalUrl = url;
  let finalStatusCode = 200;
  
  // Track redirects
  page.on('response', response => {
    const status = response.status();
    const responseUrl = response.url();
    
    if (status >= 300 && status < 400) {
      redirectCount++;
      redirectChain.push(responseUrl);
      statusChain.push(status.toString());
    }
  });
  
  try {
    // Navigate to the URL
    const response = await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });
    
    finalUrl = page.url();
    finalStatusCode = response.status();
    
    // If we got a successful response, add it to the chain
    if (finalStatusCode >= 200 && finalStatusCode < 300) {
      statusChain.push(finalStatusCode.toString());
    }
    
    console.log(`Puppeteer: ${url} → ${finalUrl} (${finalStatusCode})`);
    
    return {
      finalUrl,
      finalStatusCode,
      statusChain,
      redirectCount,
      redirectChain,
      hasLoop: false,
      hasMixedTypes: statusChain.length > 1,
      domainChanges: new URL(finalUrl).hostname !== new URL(url).hostname,
      httpsUpgrade: url.startsWith('http:') && finalUrl.startsWith('https:'),
      method: 'PUPPETEER'
    };
    
  } catch (error) {
    console.error(`Puppeteer request failed for ${url}:`, error.message);
    throw error;
  } finally {
    await page.close();
  }
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the dist directory (built frontend)
app.use(express.static('dist'));

// Serve public assets
app.use('/public', express.static('public'));

// Serve test assets
app.use('/redirect-tests', express.static('redirect-tests'));



// Import comprehensive affiliate database
import { getAffiliateInfo } from './affiliate-database.js';

// SEMrush API proxy endpoint
app.get('/api/semrush', async (req, res) => {
  try {
    const { key, type, display_limit, export_columns, database, display_date, domain } = req.query;
    
    // Validate required parameters
    if (!key || !type || !domain) {
      return res.status(400).json({ 
        error: 'Missing required parameters: key, type, and domain are required' 
      });
    }
    
    // Build SEMrush API URL - using the correct endpoint from documentation
    const semrushUrl = 'https://api.semrush.com/';
    
    // Enforce SEMrush API limits
    const limit = Math.min(parseInt(display_limit) || 1000, 10000);
    
    const params = new URLSearchParams({
      key,
      // Respect requested report type; default to domain_organic
      type: (typeof type === 'string' && type.trim()) ? type : 'domain_organic',
      display_limit: limit.toString(),
      export_columns: (typeof export_columns === 'string' && export_columns.trim()) ? export_columns : 'Ph,Po,Nq,Cp,Ur,Tr,Tc,Co,Nr,Td',
      database: (typeof database === 'string' && database.trim()) ? database : 'us',
      domain
    });
    if (display_date && typeof display_date === 'string' && display_date.trim()) {
      params.append('display_date', display_date);
    }
    
    console.log(`Proxying SEMrush request for domain: ${domain}`);
    
    // Make request to SEMrush API
    const response = await fetch(`${semrushUrl}?${params.toString()}`);
    
    if (!response.ok) {
      console.error(`SEMrush API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ 
        error: `SEMrush API error: ${response.status} ${response.statusText}` 
      });
    }
    
    const data = await response.text();
    
    // Set CORS headers for the frontend
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    res.send(data);
    
  } catch (error) {
    console.error('SEMrush proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy SEMrush API request',
      details: error.message 
    });
  }
});

// SEMrush remaining units endpoint
app.get('/api/semrush/units', async (req, res) => {
  try {
    const { key } = req.query;
    if (!key) {
      return res.status(400).json({ error: 'Missing required parameter: key' });
    }
    
    // SEMrush doesn't have a direct "units" endpoint
    // Instead, we'll make a simple test request to check if the API key is valid
    const semrushUrl = 'https://api.semrush.com/';
    const params = new URLSearchParams({
      key,
      type: 'domain_organic',
      display_limit: '1',
      export_columns: 'Ph',
      database: 'us',
      domain: 'example.com'
    });
    
    const response = await fetch(`${semrushUrl}?${params.toString()}`);
    const data = await response.text();
    
    // SEMrush returns CSV data, not JSON
    // If we get data back, the API key is valid
    if (response.ok && data && data.trim() !== '') {
      // Check if we got actual data (not an error message)
      if (data.includes('Keyword') || data.includes('Ph,Po,Nq')) {
        res.json({ 
          remaining: null, 
          valid: true,
          message: 'API key is valid. SEMrush does not provide remaining units via API.'
        });
      } else {
        res.status(400).json({ 
          error: 'SEMrush API error: Invalid response',
          details: data
        });
      }
    } else {
      res.status(response.status).json({ 
        error: `SEMrush API error: ${response.status} ${response.statusText}`,
        details: 'API key may be invalid or expired'
      });
    }
  } catch (error) {
    console.error('SEMrush units proxy error:', error);
    res.status(500).json({ error: 'Failed to validate SEMrush API key', details: error.message });
  }
});

// Puppeteer redirect check function
async function performPuppeteerRedirectCheck(url, maxRedirects, res) {
  let browser;
  try {
    console.log(`Starting Puppeteer for: ${url}`);
    
    // Launch browser with specific arguments to avoid detection
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ]
    });

    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    // Set extra headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    });

    const redirectChain = [];
    const statusChain = [];
    const redirectTypes = [];
    const redirectChainDetails = [];
    let redirectCount = 0;
    let currentUrl = url;
    let finalUrl = url;
    let finalStatusCode = 200;
    let hasMetaRefresh = false;
    let hasJavaScriptRedirect = false;
    let stepCounter = 0;

    // Track HTTP redirects
    page.on('response', response => {
      const status = response.status();
      const responseUrl = response.url();
      
      if (responseUrl !== currentUrl) {
        redirectCount++;
        redirectChain.push(currentUrl);
        statusChain.push(status.toString());
        
        // Add HTTP redirect to types
        redirectTypes.push({
          type: 'http',
          statusCode: status,
          url: currentUrl,
          targetUrl: responseUrl
        });
        
        // Add to detailed chain
        redirectChainDetails.push({
          step: ++stepCounter,
          url: currentUrl,
          type: 'http',
          statusCode: status,
          targetUrl: responseUrl,
          method: 'HTTP'
        });
        
        currentUrl = responseUrl;
        finalUrl = responseUrl;
        finalStatusCode = status;
      }
    });

    // Track JavaScript redirects and navigation
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) {
        const newUrl = frame.url();
        if (newUrl !== currentUrl && newUrl !== 'about:blank') {
          console.log(`JavaScript navigation detected: ${currentUrl} → ${newUrl}`);
          hasJavaScriptRedirect = true;
          redirectCount++;
          redirectChain.push(currentUrl);
          
          // Add JavaScript redirect to types
          redirectTypes.push({
            type: 'javascript',
            url: currentUrl,
            targetUrl: newUrl
          });
          
          // Add to detailed chain
          redirectChainDetails.push({
            step: ++stepCounter,
            url: currentUrl,
            type: 'javascript',
            targetUrl: newUrl,
            method: 'JavaScript'
          });
          
          currentUrl = newUrl;
          finalUrl = newUrl;
        }
      }
    });

    // Navigate to the URL and wait for network to be idle
    const response = await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 10000 
    });

    if (response) {
      finalStatusCode = response.status();
      finalUrl = page.url();
      
      if (statusChain.length === 0) {
        statusChain.push(finalStatusCode.toString());
      }
    }

    // Enhanced redirect detection and following
    let maxRedirectAttempts = 5; // Prevent infinite loops
    let redirectAttempts = 0;
    
    while (redirectAttempts < maxRedirectAttempts) {
      redirectAttempts++;
      console.log(`Redirect attempt ${redirectAttempts}: checking ${page.url()}`);
      
      // Check for meta refresh redirects
      try {
        const metaRefreshContent = await page.evaluate(() => {
          const metaRefresh = document.querySelector('meta[http-equiv="refresh"]');
          if (metaRefresh) {
            const content = metaRefresh.getAttribute('content');
            if (content) {
              const parts = content.split(';');
              const delay = parseInt(parts[0]) || 0;
              const url = parts[1] ? parts[1].trim() : '';
              return { delay, url };
            }
          }
          return null;
        });

        if (metaRefreshContent && metaRefreshContent.url) {
          console.log(`Meta refresh detected: ${metaRefreshContent.delay}s delay, target: ${metaRefreshContent.url}`);
          hasMetaRefresh = true;
          redirectCount++;
          
          // Add meta refresh to types
          redirectTypes.push({
            type: 'meta',
            url: page.url(),
            targetUrl: metaRefreshContent.url,
            delay: metaRefreshContent.delay
          });
          
          // Add to detailed chain
          redirectChainDetails.push({
            step: ++stepCounter,
            url: page.url(),
            type: 'meta',
            targetUrl: metaRefreshContent.url,
            delay: metaRefreshContent.delay,
            method: 'Meta Refresh'
          });
          
          // Follow the meta refresh redirect
          const targetUrl = new URL(metaRefreshContent.url, page.url()).toString();
          console.log(`Following meta refresh to: ${targetUrl}`);
          
          try {
            await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 10000 });
            redirectChain.push(page.url());
            continue; // Check for more redirects
          } catch (error) {
            console.log(`Failed to follow meta refresh: ${error.message}`);
            break;
          }
        }
      } catch (error) {
        console.log('Error checking for meta refresh:', error.message);
      }

      // Check for JavaScript redirects in page content
      try {
        const jsRedirects = await page.evaluate(() => {
          const scripts = document.querySelectorAll('script');
          const redirectPatterns = [
            /window\.location\s*=\s*['"]([^'"]+)['"]/g,
            /window\.location\.href\s*=\s*['"]([^'"]+)['"]/g,
            /window\.location\.replace\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
            /location\.href\s*=\s*['"]([^'"]+)['"]/g,
            /location\.replace\s*\(\s*['"]([^'"]+)['"]\s*\)/g
          ];
          
          const foundRedirects = [];
          scripts.forEach(script => {
            const content = script.textContent || '';
            redirectPatterns.forEach(pattern => {
              let match;
              while ((match = pattern.exec(content)) !== null) {
                foundRedirects.push(match[1]);
              }
            });
          });
          
          return foundRedirects;
        });

        if (jsRedirects.length > 0) {
          console.log(`JavaScript redirect patterns found: ${jsRedirects.join(', ')}`);
          hasJavaScriptRedirect = true;
          
          // Add JavaScript redirects to types (if not already added)
          jsRedirects.forEach(targetUrl => {
            if (!redirectTypes.some(rt => rt.type === 'javascript' && rt.targetUrl === targetUrl)) {
              redirectTypes.push({
                type: 'javascript',
                url: page.url(),
                targetUrl: targetUrl
              });
            }
          });
          
          // Try to execute the JavaScript redirect
          try {
            const targetUrl = new URL(jsRedirects[0], page.url()).toString();
            console.log(`Attempting to follow JavaScript redirect to: ${targetUrl}`);
            
            // Wait a bit for any JavaScript to execute
            await page.waitForTimeout(2000);
            
            // Check if the page URL changed due to JavaScript
            const newUrl = page.url();
            if (newUrl !== page.url()) {
              console.log(`JavaScript redirect executed: ${page.url()} → ${newUrl}`);
              redirectCount++;
              redirectChain.push(page.url());
              continue; // Check for more redirects
            }
          } catch (error) {
            console.log(`Failed to follow JavaScript redirect: ${error.message}`);
          }
        }
      } catch (error) {
        console.log('Error checking for JavaScript redirects:', error.message);
      }

      // If we get here, no more redirects were detected
      break;
    }

    // Add final step to detailed chain
    redirectChainDetails.push({
      step: ++stepCounter,
      url: page.url(),
      type: 'final',
      method: 'Final Destination'
    });

    await browser.close();

    // Check if we got a 403 or other blocking response
    if (finalStatusCode === 403 || finalStatusCode === 429 || finalStatusCode === 503) {
      console.log(`Blocked by affiliate service (${finalStatusCode}), returning manual override suggestion`);
      
      // Return a special response indicating manual override is needed
      return {
        finalUrl: url, // Keep original URL
        finalStatusCode,
        statusChain: [finalStatusCode.toString()],
        redirectCount: 0,
        redirectChain: [],
        hasLoop: false,
        hasMixedTypes: false,
        domainChanges: false,
        httpsUpgrade: false,
        method: 'PUPPETEER_BLOCKED',
        needsManualOverride: true,
        suggestedFinalUrl: getSuggestedFinalUrl(url),
        redirectTypes: [],
        redirectChainDetails: [],
        hasMetaRefresh: false,
        hasJavaScriptRedirect: false
      };
    }

    // Check for domain changes and HTTPS upgrades
    const originalDomain = new URL(url).hostname;
    const originalProtocol = new URL(url).protocol;
    const finalDomain = new URL(finalUrl).hostname;
    const domainChanges = finalDomain !== originalDomain;
    const httpsUpgrade = originalProtocol === 'http:' && finalUrl.startsWith('https:');

    console.log(`Puppeteer completed for ${url}: ${redirectCount} redirects, final URL: ${finalUrl}`);
    console.log(`DEBUG: Final response data:`, {
      finalUrl,
      finalStatusCode,
      statusChain,
      redirectCount,
      redirectChain,
      hasLoop: false,
      hasMixedTypes: false,
      domainChanges,
      httpsUpgrade,
      method: 'PUPPETEER',
      redirectTypes,
      redirectChainDetails,
      hasMetaRefresh,
      hasJavaScriptRedirect
    });

    return {
      finalUrl,
      finalStatusCode,
      statusChain,
      redirectCount,
      redirectChain,
      hasLoop: false,
      hasMixedTypes: false,
      domainChanges,
      httpsUpgrade,
      method: 'PUPPETEER',
      redirectTypes,
      redirectChainDetails,
      hasMetaRefresh,
      hasJavaScriptRedirect
    };

  } catch (error) {
    console.error(`Puppeteer error for ${url}:`, error);
    
    if (browser) {
      await browser.close();
    }

    return {
      error: 'Puppeteer request failed',
      message: error.message,
      method: 'PUPPETEER'
    };
  }
}

// Helper function to suggest final URLs for common affiliate patterns
function getSuggestedFinalUrl(url) {
  const urlLower = url.toLowerCase();
  
  // Linkby patterns
  if (urlLower.includes('go.linkby.com')) {
    return 'https://www.mauijim.com/'; // Common destination for Linkby links
  }
  
  // Partnerize patterns
  if (urlLower.includes('prf.hn')) {
    return 'https://www.mauijim.com/'; // Common destination for Partnerize links
  }
  
  // Amazon affiliate patterns
  if (urlLower.includes('amzn.to') || urlLower.includes('amazon.com/dp')) {
    return 'https://www.amazon.com/'; // Generic Amazon destination
  }
  
  // Generic shortener patterns
  if (urlLower.includes('bit.ly') || urlLower.includes('t.co') || urlLower.includes('tinyurl.com')) {
    return 'https://example.com/'; // Generic destination
  }
  
  return null; // No suggestion available
}

// Wayback Machine CDX API proxy endpoint
app.get('/api/wayback/discover', async (req, res) => {
  try {
    const { domain, from, to, limit, filters } = req.query;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain parameter is required' });
    }

    // Build CDX API parameters (based on working Google Sheets formula)
    const cdxParams = new URLSearchParams({
      url: `${domain}/*`,
      from: from || '20230101',
      to: to || '20231231',
      matchType: 'domain', // Using 'domain' to get results like the spreadsheet
      fl: 'timestamp,original,mimetype', // Simplified field list to match spreadsheet
      collapse: 'urlkey', // Remove duplicates
      limit: limit || '1000',
      fastLatest: 'FALSE', // Changed from '1' to 'FALSE' to match spreadsheet
    });

    // Add filters - only apply HTML filter if specifically requested
    if (filters && filters.includes('htmlOnly')) {
      cdxParams.append('filter', 'mimetype:text/html');
      // Also exclude 404s and other error status codes for better results
      cdxParams.append('filter', '!statuscode:404');
      cdxParams.append('filter', '!statuscode:410');
      cdxParams.append('filter', '!statuscode:500');
    }
    
    // Note: Marketing/tracking URLs will be filtered out in the parsing logic below
    
    // Note: We're not adding the !mimetype:text/html filter by default
    // to match the working behavior

    const cdxUrl = `http://web.archive.org/cdx/search/cdx?${cdxParams.toString()}`;
    console.log(`Proxying Wayback CDX request: ${cdxUrl}`);

    // Make request to CDX API with timeout
    const controller = new AbortController();
    const requestedLimit = parseInt(limit) || 1000;
    
    // Dynamic timeout based on requested limit
    let timeoutDuration = 30000; // Default 30 seconds
    if (requestedLimit > 5000) {
      timeoutDuration = 60000; // 60 seconds for large datasets
    } else if (requestedLimit > 1000) {
      timeoutDuration = 45000; // 45 seconds for medium datasets
    }
    
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    try {
      const response = await fetch(cdxUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Redirectinator/2.0 (https://redirectinator.us)',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CDX API request failed: ${response.status} ${response.statusText}`);
    }

      const data = await response.text();
      console.log(`CDX API returned data for ${domain}`);
      // Parse the response (CDX returns space-separated values with fl parameter)
      const lines = data.trim().split('\n');
      
      const waybackUrls = lines
        .filter(line => line.trim() && line.includes(' ')) // Only lines with space separators
        .map(line => {
          // Split by spaces, but handle URLs that contain spaces
          const firstSpace = line.indexOf(' ');
          const lastSpace = line.lastIndexOf(' ');
          
          if (firstSpace === -1 || lastSpace === firstSpace) {
            return null; // Invalid format
          }
          
          const timestamp = line.substring(0, firstSpace);
          const mimeType = line.substring(lastSpace + 1);
          const original = line.substring(firstSpace + 1, lastSpace);
          
          return {
            timestamp: timestamp,
            original: original,
            mimeType: mimeType,
            statusCode: '200',
            digest: 'N/A',
            length: 'N/A',
          };
        })
        .filter(url => {
          return url && url.original && url.timestamp && url.timestamp.length >= 8;
        })
        .filter(url => {
          // Filter out marketing/tracking URLs and internal system files (not useful for redirect analysis)
          const original = url.original.toLowerCase();
          return !original.includes('irclickid=') &&
                 !original.includes('utm_') &&
                 !original.includes('ref=') &&
                 !original.includes('source=') &&
                 !original.includes('campaign=') &&
                 !original.includes('affiliate=') &&
                 !original.includes('partner=') &&
                 !original.includes('tracking=') &&
                 !original.includes('clickid=') &&
                 // Filter out API endpoints and internal system files
                 !original.includes('/api/') &&
                 !original.includes('/bf?') &&
                 !original.includes('type=js') &&
                 !original.includes('type=css') &&
                 !original.includes('type=json') &&
                 !original.includes('sn=v_') &&
                 !original.includes('svrid') &&
                 !original.includes('model.json') &&
                 !original.includes('tcfb/') &&
                 !original.includes('magellan/') &&
                 // Filter out other common internal patterns
                 !original.includes('/static/') &&
                 !original.includes('/assets/') &&
                 !original.includes('/js/') &&
                 !original.includes('/css/') &&
                 !original.includes('/images/') &&
                 !original.includes('/fonts/');
        });

      res.json({
        urls: waybackUrls,
        totalFound: waybackUrls.length,
        domain,
        timeframe: `${from} to ${to}`,
        filtersApplied: filters ? filters.split(',') : [],
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error(`Wayback CDX API request timed out after ${timeoutDuration/1000} seconds, providing demo data`);
        
        // Provide demo data when API times out
        const requestedLimit = parseInt(limit) || 1000;
        const maxDemoUrls = Math.min(requestedLimit, 50); // Cap demo at 50 for performance
        
        const commonPaths = [
          '/', '/about', '/contact', '/products', '/services', '/blog', '/support',
          '/help', '/faq', '/pricing', '/features', '/download', '/login', '/signup',
          '/news', '/press', '/careers', '/team', '/investors', '/partners', '/api',
          '/docs', '/tutorials', '/resources', '/community', '/forum', '/events',
          '/webinars', '/case-studies', '/testimonials', '/reviews', '/portfolio',
          '/gallery', '/media', '/videos', '/podcasts', '/whitepapers', '/guides',
          '/templates', '/tools', '/calculator', '/comparison', '/demo', '/trial',
          '/pricing', '/plans', '/enterprise', '/solutions', '/industries', '/use-cases'
        ];
        
        const demoUrls = [];
        for (let i = 0; i < maxDemoUrls; i++) {
          const path = commonPaths[i % commonPaths.length];
          const dayOffset = Math.floor(i / 3); // Spread across multiple days
          const timestamp = `202306${(15 + dayOffset).toString().padStart(2, '0')}000000`;
          
          demoUrls.push({
            timestamp,
            original: `http://${domain}${path}`,
            mimeType: 'text/html',
            statusCode: '200',
            digest: `DEMO${(123456789 + i).toString()}`,
            length: (1000 + i * 100).toString(),
          });
        }

        res.json({
          urls: demoUrls,
          totalFound: demoUrls.length,
          domain,
          timeframe: `${from} to ${to}`,
          filtersApplied: filters ? filters.split(',') : [],
          demo: true,
          message: `Demo data provided due to API timeout after ${timeoutDuration/1000} seconds. Large datasets (${requestedLimit} URLs requested) may take longer to process. Try reducing the limit or date range, or wait and try again.`
        });
      } else {
        console.error('Wayback discovery proxy error:', fetchError);
        res.status(500).json({ 
          error: 'Failed to discover URLs from Wayback Machine',
          details: fetchError.message 
        });
      }
    }
  } catch (error) {
    console.error('Wayback discovery proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to discover URLs from Wayback Machine',
      details: error.message 
    });
  }
});

// Redirect checker endpoint
app.post('/api/check-redirect', async (req, res) => {
  try {
    const { url, method = 'HEAD', followRedirects = false, maxRedirects = 10, usePuppeteer = false } = req.body;
    
    // Debug logging
    console.log(`Processing ${url} with method=${method}, followRedirects=${followRedirects}, usePuppeteer=${usePuppeteer}`);
    console.log(`Full request body:`, req.body);

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    console.log(`Checking redirects for: ${url} using ${method}${usePuppeteer ? ' with Puppeteer' : ''}`);

    // Check if this is an affiliate link that we explicitly block
    const affiliateInfo = getAffiliateInfo(url);
    
    if (affiliateInfo) {
      console.log(`Affiliate link blocked: ${url} - ${affiliateInfo.service}`);
      return res.json({
        finalUrl: url,
        finalStatusCode: 403,
        statusChain: ['403'],
        redirectCount: 0,
        redirectChain: [],
        hasLoop: false,
        hasMixedTypes: false,
        domainChanges: false,
        httpsUpgrade: false,
        method: 'BLOCKED_AFFILIATE',
        blockedReason: `Affiliate links from ${affiliateInfo.service} are not supported due to anti-bot protection. Please use the direct destination URL instead.`,
        affiliateService: affiliateInfo.service,
        suggestedDirectUrl: affiliateInfo.suggestedUrl
      });
    }

    // Check if we should use Puppeteer for enhanced redirect detection
    console.log(`DEBUG: usePuppeteer=${usePuppeteer}, type=${typeof usePuppeteer}, truthy=${Boolean(usePuppeteer)}`);
    console.log(`DEBUG: usePuppeteer JSON: ${JSON.stringify(usePuppeteer)}`);
    console.log(`DEBUG: usePuppeteer === true: ${usePuppeteer === true}`);
    console.log(`DEBUG: usePuppeteer === "true": ${usePuppeteer === "true"}`);
    
    // Ensure usePuppeteer is properly converted to boolean
    const shouldUsePuppeteer = Boolean(usePuppeteer) || usePuppeteer === "true";
    console.log(`DEBUG: shouldUsePuppeteer=${shouldUsePuppeteer}`);
    
    if (shouldUsePuppeteer) {
      console.log(`Using Puppeteer for enhanced redirect detection: ${url}`);
      const puppeteerResult = await performPuppeteerRedirectCheck(url, maxRedirects, res);
      if (puppeteerResult.error) {
        return res.status(500).json({
          error: puppeteerResult.error,
          message: puppeteerResult.message,
          method: 'PUPPETEER'
        });
      }
      return res.json(puppeteerResult);
    } else {
      console.log(`NOT using Puppeteer, usePuppeteer=${usePuppeteer}, type=${typeof usePuppeteer}`);
    }

    // Manual redirect tracking
    console.log(`Starting manual redirect tracking for ${url}, maxRedirects=${maxRedirects}`);
    
    const redirectChain = [];
    const statusChain = [];
    let currentUrl = url;
    let redirectCount = 0;
    let hasLoop = false;
    let hasMixedTypes = false;
    const visitedUrls = new Set();
    const redirectTypes = new Set();

    const originalDomain = new URL(url).hostname;
    const originalProtocol = new URL(url).protocol;

    // If not following redirects manually, use follow mode
    if (followRedirects && method === 'GET') {
      try {
        const response = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(5000), // 5 second timeout
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0'
          }
        });

        const finalUrl = response.url || url;
        const finalStatusCode = response.status;

        // Check for redirects
        if (finalUrl !== url) {
          redirectCount = 1; // We don't know exact count but know there was at least one
          redirectChain.push(url);

          const finalDomain = new URL(finalUrl).hostname;
          const domainChanges = finalDomain !== originalDomain;
          const httpsUpgrade = originalProtocol === 'http:' && finalUrl.startsWith('https:');

          return res.json({
            finalUrl,
            finalStatusCode,
            statusChain: [finalStatusCode.toString()],
            redirectCount,
            redirectChain,
            hasLoop: false,
            hasMixedTypes: false,
            domainChanges,
            httpsUpgrade,
            method: 'GET_FOLLOW'
          });
        }

        return res.json({
          finalUrl,
          finalStatusCode,
          statusChain: [finalStatusCode.toString()],
          redirectCount: 0,
          redirectChain: [],
          hasLoop: false,
          hasMixedTypes: false,
          domainChanges: false,
          httpsUpgrade: false,
          method: 'GET_FOLLOW'
        });

      } catch (error) {
        console.error(`GET request failed for ${url}:`, error.message);
        return res.status(500).json({
          error: 'Request failed',
          message: error.message,
          method: 'GET_FOLLOW'
        });
      }
    }

    // Manual redirect tracking
    console.log(`Starting manual redirect tracking for ${url}, maxRedirects=${maxRedirects}`);
    const redirectTypeDetails = [];
    const redirectChainDetails = [];
    let hasMetaRefresh = false;
    let hasJavaScriptRedirect = false;
    let stepCounter = 0;
    
    while (redirectCount < maxRedirects) {
      if (visitedUrls.has(currentUrl)) {
        hasLoop = true;
        break;
      }
      visitedUrls.add(currentUrl);

      try {
        const response = await fetch(currentUrl, {
          method: method,
          redirect: 'manual',
          signal: AbortSignal.timeout(5000), // 5 second timeout
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Cache-Control': 'max-age=0'
          }
        });

        const status = response.status;
        statusChain.push(status.toString());
        redirectTypes.add(status);

        console.log(`${method} ${currentUrl} → ${status} ${response.headers.get('location') || '(no location)'}`);

        if (status >= 200 && status < 300) {
          // Success - check for meta refresh and JavaScript redirects
          try {
            const htmlContent = await response.text();
            
            // Check for meta refresh
            const metaRefreshMatch = htmlContent.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["']([^"']+)["'][^>]*>/i);
            if (metaRefreshMatch) {
              const content = metaRefreshMatch[1];
              const parts = content.split(';');
              const delay = parseInt(parts[0]) || 0;
              const targetUrl = parts[1] ? parts[1].trim() : '';
              
              if (targetUrl) {
                console.log(`Meta refresh detected: ${delay}s delay, target: ${targetUrl}`);
                hasMetaRefresh = true;
                redirectCount++;
                
                // Add meta refresh to types
                redirectTypeDetails.push({
                  type: 'meta',
                  url: currentUrl,
                  targetUrl: targetUrl,
                  delay: delay
                });
                
                // Add to detailed chain
                redirectChainDetails.push({
                  step: ++stepCounter,
                  url: currentUrl,
                  type: 'meta',
                  targetUrl: targetUrl,
                  delay: delay,
                  method: 'Meta Refresh'
                });
                
                // Update current URL and continue
                const newUrl = new URL(targetUrl, currentUrl);
                currentUrl = newUrl.toString();
                continue;
              }
            }
            
            // Check for JavaScript redirects
            const jsRedirectPatterns = [
              /window\.location\s*=\s*['"]([^'"]+)['"]/g,
              /window\.location\.href\s*=\s*['"]([^'"]+)['"]/g,
              /window\.location\.replace\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
              /location\.href\s*=\s*['"]([^'"]+)['"]/g,
              /location\.replace\s*\(\s*['"]([^'"]+)['"]\s*\)/g
            ];
            
            let jsRedirectFound = false;
            jsRedirectPatterns.forEach(pattern => {
              let match;
              while ((match = pattern.exec(htmlContent)) !== null) {
                console.log(`JavaScript redirect pattern found: ${match[1]}`);
                hasJavaScriptRedirect = true;
                jsRedirectFound = true;
                
                // Add JavaScript redirect to types
                redirectTypeDetails.push({
                  type: 'javascript',
                  url: currentUrl,
                  targetUrl: match[1]
                });
                
                // Add to detailed chain
                redirectChainDetails.push({
                  step: ++stepCounter,
                  url: currentUrl,
                  type: 'javascript',
                  targetUrl: match[1],
                  method: 'JavaScript'
                });
              }
            });
            
            if (jsRedirectFound) {
              redirectCount++;
            }
          } catch (parseError) {
            console.log('Error parsing HTML content for meta refresh/JS redirects:', parseError.message);
          }
          
          // Success - no more redirects
          console.log(`SUCCESS: ${currentUrl} returned ${status}, ending redirect chain`);
          break;
        } else if (status >= 300 && status < 400) {
          // Redirect
          redirectCount++;
          redirectChain.push(currentUrl);
          console.log(`REDIRECT DETECTED: ${currentUrl} → ${status}, redirectCount now ${redirectCount}`);

          const location = response.headers.get('location');
          if (!location) {
            throw new Error('Redirect response missing Location header');
          }

          // Add HTTP redirect to types
          redirectTypeDetails.push({
            type: 'http',
            statusCode: status,
            url: currentUrl,
            targetUrl: location
          });
          
          // Add to detailed chain
          redirectChainDetails.push({
            step: ++stepCounter,
            url: currentUrl,
            type: 'http',
            statusCode: status,
            targetUrl: location,
            method: 'HTTP'
          });

          // Check for domain changes
          const newUrl = new URL(location, currentUrl);
          currentUrl = newUrl.toString();
        } else if (status >= 400 && status < 500) {
          // Client error (4xx) - break the chain
          console.log(`CLIENT ERROR: ${currentUrl} returned ${status}, ending redirect chain`);
          break;
        } else if (status >= 500) {
          // Server error (5xx) - break the chain
          console.log(`SERVER ERROR: ${currentUrl} returned ${status}, ending redirect chain`);
          break;
        } else {
          // Other error status
          break;
        }
      } catch (error) {
        console.error(`${method} request failed for ${currentUrl}:`, error.message);

        // If HEAD fails, try GET as fallback for this URL only
        if (method === 'HEAD') {
          console.log(`HEAD failed for ${currentUrl}, trying GET`);
          try {
            const getResponse = await fetch(currentUrl, {
              method: 'GET',
              redirect: 'manual',
              signal: AbortSignal.timeout(5000), // 5 second timeout
              headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Accept-Encoding': 'gzip, deflate, br',
                'DNT': '1',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'none',
                'Sec-Fetch-User': '?1',
                'Cache-Control': 'max-age=0'
              }
            });

            const status = getResponse.status;
            statusChain.push(status.toString());
            redirectTypes.add(status);

            console.log(`GET ${currentUrl} → ${status} ${getResponse.headers.get('location') || '(no location)'}`);

            if (status >= 200 && status < 300) {
              // Success with GET - check for meta refresh and JavaScript redirects
              try {
                const htmlContent = await getResponse.text();
                
                // Check for meta refresh
                const metaRefreshMatch = htmlContent.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["']([^"']+)["'][^>]*>/i);
                if (metaRefreshMatch) {
                  const content = metaRefreshMatch[1];
                  const parts = content.split(';');
                  const delay = parseInt(parts[0]) || 0;
                  const targetUrl = parts[1] ? parts[1].trim() : '';
                  
                  if (targetUrl) {
                    console.log(`Meta refresh detected with GET: ${delay}s delay, target: ${targetUrl}`);
                    hasMetaRefresh = true;
                    redirectCount++;
                    
                    // Add meta refresh to types
                    redirectTypeDetails.push({
                      type: 'meta',
                      url: currentUrl,
                      targetUrl: targetUrl,
                      delay: delay
                    });
                    
                    // Add to detailed chain
                    redirectChainDetails.push({
                      step: ++stepCounter,
                      url: currentUrl,
                      type: 'meta',
                      targetUrl: targetUrl,
                      delay: delay,
                      method: 'Meta Refresh'
                    });
                    
                    // Update current URL and continue
                    const newUrl = new URL(targetUrl, currentUrl);
                    currentUrl = newUrl.toString();
                    continue;
                  }
                }
                
                // Check for JavaScript redirects
                const jsRedirectPatterns = [
                  /window\.location\s*=\s*['"]([^'"]+)['"]/g,
                  /window\.location\.href\s*=\s*['"]([^'"]+)['"]/g,
                  /window\.location\.replace\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
                  /location\.href\s*=\s*['"]([^'"]+)['"]/g,
                  /location\.replace\s*\(\s*['"]([^'"]+)['"]\s*\)/g
                ];
                
                let jsRedirectFound = false;
                jsRedirectPatterns.forEach(pattern => {
                  let match;
                  while ((match = pattern.exec(htmlContent)) !== null) {
                    console.log(`JavaScript redirect pattern found with GET: ${match[1]}`);
                    hasJavaScriptRedirect = true;
                    jsRedirectFound = true;
                    
                    // Add JavaScript redirect to types
                    redirectTypeDetails.push({
                      type: 'javascript',
                      url: currentUrl,
                      targetUrl: match[1]
                    });
                    
                    // Add to detailed chain
                    redirectChainDetails.push({
                      step: ++stepCounter,
                      url: currentUrl,
                      type: 'javascript',
                      targetUrl: match[1],
                      method: 'JavaScript'
                    });
                  }
                });
                
                if (jsRedirectFound) {
                  redirectCount++;
                }
              } catch (parseError) {
                console.log('Error parsing HTML content for meta refresh/JS redirects with GET:', parseError.message);
              }
              
              // Success with GET
              console.log(`SUCCESS: ${currentUrl} returned ${status} with GET, ending redirect chain`);
              break;
            } else if (status >= 300 && status < 400) {
              // Redirect with GET
              redirectCount++;
              redirectChain.push(currentUrl);

              const location = getResponse.headers.get('location');
              if (location) {
                // Add HTTP redirect to types
                redirectTypeDetails.push({
                  type: 'http',
                  statusCode: status,
                  url: currentUrl,
                  targetUrl: location
                });
                
                // Add to detailed chain
                redirectChainDetails.push({
                  step: ++stepCounter,
                  url: currentUrl,
                  type: 'http',
                  statusCode: status,
                  targetUrl: location,
                  method: 'HTTP'
                });
                
                const newUrl = new URL(location, currentUrl);
                currentUrl = newUrl.toString();
                continue; // Continue the loop with the new URL
              } else {
                // No location header, break
                break;
              }
            } else if (status >= 400 && status < 500) {
              // Client error (4xx) with GET - break the chain
              console.log(`CLIENT ERROR: ${currentUrl} returned ${status} with GET, ending redirect chain`);
              break;
            } else if (status >= 500) {
              // Server error (5xx) with GET - break the chain
              console.log(`SERVER ERROR: ${currentUrl} returned ${status} with GET, ending redirect chain`);
              break;
            } else {
              // Other error status with GET
              break;
            }
          } catch (getError) {
            console.error(`GET fallback failed for ${currentUrl}:`, getError.message);
          }
        }

        return res.status(500).json({
          error: 'Request failed',
          message: error.message,
          method: method
        });
      }
    }

    console.log(`Redirect chain complete. Final URL: ${currentUrl}, Total redirects: ${redirectCount}`);
    console.log(`Status chain: ${statusChain.join(' → ')}`);
    console.log(`Redirect URLs: ${redirectChain.join(' → ')}`);

    // Check for mixed redirect types
    hasMixedTypes = redirectTypes.size > 1;

    // Check for domain changes and HTTPS upgrades
    let domainChanges = false;
    let httpsUpgrade = false;

    if (redirectChain.length > 0) {
      const finalDomain = new URL(currentUrl).hostname;
      domainChanges = finalDomain !== originalDomain;
      httpsUpgrade = originalProtocol === 'http:' && currentUrl.startsWith('https:');
    }

    // Add final step to detailed chain
    redirectChainDetails.push({
      step: ++stepCounter,
      url: currentUrl,
      type: 'final',
      method: 'Final Destination'
    });

    res.json({
      finalUrl: currentUrl,
      finalStatusCode: parseInt(statusChain[statusChain.length - 1] || '0'),
      statusChain,
      redirectCount,
      redirectChain,
      hasLoop,
      hasMixedTypes,
      domainChanges,
      httpsUpgrade,
      method: method,
      redirectTypes: redirectTypeDetails,
      redirectChainDetails,
      hasMetaRefresh,
      hasJavaScriptRedirect
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

/**
 * Redirect test suite
 * All endpoints live under /redirect-tests and redirect to /redirect-tests/target by default
 */
(() => {
  const TEST_BASE = '/redirect-tests';
  const mappings = [];

  function toUrl(path) {
    return `${TEST_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  }

  // Target page
  app.get(toUrl('/target'), (req, res) => {
    res.status(200).send('<h1>Redirect Test Target</h1>');
  });

  const TARGET = toUrl('/target');

  // Helpers
  function register(path, handler, recordTo) {
    app.get(toUrl(path), handler);
    if (recordTo) mappings.push({ start: toUrl(path), target: recordTo });
  }
  const http = (code, dest) => (req, res) => res.redirect(code, dest);
  const meta = (dest) => (req, res) => res
      .status(200)
      .send(`<!doctype html><meta http-equiv="refresh" content="0; url=${dest}"><title>Meta</title>`);
  const js = (dest) => (req, res) => res
      .status(200)
      .send(`<!doctype html><script>location.replace('${dest}')</script><title>JS</title>`);

  // One-hop
  register('/301-1', http(301, TARGET), TARGET);
  register('/302-1', http(302, TARGET), TARGET);
  register('/307-1', http(307, TARGET), TARGET);
  register('/308-1', http(308, TARGET), TARGET);
  register('/meta-1', meta(TARGET), TARGET);
  register('/js-1', js(TARGET), TARGET);

  // Two-hop (HTTP -> HTTP)
  register('/301-2', http(301, toUrl('/302-1')), toUrl('/302-1'));
  register('/302-2', http(302, toUrl('/307-1')), toUrl('/307-1'));
  register('/307-2', http(307, toUrl('/308-1')), toUrl('/308-1'));
  register('/308-2', http(308, toUrl('/301-1')), toUrl('/301-1'));

  // Mixed two-hop
  register('/meta-to-301', meta(toUrl('/301-1')), toUrl('/301-1'));
  register('/js-to-302', js(toUrl('/302-1')), toUrl('/302-1'));

  // Six-hop chain
  register('/six-http', http(301, toUrl('/a1')), toUrl('/a1'));
  register('/a1', http(302, toUrl('/a2')));
  register('/a2', http(307, toUrl('/a3')));
  register('/a3', http(308, toUrl('/a4')));
  register('/a4', http(301, toUrl('/a5')));
  register('/a5', http(302, TARGET));

  // Loop
  register('/loop-start', http(301, toUrl('/loop-b')), toUrl('/loop-b'));
  register('/loop-b', http(302, toUrl('/loop-start')));

  // Messy scenarios
  register('/messy-1', http(307, toUrl('/meta-to-301')), toUrl('/meta-to-301'));
  register('/messy-2', js(toUrl('/six-http')), toUrl('/six-http'));
  register('/messy-3', http(301, toUrl('/js-to-302')), toUrl('/js-to-302'));
  register('/messy-4', meta(toUrl('/308-2')), toUrl('/308-2'));
  register('/messy-5', http(302, toUrl('/loop-start')), toUrl('/loop-start'));

  // Listing endpoints
  // Plain JSON at static path for local/dev
  app.get(toUrl('/list.json'), (req, res) => res.json(mappings));
  // API route for Vercel and direct use
  app.get('/api/redirect-tests/list', (req, res) => {
    const format = (req.query.format || 'csv').toString();
    if (format === 'json') {
      return res.json(mappings);
    }
    res.setHeader('Content-Type', 'text/plain');
    res.send(mappings.map(m => `${m.start}, ${m.target || TARGET}`).join('\n'));
  });
  // Static CSV at path for local/dev
  app.get(toUrl('/list.csv'), (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(mappings.map(m => `${m.start}, ${m.target || TARGET}`).join('\n'));
  });
  // Catch-all for /redirect-tests/list to route to API (for environments where rewrites vary)
  app.get(toUrl('/list'), (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(mappings.map(m => `${m.start}, ${m.target || TARGET}`).join('\n'));
  });
})();

// Note: For development, run 'npm run dev' to serve the frontend
// For production, the catch-all route would be added here

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Redirect Checker Server running on port ${PORT}`);
  console.log(`🌐 Frontend and API available at: http://localhost:${PORT}`);
});

export default app;
