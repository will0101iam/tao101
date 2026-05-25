const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const hoverStyles = await page.evaluate(() => {
    const rules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && rule.selectorText.includes(':hover')) {
            rules.push({ selector: rule.selectorText, css: rule.cssText });
          }
        }
      } catch (e) {}
    }
    return rules.filter(r => r.selector.includes('elementor-button') || r.selector.includes('a:hover'));
  });

  console.log(JSON.stringify(hoverStyles, null, 2));

  await browser.close();
})();
