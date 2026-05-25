const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const icons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a svg')).map(svg => svg.outerHTML);
  });

  console.log(icons);

  await browser.close();
})();
