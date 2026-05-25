const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const buttonsHtml = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.elementor-button')).map(btn => btn.outerHTML);
  });

  console.log(buttonsHtml);

  await browser.close();
})();
