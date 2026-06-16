const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const languageToggle = document.querySelector("[data-language-toggle]");
const sessionTimer = document.querySelector("[data-session-timer]");
const homePosts = document.querySelector("[data-home-posts]");
const homeProducts = document.querySelector("[data-home-products]");

const storedTheme = localStorage.getItem("rey-theme");
const preferredTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
const initialTheme = ["dark", "light"].includes(storedTheme) ? storedTheme : preferredTheme;
const storedLanguage = localStorage.getItem("rey-language");
const initialLanguage = ["en", "zh"].includes(storedLanguage) ? storedLanguage : "en";

const interfaceCopy = {
  en: {
    products: "Products",
    writing: "Writing",
    about: "About",
    viewProducts: "[ VIEW PRODUCTS ]",
    readBlogs: "[ READ BLOGS ]",
    viewMore: "VIEW MORE",
    allPosts: "ALL 48 POSTS",
    allProducts: "ALL PRODUCTS",
    read: "READ",
    inspect: "INSPECT",
    languageTitle: "Switch to Chinese",
    themeToLight: "Switch to light mode",
    themeToDark: "Switch to dark mode",
  },
  zh: {
    products: "产品",
    writing: "写作",
    about: "关于",
    viewProducts: "[ 查看产品 ]",
    readBlogs: "[ 阅读博客 ]",
    viewMore: "查看更多",
    allPosts: "全部 48 篇",
    allProducts: "全部产品",
    read: "阅读",
    inspect: "查看",
    languageTitle: "Switch to English",
    themeToLight: "切换到浅色模式",
    themeToDark: "切换到黑色模式",
  },
};

function getCopy() {
  return interfaceCopy[root.dataset.language] || interfaceCopy.en;
}

function updateRotaryControl(type, value) {
  const control = document.querySelector(`[data-rotary="${type}"]`);

  if (!control) {
    return;
  }

  const isLeftState = value === "dark" || value === "en";
  const angle = isLeftState ? "-45deg" : "45deg";
  control.dataset.state = isLeftState ? "left" : "right";
  control.dataset.value = value;
  control.style.setProperty("--rotary-angle", angle);

  control.querySelectorAll("[data-rotary-option]").forEach((option) => {
    option.classList.toggle("is-active", option.dataset.rotaryOption === value);
  });
}

function applyInterfaceLanguage() {
  const copy = getCopy();

  document.querySelectorAll('.nav-links a[href*="products"]').forEach((link) => {
    link.textContent = copy.products;
  });
  document.querySelectorAll('.nav-links a[href*="blog"]').forEach((link) => {
    link.textContent = copy.writing;
  });
  document.querySelectorAll('.nav-links a[href*="about"]').forEach((link) => {
    link.textContent = copy.about;
  });

  const viewProducts = document.querySelector('.hero-actions a[href="#products"]');
  const readBlogs = document.querySelector('.hero-actions a[href="./blog.html"]');

  if (viewProducts) {
    viewProducts.textContent = copy.viewProducts;
  }

  if (readBlogs) {
    readBlogs.textContent = copy.readBlogs;
  }

  if (languageToggle) {
    languageToggle.title = copy.languageTitle;
    languageToggle.setAttribute("aria-label", copy.languageTitle);
  }

  if (themeToggle) {
    themeToggle.title = root.dataset.theme === "dark" ? copy.themeToLight : copy.themeToDark;
    themeToggle.setAttribute("aria-label", themeToggle.title);
  }
}

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem("rey-theme", theme);
  updateRotaryControl("theme", theme);

  if (themeToggle) {
    const copy = getCopy();
    themeToggle.title = theme === "dark" ? copy.themeToLight : copy.themeToDark;
    themeToggle.setAttribute("aria-label", themeToggle.title);
  }
}

function setLanguage(language) {
  root.lang = language;
  root.dataset.language = language;
  localStorage.setItem("rey-language", language);
  updateRotaryControl("language", language);
  applyInterfaceLanguage();
  window.dispatchEvent(new CustomEvent("rey-language-change", { detail: { language } }));
}

setLanguage(initialLanguage);
setTheme(initialTheme);

