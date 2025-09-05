export default function handler(req, res) {
  console.log('a2 API hit');
  
  res.statusCode = 307;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/a3');
  res.end();
}
