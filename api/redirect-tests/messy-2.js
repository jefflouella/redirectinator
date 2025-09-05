export default function handler(req, res) {
  console.log('messy-2 API hit');
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html>
<html>
<head>
  <title>Messy 2</title>
</head>
<body>
  <h1>Messy 2 Test</h1>
  <p>This page should redirect via JavaScript to a six-hop redirect.</p>
  <script>
    setTimeout(function() {
      window.location.replace('https://www.redirectinator.us/redirect-tests/six-http');
    }, 100);
  </script>
</body>
</html>`);
}
