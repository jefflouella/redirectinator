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

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { domain, from, to, filters } = req.query;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain parameter is required' });
    }

    // Set default date range if not provided
    const fromDate = from || '20200101';
    const toDate = to || '20241231';

    console.log(`Discovering URLs for ${domain} from ${fromDate} to ${toDate}`);

    // Build Wayback Machine CDX API URL
    const cdxUrl = 'https://web.archive.org/cdx/search/cdx';
    const params = new URLSearchParams({
      url: `*.${domain}/*`,
      matchType: 'domain',
      collapse: 'urlkey',
      output: 'json',
      fl: 'original,timestamp',
      from: fromDate,
      to: toDate,
      limit: '10000'
    });

    // Set timeout for the request
    const timeoutId = setTimeout(() => {
      console.error('Wayback Machine API request timed out');
      res.status(408).json({ error: 'Request timeout' });
    }, 30000);

    try {
      const response = await fetch(`${cdxUrl}?${params.toString()}`);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Wayback Machine API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.text();
      const lines = data.trim().split('\n');

      // Parse the response
      const waybackUrls = lines
        .filter(line => line.trim() && line.includes(' '))
        .map(line => {
          const [original, timestamp] = line.split(' ');
          return {
            original: original,
            timestamp: timestamp
          };
        })
        .filter(url => {
          // Basic validation
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
        timeframe: `${fromDate} to ${toDate}`,
        filtersApplied: filters ? filters.split(',') : [],
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }

  } catch (error) {
    console.error('Wayback Machine discovery error:', error);
    res.status(500).json({ 
      error: 'Failed to discover URLs from Wayback Machine',
      details: error.message 
    });
  }
}
