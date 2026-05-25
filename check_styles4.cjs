const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');
  
  const rules = await page.evaluate(() => {
    const btn = document.querySelector('.elementor-button');
    if (!btn) return 'No button';
    
    // Get all matched CSS rules
    const matchedRules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && btn.matches(rule.selectorText)) {
            matchedRules.push({
              selector: rule.selectorText,
              cssText: rule.cssText
            });
          }
        }
      } catch (e) {}
    }
    return matchedRules;
  });
  
  console.log(JSON.stringify(rules, null, 2));
  await browser.close();
})();
