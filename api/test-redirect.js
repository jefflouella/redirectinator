export default function handler(req, res) {
  console.log('Test redirect API hit');
  
  // Simple 301 redirect
  res.statusCode = 301;
  res.setHeader('Location', 'https://www.google.com');
  res.end();
}
