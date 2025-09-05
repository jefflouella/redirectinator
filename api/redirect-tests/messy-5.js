export default function handler(req, res) {
  console.log('messy-5 API hit');
  
  res.statusCode = 302;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/loop-start');
  res.end();
}
