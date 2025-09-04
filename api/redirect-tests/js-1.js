export default function handler(req, res) {
  console.log('js-1 API hit');
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html>
<html>
<head>
  <title>JavaScript Redirect</title>
</head>
<body>
  <h1>JavaScript Redirect Test</h1>
  <p>This page should redirect via JavaScript.</p>
  <script>
    setTimeout(function() {
      window.location.replace('https://www.redirectinator.us/redirect-tests/target');
    }, 100);
  </script>
</body>
</html>`);
}
