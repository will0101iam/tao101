import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Home from "@/pages/Home";
import { saveSiteSettings } from "@/lib/cms";

describe("Home page", () => {
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
  });

  it("renders about links and footer copy from site settings", async () => {
    await saveSiteSettings({
      heroEyebrow: "GUOTAO TAO",
      heroTitle: "Build.\nBreak.\nRepeat.",
      heroDescription: "Exploring the intersection of AI, product design, and continuous learning.",
      heroPrimaryCtaLabel: "Explore My Products",
      heroPrimaryCtaUrl: "#products",
      heroSecondaryCtaLabel: "Read My Writings",
      heroSecondaryCtaUrl: "#blog",
      productsEyebrow: "THE PRODUCTS",
      productsTitle: "Manifesting Necessity",
      productsDescription: "Vibe coding experiments, AI agents, and tools built to serve me.",
      productsCardCtaLabel: "查看产品详情",
      productsEmptyState: "暂时还没有已发布产品",
      blogEyebrow: "THE BLOGS",
      blogTitle: "Explore Your Curiosity",
      blogDescription: "Deep dives on human potential, lifestyle design, & digital business.",
      blogLoadMoreLabel: "加载更多",
      blogCardCtaLabel: "阅读全文",
      blogEmptyState: "暂时还没有已发布文章",
      aboutEyebrow: "ABOUT ME",
      aboutTitle: "Who Is Guotao Tao?",
      aboutDescription: "Just a human obsessed with humans.",
      aboutAvatarUrl: "https://example.com/avatar.jpg",
      aboutIntroHeading: "Hey, I'm Guotao Tao.",
      aboutParagraphs: ["第一段自定义文案", "第二段自定义文案"],
      aboutSocialLinks: [
        { label: "微信公众号", url: "https://mp.weixin.qq.com/example" },
        { label: "小红书", url: "https://www.xiaohongshu.com/user/example" },
        { label: "Twitter", url: "https://x.com/example" },
      ],
      footerLogoUrl: "https://example.com/logo.png",
      footerSlogan: "自定义页脚标语",
      footerDescription: "这是自定义页脚介绍。",
      footerRightCopy: "这是右侧自定义文案。",
      footerCopyright: "© Rey Tao",
      footerSocialLinks: [
        { label: "微信公众号", url: "https://mp.weixin.qq.com/example" },
        { label: "小红书", url: "https://www.xiaohongshu.com/user/example" },
      ],
    });

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(html).toContain("第一段自定义文案");
    expect(html).toContain("微信公众号");
    expect(html).toContain("小红书");
    expect(html).toContain("自定义页脚标语");
    expect(html).toContain("这是右侧自定义文案。");
    expect(html).toContain("© Rey Tao");
    expect(html).toContain("查看产品详情");
    expect(html).toContain("阅读全文");
  });
});
