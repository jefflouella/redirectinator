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
}
