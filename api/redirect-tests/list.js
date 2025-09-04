export default function handler(req, res) {
  try {
    const inferredProto = (req.connection && req.connection.encrypted) ? 'https' : 'http';
    const proto = (req.headers['x-forwarded-proto'] || inferredProto || 'https').toString();
    const host = req.headers.host || 'localhost';
    const base = `${proto}://${host}`;
    const target = `${base}/redirect-tests/target`;

    const slugs = [
      // one hop
      '301-1','302-1','307-1','308-1','meta-1','js-1',
      // two hop
      '301-2','302-2','307-2','308-2',
      // mixed
      'meta-to-301','js-to-302',
      // six hop and loop/messy
      'six-http','loop-start','messy-1','messy-2','messy-3','messy-4','messy-5',
    ];

    const starts = slugs.map(p => `${base}/redirect-tests/${p}`);
    const mappings = starts.map(s => ({ start: s, target: s.includes('/loop-start') ? '' : target }));

    const format = ((req.query && req.query.format) || 'csv').toString().toLowerCase();
    if (format === 'json') {
      res.status(200).json(mappings);
      return;
    }
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(mappings.map(m => `${m.start}, ${m.target}`).join('\n'));
  } catch (e) {
    res.status(500).json({ error: 'failed', message: e.message });
  }
}
// Cleanup stale experimental export left over from previous edits
