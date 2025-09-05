export default function handler(req, res) {
  console.log('six-http API hit');
  
  res.statusCode = 301;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/a1');
  res.end();
}
