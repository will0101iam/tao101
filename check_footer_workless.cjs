const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const style = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('footer *')).find(e => e.innerText === 'Work Less. Earn More. Enjoy Life.');
    if (!el) return null;
    const s = window.getComputedStyle(el);
    return {
      tagName: el.tagName,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      color: s.color,
      marginBottom: s.marginBottom
    };
  });

  console.log(style);

  await browser.close();
})();
