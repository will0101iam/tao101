const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const footerText = await page.evaluate(() => {
    return document.querySelector('footer').innerText;
  });

  console.log(footerText);

  await browser.close();
})();
