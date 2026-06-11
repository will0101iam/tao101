import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Product from "@/pages/Product";
import { CMS_PRODUCTS_KEY, saveSiteSettings } from "@/lib/cms";

describe("Product page", () => {
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
  });

  it("renders a published product from the content layer", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/product/zen-terminal"]}>
        <Routes>
          <Route path="/product/:id" element={<Product />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(html).toContain("Zen Terminal");
    expect(html).toContain("the command line, silenced.");
    expect(html).toContain("May 12, 2026");
    expect(html).toContain("Screenshot 1");
    expect(html).not.toContain("Access Repository");
  });

  it("renders product detail microcopy from site settings", async () => {
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
      productPrimaryCtaFallbackLabel: "立即打开",
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

    window.localStorage.setItem(
      CMS_PRODUCTS_KEY,
      JSON.stringify([
        {
          id: "product-detail-copy",
          slug: "product-detail-copy",
          title: "Product Detail Copy",
          excerpt: "product excerpt",
          date: "2026-05-20",
          coverImage: "https://example.com/product-cover.jpg",
          screenshots: ["https://example.com/screenshot-1.jpg"],
          content: "<p>Product content</p>",
          ctaLabel: "",
          ctaUrl: "https://example.com/product",
          status: "published",
          createdAt: "2026-05-20T00:00:00.000Z",
          updatedAt: "2026-05-20T00:00:00.000Z",
        },
      ]),
    );

    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/product/product-detail-copy"]}>
        <Routes>
          <Route path="/product/:id" element={<Product />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(html).toContain("产品截图");
    expect(html).toContain("截图 1");
    expect(html).toContain("立即打开");
  });

  it("renders product loading and not-found copy from site settings", async () => {
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
      productPrimaryCtaFallbackLabel: "立即打开",
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
      <MemoryRouter initialEntries={["/product/missing-product"]}>
        <Routes>
          <Route path="/product/:id" element={<Product />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("正在加载产品")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("产品不存在")).toBeTruthy();
    });

    expect(screen.getByText("回到首页")).toBeTruthy();
  });
});
