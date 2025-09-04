export default function handler(req, res) {
  console.log('307-2 API hit');
  
  res.statusCode = 307;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/308-1');
  res.end();
}
