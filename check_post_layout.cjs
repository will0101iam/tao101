const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/the-art-of-focus-keepsake-edition/');

  const layout = await page.evaluate(() => {
    const title = document.querySelector('h1');
    const titleStyle = title ? window.getComputedStyle(title) : null;
    const date = document.querySelector('.elementor-post-info__item--type-date');
    const dateStyle = date ? window.getComputedStyle(date) : null;
    const content = document.querySelector('.elementor-widget-theme-post-content');
    const p = content ? content.querySelector('p') : null;
    const pStyle = p ? window.getComputedStyle(p) : null;
    const container = content ? content.closest('.elementor-container') : null;
    const containerStyle = container ? window.getComputedStyle(container) : null;

    return {
      title: titleStyle ? {
        fontSize: titleStyle.fontSize,
        fontWeight: titleStyle.fontWeight,
        color: titleStyle.color,
        fontFamily: titleStyle.fontFamily
      } : null,
      date: dateStyle ? {
        fontSize: dateStyle.fontSize,
        color: dateStyle.color,
      } : null,
      paragraph: pStyle ? {
        fontSize: pStyle.fontSize,
        color: pStyle.color,
        lineHeight: pStyle.lineHeight,
        fontFamily: pStyle.fontFamily
      } : null,
      containerMaxWidth: containerStyle ? containerStyle.maxWidth : null
    };
  });

  console.log(layout);
  await browser.close();
})();
