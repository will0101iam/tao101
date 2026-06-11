import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Post from "@/pages/Post";
import { CMS_POSTS_KEY, saveSiteSettings } from "@/lib/cms";
import type { CmsPost } from "@/types/content";

describe("Post page", () => {
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

    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });

    const post: CmsPost = {
      id: "styled-post",
      slug: "styled-post",
      title: "Styled Post",
      excerpt: "Structured body",
      date: "May 14, 2026",
      coverImage: "https://example.com/cover.jpg",
      content:
        '<h2>Section Title</h2><h3>Subheading</h3><p style="text-align:center"><strong>Centered</strong> <u>statement</u> with <a href="https://example.com/resource">resource link</a>.</p><blockquote><p>Quoted text</p></blockquote><pre><code>const value = 1;</code></pre><ul><li>First bullet</li></ul><ol><li>First step</li></ol><p><img src="https://example.com/body.jpg" alt="Body image" /></p>',
      status: "published",
      authorName: "Guotao Tao",
      createdAt: "2026-05-14T00:00:00.000Z",
      updatedAt: "2026-05-14T00:00:00.000Z",
    };

    window.localStorage.setItem(CMS_POSTS_KEY, JSON.stringify([post]));
  });

  it("renders a published post from the content layer", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/post/styled-post"]}>
        <Routes>
          <Route path="/post/:id" element={<Post />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(html).toContain("Styled Post");
    expect(html).toContain("Guotao Tao");
    expect(html).toContain("May 14, 2026");
    expect(html).toContain("content-surface");
    expect(html).toContain("Section Title");
    expect(html).toContain("Quoted text");
    expect(html).toContain("First bullet");
    expect(html).toContain("text-align:center");
    expect(html).toContain("resource link");
    expect(html).toContain('href="https://example.com/resource"');
    expect(html).toContain("<u>statement</u>");
  });

  it("renders loading and not-found copy from site settings", async () => {
    await saveSiteSettings({
      heroEyebrow: "GUOTAO TAO",
      heroTitle: "Build.\nBreak.\nRepeat.",
      heroDescription: "Hero description",
      heroPrimaryCtaLabel: "Products",
      heroPrimaryCtaUrl: "#products",
      heroSecondaryCtaLabel: "Blog",
      heroSecondaryCtaUrl: "#blog",
      productsEyebrow: "THE PRODUCTS",
      productsTitle: "Products",
      productsDescription: "Products description",
      productsCardCtaLabel: "查看产品",
      productsEmptyState: "暂无产品",
      blogEyebrow: "THE BLOG",
      blogTitle: "Blog",
      blogDescription: "Blog description",
      blogLoadMoreLabel: "加载更多",
      blogCardCtaLabel: "阅读全文",
      blogEmptyState: "暂无文章",
      postLoadingLabel: "正在加载文章",
      postNotFoundTitle: "文章不存在",
      returnHomeLabel: "回到首页",
      productLoadingLabel: "正在加载产品",
      productNotFoundTitle: "产品不存在",
      productScreenshotsTitle: "产品截图",
      productScreenshotLabelPrefix: "截图",
      productPrimaryCtaFallbackLabel: "打开产品",
      aboutEyebrow: "ABOUT",
      aboutTitle: "About",
      aboutDescription: "About description",
      aboutAvatarUrl: "https://example.com/avatar.jpg",
      aboutIntroHeading: "Hey",
      aboutParagraphs: ["第一段"],
      aboutSocialLinks: [],
      footerLogoUrl: "https://example.com/logo.png",
      footerSlogan: "Footer slogan",
      footerDescription: "Footer description",
      footerRightCopy: "Footer right copy",
      footerCopyright: "© Rey",
      footerSocialLinks: [],
      adminPostsEmptyState: "请选择一篇文章或新建文章",
      adminProductsEmptyState: "请选择一个产品或新建产品",
      adminProductNoDateLabel: "未设置发布日期",
    });

    render(
      <MemoryRouter initialEntries={["/post/missing-post"]}>
        <Routes>
          <Route path="/post/:id" element={<Post />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("正在加载文章")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("文章不存在")).toBeTruthy();
    });

    expect(screen.getByText("回到首页")).toBeTruthy();
  });
});
