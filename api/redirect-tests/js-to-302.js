export default function handler(req, res) {
  console.log('js-to-302 API hit');
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html>
<html>
<head>
  <title>JS to 302</title>
</head>
<body>
  <h1>JS to 302 Redirect Test</h1>
  <p>This page should redirect via JavaScript to a 302 redirect.</p>
  <script>
    setTimeout(function() {
      window.location.replace('https://www.redirectinator.us/redirect-tests/302-1');
    }, 100);
  </script>
</body>
</html>`);
}
