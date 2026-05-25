const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const containerSizes = await page.evaluate(() => {
    const mainContainer = document.querySelector('.elementor-container');
    if (!mainContainer) return null;
    const style = window.getComputedStyle(mainContainer);
    return {
      maxWidth: style.maxWidth,
      width: style.width
    };
  });

  const blogGrid = await page.evaluate(() => {
    const posts = document.querySelectorAll('.elementor-post');
    if (!posts.length) return null;
    const parent = posts[0].parentElement;
    const style = window.getComputedStyle(parent);
    return {
      display: style.display,
      gridTemplateColumns: style.gridTemplateColumns,
      gap: style.gap
    };
  });

  const fontSizes = await page.evaluate(() => {
    const h2 = document.querySelector('h2');
    const p = document.querySelector('p');
    return {
      h2Size: h2 ? window.getComputedStyle(h2).fontSize : null,
      h2Weight: h2 ? window.getComputedStyle(h2).fontWeight : null,
      pSize: p ? window.getComputedStyle(p).fontSize : null,
      pColor: p ? window.getComputedStyle(p).color : null
    };
  });

  console.log('Container:', containerSizes);
  console.log('Blog grid:', blogGrid);
  console.log('Font sizes:', fontSizes);

  await browser.close();
})();
