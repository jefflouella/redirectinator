export default function handler(req, res) {
  console.log('308-1 API hit');
  
  res.statusCode = 308;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/target');
  res.end();
}
