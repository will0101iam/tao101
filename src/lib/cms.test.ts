import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CMS_POSTS_KEY,
  CMS_PRODUCTS_KEY,
  getHistoricalSeedPostCoverBySlug,
  getAdminPosts,
  getPublishedPostsSnapshot,
  savePost,
  saveProduct,
  getAdminProducts,
  slugify,
} from "@/lib/cms";

describe("cms local mode", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_ANON_KEY", "");

    const storage = (() => {
      const values = new Map<string, string>();
      return {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
      };
    })();

    Object.defineProperty(window, "localStorage", {
      value: storage,
      writable: true,
      configurable: true,
    });

    window.localStorage.removeItem(CMS_POSTS_KEY);
    window.localStorage.removeItem(CMS_PRODUCTS_KEY);
  });

  it("falls back to seeded published posts", async () => {
    const posts = getPublishedPostsSnapshot();

    expect(posts.length).toBeGreaterThan(0);
    expect(posts[0]?.status).toBe("published");
    expect(posts[0]?.coverImage).toBe("");
  });

  it("exposes historical seeded covers for migration without changing seed snapshots", () => {
    expect(getHistoricalSeedPostCoverBySlug(slugify("Build一个Claude Code-01：CircleLoop"))).toBe(
      "https://thedankoe.com/wp-content/uploads/2025/08/featured-768x432.jpg",
    );

    const posts = getPublishedPostsSnapshot();
    expect(posts[0]?.coverImage).toBe("");
  });

  it("clears untouched auto-generated covers from older local data", () => {
    window.localStorage.setItem(
      CMS_POSTS_KEY,
      JSON.stringify([
        {
          id: "placeholder-cover",
          slug: "placeholder-cover",
          title: "Placeholder Cover",
          excerpt: "summary",
          date: "2026-05-02",
          coverImage: "https://mmbiz.qpic.cn/mmbiz_jpg/example-valid/640?wx_fmt=jpeg&from=appmsg",
          content:
            '<p>Intro</p><p><img src="https://mmbiz.qpic.cn/mmbiz_jpg/example-valid/640?wx_fmt=jpeg&from=appmsg" /></p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/example-second/640?wx_fmt=png&from=appmsg" /></p>',
          status: "published",
          authorName: "Guotao Tao",
          createdAt: "2026-05-02T00:00:00.000Z",
          updatedAt: "2026-05-02T00:00:00.000Z",
        },
      ]),
    );

    const [post] = getAdminPosts();

    expect(post?.coverImage).toBe("");
  });

  it("clears a legacy cover when the body has no valid cover candidate", () => {
    window.localStorage.setItem(
      CMS_POSTS_KEY,
      JSON.stringify([
        {
          id: "invalid-cover-only",
          slug: "invalid-cover-only",
          title: "Invalid Cover Only",
          excerpt: "summary",
          date: "2026-05-02",
          coverImage: "https://thedankoe.com/wp-content/uploads/2025/07/featured-niche-768x432.jpg",
          content:
            '<p>Intro</p><p><img src="https://mmbiz.qpic.cn/sz_mmbiz_png/example/640?wx_fmt=png&from=appmsg" /></p>',
          status: "published",
          authorName: "Guotao Tao",
          createdAt: "2026-05-02T00:00:00.000Z",
          updatedAt: "2026-05-02T00:00:00.000Z",
        },
      ]),
    );

    const [post] = getAdminPosts();

    expect(post?.coverImage).toBe("");
  });

  it("preserves an explicitly selected article cover", () => {
    window.localStorage.setItem(
      CMS_POSTS_KEY,
      JSON.stringify([
        {
          id: "explicit-article-cover",
          slug: "explicit-article-cover",
          title: "Explicit Article Cover",
          excerpt: "summary",
          date: "2026-05-02",
          coverImage: "https://mmbiz.qpic.cn/mmbiz_png/example-second/640?wx_fmt=png&from=appmsg",
          coverSource: "article",
          content:
            '<p>Intro</p><p><img src="https://mmbiz.qpic.cn/mmbiz_jpg/example-valid/640?wx_fmt=jpeg&from=appmsg" /></p><p><img src="https://mmbiz.qpic.cn/mmbiz_png/example-second/640?wx_fmt=png&from=appmsg" /></p>',
          status: "published",
          authorName: "Guotao Tao",
          createdAt: "2026-05-02T00:00:00.000Z",
          updatedAt: "2026-05-03T00:00:00.000Z",
        },
      ]),
    );

    const [post] = getAdminPosts();

    expect(post?.coverImage).toBe("https://mmbiz.qpic.cn/mmbiz_png/example-second/640?wx_fmt=png&from=appmsg");
  });

  it("persists saved posts and products", async () => {
    await savePost({
      title: "A New Post",
      excerpt: "short",
      date: "May 25, 2026",
      coverImage: "https://example.com/cover.jpg",
      content: "<p>Hello</p>",
      status: "draft",
    });

    await saveProduct({
      title: "A New Product",
      excerpt: "ship faster",
      date: "2026-05-25",
      coverImage: "https://example.com/tool.jpg",
      screenshots: ["https://example.com/shot-1.jpg", "https://example.com/shot-2.jpg"],
      content: "<p>Tool body</p>",
      ctaLabel: "",
      ctaUrl: "",
      status: "published",
    });

    expect(getAdminPosts().some((post) => post.title === "A New Post")).toBe(true);
    const savedProduct = getAdminProducts().find((product) => product.title === "A New Product");
    expect(savedProduct).toBeTruthy();
    expect(savedProduct?.date).toBe("2026-05-25");
    expect(savedProduct?.screenshots).toEqual(["https://example.com/shot-1.jpg", "https://example.com/shot-2.jpg"]);
    expect(savedProduct?.ctaLabel).toBe("");
    expect(savedProduct?.ctaUrl).toBe("");
  });

  it("sorts admin posts and products by publish date descending before updated time fallback", () => {
    window.localStorage.setItem(
      CMS_POSTS_KEY,
      JSON.stringify([
        {
          id: "post-a",
          slug: "post-a",
          title: "Older Publish Date",
          excerpt: "older",
          date: "2026-05-01",
          coverImage: "",
          content: "<p>a</p>",
          status: "published",
          authorName: "Guotao Tao",
          createdAt: "2026-05-01T00:00:00.000Z",
          updatedAt: "2026-05-20T00:00:00.000Z",
        },
        {
          id: "post-b",
          slug: "post-b",
          title: "Newest Publish Date",
          excerpt: "newest",
          date: "2026-05-18",
          coverImage: "",
          content: "<p>b</p>",
          status: "published",
          authorName: "Guotao Tao",
          createdAt: "2026-05-18T00:00:00.000Z",
          updatedAt: "2026-05-18T00:00:00.000Z",
        },
        {
          id: "post-c",
          slug: "post-c",
          title: "Fallback Updated Time",
          excerpt: "fallback",
          date: "",
          coverImage: "",
          content: "<p>c</p>",
          status: "draft",
          authorName: "Guotao Tao",
          createdAt: "2026-05-10T00:00:00.000Z",
          updatedAt: "2026-05-10T00:00:00.000Z",
        },
      ]),
    );

    window.localStorage.setItem(
      CMS_PRODUCTS_KEY,
      JSON.stringify([
        {
          id: "product-a",
          slug: "product-a",
          title: "Older Product",
          excerpt: "older",
          date: "2026-05-03",
          coverImage: "",
          screenshots: [],
          content: "<p>a</p>",
          ctaLabel: "",
          ctaUrl: "",
          status: "published",
          createdAt: "2026-05-03T00:00:00.000Z",
          updatedAt: "2026-05-21T00:00:00.000Z",
        },
        {
          id: "product-b",
          slug: "product-b",
          title: "Newest Product",
          excerpt: "newest",
          date: "2026-05-17",
          coverImage: "",
          screenshots: [],
          content: "<p>b</p>",
          ctaLabel: "",
          ctaUrl: "",
          status: "published",
          createdAt: "2026-05-17T00:00:00.000Z",
          updatedAt: "2026-05-17T00:00:00.000Z",
        },
        {
          id: "product-c",
          slug: "product-c",
          title: "Undated Product",
          excerpt: "fallback",
          date: "",
          coverImage: "",
          screenshots: [],
          content: "<p>c</p>",
          ctaLabel: "",
          ctaUrl: "",
          status: "draft",
          createdAt: "2026-05-09T00:00:00.000Z",
          updatedAt: "2026-05-09T00:00:00.000Z",
        },
      ]),
    );

    expect(getAdminPosts().map((post) => post.title)).toEqual([
      "Newest Publish Date",
      "Fallback Updated Time",
      "Older Publish Date",
    ]);

    expect(getAdminProducts().map((product) => product.title)).toEqual([
      "Newest Product",
      "Undated Product",
      "Older Product",
    ]);
  });
});
