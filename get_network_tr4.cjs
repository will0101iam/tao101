const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    const trpcData = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/trpc/article.list') && response.request().method() === 'GET') {
        try {
          const json = await response.json();
          trpcData.push(json);
        } catch (e) {}
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

    // Instead of scrolling, click the "Next Page" or "Load More" or find the last element and hover it
    await page.evaluate(() => {
        const container = document.querySelector('div.p-2.overflow-y-auto');
        if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            container.dispatchEvent(new Event('scroll'));
        }
        
        const links = document.querySelectorAll('a[href*="mp.weixin.qq.com/s"]');
        if (links.length > 0) {
            const lastLink = links[links.length - 1];
            lastLink.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    });
    await page.waitForTimeout(2000);

    fs.writeFileSync('trpc_debug.json', JSON.stringify(trpcData, null, 2));
    console.log("Saved trpc_debug.json");
    
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
