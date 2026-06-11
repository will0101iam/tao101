import { useEffect, useRef, useState } from "react";
import { getSiteSettingsInitial, saveSiteSettings } from "@/lib/cms";
import type { SiteSettings, SiteSettingsInput } from "@/types/content";

type SettingsFormState = {
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaUrl: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaUrl: string;
  productsEyebrow: string;
  productsTitle: string;
  productsDescription: string;
  productsCardCtaLabel: string;
  productsEmptyState: string;
  blogEyebrow: string;
  blogTitle: string;
  blogDescription: string;
  blogLoadMoreLabel: string;
  blogCardCtaLabel: string;
  blogEmptyState: string;
  postLoadingLabel: string;
  postNotFoundTitle: string;
  returnHomeLabel: string;
  productLoadingLabel: string;
  productNotFoundTitle: string;
  productScreenshotsTitle: string;
  productScreenshotLabelPrefix: string;
  productPrimaryCtaFallbackLabel: string;
  aboutEyebrow: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutAvatarUrl: string;
  aboutIntroHeading: string;
  aboutParagraphs: string;
  aboutSocialLinks: string;
  adminPostsEmptyState: string;
  adminProductsEmptyState: string;
  adminProductNoDateLabel: string;
  footerLogoUrl: string;
  footerSlogan: string;
  footerDescription: string;
  footerRightCopy: string;
  footerCopyright: string;
  footerSocialLinks: string;
};

function formatParagraphs(paragraphs: string[]) {
  return paragraphs.join("\n");
}

function parseParagraphs(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function formatLinks(links: SiteSettings["aboutSocialLinks"]) {
  return links.map((link) => `${link.label}${link.url ? ` | ${link.url}` : ""}`).join("\n");
}

function parseLinks(value: string) {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry) => {
      const [labelPart, ...urlParts] = entry.split("|");
      const label = labelPart?.trim() ?? "";
      const url = urlParts.join("|").trim();
      return label ? [{ label, url }] : [];
    });
}

function toFormState(settings: SiteSettings): SettingsFormState {
  return {
    heroEyebrow: settings.heroEyebrow,
    heroTitle: settings.heroTitle,
    heroDescription: settings.heroDescription,
    heroPrimaryCtaLabel: settings.heroPrimaryCtaLabel,
    heroPrimaryCtaUrl: settings.heroPrimaryCtaUrl,
    heroSecondaryCtaLabel: settings.heroSecondaryCtaLabel,
    heroSecondaryCtaUrl: settings.heroSecondaryCtaUrl,
    productsEyebrow: settings.productsEyebrow,
    productsTitle: settings.productsTitle,
    productsDescription: settings.productsDescription,
    productsCardCtaLabel: settings.productsCardCtaLabel,
    productsEmptyState: settings.productsEmptyState,
    blogEyebrow: settings.blogEyebrow,
    blogTitle: settings.blogTitle,
    blogDescription: settings.blogDescription,
    blogLoadMoreLabel: settings.blogLoadMoreLabel,
    blogCardCtaLabel: settings.blogCardCtaLabel,
    blogEmptyState: settings.blogEmptyState,
    postLoadingLabel: settings.postLoadingLabel,
    postNotFoundTitle: settings.postNotFoundTitle,
    returnHomeLabel: settings.returnHomeLabel,
    productLoadingLabel: settings.productLoadingLabel,
    productNotFoundTitle: settings.productNotFoundTitle,
    productScreenshotsTitle: settings.productScreenshotsTitle,
    productScreenshotLabelPrefix: settings.productScreenshotLabelPrefix,
    productPrimaryCtaFallbackLabel: settings.productPrimaryCtaFallbackLabel,
    aboutEyebrow: settings.aboutEyebrow,
    aboutTitle: settings.aboutTitle,
    aboutDescription: settings.aboutDescription,
    aboutAvatarUrl: settings.aboutAvatarUrl,
    aboutIntroHeading: settings.aboutIntroHeading,
    aboutParagraphs: formatParagraphs(settings.aboutParagraphs),
    aboutSocialLinks: formatLinks(settings.aboutSocialLinks),
    adminPostsEmptyState: settings.adminPostsEmptyState,
    adminProductsEmptyState: settings.adminProductsEmptyState,
    adminProductNoDateLabel: settings.adminProductNoDateLabel,
    footerLogoUrl: settings.footerLogoUrl,
    footerSlogan: settings.footerSlogan,
    footerDescription: settings.footerDescription,
    footerRightCopy: settings.footerRightCopy,
    footerCopyright: settings.footerCopyright,
    footerSocialLinks: formatLinks(settings.footerSocialLinks),
  };
}

