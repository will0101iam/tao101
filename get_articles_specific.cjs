const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    // 1. Go to root to trigger auth if needed
    await page.goto('http://localhost:4000/dash', { waitUntil: 'networkidle', timeout: 15000 });
    
    const authInput = await page.$('input[aria-label="AuthCode"]');
    if (authInput) {
        await authInput.fill('123567');
        await page.click('button:has-text("确认")');
        await page.waitForTimeout(3000);
    }

    // 2. Go to the specific feed
    await page.goto('http://localhost:4000/dash/feeds/MP_WXS_3900598186', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000); // let React render

    // 3. Scroll to load all articles
    let previousHeight = 0;
    for(let i = 0; i < 10; i++) {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        let currentHeight = await page.evaluate(() => document.body.scrollHeight);
        if (currentHeight === previousHeight) break; // Reached bottom
        previousHeight = currentHeight;
    }
    
    // 4. Extract weixin article links
    const articles = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .map(a => ({ title: a.innerText.trim(), url: a.href }))
        .filter(a => a.url && a.url.includes('mp.weixin.qq.com/s'));
    });
    
    console.log(JSON.stringify(articles, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
