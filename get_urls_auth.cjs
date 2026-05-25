const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:4000/dash/feeds/MP_WXS_3900598186', { waitUntil: 'networkidle', timeout: 15000 });
    
    // check for auth
    const authInput = await page.$('input[aria-label="AuthCode"]');
    if (authInput) {
        await authInput.fill('123567');
        await page.click('button:has-text("确认")');
        await page.waitForTimeout(5000);
    }

    // Scroll
    for(let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
    }
    
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .map(a => ({ text: a.innerText.trim(), href: a.href }))
        .filter(a => a.href && a.href !== '' && !a.href.startsWith('javascript:'));
    });
    
    console.log(JSON.stringify(links, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
