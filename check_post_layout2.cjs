const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const postLink = await page.evaluate(() => {
    const el = document.querySelector('.elementor-post__title a');
    return el ? el.href : null;
  });

  if (postLink) {
    console.log("Found post:", postLink);
    await page.goto(postLink);
    const layout = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const h1Style = h1 ? window.getComputedStyle(h1) : null;
      const content = document.querySelector('main') || document.body;
      const p = Array.from(content.querySelectorAll('p')).find(p => p.innerText.length > 50);
      const pStyle = p ? window.getComputedStyle(p) : null;
      const container = h1 ? h1.closest('.elementor-container, .max-w-7xl, div[style*="max-width"]') : null;
      
      return {
        h1: h1Style ? {
          fontSize: h1Style.fontSize,
          fontWeight: h1Style.fontWeight,
          lineHeight: h1Style.lineHeight,
          color: h1Style.color
        } : null,
        p: pStyle ? {
          fontSize: pStyle.fontSize,
          lineHeight: pStyle.lineHeight,
          color: pStyle.color
        } : null,
        container: container ? window.getComputedStyle(container).maxWidth : null
      };
    });
    console.log(layout);
  }
  await browser.close();
})();
