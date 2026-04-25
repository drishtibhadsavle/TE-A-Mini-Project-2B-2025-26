const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];
  const errors = [];

  page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const rootContent = await page.evaluate(() => document.getElementById('root')?.innerHTML || 'EMPTY');
  
  console.log('=== ROOT CONTENT (first 500 chars) ===\n', rootContent.substring(0, 500));
  console.log('\n=== CONSOLE LOGS ===');
  logs.forEach(l => console.log(l));
  console.log('\n=== PAGE ERRORS ===');
  errors.forEach(e => console.log(e));

  await browser.close();
})();
