const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    const urls = [];
    page.on('request', request => {
      if (request.resourceType() === 'fetch' || request.resourceType() === 'xhr') {
        urls.push(request.url());
      }
    });

    await page.goto('http://localhost:4000/dash', { waitUntil: 'networkidle', timeout: 15000 });
    
    const authInput = await page.$('input[aria-label="AuthCode"]');
    if (authInput) {
        await authInput.fill('123567');
        await page.click('button:has-text("确认")');
        await page.waitForTimeout(3000);
    }

    await page.goto('http://localhost:4000/dash/feeds/MP_WXS_3900598186', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    // Also trigger scroll
    await page.evaluate(() => {
        const container = document.querySelector('div.p-2.overflow-y-auto');
        if (container) {
            container.scrollTo(0, container.scrollHeight);
        }
    });
    await page.waitForTimeout(2000);

    console.log("XHR/Fetch Requests Made:");
    console.log(urls);
    
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
