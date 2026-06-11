import { BLOG_POSTS, PRODUCTS, SITE_SETTINGS } from "@/data";
import { getSupabaseBrowserClient, isSupabaseEnabled } from "@/lib/supabase";
import type {
  AdminSession,
  CmsPost,
  CmsProduct,
  PostInput,
  ProductInput,
  SiteLink,
  SiteSettings,
  SiteSettingsInput,
} from "@/types/content";

export const CMS_POSTS_KEY = "cms-posts";
export const CMS_PRODUCTS_KEY = "cms-products";
export const CMS_SITE_SETTINGS_KEY = "cms-site-settings";
export const CMS_ADMIN_SESSION_KEY = "cms-admin-session";

const DEFAULT_AUTHOR_NAME = "Guotao Tao";
const LEGACY_COVER_MARKER = "thedankoe.com/wp-content/uploads";
const WECHAT_PLACEHOLDER_MARKER = "mmbiz.qpic.cn/sz_mmbiz_";
const DEFAULT_SITE_SETTINGS_ID = "default";

function nowIso() {
  return new Date().toISOString();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9一-龥\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function extractImageSrcs(content: string) {
  return Array.from(content.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)).map((match) => match[1]?.replace(/&amp;/g, "&") ?? "");
}

function parseStringArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
  }

  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      return parseStringArray(parsed);
    } catch {
      return [];
    }
  }

  return [];
}

function parseSiteLinks(value: unknown): SiteLink[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry || typeof entry !== "object") {
          return null;
        }

        const label = "label" in entry ? String(entry.label ?? "").trim() : "";
        const url = "url" in entry ? String(entry.url ?? "").trim() : "";
        if (!label) {
          return null;
        }

        return { label, url };
      })
      .filter((entry): entry is SiteLink => entry !== null);
  }

  if (typeof value === "string" && value.trim()) {
    try {
      return parseSiteLinks(JSON.parse(value) as unknown);
    } catch {
      return [];
    }
  }

  return [];
}

function toComparableTime(value: string | undefined) {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return Number.NEGATIVE_INFINITY;
  }

  return parsed.getTime();
}

function compareAdminContentByRecency<T extends { date: string; updatedAt: string; createdAt: string; title: string }>(a: T, b: T) {
  const recencyDiff = toComparableTime(b.date || b.updatedAt) - toComparableTime(a.date || a.updatedAt);
  if (recencyDiff !== 0) {
    return recencyDiff;
  }

  const updatedDiff = toComparableTime(b.updatedAt) - toComparableTime(a.updatedAt);
  if (updatedDiff !== 0) {
    return updatedDiff;
  }

  const createdDiff = toComparableTime(b.createdAt) - toComparableTime(a.createdAt);
  if (createdDiff !== 0) {
    return createdDiff;
  }

  return a.title.localeCompare(b.title);
}

function isLegacyCoverImage(value: string) {
  return value.includes(LEGACY_COVER_MARKER);
}

function isWechatPlaceholderCoverImage(value: string) {
  return value.includes(WECHAT_PLACEHOLDER_MARKER);
}

function isUnsuitableAutoCoverImage(value: string) {
  if (!value) {
    return true;
  }

  return isLegacyCoverImage(value) || isWechatPlaceholderCoverImage(value);
}

function isUntouchedSeedPost(post: CmsPost) {
  return post.createdAt === post.updatedAt;
}

function migratePostCoverImage(post: CmsPost) {
  if (!post.coverImage) {
    return post;
  }

  if (post.coverSource) {
    return post;
  }

  if (isUnsuitableAutoCoverImage(post.coverImage)) {
    return {
      ...post,
      coverImage: "",
    };
  }

  const bodyImages = extractImageSrcs(post.content);
  if (isUntouchedSeedPost(post) && bodyImages.includes(post.coverImage)) {
    return {
      ...post,
      coverImage: "",
    };
  }

  return post;
}