function toSiteSettingsInput(formState: SettingsFormState): SiteSettingsInput {
  return {
    heroEyebrow: formState.heroEyebrow,
    heroTitle: formState.heroTitle,
    heroDescription: formState.heroDescription,
    heroPrimaryCtaLabel: formState.heroPrimaryCtaLabel,
    heroPrimaryCtaUrl: formState.heroPrimaryCtaUrl,
    heroSecondaryCtaLabel: formState.heroSecondaryCtaLabel,
    heroSecondaryCtaUrl: formState.heroSecondaryCtaUrl,
    productsEyebrow: formState.productsEyebrow,
    productsTitle: formState.productsTitle,
    productsDescription: formState.productsDescription,
    productsCardCtaLabel: formState.productsCardCtaLabel,
    productsEmptyState: formState.productsEmptyState,
    blogEyebrow: formState.blogEyebrow,
    blogTitle: formState.blogTitle,
    blogDescription: formState.blogDescription,
    blogLoadMoreLabel: formState.blogLoadMoreLabel,
    blogCardCtaLabel: formState.blogCardCtaLabel,
    blogEmptyState: formState.blogEmptyState,
    postLoadingLabel: formState.postLoadingLabel,
    postNotFoundTitle: formState.postNotFoundTitle,
    returnHomeLabel: formState.returnHomeLabel,
    productLoadingLabel: formState.productLoadingLabel,
    productNotFoundTitle: formState.productNotFoundTitle,
    productScreenshotsTitle: formState.productScreenshotsTitle,
    productScreenshotLabelPrefix: formState.productScreenshotLabelPrefix,
    productPrimaryCtaFallbackLabel: formState.productPrimaryCtaFallbackLabel,
    aboutEyebrow: formState.aboutEyebrow,
    aboutTitle: formState.aboutTitle,
    aboutDescription: formState.aboutDescription,
    aboutAvatarUrl: formState.aboutAvatarUrl,
    aboutIntroHeading: formState.aboutIntroHeading,
    aboutParagraphs: parseParagraphs(formState.aboutParagraphs),
    aboutSocialLinks: parseLinks(formState.aboutSocialLinks),
    adminPostsEmptyState: formState.adminPostsEmptyState,
    adminProductsEmptyState: formState.adminProductsEmptyState,
    adminProductNoDateLabel: formState.adminProductNoDateLabel,
    footerLogoUrl: formState.footerLogoUrl,
    footerSlogan: formState.footerSlogan,
    footerDescription: formState.footerDescription,
    footerRightCopy: formState.footerRightCopy,
    footerCopyright: formState.footerCopyright,
    footerSocialLinks: parseLinks(formState.footerSocialLinks),
  };
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 border border-white/10 bg-[#050505] p-5">
      <div>
        <h2 className="font-['Poppins'] text-[20px] font-[800] text-white">{title}</h2>
        <p className="mt-2 text-sm text-white/45">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-white/70">{label}</span>
      {multiline ? (
        <textarea
          aria-label={label}
          className="min-h-[110px] w-full bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          aria-label={label}
          className="w-full bg-black border border-white/10 px-4 py-3 outline-none focus:border-white/30"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export default function SettingsEditor({
  settings,
  onSaved,
  onCancel,
}: {
  settings?: SiteSettings;
  onSaved: (settings: SiteSettings) => void;
  onCancel?: () => void;
}) {
  const initialSettings = settings ?? getSiteSettingsInitial();
  const [formState, setFormState] = useState<SettingsFormState>(() => toFormState(initialSettings));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const lastSavedSettingsKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const currentSettingsKey = settings ? `${settings.id}:${settings.updatedAt}` : null;
    setFormState(toFormState(settings ?? getSiteSettingsInitial()));
    setError("");

    if (currentSettingsKey !== lastSavedSettingsKeyRef.current) {
      setSuccessMessage("");
    }
  }, [settings]);

  function updateField<K extends keyof SettingsFormState>(key: K, value: SettingsFormState[K]) {
    setFormState((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const saved = await saveSiteSettings(toSiteSettingsInput(formState));
      lastSavedSettingsKeyRef.current = `${saved.id}:${saved.updatedAt}`;
      onSaved(saved);
      setSuccessMessage("Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <Section title="Hero" description="首页首屏标题、副标题和两个按钮都在这里维护。">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Hero Eyebrow" value={formState.heroEyebrow} onChange={(value) => updateField("heroEyebrow", value)} />
          <Field label="Hero Primary CTA Label" value={formState.heroPrimaryCtaLabel} onChange={(value) => updateField("heroPrimaryCtaLabel", value)} />
          <Field label="Hero Primary CTA URL" value={formState.heroPrimaryCtaUrl} onChange={(value) => updateField("heroPrimaryCtaUrl", value)} />
          <Field label="Hero Secondary CTA Label" value={formState.heroSecondaryCtaLabel} onChange={(value) => updateField("heroSecondaryCtaLabel", value)} />
          <Field label="Hero Secondary CTA URL" value={formState.heroSecondaryCtaUrl} onChange={(value) => updateField("heroSecondaryCtaUrl", value)} />
        </div>
        <Field label="Hero Title" multiline value={formState.heroTitle} onChange={(value) => updateField("heroTitle", value)} />
        <Field label="Hero Description" multiline value={formState.heroDescription} onChange={(value) => updateField("heroDescription", value)} />
      </Section>

      <Section title="Products" description="产品区块固定文案。">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Products Eyebrow" value={formState.productsEyebrow} onChange={(value) => updateField("productsEyebrow", value)} />
          <Field label="Products Title" value={formState.productsTitle} onChange={(value) => updateField("productsTitle", value)} />
          <Field label="Products Card CTA Label" value={formState.productsCardCtaLabel} onChange={(value) => updateField("productsCardCtaLabel", value)} />
          <Field label="Products Empty State" value={formState.productsEmptyState} onChange={(value) => updateField("productsEmptyState", value)} />
        </div>
        <Field label="Products Description" multiline value={formState.productsDescription} onChange={(value) => updateField("productsDescription", value)} />
      </Section>

      <Section title="Blog" description="博客区块固定文案和加载更多按钮。">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Blog Eyebrow" value={formState.blogEyebrow} onChange={(value) => updateField("blogEyebrow", value)} />
          <Field label="Blog Title" value={formState.blogTitle} onChange={(value) => updateField("blogTitle", value)} />
          <Field label="Blog Load More Label" value={formState.blogLoadMoreLabel} onChange={(value) => updateField("blogLoadMoreLabel", value)} />
          <Field label="Blog Card CTA Label" value={formState.blogCardCtaLabel} onChange={(value) => updateField("blogCardCtaLabel", value)} />
          <Field label="Blog Empty State" value={formState.blogEmptyState} onChange={(value) => updateField("blogEmptyState", value)} />
        </div>
        <Field label="Blog Description" multiline value={formState.blogDescription} onChange={(value) => updateField("blogDescription", value)} />
      </Section>

      <Section title="Detail Pages" description="文章详情、产品详情里的加载态、空态和截图文案。">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Post Loading Label" value={formState.postLoadingLabel} onChange={(value) => updateField("postLoadingLabel", value)} />
          <Field label="Post Not Found Title" value={formState.postNotFoundTitle} onChange={(value) => updateField("postNotFoundTitle", value)} />
          <Field label="Return Home Label" value={formState.returnHomeLabel} onChange={(value) => updateField("returnHomeLabel", value)} />
          <Field label="Product Loading Label" value={formState.productLoadingLabel} onChange={(value) => updateField("productLoadingLabel", value)} />
          <Field label="Product Not Found Title" value={formState.productNotFoundTitle} onChange={(value) => updateField("productNotFoundTitle", value)} />
          <Field label="Product Screenshots Title" value={formState.productScreenshotsTitle} onChange={(value) => updateField("productScreenshotsTitle", value)} />
          <Field label="Product Screenshot Label Prefix" value={formState.productScreenshotLabelPrefix} onChange={(value) => updateField("productScreenshotLabelPrefix", value)} />
          <Field label="Product Primary CTA Fallback Label" value={formState.productPrimaryCtaFallbackLabel} onChange={(value) => updateField("productPrimaryCtaFallbackLabel", value)} />
        </div>
      </Section>

      <Section title="About" description="段落一行一段；社媒链接一行一个，格式为 文案 | URL。">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="About Eyebrow" value={formState.aboutEyebrow} onChange={(value) => updateField("aboutEyebrow", value)} />
          <Field label="About Title" value={formState.aboutTitle} onChange={(value) => updateField("aboutTitle", value)} />
          <Field label="About Avatar URL" value={formState.aboutAvatarUrl} onChange={(value) => updateField("aboutAvatarUrl", value)} />
          <Field label="About Intro Heading" value={formState.aboutIntroHeading} onChange={(value) => updateField("aboutIntroHeading", value)} />
        </div>
        <Field label="About Description" multiline value={formState.aboutDescription} onChange={(value) => updateField("aboutDescription", value)} />
        <Field label="About Paragraphs" multiline value={formState.aboutParagraphs} onChange={(value) => updateField("aboutParagraphs", value)} />
        <Field label="About Social Links" multiline value={formState.aboutSocialLinks} onChange={(value) => updateField("aboutSocialLinks", value)} />
      </Section>

      <Section title="Admin" description="后台文章、产品列表里的空状态和日期占位文案。">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Admin Posts Empty State" value={formState.adminPostsEmptyState} onChange={(value) => updateField("adminPostsEmptyState", value)} />
          <Field label="Admin Products Empty State" value={formState.adminProductsEmptyState} onChange={(value) => updateField("adminProductsEmptyState", value)} />
          <Field label="Admin Product No Date Label" value={formState.adminProductNoDateLabel} onChange={(value) => updateField("adminProductNoDateLabel", value)} />
        </div>
      </Section>

      <Section title="Footer" description="页脚 logo、标语、描述和社媒链接。">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Footer Logo URL" value={formState.footerLogoUrl} onChange={(value) => updateField("footerLogoUrl", value)} />
          <Field label="Footer Slogan" value={formState.footerSlogan} onChange={(value) => updateField("footerSlogan", value)} />
          <Field label="Footer Right Copy" value={formState.footerRightCopy} onChange={(value) => updateField("footerRightCopy", value)} />
          <Field label="Footer Copyright" value={formState.footerCopyright} onChange={(value) => updateField("footerCopyright", value)} />
        </div>
        <Field label="Footer Description" multiline value={formState.footerDescription} onChange={(value) => updateField("footerDescription", value)} />
        <Field label="Footer Social Links" multiline value={formState.footerSocialLinks} onChange={(value) => updateField("footerSocialLinks", value)} />
      </Section>

      {successMessage ? <p className="text-sm text-[#d8c07d]">{successMessage}</p> : null}
      {error ? <p className="text-sm text-[#ff9d9d]">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={saving} className="bg-[#efefef] px-5 py-3 font-['Poppins'] font-[700] text-black transition-colors hover:bg-[#e0c787] disabled:opacity-60">
          {saving ? "Saving…" : "Save Settings"}
        </button>
        {onCancel ? (
          <button type="button" className="border border-white/10 px-5 py-3 text-white/70 transition-colors hover:border-white/30 hover:text-white" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
