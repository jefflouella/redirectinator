export default function handler(req, res) {
  console.log('Meta-1 API hit');
  
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html>
<html>
<head>
  <meta http-equiv="refresh" content="0; url=https://www.redirectinator.us/redirect-tests/target">
  <title>Meta Redirect</title>
</head>
<body>
  <h1>Meta Redirect Test</h1>
  <p>This page should redirect via meta refresh.</p>
</body>
</html>`);
}
