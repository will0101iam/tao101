const assert = require("node:assert/strict");
const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("playwright");

const rootDir = path.join(__dirname, "..");

function contentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html";
  if (filePath.endsWith(".js")) return "text/javascript";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

function startServer() {
  const server = http.createServer((request, response) => {
    const url = new URL(request.url, "http://127.0.0.1");
    const requestedPath = decodeURIComponent(url.pathname === "/" ? "/admin.html" : url.pathname);
    const filePath = path.normalize(path.join(rootDir, requestedPath));

    if (!filePath.startsWith(rootDir)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, body) => {
      if (error) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }

      response.writeHead(200, { "content-type": contentType(filePath) });
      response.end(body);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      resolve({ server, url: `http://127.0.0.1:${server.address().port}` });
    });
  });
}

async function createPage(baseUrl, rows = [], openNew = true) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.route("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2", (route) => {
    route.fulfill({
      contentType: "text/javascript",
      body: `
        window.__uploadCalls = [];
        window.supabase = {
          createClient() {
            return {
              auth: {
                getSession: async () => ({ data: { session: { user: { email: "admin@web-new.local" } } }, error: null }),
                signInWithPassword: async () => ({ error: null }),
                signOut: async () => ({ error: null })
              },
              from() {
                return {
                  select: async () => ({ data: ${JSON.stringify(rows)}, error: null }),
                  insert: () => ({ select: () => ({ single: async () => ({ data: {}, error: null }) }) }),
                  update: () => ({ eq: () => ({ select: () => ({ single: async () => ({ data: {}, error: null }) }) }) }),
                  delete: () => ({ eq: async () => ({ error: null }) })
                };
              },
              storage: {
                from() {
                  return {
                    upload: async (path, file) => {
                      window.__uploadCalls.push({ path, name: file.name });
                      return { error: null };
                    },
                    getPublicUrl: (path) => ({ data: { publicUrl: "https://cdn.example.test/" + path } })
                  };
                }
              }
            };
          }
        };
      `,
    });
  });

  await page.goto(`${baseUrl}/admin.html`);
  await page.waitForSelector("[data-admin-console]:not(.is-hidden)");
  if (openNew) {
    await page.click("[data-new-entry]");
    await page.waitForSelector("[data-visual-editor][contenteditable='true']");
  }

  return { browser, page };
}

async function setEditorHtmlAndCaret(page, html, selector = "p", offset = null) {
  await page.evaluate(
    ({ html, selector, offset }) => {
      const editor = document.querySelector("[data-visual-editor]");
      editor.innerHTML = html;
      const target = editor.querySelector(selector);
      const range = document.createRange();
      const selection = window.getSelection();

      target.focus?.();
      if (target.firstChild?.nodeType === Node.TEXT_NODE) {
        range.setStart(target.firstChild, offset ?? target.firstChild.textContent.length);
      } else {
        range.selectNodeContents(target);
        range.collapse(false);
      }

      selection.removeAllRanges();
      selection.addRange(range);
      editor.focus();
    },
    { html, selector, offset },
  );
}

async function menuLabels(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll("[data-slash-menu]:not(.is-hidden) [data-slash-command] span")].map((node) => node.textContent),
  );
}

async function selectTextInEditor(page, selector, start, end) {
  await page.evaluate(
    ({ selector, start, end }) => {
      const editor = document.querySelector("[data-visual-editor]");
      const target = editor.querySelector(selector);
      const textNode = target.firstChild;
      const range = document.createRange();
      const selection = window.getSelection();

      range.setStart(textNode, start);
      range.setEnd(textNode, end);
      selection.removeAllRanges();
      selection.addRange(range);
      editor.focus();
    },
    { selector, start, end },
  );
}

