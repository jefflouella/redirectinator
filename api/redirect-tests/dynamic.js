export default function handler(req, res) {
  // Extract the path from the request
  const url = new URL(req.url, `https://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Find the slug part after /redirect-tests/
  const redirectTestsIndex = pathParts.indexOf('redirect-tests');
  const slug = redirectTestsIndex >= 0 && redirectTestsIndex < pathParts.length - 1 
    ? pathParts[redirectTestsIndex + 1] 
    : '';

  const inferredProto = (req.connection && req.connection.encrypted) ? 'https' : 'http';
  const proto = (req.headers['x-forwarded-proto'] || inferredProto || 'https').toString();
  const host = req.headers.host || 'localhost';
  const base = `${proto}://${host}`;
  const baseTests = `${base}/redirect-tests`;

  const absolute = (p) => p.startsWith('http') ? p : `${baseTests}/${p}`;

  const sendMeta = (to) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><meta http-equiv="refresh" content="0; url=${absolute(to)}"><title>Meta</title>`);
  };

  const sendJs = (to) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><script>location.replace('${absolute(to)}')</script><title>JS</title>`);
  };

  const redirect = (code, to) => {
    res.statusCode = code;
    res.setHeader('Location', absolute(to));
    res.end();
  };

  const target = 'target';

  // Dynamic routing based on URL pattern
  switch (slug) {
    case 'target':
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<h1>Redirect Test Target</h1>');
      return;

    // One hop HTTP redirects
    case '301-1': return redirect(301, target);
    case '302-1': return redirect(302, target);
    case '307-1': return redirect(307, target);
    case '308-1': return redirect(308, target);
    
    // One hop client-side redirects
    case 'meta-1': return sendMeta(target);
    case 'js-1': return sendJs(target);

    // Two hop HTTP -> HTTP
    case '301-2': return redirect(301, '302-1');
    case '302-2': return redirect(302, '307-1');
    case '307-2': return redirect(307, '308-1');
    case '308-2': return redirect(308, '301-1');

    // Mixed two hop
    case 'meta-to-301': return sendMeta('301-1');
    case 'js-to-302': return sendJs('302-1');

    // Six hops
    case 'six-http': return redirect(301, 'a1');
    case 'a1': return redirect(302, 'a2');
    case 'a2': return redirect(307, 'a3');
    case 'a3': return redirect(308, 'a4');
    case 'a4': return redirect(301, 'a5');
    case 'a5': return redirect(302, target);

    // Loop
    case 'loop-start': return redirect(301, 'loop-b');
    case 'loop-b': return redirect(302, 'loop-start');

    // Messy combinations
    case 'messy-1': return redirect(307, 'meta-to-301');
    case 'messy-2': return sendJs('six-http');
    case 'messy-3': return redirect(301, 'js-to-302');
    case 'messy-4': return sendMeta('308-2');
    case 'messy-5': return redirect(302, 'loop-start');

    // Generic redirect patterns for any URL
    default:
      // Check if slug matches common redirect patterns
      if (slug.match(/^(\d{3})-(\d+)$/)) {
        // Pattern: 301-1, 302-2, etc.
        const [, code, hop] = slug.match(/^(\d{3})-(\d+)$/);
        const statusCode = parseInt(code);
        if (statusCode >= 300 && statusCode < 400) {
          if (hop === '1') {
            return redirect(statusCode, target);
          } else {
            return redirect(statusCode, `${code}-${parseInt(hop) - 1}`);
          }
        }
      }
      
      if (slug.startsWith('meta-')) {
        // Pattern: meta-anything
        return sendMeta(target);
      }
      
      if (slug.startsWith('js-')) {
        // Pattern: js-anything
        return sendJs(target);
      }
      
      if (slug.startsWith('loop')) {
        // Pattern: loop-anything
        return redirect(301, 'loop-b');
      }
      
      // Default: return a simple redirect
      return redirect(302, target);
  }
}
