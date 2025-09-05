export default function handler(req, res) {
  const { type, code, target, delay } = req.query;
  
  const inferredProto = (req.connection && req.connection.encrypted) ? 'https' : 'http';
  const proto = (req.headers['x-forwarded-proto'] || inferredProto || 'https').toString();
  const host = req.headers.host || 'localhost';
  const base = `${proto}://${host}`;
  const baseTests = `${base}/redirect-tests`;

  const absolute = (p) => p.startsWith('http') ? p : `${baseTests}/${p}`;

  const sendMeta = (to, delayMs = 0) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><meta http-equiv="refresh" content="${delayMs}; url=${absolute(to)}"><title>Meta</title>`);
  };

  const sendJs = (to, delayMs = 100) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html><script>setTimeout(() => location.replace('${absolute(to)}'), ${delayMs})</script><title>JS</title>`);
  };

  const redirect = (code, to) => {
    res.statusCode = parseInt(code);
    res.setHeader('Location', absolute(to));
    res.end();
  };

  const defaultTarget = target || 'target';

  // Handle different redirect types
  switch (type) {
    case 'http':
    case 'server':
      const statusCode = code || '302';
      return redirect(statusCode, defaultTarget);
      
    case 'meta':
    case 'meta-refresh':
      return sendMeta(defaultTarget, parseInt(delay) || 0);
      
    case 'js':
    case 'javascript':
      return sendJs(defaultTarget, parseInt(delay) || 100);
      
    case 'target':
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<h1>Redirect Test Target</h1><p>You have successfully reached the target page!</p>');
      return;
      
    default:
      // Default: return a simple 302 redirect
      return redirect('302', defaultTarget);
  }
}
