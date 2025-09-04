export default function handler(req, res) {
  console.log('302-2 API hit');
  
  res.statusCode = 302;
  res.setHeader('Location', 'https://www.redirectinator.us/redirect-tests/307-1');
  res.end();
}