function toStoredPost(row: Record<string, unknown>): CmsPost {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    date: String(row.date ?? row.published_at ?? ""),
    coverImage: String(row.coverImage ?? row.cover_image_url ?? ""),
    coverSource: row.coverSource === "upload" || row.coverSource === "article" ? row.coverSource : undefined,
    content: String(row.content ?? row.content_html ?? ""),
    status: (row.status as CmsPost["status"]) ?? "draft",
    authorName: String(row.authorName ?? row.author_name ?? DEFAULT_AUTHOR_NAME),
    createdAt: String(row.createdAt ?? row.created_at ?? ""),
    updatedAt: String(row.updatedAt ?? row.updated_at ?? ""),
  };
}

function resolveStoredPosts(posts: Record<string, unknown>[]) {
  return posts.map((post) => migratePostCoverImage(toStoredPost(post)));
}

function makeSeedPosts(): CmsPost[] {
  const stamp = nowIso();
  return BLOG_POSTS.map((post, index) => ({
    id: String(post.id ?? `post-${index + 1}`),
    slug: slugify(post.title),
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    coverImage: "",
    content: post.content,
    status: "published",
    authorName: DEFAULT_AUTHOR_NAME,
    createdAt: stamp,
    updatedAt: stamp,
  }));
}

const historicalSeedPostCoverLookup = new Map(
  BLOG_POSTS.map((post) => [slugify(post.title), post.image?.trim() ?? ""] as const).filter((entry) => entry[1]),
);

export function getHistoricalSeedPostCoverBySlug(slug: string) {
  return historicalSeedPostCoverLookup.get(slug) ?? "";
}

function makeSeedProducts(): CmsProduct[] {
  const stamp = nowIso();
  return PRODUCTS.map((product) => ({
    id: String(product.id),
    slug: slugify(product.title),
    title: product.title,
    excerpt: product.excerpt,
    date: product.date,
    coverImage: product.image,
    screenshots: product.screenshots ?? [],
    content: product.content,
    ctaLabel: product.ctaLabel ?? "",
    ctaUrl: product.ctaUrl ?? "",
    status: "published",
    createdAt: stamp,
    updatedAt: stamp,
  }));
}

