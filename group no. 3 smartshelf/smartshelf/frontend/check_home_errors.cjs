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
    console.log('Setting auth state...');
    await page.addInitScript(() => {
       window.localStorage.setItem('smartshelf_auth', 'true');
       window.localStorage.setItem('smartshelf_token', 'mock_token');
       window.localStorage.setItem('smartshelf_email', 'reader@example.com');
    });

    console.log('Navigating to http://localhost:8080/home...');
    await page.goto('http://localhost:8080/home', { waitUntil: 'load', timeout: 30000 });
    
    // Give time for hydration and dynamic content
    console.log('Current URL:', page.url());
    console.log('Waiting for network idle...');
    await page.waitForTimeout(5000);

    const rootContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML : 'ROOT_NOT_FOUND';
    });

    const result = {
      url: page.url(),
      rootContent: rootContent,
      logs: logs,
      errors: errors
    };

    fs.writeFileSync('debug_home_output.json', JSON.stringify(result, null, 2));
    console.log('Results written to debug_home_output.json');
  } catch (e) {
    console.error('Error during script execution:', e);
    fs.writeFileSync('debug_home_error.txt', e.stack);
  } finally {
    await browser.close();
  }
})();
