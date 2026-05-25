const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const hero = await page.evaluate(() => {
    const section = document.querySelector('section');
    return section ? section.innerText : '';
  });

  const allH2 = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim());
  });

  const allH1 = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim());
  });
  
  const allH5 = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h5')).map(h => h.innerText.trim());
  });

  console.log('First Section:\n', hero);
  console.log('All H1:', allH1);
  console.log('All H2:', allH2);
  console.log('All H5:', allH5);

  await browser.close();
})();