function makeSeedSiteSettings(): SiteSettings {
  const stamp = nowIso();
  return {
    id: DEFAULT_SITE_SETTINGS_ID,
    ...SITE_SETTINGS,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

function readCollection<T>(key: string, fallback: () => T[]): T[] {
  if (!canUseStorage()) {
    return fallback();
  }

  const raw = localStorage.getItem(key);
  if (!raw) {
    const seed = fallback();
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(raw) as T[];
  } catch {
    const seed = fallback();
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
}

function readSingleton<T>(key: string, fallback: () => T): T {
  if (!canUseStorage()) {
    return fallback();
  }

  const raw = localStorage.getItem(key);
  if (!raw) {
    const seed = fallback();
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    const seed = fallback();
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
}

function readPostCollection() {
  const posts = readCollection<Record<string, unknown>>(CMS_POSTS_KEY, makeSeedPosts);
  const migrated = resolveStoredPosts(posts);

  if (canUseStorage() && JSON.stringify(posts) !== JSON.stringify(migrated)) {
    writeCollection(CMS_POSTS_KEY, migrated);
  }

  return migrated;
}

function toStoredProduct(row: Record<string, unknown>): CmsProduct {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    date: String(row.date ?? row.published_at ?? ""),
    coverImage: String(row.coverImage ?? row.cover_image_url ?? ""),
    screenshots: parseStringArray(row.screenshots),
    content: String(row.content ?? row.content_html ?? ""),
    ctaLabel: String(row.ctaLabel ?? row.cta_label ?? ""),
    ctaUrl: String(row.ctaUrl ?? row.cta_url ?? ""),
    status: (row.status as CmsProduct["status"]) ?? "draft",
    createdAt: String(row.createdAt ?? row.created_at ?? ""),
    updatedAt: String(row.updatedAt ?? row.updated_at ?? ""),
  };
}

function readProductCollection() {
  const products = readCollection<Record<string, unknown>>(CMS_PRODUCTS_KEY, makeSeedProducts);
  const migrated = products.map((product) => toStoredProduct(product));

  if (canUseStorage() && JSON.stringify(products) !== JSON.stringify(migrated)) {
    writeCollection(CMS_PRODUCTS_KEY, migrated);
  }

  return migrated;
}

function toStoredSiteSettings(row: Record<string, unknown>): SiteSettings {
  return {
    id: String(row.id ?? DEFAULT_SITE_SETTINGS_ID),
    heroEyebrow: String(row.heroEyebrow ?? row.hero_eyebrow ?? ""),
    heroTitle: String(row.heroTitle ?? row.hero_title ?? ""),
    heroDescription: String(row.heroDescription ?? row.hero_description ?? ""),
    heroPrimaryCtaLabel: String(row.heroPrimaryCtaLabel ?? row.hero_primary_cta_label ?? ""),
    heroPrimaryCtaUrl: String(row.heroPrimaryCtaUrl ?? row.hero_primary_cta_url ?? ""),
    heroSecondaryCtaLabel: String(row.heroSecondaryCtaLabel ?? row.hero_secondary_cta_label ?? ""),
    heroSecondaryCtaUrl: String(row.heroSecondaryCtaUrl ?? row.hero_secondary_cta_url ?? ""),
    productsEyebrow: String(row.productsEyebrow ?? row.products_eyebrow ?? ""),
    productsTitle: String(row.productsTitle ?? row.products_title ?? ""),
    productsDescription: String(row.productsDescription ?? row.products_description ?? ""),
    productsCardCtaLabel: String(row.productsCardCtaLabel ?? row.products_card_cta_label ?? "Explore Tool"),
    productsEmptyState: String(row.productsEmptyState ?? row.products_empty_state ?? "No published products yet."),
    blogEyebrow: String(row.blogEyebrow ?? row.blog_eyebrow ?? ""),
    blogTitle: String(row.blogTitle ?? row.blog_title ?? ""),
    blogDescription: String(row.blogDescription ?? row.blog_description ?? ""),
    blogLoadMoreLabel: String(row.blogLoadMoreLabel ?? row.blog_load_more_label ?? "Load More"),
    blogCardCtaLabel: String(row.blogCardCtaLabel ?? row.blog_card_cta_label ?? "Read Full Post"),
    blogEmptyState: String(row.blogEmptyState ?? row.blog_empty_state ?? "No published posts yet."),
    postLoadingLabel: String(row.postLoadingLabel ?? row.post_loading_label ?? "Loading post..."),
    postNotFoundTitle: String(row.postNotFoundTitle ?? row.post_not_found_title ?? "Post not found"),
    returnHomeLabel: String(row.returnHomeLabel ?? row.return_home_label ?? "Return to home"),
    productLoadingLabel: String(row.productLoadingLabel ?? row.product_loading_label ?? "Loading product..."),
    productNotFoundTitle: String(row.productNotFoundTitle ?? row.product_not_found_title ?? "Product not found"),
    productScreenshotsTitle: String(row.productScreenshotsTitle ?? row.product_screenshots_title ?? "Screenshots"),
    productScreenshotLabelPrefix: String(row.productScreenshotLabelPrefix ?? row.product_screenshot_label_prefix ?? "Screenshot"),
    productPrimaryCtaFallbackLabel: String(row.productPrimaryCtaFallbackLabel ?? row.product_primary_cta_fallback_label ?? "Open Product"),
    aboutEyebrow: String(row.aboutEyebrow ?? row.about_eyebrow ?? ""),
    aboutTitle: String(row.aboutTitle ?? row.about_title ?? ""),
    aboutDescription: String(row.aboutDescription ?? row.about_description ?? ""),
    aboutAvatarUrl: String(row.aboutAvatarUrl ?? row.about_avatar_url ?? ""),
    aboutIntroHeading: String(row.aboutIntroHeading ?? row.about_intro_heading ?? ""),
    aboutParagraphs: parseStringArray(row.aboutParagraphs ?? row.about_paragraphs),
    aboutSocialLinks: parseSiteLinks(row.aboutSocialLinks ?? row.about_social_links),
    adminPostsEmptyState: String(row.adminPostsEmptyState ?? row.admin_posts_empty_state ?? "Select a post or create a new one."),
    adminProductsEmptyState: String(row.adminProductsEmptyState ?? row.admin_products_empty_state ?? "Select a product or create a new one."),
    adminProductNoDateLabel: String(row.adminProductNoDateLabel ?? row.admin_product_no_date_label ?? "No publish date"),
    footerLogoUrl: String(row.footerLogoUrl ?? row.footer_logo_url ?? ""),
    footerSlogan: String(row.footerSlogan ?? row.footer_slogan ?? ""),
    footerDescription: String(row.footerDescription ?? row.footer_description ?? ""),
    footerRightCopy: String(row.footerRightCopy ?? row.footer_right_copy ?? ""),
    footerCopyright: String(row.footerCopyright ?? row.footer_copyright ?? ""),
    footerSocialLinks: parseSiteLinks(row.footerSocialLinks ?? row.footer_social_links),
    createdAt: String(row.createdAt ?? row.created_at ?? ""),
    updatedAt: String(row.updatedAt ?? row.updated_at ?? ""),
  };
}

function readSiteSettingsRecord() {
  const settings = readSingleton<Record<string, unknown>>(CMS_SITE_SETTINGS_KEY, makeSeedSiteSettings);
  return toStoredSiteSettings(settings);
}

function writeCollection<T>(key: string, value: T[]) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

function writeSingleton<T>(key: string, value: T) {
  if (!canUseStorage()) {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
}

function matchesRecord(value: string | undefined, record: { id: string; slug: string }) {
  if (!value) {
    return false;
  }
  return record.id === value || record.slug === value;
}

function toSupabasePost(row: Record<string, unknown>): CmsPost {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    date: String(row.published_at ?? row.date ?? ""),
    coverImage: String(row.cover_image_url ?? ""),
    content: String(row.content_html ?? row.content ?? ""),
    status: (row.status as CmsPost["status"]) ?? "draft",
    authorName: String(row.author_name ?? DEFAULT_AUTHOR_NAME),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function toSupabaseProduct(row: Record<string, unknown>): CmsProduct {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    date: String(row.published_at ?? row.date ?? ""),
    coverImage: String(row.cover_image_url ?? ""),
    screenshots: parseStringArray(row.screenshots),
    content: String(row.content_html ?? row.content ?? ""),
    ctaLabel: String(row.cta_label ?? ""),
    ctaUrl: String(row.cta_url ?? ""),
    status: (row.status as CmsProduct["status"]) ?? "draft",
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function toSupabaseSiteSettings(row: Record<string, unknown>): SiteSettings {
  return toStoredSiteSettings(row);
}

export function getPublishedPostsSnapshot() {
  return readPostCollection().filter((post) => post.status === "published");
}

export function getPublishedPostSnapshot(idOrSlug: string | undefined) {
  return getPublishedPostsSnapshot().find((post) => matchesRecord(idOrSlug, post));
}

export function getPublishedProductsSnapshot() {
  return readProductCollection().filter((product) => product.status === "published");
}

export function getPublishedProductSnapshot(idOrSlug: string | undefined) {
  return getPublishedProductsSnapshot().find((product) => matchesRecord(idOrSlug, product));
}

export function getSiteSettingsInitial() {
  return readSiteSettingsRecord();
}

export function getAdminPosts() {
  return readPostCollection().sort(compareAdminContentByRecency);
}

export function getAdminProducts() {
  return readProductCollection().sort(compareAdminContentByRecency);
}

export function readSiteSettings() {
  return readSiteSettingsRecord();
}

export async function loadSiteSettings() {
  if (!isSupabaseEnabled()) {
    return readSiteSettingsRecord();
  }

  const client = getSupabaseBrowserClient();
  const { data, error } = await client!.from("site_settings").select("*").eq("id", DEFAULT_SITE_SETTINGS_ID).maybeSingle();
  if (error) {
    throw error;
  }

  return data ? toSupabaseSiteSettings(data as Record<string, unknown>) : readSiteSettingsRecord();
}

export async function listPosts() {
  if (!isSupabaseEnabled()) {
    return getAdminPosts();
  }

  const client = getSupabaseBrowserClient();
  const { data, error } = await client!.from("posts").select("*");
  if (error) {
    throw error;
  }
  return (data ?? []).map((row) => toSupabasePost(row as Record<string, unknown>)).sort(compareAdminContentByRecency);
}

export async function listProducts() {
  if (!isSupabaseEnabled()) {
    return getAdminProducts();
  }

  const client = getSupabaseBrowserClient();
  const { data, error } = await client!.from("products").select("*");
  if (error) {
    throw error;
  }
  return (data ?? []).map((row) => toSupabaseProduct(row as Record<string, unknown>)).sort(compareAdminContentByRecency);
}

export async function saveSiteSettings(input: SiteSettingsInput) {
  const current = await loadSiteSettings().catch(() => readSiteSettingsRecord());
  const mergedInput = {
    ...current,
    ...input,
    id: input.id ?? current.id ?? DEFAULT_SITE_SETTINGS_ID,
  };

  if (!isSupabaseEnabled()) {
    const record: SiteSettings = {
      id: mergedInput.id,
      heroEyebrow: mergedInput.heroEyebrow,
      heroTitle: mergedInput.heroTitle,
      heroDescription: mergedInput.heroDescription,
      heroPrimaryCtaLabel: mergedInput.heroPrimaryCtaLabel,
      heroPrimaryCtaUrl: mergedInput.heroPrimaryCtaUrl,
      heroSecondaryCtaLabel: mergedInput.heroSecondaryCtaLabel,
      heroSecondaryCtaUrl: mergedInput.heroSecondaryCtaUrl,
      productsEyebrow: mergedInput.productsEyebrow,
      productsTitle: mergedInput.productsTitle,
      productsDescription: mergedInput.productsDescription,
      productsCardCtaLabel: mergedInput.productsCardCtaLabel,
      productsEmptyState: mergedInput.productsEmptyState,
      blogEyebrow: mergedInput.blogEyebrow,
      blogTitle: mergedInput.blogTitle,
      blogDescription: mergedInput.blogDescription,
      blogLoadMoreLabel: mergedInput.blogLoadMoreLabel,
      blogCardCtaLabel: mergedInput.blogCardCtaLabel,
      blogEmptyState: mergedInput.blogEmptyState,
      postLoadingLabel: mergedInput.postLoadingLabel,
      postNotFoundTitle: mergedInput.postNotFoundTitle,
      returnHomeLabel: mergedInput.returnHomeLabel,
      productLoadingLabel: mergedInput.productLoadingLabel,
      productNotFoundTitle: mergedInput.productNotFoundTitle,
      productScreenshotsTitle: mergedInput.productScreenshotsTitle,
      productScreenshotLabelPrefix: mergedInput.productScreenshotLabelPrefix,
      productPrimaryCtaFallbackLabel: mergedInput.productPrimaryCtaFallbackLabel,
      aboutEyebrow: mergedInput.aboutEyebrow,
      aboutTitle: mergedInput.aboutTitle,
      aboutDescription: mergedInput.aboutDescription,
      aboutAvatarUrl: mergedInput.aboutAvatarUrl,
      aboutIntroHeading: mergedInput.aboutIntroHeading,
      aboutParagraphs: mergedInput.aboutParagraphs,
      aboutSocialLinks: mergedInput.aboutSocialLinks,
      adminPostsEmptyState: mergedInput.adminPostsEmptyState,
      adminProductsEmptyState: mergedInput.adminProductsEmptyState,
      adminProductNoDateLabel: mergedInput.adminProductNoDateLabel,
      footerLogoUrl: mergedInput.footerLogoUrl,
      footerSlogan: mergedInput.footerSlogan,
      footerDescription: mergedInput.footerDescription,
      footerRightCopy: mergedInput.footerRightCopy,
      footerCopyright: mergedInput.footerCopyright,
      footerSocialLinks: mergedInput.footerSocialLinks,
      createdAt: current.createdAt || nowIso(),
      updatedAt: nowIso(),
    };

    writeSingleton(CMS_SITE_SETTINGS_KEY, record);
    return record;
  }

  const client = getSupabaseBrowserClient();
  const payload = {
    id: mergedInput.id,
    hero_eyebrow: mergedInput.heroEyebrow,
    hero_title: mergedInput.heroTitle,
    hero_description: mergedInput.heroDescription,
    hero_primary_cta_label: mergedInput.heroPrimaryCtaLabel,
    hero_primary_cta_url: mergedInput.heroPrimaryCtaUrl,
    hero_secondary_cta_label: mergedInput.heroSecondaryCtaLabel,
    hero_secondary_cta_url: mergedInput.heroSecondaryCtaUrl,
    products_eyebrow: mergedInput.productsEyebrow,
    products_title: mergedInput.productsTitle,
    products_description: mergedInput.productsDescription,
    products_card_cta_label: mergedInput.productsCardCtaLabel,
    products_empty_state: mergedInput.productsEmptyState,
    blog_eyebrow: mergedInput.blogEyebrow,
    blog_title: mergedInput.blogTitle,
    blog_description: mergedInput.blogDescription,
    blog_load_more_label: mergedInput.blogLoadMoreLabel,
    blog_card_cta_label: mergedInput.blogCardCtaLabel,
    blog_empty_state: mergedInput.blogEmptyState,
    post_loading_label: mergedInput.postLoadingLabel,
    post_not_found_title: mergedInput.postNotFoundTitle,
    return_home_label: mergedInput.returnHomeLabel,
    product_loading_label: mergedInput.productLoadingLabel,
    product_not_found_title: mergedInput.productNotFoundTitle,
    product_screenshots_title: mergedInput.productScreenshotsTitle,
    product_screenshot_label_prefix: mergedInput.productScreenshotLabelPrefix,
    product_primary_cta_fallback_label: mergedInput.productPrimaryCtaFallbackLabel,
    about_eyebrow: mergedInput.aboutEyebrow,
    about_title: mergedInput.aboutTitle,
    about_description: mergedInput.aboutDescription,
    about_avatar_url: mergedInput.aboutAvatarUrl,
    about_intro_heading: mergedInput.aboutIntroHeading,
    about_paragraphs: mergedInput.aboutParagraphs,
    about_social_links: mergedInput.aboutSocialLinks,
    admin_posts_empty_state: mergedInput.adminPostsEmptyState,
    admin_products_empty_state: mergedInput.adminProductsEmptyState,
    admin_product_no_date_label: mergedInput.adminProductNoDateLabel,
    footer_logo_url: mergedInput.footerLogoUrl,
    footer_slogan: mergedInput.footerSlogan,
    footer_description: mergedInput.footerDescription,
    footer_right_copy: mergedInput.footerRightCopy,
    footer_copyright: mergedInput.footerCopyright,
    footer_social_links: mergedInput.footerSocialLinks,
  };

  const { data, error } = await client!.from("site_settings").upsert(payload).select().single();
  if (error) {
    throw error;
  }
  return toSupabaseSiteSettings(data as Record<string, unknown>);
}

export async function savePost(input: PostInput) {
  if (!isSupabaseEnabled()) {
    const posts = getAdminPosts();
    const current = posts.find((post) => post.id === input.id);
    const record: CmsPost = {
      id: input.id ?? makeId("post"),
      slug: input.slug?.trim() || slugify(input.title),
      title: input.title,
      excerpt: input.excerpt,
      date: input.date,
      coverImage: input.coverImage,
      coverSource: input.coverSource ?? current?.coverSource,
      content: input.content,
      status: input.status,
      authorName: input.authorName ?? DEFAULT_AUTHOR_NAME,
      createdAt: current?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };

    const next = current
      ? posts.map((post) => (post.id === record.id ? record : post))
      : [record, ...posts];

    writeCollection(CMS_POSTS_KEY, next);
    return record;
  }

  const client = getSupabaseBrowserClient();
  const payload = {
    id: input.id,
    slug: input.slug?.trim() || slugify(input.title),
    title: input.title,
    excerpt: input.excerpt,
    published_at: input.date,
    cover_image_url: input.coverImage,
    content_html: input.content,
    status: input.status,
    author_name: input.authorName ?? DEFAULT_AUTHOR_NAME,
  };

  const query = input.id
    ? client!.from("posts").update(payload).eq("id", input.id).select().single()
    : client!.from("posts").insert(payload).select().single();

  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return toSupabasePost(data as Record<string, unknown>);
}

export async function saveProduct(input: ProductInput) {
  if (!isSupabaseEnabled()) {
    const products = getAdminProducts();
    const current = products.find((product) => product.id === input.id);
    const record: CmsProduct = {
      id: input.id ?? makeId("product"),
      slug: input.slug?.trim() || slugify(input.title),
      title: input.title,
      excerpt: input.excerpt,
      date: input.date,
      coverImage: input.coverImage,
      screenshots: input.screenshots,
      content: input.content,
      ctaLabel: input.ctaLabel,
      ctaUrl: input.ctaUrl,
      status: input.status,
      createdAt: current?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
    };

    const next = current
      ? products.map((product) => (product.id === record.id ? record : product))
      : [record, ...products];

    writeCollection(CMS_PRODUCTS_KEY, next);
    return record;
  }

  const client = getSupabaseBrowserClient();
  const payload = {
    id: input.id,
    slug: input.slug?.trim() || slugify(input.title),
    title: input.title,
    excerpt: input.excerpt,
    published_at: input.date,
    cover_image_url: input.coverImage,
    screenshots: input.screenshots,
    content_html: input.content,
    cta_label: input.ctaLabel,
    cta_url: input.ctaUrl,
    status: input.status,
  };

  const query = input.id
    ? client!.from("products").update(payload).eq("id", input.id).select().single()
    : client!.from("products").insert(payload).select().single();

  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return toSupabaseProduct(data as Record<string, unknown>);
}

export async function deletePost(id: string) {
  if (!isSupabaseEnabled()) {
    writeCollection(CMS_POSTS_KEY, getAdminPosts().filter((post) => post.id !== id));
    return;
  }

  const client = getSupabaseBrowserClient();
  const { error } = await client!.from("posts").delete().eq("id", id);
  if (error) {
    throw error;
  }
}

export async function deleteProduct(id: string) {
  if (!isSupabaseEnabled()) {
    writeCollection(CMS_PRODUCTS_KEY, getAdminProducts().filter((product) => product.id !== id));
    return;
  }

  const client = getSupabaseBrowserClient();
  const { error } = await client!.from("products").delete().eq("id", id);
  if (error) {
    throw error;
  }
}

export function getLocalAdminSession(): AdminSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const raw = localStorage.getItem(CMS_ADMIN_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

export async function loginAdmin(email: string, password: string) {
  if (!email.trim() || !password.trim()) {
    throw new Error("Please enter email and password.");
  }

  if (!isSupabaseEnabled()) {
    const session: AdminSession = { email, mode: "local" };
    if (canUseStorage()) {
      localStorage.setItem(CMS_ADMIN_SESSION_KEY, JSON.stringify(session));
    }
    return session;
  }

  const client = getSupabaseBrowserClient();
  const { data, error } = await client!.auth.signInWithPassword({ email, password });
  if (error) {
    throw error;
  }
  return {
    email: data.user?.email ?? email,
    mode: "supabase" as const,
  };
}

export async function logoutAdmin() {
  if (!isSupabaseEnabled()) {
    if (canUseStorage()) {
      localStorage.removeItem(CMS_ADMIN_SESSION_KEY);
    }
    return;
  }

  const client = getSupabaseBrowserClient();
  await client!.auth.signOut();
}

export async function uploadImage(file: File) {
  if (!isSupabaseEnabled()) {
    return await fileToDataUrl(file);
  }

  const client = getSupabaseBrowserClient();
  const path = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
  const { error } = await client!.storage.from("media").upload(path, file, { upsert: true });
  if (error) {
    throw error;
  }
  const { data } = client!.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Image upload failed."));
    reader.readAsDataURL(file);
  });
}
