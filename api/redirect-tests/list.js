export default function handler(req, res) {
  try {
    const proto = (req.headers[x-forwarded-proto] || https).toString();
    const host = req.headers.host;
    const base = `${proto}://${host}`;
    const t = `${base}/redirect-tests/target`;

    const starts = [
      // one hop
      301-1,302-1,307-1,308-1,meta-1,js-1,
      // two hop
      301-2,302-2,307-2,308-2,
      // mixed
      meta-to-301,js-to-302,
      // six hop and loop/messy
      six-http,loop-start,messy-1,messy-2,messy-3,messy-4,messy-5,
    ].map(p => `${base}/redirect-tests/${p}`);

    // Build mappings (loop-start has no stable final target)
    const mappings = starts.map(s => ({ start: s, target: s.includes(/loop-start) ?  : t }));

    const format = (req.query.format || csv).toString();
    if (format === json) {
      res.status(200).json(mappings);
      return;
    }
    res.setHeader(Content-Type, text/plain
