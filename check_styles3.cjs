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
        display: comp.display
      };
    };

    const heroBtn = document.querySelector('.elementor-button');
    const heroBtnText = heroBtn ? heroBtn.querySelector('.elementor-button-text') : null;
    const heroBtnContentWrapper = heroBtn ? heroBtn.querySelector('.elementor-button-content-wrapper') : null;

    // Simulate hover on hero button
    // (We can't easily get hover styles without triggering it, but we can look for css rules)
    return {
      heroBtn: getStyles(heroBtn),
      heroBtnContentWrapper: getStyles(heroBtnContentWrapper),
      heroBtnText: getStyles(heroBtnText)
    };
  });
  
  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
})();
