export default function handler(req, res) {
  const { 
    type = 'http',           // http, meta, js, target
    code = '302',            // 301, 302, 307, 308
    target = 'target',       // target URL
    delay = '0',             // delay in ms
    hops = '1',              // number of hops
    chain = '',              // comma-separated chain
    loop = 'false'           // create a loop
  } = req.query;
  
  const inferredProto = (req.connection && req.connection.encrypted) ? 'https' : 'http';
  const proto = (req.headers['x-forwarded-proto'] || inferredProto || 'https').toString();
  const host = req.headers.host || 'localhost';
  const base = `${proto}://${host}`;
  const baseTests = `${base}/redirect-tests`;

  const absolute = (p) => p.startsWith('http') ? p : `${baseTests}/${p}`;

  const sendMeta = (to, delayMs = 0) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html>
<html>
<head>
  <meta http-equiv="refresh" content="${delayMs}; url=${absolute(to)}">
  <title>Meta Redirect</title>
</head>
<body>
  <h1>Meta Redirect Test</h1>
  <p>Redirecting to: ${absolute(to)}</p>
</body>
</html>`);
  };

  const sendJs = (to, delayMs = 100) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html>
<html>
<head>
  <title>JavaScript Redirect</title>
</head>
<body>
  <h1>JavaScript Redirect Test</h1>
  <p>Redirecting to: ${absolute(to)}</p>
  <script>
    setTimeout(function() {
      window.location.replace('${absolute(to)}');
    }, ${delayMs});
  </script>
</body>
</html>`);
  };

  const redirect = (code, to) => {
    res.statusCode = parseInt(code);
    res.setHeader('Location', absolute(to));
    res.end();
  };

  const showTarget = () => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!doctype html>
<html>
<head>
  <title>Redirect Test Target</title>
</head>
<body>
  <h1>Redirect Test Target</h1>
  <p>You have successfully reached the target page!</p>
  <p>This is the final destination for redirect tests.</p>
</body>
</html>`);
  };

  // Handle different redirect types
  switch (type) {
    case 'http':
    case 'server':
      const statusCode = code || '302';
      return redirect(statusCode, target);
      
    case 'meta':
    case 'meta-refresh':
      return sendMeta(target, parseInt(delay) || 0);
      
    case 'js':
    case 'javascript':
      return sendJs(target, parseInt(delay) || 100);
      
    case 'target':
      return showTarget();
      
    default:
      // Default: return a simple 302 redirect
      return redirect('302', target);
  }
}
