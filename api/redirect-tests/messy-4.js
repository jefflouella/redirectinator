export default function handler(req, res) {
  console.log('messy-4 API hit');
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=https://www.redirectinator.us/redirect-tests/308-2">
  <title>Messy 4</title>
</head>
<body>
  <h1>Messy 4 Test</h1>
  <p>This page should redirect via meta refresh to a 308 redirect.</p>
</body>
</html>`);
}
