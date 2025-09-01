import { getAffiliateInfo } from '../affiliate-database.js';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url, method = 'HEAD', followRedirects = false, maxRedirects = 10, usePuppeteer = false } = req.body;
    
    // Debug logging
    console.log(`Processing ${url} with method=${method}, followRedirects=${followRedirects}`);

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

    // Always follow redirects manually to capture the full chain
    // This gives us complete redirect information regardless of the followRedirects parameter
    for (let i = 0; i < maxRedirects; i++) {
      try {
        const response = await fetch(currentUrl, { 
          method: method.toUpperCase(),
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });

        const status = response.status;
        statusChain.push(status.toString());

        // Check for redirect status codes
        if (status >= 300 && status < 400) {
          const location = response.headers.get('location');
          if (!location) {
            break;
          }

          // Resolve relative URLs
          const resolvedUrl = new URL(location, currentUrl).href;
          
          // Check for redirect loops
          if (visitedUrls.has(resolvedUrl)) {
            hasLoop = true;
            break;
          }
          
          visitedUrls.add(resolvedUrl);
          redirectChain.push(currentUrl);
          redirectCount++;
          currentUrl = resolvedUrl;

          // Track redirect types
          if (status === 301) redirectTypes.add('301');
          if (status === 302) redirectTypes.add('302');
          if (status === 303) redirectTypes.add('303');
          if (status === 307) redirectTypes.add('307');
          if (status === 308) redirectTypes.add('308');

        } else {
          // No more redirects
          break;
        }

      } catch (error) {
        console.error('Error following redirect:', error);
        return res.status(500).json({ 
          error: 'Failed to follow redirect',
          details: error.message 
        });
      }
    }

    // Check for mixed redirect types
    hasMixedTypes = redirectTypes.size > 1;

    // Check for domain changes
    const finalDomain = new URL(currentUrl).hostname;
    const domainChanges = finalDomain !== originalDomain;

    // Check for HTTPS upgrade
    const finalProtocol = new URL(currentUrl).protocol;
    const httpsUpgrade = originalProtocol === 'http:' && finalProtocol === 'https:';

    return res.json({
      finalUrl: currentUrl,
      finalStatusCode: parseInt(statusChain[statusChain.length - 1]),
      statusChain,
      redirectCount,
      redirectChain,
      hasLoop,
      hasMixedTypes,
      domainChanges,
      httpsUpgrade,
      method: method.toUpperCase()
    });

      } catch (error) {
        console.error('Error following redirect:', error);
        return res.status(500).json({ 
          error: 'Failed to follow redirect',
          details: error.message 
        });
      }
    }

  } catch (error) {
    console.error('Redirect checker error:', error);
    res.status(500).json({ 
      error: 'Failed to check redirect',
      details: error.message 
    });
  }
}
