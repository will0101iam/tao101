const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
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
                container.scrollTo(0, container.scrollHeight);
            }
            
            const links = document.querySelectorAll('a[href*="mp.weixin.qq.com/s"]');
            return links.length;
        });
        
        console.log(`Currently loaded DOM articles: ${count}...`);
        
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
        await page.waitForTimeout(3000);
    }
    
    const finalArticles = await page.evaluate(() => {
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
    
    fs.writeFileSync('nlp_agent_all.json', JSON.stringify(uniqueArticles, null, 2));
    console.log(`\nSuccess! Total unique articles extracted: ${uniqueArticles.length}`);
    
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
