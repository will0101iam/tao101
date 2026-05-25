const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:4000/dash/feeds/MP_WXS_3900598186', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000); // extra wait
    
    const html = await page.content();
    console.log(html);
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
