const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const iconsStyle = await page.evaluate(() => {
    const el = document.querySelector('.elementor-social-icon');
    if (!el) return null;
    const s = window.getComputedStyle(el);
    return {
      border: s.border,
      background: s.backgroundColor,
      color: s.color,
      width: s.width,
      height: s.height,
      borderRadius: s.borderRadius
    };
  });

  console.log(iconsStyle);

  await browser.close();
})();
