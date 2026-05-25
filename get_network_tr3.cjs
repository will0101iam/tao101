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

    // Instead of scrolling, click the "Next Page" or "Load More" or find the last element and hover it
    await page.evaluate(() => {
        const container = document.querySelector('div.p-2.overflow-y-auto');
        if (container) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
            container.dispatchEvent(new Event('scroll'));
        }
        
        // Find the last article and simulate a hover/focus on it, sometimes infinite scroll relies on IntersectionObserver
        const links = document.querySelectorAll('a[href*="mp.weixin.qq.com/s"]');
        if (links.length > 0) {
            const lastLink = links[links.length - 1];
            lastLink.scrollIntoView({ behavior: 'smooth', block: 'end' });
            // Look for a spinner or trigger element below the list
            const allDivs = document.querySelectorAll('div');
            // Try to trigger any load more button if exists
            const buttons = document.querySelectorAll('button');
            buttons.forEach(b => {
                if(b.innerText.includes('加载更多') || b.innerText.includes('Load More')) {
                    b.click();
                }
            });
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
