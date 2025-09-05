export default function handler(req, res) {
  console.log('loop-start API hit');
  
  res.statusCode = 301;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/loop-b');
  res.end();
}
