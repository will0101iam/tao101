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
        lineHeight: comp.lineHeight,
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
      heroP: getStyles('.elementor-widget-text-editor p'),
      heroButton: getStyles('.elementor-button'),
      navLink: getStyles('.elementor-nav-menu a'),
      blogHeading: getStyles('.elementor-posts-container h3')
    };
  });
  
  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
})();
