const postList = document.querySelector("[data-post-list]");
const postCount = document.querySelector("[data-post-count]");
const postSearch = document.querySelector("[data-post-search]");
const archiveCopy = {
  en: {
    read: "READ",
    noMatch: "[NO MATCHING POSTS]",
  },
  zh: {
    read: "阅读",
    noMatch: "[没有匹配文章]",
  },
};

let archivePosts = [];

function getArchiveCopy() {
  return archiveCopy[document.documentElement.dataset.language] || archiveCopy.en;
}

function parsePostDate(post) {
  const time = Date.parse(post.date || "");
  return Number.isNaN(time) ? 0 : time;
}

function sortPosts(posts) {
  return [...posts].sort((a, b) => parsePostDate(b) - parsePostDate(a));
}

function formatArchiveDate(date) {
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

function postUrl(post) {
  return `./post.html?id=${encodeURIComponent(post.id)}`;
}

function renderPosts(posts) {
  if (postCount) {
    postCount.textContent = String(posts.length).padStart(2, "0");
  }

  if (!postList) {
    return;
  }

  const copy = getArchiveCopy();

  if (!posts.length) {
    postList.innerHTML = `<p class="inline-status">${copy.noMatch}</p>`;
    return;
  }

  postList.innerHTML = posts
    .map(
      (post, index) => `
        <a class="archive-row" href="${postUrl(post)}">
          <span class="archive-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="archive-date">${escapeHtml(formatArchiveDate(post.date))}</span>
          <span class="archive-main">
            <strong>${escapeHtml(post.title)}</strong>
            <em>${escapeHtml(post.excerpt || "No excerpt yet.")}</em>
          </span>
          <span class="archive-action">${escapeHtml(copy.read)}</span>
        </a>
      `,
    )
    .join("");
}

async function loadArchive() {
  try {
    archivePosts = sortPosts(await window.ReyContent.listPublishedPosts());
    renderPosts(archivePosts);

    postSearch?.addEventListener("input", () => {
      const query = postSearch.value.trim().toLowerCase();
      const filtered = query
        ? archivePosts.filter((post) =>
            [post.title, post.excerpt, post.date].some((value) => String(value ?? "").toLowerCase().includes(query)),
          )
        : archivePosts;

      renderPosts(filtered);
    });
  } catch (error) {
    if (postList) {
      postList.innerHTML = `<p class="inline-status">[ERROR: ${escapeHtml(error.message)}]</p>`;
    }
  }
}

loadArchive();
window.addEventListener("rey-language-change", () => {
  if (archivePosts.length) {
    const query = postSearch?.value.trim().toLowerCase();
    const filtered = query
      ? archivePosts.filter((post) =>
          [post.title, post.excerpt, post.date].some((value) => String(value ?? "").toLowerCase().includes(query)),
        )
      : archivePosts;

    renderPosts(filtered);
  }
});
