const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const headerHtml = await page.evaluate(() => {
    return document.querySelector('header').innerHTML;
  });

  console.log(headerHtml);

  await browser.close();
})();
