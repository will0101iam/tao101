const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');
  
  const styles = await page.evaluate(() => {
    const getStyles = (selector) => {
      const els = document.querySelectorAll(selector);
      return Array.from(els).map(el => {
        const comp = window.getComputedStyle(el);
        return {
          text: el.innerText.trim().substring(0, 20),
          bgColor: comp.backgroundColor,
          color: comp.color,
          fontFamily: comp.fontFamily,
          fontSize: comp.fontSize,
          fontWeight: comp.fontWeight,
          letterSpacing: comp.letterSpacing,
          textTransform: comp.textTransform,
          border: comp.border,
          padding: comp.padding,
          borderRadius: comp.borderRadius
        };
      });
    };

    return {
      buttons: getStyles('.elementor-button'),
      h2s: getStyles('h2'),
      h5s: getStyles('h5'),
      inputs: getStyles('input')
    };
  });
  
  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
})();
