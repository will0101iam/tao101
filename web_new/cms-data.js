(function () {
  const config = window.REY_CMS_CONFIG || {};
  const hasRemote = Boolean(config.supabaseUrl && config.supabaseAnonKey);

  function remoteHeaders() {
    return {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${config.supabaseAnonKey}`,
    };
  }

  function parsePostDate(post) {
    const time = Date.parse(post.date || "");
    return Number.isNaN(time) ? 0 : time;
  }

  function sortByPublishedDate(items) {
    return [...items].sort((a, b) => parsePostDate(b) - parsePostDate(a));
  }

  function normalizeStringArray(value) {
    if (Array.isArray(value)) {
      return value.filter((entry) => typeof entry === "string" && entry.trim());
    }

    if (typeof value === "string" && value.trim()) {
      try {
        return normalizeStringArray(JSON.parse(value));
      } catch {
        return value
          .split("\n")
          .map((entry) => entry.trim())
          .filter(Boolean);
      }
    }

    return [];
  }

  function mapPost(row) {
    return {
      id: String(row.id ?? ""),
      slug: String(row.slug ?? ""),
      title: String(row.title ?? ""),
      excerpt: String(row.excerpt ?? ""),
      date: String(row.published_at ?? row.date ?? ""),
      coverImage: String(row.cover_image_url ?? row.coverImage ?? ""),
      content: String(row.content_html ?? row.content ?? ""),
      status: row.status || "published",
      authorName: String(row.author_name ?? row.authorName ?? "Guotao Tao"),
      url: String(row.source_url ?? row.url ?? ""),
      createdAt: String(row.created_at ?? row.createdAt ?? ""),
      updatedAt: String(row.updated_at ?? row.updatedAt ?? ""),
    };
  }

  function mapProduct(row) {
    return {
      id: String(row.id ?? ""),
      slug: String(row.slug ?? ""),
      title: String(row.title ?? ""),
      excerpt: String(row.excerpt ?? ""),
      date: String(row.published_at ?? row.date ?? ""),
      coverImage: String(row.cover_image_url ?? row.coverImage ?? row.image ?? ""),
      screenshots: normalizeStringArray(row.screenshots),
      content: String(row.content_html ?? row.content ?? ""),
      ctaLabel: String(row.cta_label ?? row.ctaLabel ?? ""),
      ctaUrl: String(row.cta_url ?? row.ctaUrl ?? ""),
      status: row.status || "published",
      createdAt: String(row.created_at ?? row.createdAt ?? ""),
      updatedAt: String(row.updated_at ?? row.updatedAt ?? ""),
    };
  }

  async function fetchJson(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status}`);
    }
    return response.json();
  }

  async function fetchRemote(table, query) {
    if (!hasRemote) {
      throw new Error("Supabase config is missing.");
    }

    const url = `${config.supabaseUrl}/rest/v1/${table}?${query}`;
    const response = await fetch(url, { headers: remoteHeaders() });

    if (!response.ok) {
      throw new Error(`Remote ${table} unavailable: ${response.status}`);
    }

    return response.json();
  }

  async function listPublishedPosts() {
    try {
      const rows = await fetchRemote(
        "posts",
        "select=*&status=eq.published&order=published_at.desc.nullslast,updated_at.desc",
      );
      return rows.map(mapPost);
    } catch {
      return sortByPublishedDate((await fetchJson("./data/posts.json")).map(mapPost));
    }
  }

  async function listPublishedProducts() {
    try {
      const rows = await fetchRemote(
        "products",
        "select=*&status=eq.published&order=published_at.desc.nullslast,updated_at.desc",
      );
      return rows.map(mapProduct);
    } catch (error) {
      if (hasRemote) {
        console.warn("[REY CMS] Remote products unavailable; refusing stale local fallback.", error);
        throw error;
      }

      return sortByPublishedDate((await fetchJson("./data/products.json")).map(mapProduct));
    }
  }

  async function findPublishedPost(idOrSlug) {
    if (!idOrSlug) {
      return undefined;
    }

    try {
      const encoded = encodeURIComponent(idOrSlug);
      const slugRows = await fetchRemote("posts", `select=*&status=eq.published&slug=eq.${encoded}&limit=1`);

      if (slugRows[0]) {
        return mapPost(slugRows[0]);
      }

      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)) {
        const idRows = await fetchRemote("posts", `select=*&status=eq.published&id=eq.${encoded}&limit=1`);
        return idRows[0] ? mapPost(idRows[0]) : undefined;
      }
    } catch {
      const posts = await listPublishedPosts();
      return posts.find((post) => String(post.id) === String(idOrSlug) || post.slug === idOrSlug);
    }

    const posts = await listPublishedPosts();
    return posts.find((post) => String(post.id) === String(idOrSlug) || post.slug === idOrSlug);
  }

  async function findPublishedProduct(idOrSlug) {
    if (!idOrSlug) {
      return undefined;
    }

    try {
      const encoded = encodeURIComponent(idOrSlug);
      const slugRows = await fetchRemote("products", `select=*&status=eq.published&slug=eq.${encoded}&limit=1`);

      if (slugRows[0]) {
        return mapProduct(slugRows[0]);
      }

      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug)) {
        const idRows = await fetchRemote("products", `select=*&status=eq.published&id=eq.${encoded}&limit=1`);
        return idRows[0] ? mapProduct(idRows[0]) : undefined;
      }
    } catch {
      const products = await listPublishedProducts();
      return products.find((product) => String(product.id) === String(idOrSlug) || product.slug === idOrSlug);
    }

    const products = await listPublishedProducts();
    return products.find((product) => String(product.id) === String(idOrSlug) || product.slug === idOrSlug);
  }

  window.ReyContent = {
    hasRemote,
    mapPost,
    mapProduct,
    listPublishedPosts,
    listPublishedProducts,
    findPublishedPost,
    findPublishedProduct,
    sortByPublishedDate,
  };
})();