(async () => {
  const { server, url } = await startServer();
  const { browser, page } = await createPage(url);

  try {
    await page.evaluate(() => {
      window.__promptCalls = 0;
      window.prompt = () => {
        window.__promptCalls += 1;
        throw new Error("Slash image must not use URL prompt");
      };
    });

    await page.waitForTimeout(100);
    await page.keyboard.type("/");
    assert.deepEqual(await menuLabels(page), ["Paragraph", "Heading 2", "Heading 3", "Quote", "Bullet List", "Image", "Divider", "Code"]);
    await page.keyboard.press("Escape");

    await setEditorHtmlAndCaret(page, "<p>First paragraph</p>");
    await page.keyboard.press("Enter");
    await page.keyboard.type("/");
    assert.deepEqual(await menuLabels(page), ["Paragraph", "Heading 2", "Heading 3", "Quote", "Bullet List", "Image", "Divider", "Code"]);
    await page.keyboard.press("Escape");

    await setEditorHtmlAndCaret(page, "<p></p>");
    await page.keyboard.type("、");
    assert.deepEqual(await menuLabels(page), ["Paragraph", "Heading 2", "Heading 3", "Quote", "Bullet List", "Image", "Divider", "Code"]);
    await page.keyboard.press("Escape");

    await setEditorHtmlAndCaret(page, "<p></p>");
    await page.keyboard.type("／");
    assert.deepEqual(await menuLabels(page), ["Paragraph", "Heading 2", "Heading 3", "Quote", "Bullet List", "Image", "Divider", "Code"]);
    await page.keyboard.press("Escape");

    await setEditorHtmlAndCaret(page, "<p></p>");
    await page.keyboard.type("/");
    assert.deepEqual(await menuLabels(page), ["Paragraph", "Heading 2", "Heading 3", "Quote", "Bullet List", "Image", "Divider", "Code"]);

    await page.keyboard.type("h");
    assert.deepEqual(await menuLabels(page), ["Heading 2", "Heading 3"]);

    await setEditorHtmlAndCaret(page, "<p>Hello </p>");
    await page.keyboard.type("/");
    assert.equal(await page.locator("[data-slash-menu]:not(.is-hidden)").count(), 0);

    await setEditorHtmlAndCaret(page, "<p>https://example.com</p>");
    await page.keyboard.type("/");
    assert.equal(await page.locator("[data-slash-menu]:not(.is-hidden)").count(), 0);

    await setEditorHtmlAndCaret(page, "<pre><code></code></pre>", "code");
    await page.keyboard.type("/");
    assert.equal(await page.locator("[data-slash-menu]:not(.is-hidden)").count(), 0);

    await setEditorHtmlAndCaret(page, "<h2></h2>", "h2");
    await page.keyboard.type("/");
    assert.equal(await page.locator("[data-slash-menu]:not(.is-hidden)").count(), 0);

    await setEditorHtmlAndCaret(page, "<figure><img src='x.png'><figcaption></figcaption></figure>", "figcaption");
    await page.keyboard.type("/");
    assert.equal(await page.locator("[data-slash-menu]:not(.is-hidden)").count(), 0);

    await setEditorHtmlAndCaret(page, "<p></p>");
    await page.keyboard.type("/zzz");
    assert.equal(await page.locator("[data-slash-menu]:not(.is-hidden)").count(), 0);

    await setEditorHtmlAndCaret(page, "<p></p>");
    await page.keyboard.type("/");
    await page.keyboard.press(" ");
    assert.equal(await page.locator("[data-slash-menu]:not(.is-hidden)").count(), 0);

    await setEditorHtmlAndCaret(page, "<p></p>");
    await page.keyboard.type("/h");
    await page.keyboard.press("Enter");
    assert.match(await page.locator("[data-visual-editor]").innerHTML(), /^<h2><br><\/h2>/);

    await setEditorHtmlAndCaret(page, "<p></p>");
    await page.keyboard.type("/h3");
    await page.keyboard.press("Enter");
    assert.match(await page.locator("[data-visual-editor]").innerHTML(), /^<h3><br><\/h3>/);

    await page.evaluate(() => {
      const editor = document.querySelector("[data-visual-editor]");
      editor.innerHTML = "<h2>Heading two</h2><h3>Heading three</h3>";
    });
    const headingStyles = await page.evaluate(() => {
      const h2 = Number.parseFloat(getComputedStyle(document.querySelector("[data-visual-editor] h2")).fontSize);
      const h3 = Number.parseFloat(getComputedStyle(document.querySelector("[data-visual-editor] h3")).fontSize);
      return { h2, h3 };
    });
    assert.ok(headingStyles.h2 > headingStyles.h3, `expected h2 (${headingStyles.h2}) to be larger than h3 (${headingStyles.h3})`);

    await setEditorHtmlAndCaret(page, "<p>Hello world</p>");
    await selectTextInEditor(page, "p", 6, 11);
    await page.keyboard.press("Control+B");
    assert.match(await page.locator("[data-visual-editor]").innerHTML(), /<(strong|b)>world<\/(strong|b)>/);

    await setEditorHtmlAndCaret(page, "<p></p>");
    await page.keyboard.type("/q");
    await page.keyboard.press("Enter");
    assert.match(await page.locator("[data-visual-editor]").innerHTML(), /^<blockquote><br><\/blockquote>/);
    await page.keyboard.type("Quoted idea");
    await page.keyboard.press("Enter");
    assert.match(await page.locator("[data-visual-editor]").innerHTML(), /^<blockquote>Quoted idea<\/blockquote><blockquote><br><\/blockquote>/);
    await page.keyboard.press("Backspace");
    assert.match(await page.locator("[data-visual-editor]").innerHTML(), /^<blockquote>Quoted idea<\/blockquote><p><br><\/p>/);

    await setEditorHtmlAndCaret(page, "<p></p>");
    await page.keyboard.type("/h");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Section title");
    await page.keyboard.press("Enter");
    assert.match(await page.locator("[data-visual-editor]").innerHTML(), /^<h2>Section title<\/h2><p><br><\/p>/);

    await setEditorHtmlAndCaret(page, "<p></p>");
    await page.keyboard.type("/b");
    await page.keyboard.press("Enter");
    assert.match(await page.locator("[data-visual-editor]").innerHTML(), /^<ul><li><br><\/li><\/ul>/);
    await page.keyboard.type("First item");
    await page.keyboard.press("Enter");
    assert.match(await page.locator("[data-visual-editor]").innerHTML(), /^<ul><li>First item<\/li><li><br><\/li><\/ul>/);
    await page.keyboard.press("Enter");
    assert.match(await page.locator("[data-visual-editor]").innerHTML(), /^<ul><li>First item<\/li><\/ul><p><br><\/p>/);

    await setEditorHtmlAndCaret(page, "<p></p>");
    await page.keyboard.type("/d");
    await page.keyboard.press("Enter");
    assert.match(await page.locator("[data-visual-editor]").innerHTML(), /^<hr><p><br><\/p>/);

    const chooserPromise = page.waitForEvent("filechooser");
    await setEditorHtmlAndCaret(page, "<p></p>");
    await page.keyboard.type("/");
    await page.click("[data-slash-command='image']");
    const chooser = await chooserPromise;
    await chooser.setFiles({
      name: "body-image.png",
      mimeType: "image/png",
      buffer: Buffer.from("png"),
    });
    await page.waitForFunction(() => window.__uploadCalls.length === 1);
    assert.deepEqual(await page.evaluate(() => window.__uploadCalls.map((call) => call.name)), ["body-image.png"]);
    assert.match(await page.locator("[data-visual-editor]").innerHTML(), /<figure><img src="https:\/\/cdn\.example\.test\//);
    assert.equal(await page.evaluate(() => window.__promptCalls), 0);
    await page.keyboard.type("/");
    assert.deepEqual(await menuLabels(page), ["Paragraph", "Heading 2", "Heading 3", "Quote", "Bullet List", "Image", "Divider", "Code"]);
  } finally {
    await browser.close();
    server.close();
  }

  const existingRow = {
    id: "post-1",
    slug: "post-1",
    title: "Existing Post",
    excerpt: "",
    published_at: "2026-06-16",
    cover_image_url: "",
    content_html: "<p></p>",
    blocks_json: [],
    status: "draft",
    author_name: "Guotao Tao",
  };
  const secondRun = await startServer();
  const existing = await createPage(secondRun.url, [existingRow], false);

  try {
    await existing.page.click("[data-entry-id='post-1']");
    await existing.page.waitForSelector("[data-visual-editor]");
    assert.equal(await existing.page.locator("[data-visual-editor]").getAttribute("contenteditable"), "true");
    await setEditorHtmlAndCaret(existing.page, "<p></p>");
    await existing.page.keyboard.type("/");
    assert.deepEqual(await menuLabels(existing.page), ["Paragraph", "Heading 2", "Heading 3", "Quote", "Bullet List", "Image", "Divider", "Code"]);
  } finally {
    await existing.browser.close();
    secondRun.server.close();
  }

  const productRun = await startServer();
  const productEditor = await createPage(productRun.url, [], false);

  try {
    await productEditor.page.click("[data-admin-tab='products']");
    await productEditor.page.click("[data-new-entry]");
    await productEditor.page.waitForSelector("[data-visual-editor][contenteditable='true']");
    assert.match((await productEditor.page.locator("[data-visual-editor]").innerHTML()).trim(), /^<p><br><\/p>$/);
    await productEditor.page.click("[data-visual-editor] p");
    await productEditor.page.keyboard.type("/");
    assert.deepEqual(await menuLabels(productEditor.page), ["Paragraph", "Heading 2", "Heading 3", "Quote", "Bullet List", "Image", "Divider", "Code"]);
    await productEditor.page.keyboard.press("Escape");

    await setEditorHtmlAndCaret(productEditor.page, "<p></p>");
    await productEditor.page.keyboard.type("/");
    assert.deepEqual(await menuLabels(productEditor.page), ["Paragraph", "Heading 2", "Heading 3", "Quote", "Bullet List", "Image", "Divider", "Code"]);
    await productEditor.page.keyboard.press("Escape");

    await setEditorHtmlAndCaret(productEditor.page, "<p>Product intro</p>");
    await productEditor.page.keyboard.press("Enter");
    await productEditor.page.keyboard.type("/");
    assert.deepEqual(await menuLabels(productEditor.page), ["Paragraph", "Heading 2", "Heading 3", "Quote", "Bullet List", "Image", "Divider", "Code"]);
  } finally {
    await productEditor.browser.close();
    productRun.server.close();
  }

  const looseProductRow = {
    id: "product-1",
    slug: "product-1",
    title: "Loose Product",
    excerpt: "",
    published_at: "2026-06-16",
    cover_image_url: "",
    screenshots: [],
    content_html: "Loose intro<br><br>Second line",
    blocks_json: [],
    status: "draft",
    cta_label: "",
    cta_url: "",
  };
  const looseProductRun = await startServer();
  const looseProduct = await createPage(looseProductRun.url, [looseProductRow], false);

  try {
    await looseProduct.page.click("[data-admin-tab='products']");
    await looseProduct.page.click("[data-entry-id='product-1']");
    await looseProduct.page.waitForSelector("[data-visual-editor][contenteditable='true']");
    assert.match(await looseProduct.page.locator("[data-visual-editor]").innerHTML(), /<p>Loose intro<\/p><p>Second line<\/p>/);

    await setEditorHtmlAndCaret(looseProduct.page, "<p>Loose intro</p>");
    await looseProduct.page.keyboard.press("Enter");
    await looseProduct.page.keyboard.type("/");
    assert.deepEqual(await menuLabels(looseProduct.page), ["Paragraph", "Heading 2", "Heading 3", "Quote", "Bullet List", "Image", "Divider", "Code"]);
  } finally {
    await looseProduct.browser.close();
    looseProductRun.server.close();
  }

  const productWithTerminalImage = {
    id: "product-image",
    slug: "product-image",
    title: "Image Product",
    excerpt: "",
    published_at: "2026-06-16",
    cover_image_url: "",
    screenshots: [],
    content_html: '<p>Intro</p><figure><img src="https://cdn.example.test/body.png" alt="Body image"></figure>',
    blocks_json: [],
    status: "draft",
    cta_label: "",
    cta_url: "",
  };
  const imageProductRun = await startServer();
  const imageProduct = await createPage(imageProductRun.url, [productWithTerminalImage], false);

  try {
    await imageProduct.page.click("[data-admin-tab='products']");
    await imageProduct.page.click("[data-entry-id='product-image']");
    await imageProduct.page.waitForSelector("[data-visual-editor][contenteditable='true']");
    assert.match((await imageProduct.page.locator("[data-visual-editor]").innerHTML()).trim(), /<figure><img[^>]+><\/figure><p><br><\/p>$/);

    await setEditorHtmlAndCaret(imageProduct.page, '<p>Intro</p><figure><img src="https://cdn.example.test/body.png" alt="Body image"></figure><p><br></p>', "p:last-child");
    await imageProduct.page.keyboard.type("/");
    assert.deepEqual(await menuLabels(imageProduct.page), ["Paragraph", "Heading 2", "Heading 3", "Quote", "Bullet List", "Image", "Divider", "Code"]);
  } finally {
    await imageProduct.browser.close();
    imageProductRun.server.close();
  }

  console.log("admin-slash tests passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
