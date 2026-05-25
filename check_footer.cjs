const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const footerStyles = await page.evaluate(() => {
    const pElements = Array.from(document.querySelectorAll('footer p'));
    const hElements = Array.from(document.querySelectorAll('footer h2, footer h3'));
    
    return {
      p: pElements.map(p => ({ text: p.innerText, fontSize: window.getComputedStyle(p).fontSize, color: window.getComputedStyle(p).color })),
      h: hElements.map(h => ({ text: h.innerText, fontSize: window.getComputedStyle(h).fontSize, color: window.getComputedStyle(h).color, fontWeight: window.getComputedStyle(h).fontWeight }))
    };
  });

  console.log(JSON.stringify(footerStyles, null, 2));

  await browser.close();
})();
