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
    
    res.send(data);
    
  } catch (error) {
    console.error('SEMrush proxy error:', error);
    res.status(500).json({ 
      error: 'Failed to proxy SEMrush API request',
      details: error.message 
    });
  }
}
