export default function handler(req, res) {
  console.log('messy-3 API hit');
  
  res.statusCode = 301;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/js-to-302');
  res.end();
}
