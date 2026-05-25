const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    let allData = [];
    
    // Intercept network responses to capture the actual JSON data
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('/api/feeds/MP_WXS_3900598186') || url.includes('/api/articles')) {
        try {
          const json = await response.json();
          // Assuming WeWe RSS returns a list of items or data.list
          if (json.data && Array.isArray(json.data.list)) {
            allData = allData.concat(json.data.list);
          } else if (Array.isArray(json.data)) {
            allData = allData.concat(json.data);
          }
        } catch (e) {
          // Ignore JSON parse errors for non-JSON endpoints
        }
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
    
    // WeWe RSS often uses a scroll container like .overflow-y-auto inside main
    while (true) {
        const count = await page.evaluate(() => {
            const containers = Array.from(document.querySelectorAll('div')).filter(el => {
                const style = window.getComputedStyle(el);
                return (style.overflowY === 'auto' || style.overflowY === 'scroll' || style.overflowY === 'overlay') && el.scrollHeight > el.clientHeight;
            });
            
            // Try scrolling the first scrollable container we find
            if (containers.length > 0) {
                // Usually the main content container is one of these
                for(const c of containers) {
                    c.scrollTo(0, c.scrollHeight);
                }
            } else {
                window.scrollTo(0, document.body.scrollHeight);
            }
            
            const links = document.querySelectorAll('a[href*="mp.weixin.qq.com/s"]');
            if (links.length > 0) {
                links[links.length - 1].scrollIntoView({ behavior: 'smooth', block: 'end' });
            }
            return links.length;
        });
        
        console.log(`Currently loaded DOM articles: ${count}... API intercepted: ${allData.length}`);
        
        if (count === previousCount) {
            retries++;
            if (retries >= 4) {
                break;
            }
        } else {
            retries = 0;
        }
        
        previousCount = count;
        await page.waitForTimeout(2000);
    }
    
    // Fallback: extract from DOM if API didn't catch anything useful
    let finalArticles = [];
    if (allData.length > 0) {
       finalArticles = allData.filter(item => item.url).map(item => ({ title: item.title, url: item.url }));
    } else {
       finalArticles = await page.evaluate(() => {
         const anchors = Array.from(document.querySelectorAll('a'));
         return anchors
           .filter(a => a.href && a.href.includes('mp.weixin.qq.com/s'))
           .map(a => ({ title: a.innerText.trim(), url: a.href }));
       });
    }

    // Deduplicate
    const uniqueArticles = [];
    const seenUrls = new Set();
    for (const a of finalArticles) {
        if (!seenUrls.has(a.url)) {
            seenUrls.add(a.url);
            uniqueArticles.push(a);
        }
    }
    
    fs.writeFileSync('nlp_agent_articles_deep.json', JSON.stringify(uniqueArticles, null, 2));
    console.log(`\nSuccess! Total unique articles extracted: ${uniqueArticles.length}`);
    
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await browser.close();
  }
})();
