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
    
    // Validate date format (CDX API supports 1-14 digit format: yyyyMMddhhmmss)
    const dateRegex = /^\d{1,14}$/;
    if (!dateRegex.test(fromDate) || !dateRegex.test(toDate)) {
      return res.status(400).json({ 
        error: 'Invalid date format. Dates must be in 1-14 digit format (e.g., 2023, 202304, 20230401, 20230401120000)' 
      });
    }

    console.log(`Discovering URLs for ${domain} from ${fromDate} to ${toDate}`);

    // Build Wayback Machine CDX API URL - support subfolders
    const cdxUrl = 'https://web.archive.org/cdx/search/cdx';
    const params = new URLSearchParams({
      output: 'json',
      limit: '5000'  // Reduced limit to avoid potential API issues
    });

    // Handle domain with potential subfolder
    let urlPattern = domain;
    
    // If domain contains a path (subfolder), format it properly
    if (domain.includes('/')) {
      // Extract domain and path
      const urlParts = domain.split('/');
      const baseDomain = urlParts[0];
      const path = urlParts.slice(1).join('/');
      
      // Format for CDX API: domain.com/path/*
      urlPattern = `${baseDomain}/${path}/*`;
      console.log(`Subfolder detected: ${baseDomain}/${path}`);
    } else {
      // Just a domain, use standard pattern
      urlPattern = `${domain}/*`;
    }

    params.append('url', urlPattern);

    // Add CDX API filters for HTML content and successful status codes
    params.append('filter', 'mimetype:text/html');
    params.append('filter', 'statuscode:200');

    // Add date range if specified
    if (fromDate && toDate) {
      params.append('from', fromDate);
      params.append('to', toDate);
    }

    console.log(`Making request to: ${cdxUrl}?${params.toString()}`);

    // Set timeout for the request
    const timeoutId = setTimeout(() => {
      console.error('Wayback Machine API request timed out');
      res.status(408).json({ error: 'Request timeout' });
    }, 30000);

    try {
      const response = await fetch(`${cdxUrl}?${params.toString()}`);
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('CDX API error response:', errorText);
        throw new Error(`Wayback Machine API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.text();
      console.log(`Raw response length: ${data.length} characters`);
      console.log(`First 500 characters: ${data.substring(0, 500)}`);

      // Parse the JSON response
      let waybackUrls = [];
      
      try {
        const jsonData = JSON.parse(data);
        console.log(`Parsed JSON data type: ${typeof jsonData}, length: ${Array.isArray(jsonData) ? jsonData.length : 'not array'}`);
        
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          // Check if first row is a header
          const hasHeader = jsonData[0] && Array.isArray(jsonData[0]) && jsonData[0].length > 0;
          const dataRows = hasHeader ? jsonData.slice(1) : jsonData;
          
          console.log(`Processing ${dataRows.length} data rows`);
          
          waybackUrls = dataRows
            .filter(row => row && Array.isArray(row) && row.length >= 2)
            .map(row => {
              // The CDX API returns: [urlkey, timestamp, original, mimetype, statuscode, digest, length]
              // Since we're filtering by mimetype:text/html and statuscode:200, we get cleaner results
              const original = row[2] || row[0]; // original is at index 2, fallback to 0
              const timestamp = row[1]; // timestamp is at index 1
              const mimetype = row[3]; // mimetype is at index 3
              const statuscode = row[4]; // statuscode is at index 4
              
              return {
                original: original,
                timestamp: timestamp,
                mimetype: mimetype,
                statuscode: statuscode
              };
            })
            .filter(url => {
              // Basic validation - since we're pre-filtering, this is mostly for safety
              return url && url.original && url.timestamp && url.timestamp.length >= 8;
            });
        }
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError.message);
        throw new Error(`Invalid JSON response from Wayback Machine API: ${jsonError.message}`);
      }

      console.log(`Found ${waybackUrls.length} URLs before filtering`);

      // Apply additional post-processing filters for URLs that slip through
      const filteredUrls = waybackUrls.filter(url => {
        // Filter out marketing/tracking URLs and internal system files
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
               // Filter out WordPress JSON API endpoints (should be caught by mimetype filter, but safety net)
               !original.includes('/wp-json/') &&
               !original.includes('/wp-admin/') &&
               !original.includes('/wp-content/') &&
               !original.includes('/wp-includes/') &&
               // Filter out other common internal patterns
               !original.includes('/static/') &&
               !original.includes('/assets/') &&
               !original.includes('/js/') &&
               !original.includes('/css/') &&
               !original.includes('/images/') &&
               !original.includes('/fonts/') &&
               !original.includes('/media/') &&
               !original.includes('/uploads/') &&
               // Filter out robots.txt and sitemaps
               !original.includes('/robots.txt') &&
               !original.includes('/sitemap') &&
               // Only include URLs that look like actual pages (have path or end with /)
               (original.includes('/') || original.endsWith('/')) &&
               // Exclude URLs that are just query parameters
               !original.includes('?') ||
               (original.includes('?') && original.split('?')[0].includes('/'));
      });

      console.log(`Found ${waybackUrls.length} total URLs, ${filteredUrls.length} after filtering`);

      res.json({
        urls: filteredUrls,
        totalFound: filteredUrls.length,
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
