export default function handler(req, res) {
  console.log('messy-1 API hit');
  
  res.statusCode = 307;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/meta-to-301');
  res.end();
}
