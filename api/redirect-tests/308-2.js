export default function handler(req, res) {
  console.log('308-2 API hit');
  
  res.statusCode = 308;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/301-1');
  res.end();
}
