const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');
  
  const styles = await page.evaluate(() => {
    const getStyles = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const comp = window.getComputedStyle(el);
      return {
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
    };

    return {
      body: getStyles('body'),
      heroH2: getStyles('h2'),
      heroButton: getStyles('.elementor-button'),
      sectionBg1: getStyles('section:nth-of-type(2)'),
      sectionBg2: getStyles('section:nth-of-type(3)')
    };
  });
  
  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
})();
