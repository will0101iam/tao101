const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const rootDir = path.join(__dirname, "..");

const products = [
  {
    id: "p4",
    slug: "product-four",
    title: "Product Four",
    excerpt: "Newest product.",
    published_at: "2026-06-16",
    cover_image_url: "https://cdn.example.test/product-four-cover.png",
    screenshots: [],
    content_html: "<p>Product four body.</p>",
    cta_label: "Open Product",
    cta_url: "",
    status: "published",
    updated_at: "2026-06-16T09:52:36.812904+00:00",
  },
  {
    id: "p3",
    slug: "product-three",
    title: "Product Three",
    excerpt: "Third product.",
    published_at: "2026-06-15",
    cover_image_url: "",
    screenshots: ["https://cdn.example.test/product-three-shot.png"],
    content_html: "<p>Product three body.</p>",
    cta_label: "Open Product",
    cta_url: "",
    status: "published",
    updated_at: "2026-06-15T09:52:36.812904+00:00",
  },
  {
    id: "p2",
    slug: "product-two",
    title: "Product Two",
    excerpt: "Second product.",
    published_at: "2026-06-14",
    cover_image_url: "",
    screenshots: [],
    content_html: '<p>Product two body.</p><figure><img src="https://cdn.example.test/product-two-body.png" alt="Body image"></figure>',
    cta_label: "Open Product",
    cta_url: "",
    status: "published",
    updated_at: "2026-06-14T09:52:36.812904+00:00",
  },
  {
    id: "p1",
    slug: "product-one",
    title: "Product One",
    excerpt: "Oldest product.",
    published_at: "2026-06-13",
    cover_image_url: "",
    screenshots: [],
    content_html: "<p>Product one body.</p>",
    cta_label: "Open Product",
    cta_url: "",
    status: "published",
    updated_at: "2026-06-13T09:52:36.812904+00:00",
  },
];

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
    const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
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

(async () => {
  const { server, url } = await startServer();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.route("https://xnvxbqxgixyeissvasuj.supabase.co/rest/v1/products**", (route) => {
    const requestUrl = new URL(route.request().url());
    const slug = requestUrl.searchParams.get("slug");
    const id = requestUrl.searchParams.get("id");
    let rows = products;

    if (slug?.startsWith("eq.")) {
      rows = rows.filter((product) => product.slug === slug.slice(3));
    }

    if (id?.startsWith("eq.")) {
      rows = rows.filter((product) => product.id === id.slice(3));
    }

    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify(rows),
    });
  });

  await page.route("https://xnvxbqxgixyeissvasuj.supabase.co/rest/v1/posts**", (route) => {
    route.fulfill({ contentType: "application/json", body: "[]" });
  });

  try {
    await page.goto(`${url}/index.html`);
    await page.waitForSelector("[data-home-products] .product-card");
    assert.deepEqual(await page.locator(".site-footer .footer-links a").evaluateAll((links) => links.map((link) => ({
      text: link.textContent.trim(),
      href: link.getAttribute("href"),
    }))), [
      {
        text: "微信公众号",
        href: "https://mp.weixin.qq.com/s/4NSIvsU_SbTeUHzH5U9VUw",
      },
      {
        text: "小红书",
        href: "https://www.xiaohongshu.com/user/profile/5bfcd46a6b58b740b2aa8c54",
      },
      {
        text: "Twitter",
        href: "#",
      },
    ]);
    assert.equal(await page.locator("[data-home-products] .product-card").count(), 3);
    assert.equal(await page.locator("[data-home-products] .product-card h3").first().textContent(), "Product Four");
    assert.deepEqual(await page.locator("[data-home-products] .product-card .product-card-media img").evaluateAll((images) => images.map((image) => image.getAttribute("src"))), [
      "https://cdn.example.test/product-four-cover.png",
      "https://cdn.example.test/product-three-shot.png",
      "https://cdn.example.test/product-two-body.png",
    ]);
    await expectText(page, "[data-home-products] .view-more-link strong", "ALL 4 PRODUCTS");
    assert.match(await page.locator("[data-home-products] .view-more-link").getAttribute("href"), /products\.html$/);
    const hoverBefore = await page.evaluate(() => {
      const card = document.querySelectorAll("[data-home-products] .product-card")[1];
      const title = card.querySelector("h3");
      const status = card.querySelector(".card-footer strong");
      return {
        title: getComputedStyle(title).color,
        status: getComputedStyle(status).color,
      };
    });
    await page.hover("[data-home-products] .product-card:nth-of-type(2)");
    const hoverAfter = await page.evaluate(() => {
      const card = document.querySelectorAll("[data-home-products] .product-card")[1];
      const title = card.querySelector("h3");
      const status = card.querySelector(".card-footer strong");
      return {
        title: getComputedStyle(title).color,
        status: getComputedStyle(status).color,
      };
    });
    assert.deepEqual(hoverAfter, hoverBefore);

    await page.goto(`${url}/products.html`);
    await page.waitForSelector("[data-product-list] .archive-row");
    assert.equal(await page.locator("[data-product-list] .archive-row").count(), 4);
    assert.equal(await page.locator("[data-product-list] img").count(), 0);
    await expectText(page, "[data-product-count]", "04");
    assert.match(await page.locator("[data-product-list] .archive-row").first().getAttribute("href"), /product\.html\?id=p4$/);

    await page.goto(`${url}/product.html?id=p4`);
    await page.waitForSelector("[data-product-root] h1");
    await expectText(page, "[data-product-root] h1", "Product Four");
    await expectText(page, "[data-product-root] .article-content p", "Product four body.");

    await page.unroute("https://xnvxbqxgixyeissvasuj.supabase.co/rest/v1/products**");
    await page.route("https://xnvxbqxgixyeissvasuj.supabase.co/rest/v1/products**", (route) => route.abort());
    await page.goto(`${url}/index.html`);
    await expectText(page, "[data-home-products]", "[PRODUCTS UNAVAILABLE]");
    assert.equal(await page.locator("[data-home-products] .product-card").count(), 0);
    assert.equal((await page.locator("[data-home-products]").textContent()).includes("Zen Terminal"), false);
  } finally {
    await browser.close();
    server.close();
  }

  console.log("product pages tests passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});

async function expectText(page, selector, text) {
  assert.equal((await page.locator(selector).textContent()).trim(), text);
}
