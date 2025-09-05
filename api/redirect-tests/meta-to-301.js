export default function handler(req, res) {
  console.log('meta-to-301 API hit');
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=https://www.redirectinator.us/redirect-tests/301-1">
  <title>Meta to 301</title>
</head>
<body>
  <h1>Meta to 301 Redirect Test</h1>
  <p>This page should redirect via meta refresh to a 301 redirect.</p>
</body>
</html>`);
}
