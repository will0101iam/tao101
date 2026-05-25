const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/');
  
  const styles = await page.evaluate(() => {
    const getStyles = (el) => {
      if (!el) return null;
      const comp = window.getComputedStyle(el);
      return {
        className: el.className,
        bgColor: comp.backgroundColor,
        color: comp.color,
        fontFamily: comp.fontFamily,
        fontSize: comp.fontSize,
        fontWeight: comp.fontWeight,
        letterSpacing: comp.letterSpacing,
        textTransform: comp.textTransform,
        border: comp.border,
        padding: comp.padding,
        borderRadius: comp.borderRadius,
        boxShadow: comp.boxShadow
      };
    };

    const heroButton = document.querySelector('.elementor-button');
    const heroButtonWrapper = heroButton ? heroButton.closest('.elementor-button-wrapper') : null;
    const authorH5 = document.querySelector('h5');
    const h2s = Array.from(document.querySelectorAll('h2')).map(el => getStyles(el));
    const h3s = Array.from(document.querySelectorAll('h3')).map(el => getStyles(el));

    return {
      heroButtonWrapper: getStyles(heroButtonWrapper),
      heroButton: getStyles(heroButton),
      authorH5: getStyles(authorH5),
      h2s: h2s.slice(0, 3),
      h3s: h3s.slice(0, 3)
    };
  });
  
  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
})();
