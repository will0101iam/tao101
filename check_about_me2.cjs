const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const aboutGrid = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('.elementor-top-section'));
    const aboutSec = sections.find(s => s.innerText.includes("Hey, I'm Dan."));
    if (!aboutSec) return null;
    
    return {
      text: aboutSec.innerText.slice(0, 200).replace(/\n/g, ' ')
    };
  });

  console.log(aboutGrid);

  await browser.close();
})();