themeToggle?.addEventListener("click", () => {
  setTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

languageToggle?.addEventListener("click", () => {
  setLanguage(root.dataset.language === "en" ? "zh" : "en");
});

if (sessionTimer) {
  const startedAt = Date.now();

  function updateSessionTimer() {
    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
    const seconds = String(elapsedSeconds % 60).padStart(2, "0");

    sessionTimer.textContent = `${minutes}:${seconds}`;
  }

  updateSessionTimer();
  window.setInterval(updateSessionTimer, 1000);
}

const revealTargets = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );

  revealTargets.forEach((target) => observer.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add("is-visible"));
}

function parsePostDate(post) {
  const time = Date.parse(post.date || "");
  return Number.isNaN(time) ? 0 : time;
}

function formatLogDate(date) {
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

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function firstImageFromHtml(html) {
  if (!html) {
    return "";
  }

  const body = new DOMParser().parseFromString(String(html), "text/html").body;
  return body.querySelector("img")?.getAttribute("src") || "";
}

function productPreviewImage(product) {
  return product.coverImage || product.screenshots?.[0] || firstImageFromHtml(product.content);
}

function renderProductPreview(product) {
  const imageUrl = productPreviewImage(product);

  if (!imageUrl) {
    return '<div class="product-card-media is-empty" aria-hidden="true">NO IMAGE</div>';
  }

  return `
    <figure class="product-card-media">
      <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(product.title)} preview" loading="lazy" decoding="async" referrerpolicy="no-referrer" />
    </figure>
  `;
}

async function renderHomePosts() {
  if (!homePosts) {
    return;
  }

  try {
    const copy = getCopy();
    const posts = await window.ReyContent.listPublishedPosts();
    const latestPosts = posts.slice(0, 3);

    const rows = latestPosts
      .map(
        (post) => `
          <a href="./post.html?id=${encodeURIComponent(post.id)}" class="log-row">
            <span class="log-date">${escapeHtml(formatLogDate(post.date))}</span>
            <span class="log-main">
              <strong>${escapeHtml(post.title)}</strong>
              <em>${escapeHtml(post.excerpt || "No excerpt yet.")}</em>
            </span>
            <span class="log-status">${escapeHtml(copy.read)}</span>
          </a>
        `,
      )
      .join("");

    homePosts.innerHTML = `
      ${rows}
      <a class="view-more-link" href="./blog.html">
        <span>${escapeHtml(copy.viewMore)}</span>
        <strong>${escapeHtml(posts.length ? `ALL ${posts.length} POSTS` : copy.allPosts)}</strong>
      </a>
    `;
  } catch {
    homePosts.innerHTML = '<p class="inline-status">[POSTS UNAVAILABLE]</p>';
  }
}

async function renderHomeProducts() {
  if (!homeProducts) {
    return;
  }

  try {
    const copy = getCopy();
    const products = await window.ReyContent.listPublishedProducts();
    const featuredProducts = products.slice(0, 3);

    if (!products.length) {
      homeProducts.innerHTML = '<p class="inline-status">[NO PUBLISHED PRODUCTS]</p>';
      return;
    }

    const rows = featuredProducts
      .map(
        (product, index) => `
          <a class="product-card${index === 0 ? " featured" : ""}" href="./product.html?id=${encodeURIComponent(product.id)}">
            <div class="card-index">${String(index + 1).padStart(2, "0")}</div>
            ${renderProductPreview(product)}
            <p class="card-label">${escapeHtml(product.ctaLabel || "PRODUCT / BUILD")}</p>
            <h3>${escapeHtml(product.title)}</h3>
            <p>${escapeHtml(product.excerpt || "No product description yet.")}</p>
            <div class="card-footer">
              <span>${escapeHtml(product.date || "NO DATE")}</span>
              <strong>${escapeHtml(copy.inspect)}</strong>
            </div>
          </a>
        `,
      )
      .join("");

    homeProducts.innerHTML = `
      ${rows}
      <a class="view-more-link product-view-more" href="./products.html">
        <span>${escapeHtml(copy.viewMore)}</span>
        <strong>${escapeHtml(products.length ? `ALL ${products.length} PRODUCTS` : copy.allProducts)}</strong>
      </a>
    `;
  } catch {
    homeProducts.innerHTML = '<p class="inline-status">[PRODUCTS UNAVAILABLE]</p>';
  }
}

renderHomePosts();
renderHomeProducts();
window.addEventListener("rey-language-change", renderHomePosts);
window.addEventListener("rey-language-change", renderHomeProducts);
