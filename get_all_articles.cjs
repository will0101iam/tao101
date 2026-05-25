const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    // 1. Authenticate
    await page.goto('http://localhost:4000/dash', { waitUntil: 'networkidle', timeout: 15000 });
    
    const authInput = await page.$('input[aria-label="AuthCode"]');
    if (authInput) {
        await authInput.fill('123567');
        await page.click('button:has-text("确认")');
        await page.waitForTimeout(3000);
    }

    // 2. Go to feed
    await page.goto('http://localhost:4000/dash/feeds/MP_WXS_3900598186', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    let previousCount = 0;
    let retries = 0;
    
    // 3. Keep scrolling until no new items are loaded
    while (true) {
        const count = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a')).filter(a => a.href && a.href.includes('mp.weixin.qq.com/s'));
            
            // Try to scroll the last link into view
            if (links.length > 0) {
                links[links.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
            
            // Try to scroll all scrollable containers to the bottom
            const scrollContainers = Array.from(document.querySelectorAll('*')).filter(el => {
                const style = window.getComputedStyle(el);
                return style.overflowY === 'auto' || style.overflowY === 'scroll';
            });
            scrollContainers.forEach(c => {
                c.scrollTo(0, c.scrollHeight);
            });
            
            // Also scroll window
            window.scrollTo(0, document.body.scrollHeight);
            
            return links.length;
        });
        
        console.log(`Currently loaded: ${count} articles...`);
        
        if (count === previousCount) {
            retries++;
            // If it hasn't increased for 3 consecutive checks (approx 6 seconds), we are probably at the end
            if (retries >= 3) {
                console.log("No new articles loaded, finishing scroll.");
                break;
            }
        } else {
            retries = 0;
        }
        
        previousCount = count;
        // Wait for the infinite scroll to fetch and render
        await page.waitForTimeout(2000);
    }
    
    // 4. Extract all links
    const articles = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .filter(a => a.href && a.href.includes('mp.weixin.qq.com/s'))
        .map(a => ({ title: a.innerText.trim(), url: a.href }));
    });
    
    // De-duplicate just in case
    const uniqueArticles = [];
    const seenUrls = new Set();
    for (const a of articles) {
        if (!seenUrls.has(a.url)) {
            seenUrls.add(a.url);
            uniqueArticles.push(a);
        }
    }
    
    fs.writeFileSync('nlp_agent_articles.json', JSON.stringify(uniqueArticles, null, 2));
    console.log(`\nSuccess! Total unique articles extracted: ${uniqueArticles.length}`);
    
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
