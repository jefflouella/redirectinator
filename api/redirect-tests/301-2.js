export default function handler(req, res) {
  console.log('301-2 API hit');
  
  res.statusCode = 301;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/302-1');
  res.end();
}
