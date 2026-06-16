const productRoot = document.querySelector("[data-product-root]");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeProductHtml(html) {
  const parser = new DOMParser();
  const documentBody = parser.parseFromString(html || "", "text/html").body;

  documentBody.querySelectorAll("script, style, iframe, mp-style-type").forEach((node) => node.remove());
  documentBody.querySelectorAll("[data-lark-record-format]").forEach((node) => node.remove());

  documentBody.querySelectorAll("img").forEach((image) => {
    image.loading = "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    image.removeAttribute("style");
  });

  documentBody.querySelectorAll("a").forEach((link) => {
    link.target = "_blank";
    link.rel = "noreferrer";
  });

  documentBody.querySelectorAll("*").forEach((node) => {
    [...node.attributes].forEach((attribute) => {
      if (attribute.name.startsWith("on")) {
        node.removeAttribute(attribute.name);
      }
    });
  });

  return documentBody.innerHTML;
}

function formatFullDate(date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date || "NO DATE";
  }

  return parsed.toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getProductId() {
  return new URLSearchParams(window.location.search).get("id");
}

function renderNotFound() {
  if (!productRoot) {
    return;
  }

  productRoot.innerHTML = `
    <div class="post-not-found">
      <p class="eyebrow">/ PRODUCT ERROR</p>
      <h1>Product not found</h1>
      <a class="button secondary" href="./products.html">BACK TO PRODUCTS</a>
    </div>
  `;
}

function renderProduct(product) {
  if (!productRoot) {
    return;
  }

  const productHtml = sanitizeProductHtml(product.content);

  document.title = `${product.title} | Guotao Tao`;

  productRoot.innerHTML = `
    <header class="post-hero">
      <a class="back-link" href="./products.html">← ALL PRODUCTS</a>
      <div class="post-title-card">
        <div class="post-page-kicker">
          <span class="post-page-icon">RT</span>
          <span>/ PRODUCT NOTE</span>
        </div>
        <h1>${escapeHtml(product.title)}</h1>
      </div>
      <div class="post-meta">
        <span>${escapeHtml(formatFullDate(product.date))}</span>
        <span>${escapeHtml(product.excerpt || "No product description yet.")}</span>
      </div>
      ${
        product.ctaUrl
          ? `<a class="source-link" href="${escapeHtml(product.ctaUrl)}" target="_blank" rel="noreferrer">${escapeHtml(product.ctaLabel || "OPEN PRODUCT")}</a>`
          : ""
      }
    </header>
    <div class="article-content">
      ${productHtml || "<p>No product details yet.</p>"}
    </div>
  `;
}

async function loadProduct() {
  try {
    const productId = getProductId();
    const product = await window.ReyContent.findPublishedProduct(productId);

    if (!product) {
      renderNotFound();
      return;
    }

    renderProduct(product);
  } catch {
    renderNotFound();
  }
}

loadProduct();
