const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const readFullPost = await page.evaluate(() => {
    const el = document.querySelector('.elementor-post__read-more');
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      tagName: el.tagName,
      color: style.color,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      textTransform: style.textTransform,
      letterSpacing: style.letterSpacing
    };
  });

  const dateStyle = await page.evaluate(() => {
    const el = document.querySelector('.elementor-post-date');
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      color: style.color,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight
    };
  });

  const excerptStyle = await page.evaluate(() => {
    const el = document.querySelector('.elementor-post__excerpt p');
    if (!el) return null;
    const style = window.getComputedStyle(el);
    return {
      color: style.color,
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      marginBottom: style.marginBottom
    };
  });

  console.log('Read Full Post:', readFullPost);
  console.log('Date:', dateStyle);
  console.log('Excerpt:', excerptStyle);

  await browser.close();
})();
