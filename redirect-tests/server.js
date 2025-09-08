const express = require('express');
const app = express();

const PORT = process.env.REDIRECT_TESTS_PORT || 4000;
const HOST = process.env.REDIRECT_TESTS_HOST || 'http://localhost:' + PORT;
const TARGET = process.env.REDIRECT_TESTS_TARGET || HOST + '/target';

app.get('/target', (req, res) => {
  res.status(200).send('<h1>Target</h1>');
});

function httpRedirect(code, destination) {
  return (req, res) => res.redirect(code, destination);
}

function metaRefresh(to) {
  return (req, res) =>
    res
      .status(200)
      .send(
        `<!doctype html><meta http-equiv="refresh" content="0; url=${to}"><title>Meta</title>`
      );
}

function jsRedirect(to) {
  return (req, res) =>
    res
      .status(200)
      .send(
        `<!doctype html><script>location.replace('${to}')</script><title>JS</title>`
      );
}

// Single hop examples
app.get('/301-1', httpRedirect(301, TARGET));
app.get('/302-1', httpRedirect(302, TARGET));
app.get('/307-1', httpRedirect(307, TARGET));
app.get('/308-1', httpRedirect(308, TARGET));
app.get('/meta-1', metaRefresh(TARGET));
app.get('/js-1', jsRedirect(TARGET));

// Two hop examples (HTTP -> HTTP)
app.get('/301-2', httpRedirect(301, HOST + '/302-1'));
app.get('/302-2', httpRedirect(302, HOST + '/307-1'));
app.get('/307-2', httpRedirect(307, HOST + '/308-1'));
app.get('/308-2', httpRedirect(308, HOST + '/301-1'));

// Mixed two hops
app.get('/meta-to-301', (req, res) =>
  res
    .status(200)
    .send(
      `<!doctype html><meta http-equiv="refresh" content="0; url=${HOST + '/301-1'}">`
    )
);
app.get('/js-to-302', jsRedirect(HOST + '/302-1'));

// Six hops (cap at 10 overall)
app.get('/six-http', httpRedirect(301, HOST + '/a1'));
app.get('/a1', httpRedirect(302, HOST + '/a2'));
app.get('/a2', httpRedirect(307, HOST + '/a3'));
app.get('/a3', httpRedirect(308, HOST + '/a4'));
app.get('/a4', httpRedirect(301, HOST + '/a5'));
app.get('/a5', httpRedirect(302, TARGET));

// Redirect loop
app.get('/loop-start', httpRedirect(301, HOST + '/loop-b'));
app.get('/loop-b', httpRedirect(302, HOST + '/loop-start'));

// “Messy” scenarios
app.get('/messy-1', httpRedirect(307, HOST + '/meta-to-301'));
app.get('/messy-2', jsRedirect(HOST + '/six-http'));
app.get('/messy-3', httpRedirect(301, HOST + '/js-to-302'));
app.get('/messy-4', metaRefresh(HOST + '/308-2'));
app.get('/messy-5', httpRedirect(302, HOST + '/loop-start'));

// Start
app.listen(PORT, () => {
  console.log('Redirect test server on ' + HOST);
  console.log('Target: ' + TARGET);
});
