const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const hoverColor = await page.evaluate(() => {
    const rules = [];
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText && rule.selectorText.includes('.elementor-post__title a:hover')) {
            rules.push(rule.cssText);
          }
        }
      } catch (e) {}
    }
    return rules;
  });

  const postTitleColor = await page.evaluate(() => {
    const title = document.querySelector('.elementor-post__title a');
    if (!title) return null;
    const style = window.getComputedStyle(title);
    return {
      color: style.color,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight
    }
  });

  console.log('Title style:', postTitleColor);
  console.log('Hover rules:', hoverColor);

  await browser.close();
})();
