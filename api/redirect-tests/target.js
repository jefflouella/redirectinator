export default function handler(req, res) {
  console.log('Target API hit');
  
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
</body>
</html>`);
}
