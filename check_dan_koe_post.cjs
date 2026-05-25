const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://thedankoe.com/letters/human-3-0-a-map-to-reach-the-top-1/');

  const styles = await page.evaluate(() => {
    const getStyle = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        color: s.color,
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        marginTop: s.marginTop,
        marginBottom: s.marginBottom,
        padding: s.padding,
        borderLeft: s.borderLeft
      };
    };

    return {
      h1: getStyle('h1'),
      h2: getStyle('.elementor-widget-theme-post-content h2'),
      h3: getStyle('.elementor-widget-theme-post-content h3'),
      p: getStyle('.elementor-widget-theme-post-content p'),
      a: getStyle('.elementor-widget-theme-post-content a'),
      strong: getStyle('.elementor-widget-theme-post-content strong'),
      blockquote: getStyle('.elementor-widget-theme-post-content blockquote'),
      ul: getStyle('.elementor-widget-theme-post-content ul'),
      li: getStyle('.elementor-widget-theme-post-content li'),
      containerMaxWidth: getStyle('.elementor-widget-theme-post-content')?.maxWidth || getStyle('.elementor-container')?.maxWidth
    };
  });

  console.log(JSON.stringify(styles, null, 2));
  await browser.close();
})();
