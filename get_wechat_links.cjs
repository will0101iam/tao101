const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    // Intercept JSON API calls
    const allData = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/') && response.request().method() === 'GET') {
        try {
          const json = await response.json();
          console.log(`Intercepted JSON from ${url}, has keys:`, Object.keys(json));
          if (json.data && Array.isArray(json.data.list)) {
            json.data.list.forEach(item => {
              if (item.link && item.title) {
                allData.push({ title: item.title, url: item.link });
              }
            });
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
            // Target the specific scroll container we found: DIV with class "p-2 overflow-y-auto"
            const container = document.querySelector('div.p-2.overflow-y-auto');
            if (container) {
                // Small trick: WeWe RSS might need to scroll down slightly, then up slightly to trigger intersection observer
                container.scrollTo(0, container.scrollHeight - 100);
                setTimeout(() => container.scrollTo(0, container.scrollHeight), 100);
            }
            
            const links = document.querySelectorAll('a[href*="mp.weixin.qq.com/s"]');
            return links.length;
        });
        
        console.log(`Currently loaded DOM articles: ${count}... Intercepted API articles: ${allData.length}`);
        
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
    
    let finalArticles = allData.length > 20 ? allData : await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .filter(a => a.href && a.href.includes('mp.weixin.qq.com/s'))
        .map(a => ({ title: a.innerText.trim(), url: a.href }));
    });

    const uniqueArticles = [];
    const seenUrls = new Set();
    for (const a of finalArticles) {
        if (!seenUrls.has(a.url)) {
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
