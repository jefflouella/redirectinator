export default function handler(req, res) {
  console.log('301-1 API hit');
  
  res.statusCode = 301;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/target');
  res.end();
}
