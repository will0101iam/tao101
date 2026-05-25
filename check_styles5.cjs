const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');
  
  const rules = await page.evaluate(() => {
    const matchedRules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && rule.selectorText.includes(':hover') && rule.selectorText.includes('.elementor-button')) {
            matchedRules.push(rule.selectorText + " { " + rule.cssText + " }");
          }
        }
      } catch (e) {}
    }
    return matchedRules;
  });
  
  console.log(JSON.stringify(rules.filter(r => r.includes('88eaaa0') || r.includes('98828b4') || r.includes('elementor-button')), null, 2));
  await browser.close();
})();
