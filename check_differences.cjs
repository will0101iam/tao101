const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  // Check header
  const headerLinks = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('header a')).map(a => a.textContent.trim());
  });

  // Check hero section
  const heroText = await page.evaluate(() => {
    const el = document.querySelector('.elementor-heading-title');
    return el ? el.innerHTML : '';
  });

  // Check primary button
  const buttonStyles = await page.evaluate(() => {
    const btn = document.querySelector('.elementor-button');
    if (!btn) return null;
    const style = window.getComputedStyle(btn);
    return {
      text: btn.textContent.trim(),
      bg: style.backgroundColor,
      color: style.color,
      padding: style.padding,
      font: style.fontFamily,
      weight: style.fontWeight,
      border: style.border,
      borderRadius: style.borderRadius
    };
  });

  console.log('Header links:', headerLinks);
  console.log('Hero text:', heroText);
  console.log('Button styles:', buttonStyles);

  await browser.close();
})();
