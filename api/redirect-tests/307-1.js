export default function handler(req, res) {
  console.log('307-1 API hit');
  
  res.statusCode = 307;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/target');
  res.end();
}
