const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/letters/a-complete-knowledge-base-of-human-3-0/');

  const extra = await page.evaluate(() => {
    const h2 = document.querySelector('h2');
    const h3 = document.querySelector('h3');
    const h2Style = h2 ? window.getComputedStyle(h2) : null;
    const h3Style = h3 ? window.getComputedStyle(h3) : null;
    const img = document.querySelector('main img');
    
    return {
      h2: h2Style ? { fontSize: h2Style.fontSize, fontWeight: h2Style.fontWeight, marginTop: h2Style.marginTop, marginBottom: h2Style.marginBottom } : null,
      h3: h3Style ? { fontSize: h3Style.fontSize, fontWeight: h3Style.fontWeight } : null,
      imgClasses: img ? img.className : null
    };
  });
  console.log(extra);
  await browser.close();
})();
