/**
 * Redirectinator Advanced Chrome Extension - Tests
 */

const puppeteer = require('puppeteer');

describe('Redirectinator Advanced Chrome Extension', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process', // <- this one doesn't work in Windows
        '--disable-gpu',
      ],
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  describe('Meta Refresh Detection', () => {
    test('should detect basic meta refresh', async () => {
      // Create a test HTML page with meta refresh
      const testHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="refresh" content="5;url=https://example.com">
          <title>Test Meta Refresh</title>
        </head>
        <body>
          <h1>Redirecting in 5 seconds...</h1>
        </body>
        </html>
      `;

      await page.setContent(testHtml);

      // Wait for content script to initialize
      await page.waitForTimeout(1000);

      // Check if meta refresh was detected
      const metaRefresh = await page.evaluate(() => {
        return window.redirectDetector?.metaRefresh || null;
      });

      expect(metaRefresh).toBeTruthy();
      expect(metaRefresh.type).toBe('meta_refresh');
      expect(metaRefresh.delay).toBe(5);
      expect(metaRefresh.targetUrl).toBe('https://example.com');
    });

    test('should detect immediate meta refresh', async () => {
      const testHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="refresh" content="0;url=https://redirect.com">
          <title>Test Immediate Redirect</title>
        </head>
        <body>
          <h1>Redirecting immediately...</h1>
        </body>
        </html>
      `;

      await page.setContent(testHtml);
      await page.waitForTimeout(1000);

      const metaRefresh = await page.evaluate(() => {
        return window.redirectDetector?.metaRefresh || null;
      });

      expect(metaRefresh).toBeTruthy();
      expect(metaRefresh.delay).toBe(0);
      expect(metaRefresh.targetUrl).toBe('https://redirect.com');
    });
  });

  describe('JavaScript Redirect Detection', () => {
    test('should detect window.location.href redirect', async () => {
      const testHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test JS Redirect</title>
        </head>
        <body>
          <h1>Testing JavaScript redirect...</h1>
          <script>
            setTimeout(() => {
              window.location.href = 'https://example.com';
            }, 1000);
          </script>
        </body>
        </html>
      `;

      await page.setContent(testHtml);

      // Wait for redirect to be detected
      await page.waitForTimeout(2000);

      const redirects = await page.evaluate(() => {
        return window.redirectDetector?.javascriptRedirects || [];
      });

      expect(redirects.length).toBeGreaterThan(0);
      expect(redirects[0].method).toBe('location_href_set');
      expect(redirects[0].to).toBe('https://example.com');
    });

    test('should detect window.location.assign redirect', async () => {
      const testHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test JS Assign</title>
        </head>
        <body>
          <h1>Testing location.assign...</h1>
          <button onclick="redirect()">Redirect</button>
          <script>
            function redirect() {
              window.location.assign('https://test.com');
            }
          </script>
        </body>
        </html>
      `;

      await page.setContent(testHtml);

      // Click the button to trigger redirect
      await page.click('button');

      // Wait for redirect detection
      await page.waitForTimeout(1000);

      const redirects = await page.evaluate(() => {
        return window.redirectDetector?.javascriptRedirects || [];
      });

      expect(redirects.length).toBeGreaterThan(0);
      expect(redirects[0].method).toBe('location_assign');
      expect(redirects[0].to).toBe('https://test.com');
    });
  });

  describe('Performance Tests', () => {
    test('should analyze page within reasonable time', async () => {
      const startTime = Date.now();

      const testHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="refresh" content="10;url=https://example.com">
          <title>Performance Test</title>
        </head>
        <body>
          <h1>Performance test page</h1>
        </body>
        </html>
      `;

      await page.setContent(testHtml);
      await page.waitForTimeout(2000);

      const endTime = Date.now();
      const analysisTime = endTime - startTime;

      // Should complete analysis within 5 seconds
      expect(analysisTime).toBeLessThan(5000);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid URLs gracefully', async () => {
      const testHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta http-equiv="refresh" content="invalid;url=not-a-url">
          <title>Invalid URL Test</title>
        </head>
        <body>
          <h1>Testing invalid URLs</h1>
        </body>
        </html>
      `;

      await page.setContent(testHtml);
      await page.waitForTimeout(1000);

      // Should not crash and should handle gracefully
      const hasError = await page.evaluate(() => {
        return window.redirectDetector !== undefined;
      });

      expect(hasError).toBe(true);
    });
  });
});
