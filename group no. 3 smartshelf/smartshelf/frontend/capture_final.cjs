const { chromium } = require('@playwright/test');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('http://localhost:8080/recommend', { waitUntil: 'networkidle' });
  
  // Click refresh
  await page.click('button:has-text("Refresh")');
  await page.waitForTimeout(2000);

  // Click first book
  const cards = await page.$$('.book-container');
  if (cards.length > 0) {
    await cards[0].click();
    await page.waitForTimeout(1500); // wait for flip
    
    const screenshotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\e8c58644-594f-4cfd-8fca-e2531bf93e0b\\final_850px_view.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to ${screenshotPath}`);
  } else {
    console.log('No books found to click.');
  }

  await browser.close();
})();
