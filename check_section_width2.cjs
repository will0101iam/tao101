const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const layout = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('.elementor-top-section'));
    return sections.map(sec => {
      const container = sec.querySelector('.elementor-container');
      const text = sec.innerText.slice(0, 50).replace(/\n/g, ' ');
      return {
        text,
        maxWidth: container ? window.getComputedStyle(container).maxWidth : null
      };
    });
  });

  console.log(layout);

  await browser.close();
})();
