const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');

  const layout = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('section')).map(sec => {
      return {
        classes: sec.className,
        text: sec.innerText.slice(0, 100).replace(/\n/g, ' ')
      };
    });
  });

  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.elementor-button, a')).filter(a => a.textContent.includes('Load More') || a.textContent.includes('Pre-Order') || a.textContent.includes('Read Full Post') || a.textContent.includes('Join Future Proof')).map(btn => {
      const style = window.getComputedStyle(btn);
      return {
        text: btn.textContent.trim(),
        bg: style.backgroundColor,
        color: style.color,
        border: style.border,
        padding: style.padding,
        display: style.display,
        justifyContent: style.justifyContent,
        alignItems: style.alignItems
      }
    });
  });

  console.log('Buttons:', buttons);

  await browser.close();
})();
