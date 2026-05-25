const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const html = await page.evaluate(() => {
    return document.querySelector('h2').innerHTML;
  });

  console.log(html);

  await browser.close();
})();
