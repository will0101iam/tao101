import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsEditor from "@/pages/admin/SettingsEditor";
import { readSiteSettings, saveSiteSettings } from "@/lib/cms";

afterEach(() => {
  cleanup();
});

function mockStorage() {
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
}

describe("SettingsEditor", () => {
  it("renders the stored site settings in text-friendly fields", async () => {
    mockStorage();

    await saveSiteSettings({
      heroEyebrow: "CUSTOM",
      heroTitle: "Line 1\nLine 2",
      heroDescription: "Custom hero description.",
      heroPrimaryCtaLabel: "Primary CTA",
      heroPrimaryCtaUrl: "#primary",
      heroSecondaryCtaLabel: "Secondary CTA",
      heroSecondaryCtaUrl: "#secondary",
      productsEyebrow: "PRODUCTS",
      productsTitle: "Product Title",
      productsDescription: "Product description.",
      productsCardCtaLabel: "查看产品详情",
      productsEmptyState: "暂无产品",
      blogEyebrow: "BLOG",
      blogTitle: "Blog Title",
      blogDescription: "Blog description.",
      blogLoadMoreLabel: "查看更多",
      blogCardCtaLabel: "阅读全文",
      blogEmptyState: "暂无文章",
      aboutEyebrow: "ABOUT",
      aboutTitle: "About Title",
      aboutDescription: "About description.",
      aboutAvatarUrl: "https://example.com/avatar.jpg",
      aboutIntroHeading: "Hey, I'm Rey.",
      aboutParagraphs: ["第一段", "第二段"],
      aboutSocialLinks: [
        { label: "微信公众号", url: "https://mp.weixin.qq.com/example" },
        { label: "小红书", url: "https://www.xiaohongshu.com/user/example" },
      ],
      footerLogoUrl: "https://example.com/logo.png",
      footerSlogan: "Footer slogan",
      footerDescription: "Footer description.",
      footerRightCopy: "Footer right copy.",
      footerCopyright: "© Rey",
      footerSocialLinks: [{ label: "Twitter", url: "https://x.com/example" }],
    });

    render(<SettingsEditor onSaved={vi.fn()} />);

    expect((screen.getByLabelText("Hero Eyebrow") as HTMLInputElement).value).toBe("CUSTOM");
    expect((screen.getByLabelText("Hero Title") as HTMLTextAreaElement).value).toBe("Line 1\nLine 2");
    expect((screen.getByLabelText("Products Card CTA Label") as HTMLInputElement).value).toBe("查看产品详情");
    expect((screen.getByLabelText("Blog Empty State") as HTMLInputElement).value).toBe("暂无文章");
    expect((screen.getByLabelText("Post Loading Label") as HTMLInputElement).value).toBe("Loading post...");
    expect((screen.getByLabelText("Admin Product No Date Label") as HTMLInputElement).value).toBe("No publish date");
    expect((screen.getByLabelText("About Paragraphs") as HTMLTextAreaElement).value).toBe("第一段\n第二段");
    expect((screen.getByLabelText("About Social Links") as HTMLTextAreaElement).value).toBe(
      "微信公众号 | https://mp.weixin.qq.com/example\n小红书 | https://www.xiaohongshu.com/user/example",
    );
  });

  it("saves updated settings from text fields", async () => {
    mockStorage();
    const user = userEvent.setup();
    const onSaved = vi.fn();

    render(<SettingsEditor onSaved={onSaved} />);

    await user.clear(screen.getByLabelText("Hero Eyebrow"));
    await user.type(screen.getByLabelText("Hero Eyebrow"), "UPDATED");
    await user.clear(screen.getByLabelText("Products Card CTA Label"));
    await user.type(screen.getByLabelText("Products Card CTA Label"), "立即查看");
    await user.clear(screen.getByLabelText("Blog Empty State"));
    await user.type(screen.getByLabelText("Blog Empty State"), "这里暂时还没有文章");
    await user.clear(screen.getByLabelText("Product Screenshots Title"));
    await user.type(screen.getByLabelText("Product Screenshots Title"), "产品截图");
    await user.clear(screen.getByLabelText("Admin Product No Date Label"));
    await user.type(screen.getByLabelText("Admin Product No Date Label"), "未设置发布日期");
    await user.clear(screen.getByLabelText("About Paragraphs"));
    await user.type(screen.getByLabelText("About Paragraphs"), "新的第一段{enter}新的第二段");
    await user.clear(screen.getByLabelText("About Social Links"));
    await user.type(
      screen.getByLabelText("About Social Links"),
      "微信公众号 | https://mp.weixin.qq.com/new{enter}Twitter | https://x.com/new",
    );
    await user.clear(screen.getByLabelText("Footer Slogan"));
    await user.type(screen.getByLabelText("Footer Slogan"), "New footer slogan");
    await user.click(screen.getByRole("button", { name: "Save Settings" }));

    await waitFor(() => {
      expect(screen.getByText("Settings saved.")).toBeTruthy();
    });

    const stored = readSiteSettings();
    expect(stored.heroEyebrow).toBe("UPDATED");
    expect(stored.productsCardCtaLabel).toBe("立即查看");
    expect(stored.blogEmptyState).toBe("这里暂时还没有文章");
    expect(stored.productScreenshotsTitle).toBe("产品截图");
    expect(stored.adminProductNoDateLabel).toBe("未设置发布日期");
    expect(stored.aboutParagraphs).toEqual(["新的第一段", "新的第二段"]);
    expect(stored.aboutSocialLinks).toEqual([
      { label: "微信公众号", url: "https://mp.weixin.qq.com/new" },
      { label: "Twitter", url: "https://x.com/new" },
    ]);
    expect(stored.footerSlogan).toBe("New footer slogan");
    expect(onSaved).toHaveBeenCalled();
  });
});
