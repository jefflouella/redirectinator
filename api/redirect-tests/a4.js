export default function handler(req, res) {
  console.log('a4 API hit');
  
  res.statusCode = 301;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/a5');
  res.end();
}
