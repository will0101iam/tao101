const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const containerMaxWidths = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.elementor-container')).map(el => {
      const s = window.getComputedStyle(el);
      return {
        maxWidth: s.maxWidth,
        width: s.width
      };
    });
  });

  console.log([...new Set(containerMaxWidths.map(c => c.maxWidth))]);

  await browser.close();
})();
