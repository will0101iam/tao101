const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    const allData = [];
    
    // Intercept TRPC responses
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/trpc/article.list') && response.request().method() === 'GET') {
        try {
          const json = await response.json();
          // trpc response is usually an array of results when batched
          if (Array.isArray(json)) {
            // Find the article.list result
            for (const item of json) {
               if (item.result && item.result.data && item.result.data.json && Array.isArray(item.result.data.json.items)) {
                  item.result.data.json.items.forEach(article => {
                     allData.push({ title: article.title, url: article.link || article.url });
                  });
               }
            }
          }
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

    let previousCount = 0;
    let retries = 0;
    
    while (true) {
        const count = await page.evaluate(() => {
            const container = document.querySelector('div.p-2.overflow-y-auto');
            if (container) {
                container.scrollTo(0, container.scrollHeight);
            }
            return document.querySelectorAll('a[href*="mp.weixin.qq.com/s"]').length;
        });
        
        console.log(`Currently loaded DOM articles: ${count}... Intercepted TRPC articles: ${allData.length}`);
        
        if (count === previousCount) {
            retries++;
            if (retries >= 5) {
                break;
            }
        } else {
            retries = 0;
        }
        
        previousCount = count;
        // Wait for fetch to complete and UI to render
        await page.waitForTimeout(2500);
    }
    
    let finalArticles = allData.length > 0 ? allData : await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .filter(a => a.href && a.href.includes('mp.weixin.qq.com/s'))
        .map(a => ({ title: a.innerText.trim(), url: a.href }));
    });

    const uniqueArticles = [];
    const seenUrls = new Set();
    for (const a of finalArticles) {
        if (a.url && !seenUrls.has(a.url)) {
            seenUrls.add(a.url);
            uniqueArticles.push(a);
        }
    }
    
    fs.writeFileSync('nlp_agent_final.json', JSON.stringify(uniqueArticles, null, 2));
    console.log(`\nSuccess! Total unique articles extracted: ${uniqueArticles.length}`);
    
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
