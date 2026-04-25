const { chromium } = require('@playwright/test');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];
  const errors = [];

  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    logs.push(text);
  });
  
  page.on('pageerror', err => {
    errors.push(err.stack || err.message);
  });

  try {
    console.log('Navigating to http://localhost:8080...');
    await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('Navigation complete. Waiting 5s...');
    await page.waitForTimeout(5000);

    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML : 'ROOT_NOT_FOUND';
    });

    const bodyContent = await page.evaluate(() => document.body.innerHTML);
    
    const result = {
      rootContent: rootContent,
      bodyContent: bodyContent,
      logs: logs,
      errors: errors
    };

    fs.writeFileSync('debug_output.json', JSON.stringify(result, null, 2));
    console.log('Results written to debug_output.json');
  } catch (e) {
    console.error('Error during script execution:', e);
    fs.writeFileSync('debug_error.txt', e.stack);
  } finally {
    await browser.close();
  }
})();
