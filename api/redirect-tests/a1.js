export default function handler(req, res) {
  console.log('a1 API hit');
  
  res.statusCode = 302;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/a2');
  res.end();
}
