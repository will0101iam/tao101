const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const aboutHtml = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('.elementor-top-section'));
    const aboutSec = sections.find(s => s.innerText.includes("Hey, I'm Dan."));
    return aboutSec ? aboutSec.outerHTML : '';
  });

  console.log(aboutHtml.slice(0, 1000));

  await browser.close();
})();
