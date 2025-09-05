export default function handler(req, res) {
  console.log('a3 API hit');
  
  res.statusCode = 308;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/a4');
  res.end();
}
