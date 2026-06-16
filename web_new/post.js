const postRoot = document.querySelector("[data-post-root]");

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sanitizeArticleHtml(html) {
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

function getPostId() {
  return new URLSearchParams(window.location.search).get("id");
}

function renderReadingTicks(count = 34) {
  return Array.from({ length: count }, (_, index) => {
    const isMajor = index === 0 || index === count - 1 || index % 5 === 0;
    return `<span class="reading-tick${isMajor ? " is-major" : ""}"></span>`;
  }).join("");
}

function renderReadingRuler() {
  document.querySelector("[data-reading-ruler]")?.remove();

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <aside class="reading-ruler" data-reading-ruler aria-hidden="true">
        <div class="reading-ruler-rail"></div>
        <div class="reading-ruler-ticks">
          ${renderReadingTicks()}
        </div>
        <div class="reading-ruler-pointer" data-reading-pointer>
          <span class="reading-pointer-needle"></span>
          <span class="reading-pointer-line"></span>
        </div>
      </aside>
    `,
  );
}

function initReadingRuler() {
  const ruler = document.querySelector("[data-reading-ruler]");
  const pointer = document.querySelector("[data-reading-pointer]");

  if (!ruler || !pointer) {
    return;
  }

  function updateReadingRuler() {
    const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableDistance <= 0 ? 0 : window.scrollY / scrollableDistance;
    const rulerHeight = ruler.getBoundingClientRect().height;
    const pointerOffset = Math.max(0, Math.min(rulerHeight, progress * rulerHeight));

    pointer.style.transform = `translateY(${pointerOffset}px)`;
    ruler.style.setProperty("--reading-progress", progress.toFixed(3));
  }

  updateReadingRuler();
  window.addEventListener("scroll", updateReadingRuler, { passive: true });
  window.addEventListener("resize", updateReadingRuler);
}

function renderNotFound() {
  if (!postRoot) {
    return;
  }

  document.querySelector("[data-reading-ruler]")?.remove();

  postRoot.innerHTML = `
    <div class="post-not-found">
      <p class="eyebrow">/ ARTICLE ERROR</p>
      <h1>Post not found</h1>
      <a class="button secondary" href="./blog.html">BACK TO WRITING</a>
    </div>
  `;
}

function renderPost(post) {
  if (!postRoot) {
    return;
  }

  const articleHtml = sanitizeArticleHtml(post.content);

  document.title = `${post.title} | Guotao Tao`;

  renderReadingRuler();

  postRoot.innerHTML = `
    <header class="post-hero">
      <a class="back-link" href="./blog.html">← ALL WRITING</a>
      <div class="post-title-card">
        <div class="post-page-kicker">
          <span class="post-page-icon">RT</span>
          <span>/ MIGRATED ARTICLE</span>
        </div>
        <h1>${escapeHtml(post.title)}</h1>
      </div>
      <div class="post-meta">
        <span>${escapeHtml(formatFullDate(post.date))}</span>
        <span>${escapeHtml(post.excerpt || "No excerpt yet.")}</span>
      </div>
      ${post.url ? `<a class="source-link" href="${escapeHtml(post.url)}" target="_blank" rel="noreferrer">ORIGINAL SOURCE</a>` : ""}
    </header>
    <div class="article-content">
      ${articleHtml}
    </div>
  `;

  initReadingRuler();
}

async function loadPost() {
  try {
    const postId = getPostId();
    const post = await window.ReyContent.findPublishedPost(postId);

    if (!post) {
      renderNotFound();
      return;
    }

    renderPost(post);
  } catch {
    renderNotFound();
  }
}

loadPost();
