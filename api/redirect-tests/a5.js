export default function handler(req, res) {
  console.log('a5 API hit');
  
  res.statusCode = 302;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/target');
  res.end();
}
