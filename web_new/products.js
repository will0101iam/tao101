const productList = document.querySelector("[data-product-list]");
const productCount = document.querySelector("[data-product-count]");
const productSearch = document.querySelector("[data-product-search]");
const productArchiveCopy = {
  en: {
    inspect: "INSPECT",
    noMatch: "[NO MATCHING PRODUCTS]",
  },
  zh: {
    inspect: "查看",
    noMatch: "[没有匹配产品]",
  },
};

let archiveProducts = [];

function getProductArchiveCopy() {
  return productArchiveCopy[document.documentElement.dataset.language] || productArchiveCopy.en;
}

function parseProductDate(product) {
  const time = Date.parse(product.date || "");
  return Number.isNaN(time) ? 0 : time;
}

function sortProducts(products) {
  return [...products].sort((a, b) => parseProductDate(b) - parseProductDate(a));
}

function formatProductDate(date) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date || "NO DATE";
  }

  return `${parsed.getFullYear()}.${String(parsed.getMonth() + 1).padStart(2, "0")}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function productUrl(product) {
  return `./product.html?id=${encodeURIComponent(product.id)}`;
}

function renderProducts(products) {
  if (productCount) {
    productCount.textContent = String(products.length).padStart(2, "0");
  }

  if (!productList) {
    return;
  }

  const copy = getProductArchiveCopy();

  if (!products.length) {
    productList.innerHTML = `<p class="inline-status">${copy.noMatch}</p>`;
    return;
  }

  productList.innerHTML = products
    .map(
      (product, index) => `
        <a class="archive-row" href="${productUrl(product)}">
          <span class="archive-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="archive-date">${escapeHtml(formatProductDate(product.date))}</span>
          <span class="archive-main">
            <strong>${escapeHtml(product.title)}</strong>
            <em>${escapeHtml(product.excerpt || "No product description yet.")}</em>
          </span>
          <span class="archive-action">${escapeHtml(product.ctaLabel || copy.inspect)}</span>
        </a>
      `,
    )
    .join("");
}

async function loadProductsArchive() {
  try {
    archiveProducts = sortProducts(await window.ReyContent.listPublishedProducts());
    renderProducts(archiveProducts);

    productSearch?.addEventListener("input", () => {
      const query = productSearch.value.trim().toLowerCase();
      const filtered = query
        ? archiveProducts.filter((product) =>
            [product.title, product.excerpt, product.date, product.ctaLabel].some((value) =>
              String(value ?? "").toLowerCase().includes(query),
            ),
          )
        : archiveProducts;

      renderProducts(filtered);
    });
  } catch (error) {
    if (productList) {
      productList.innerHTML = `<p class="inline-status">[ERROR: ${escapeHtml(error.message)}]</p>`;
    }
  }
}

loadProductsArchive();
window.addEventListener("rey-language-change", () => {
  if (archiveProducts.length) {
    const query = productSearch?.value.trim().toLowerCase();
    const filtered = query
      ? archiveProducts.filter((product) =>
          [product.title, product.excerpt, product.date, product.ctaLabel].some((value) =>
            String(value ?? "").toLowerCase().includes(query),
          ),
        )
      : archiveProducts;

    renderProducts(filtered);
  }
});
