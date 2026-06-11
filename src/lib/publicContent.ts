import {
  getSiteSettingsInitial,
  getPublishedPostSnapshot,
  getPublishedPostsSnapshot,
  getPublishedProductSnapshot,
  getPublishedProductsSnapshot,
  readSiteSettings,
} from "@/lib/cms";
import { getSupabaseBrowserClient, isSupabaseEnabled } from "@/lib/supabase";
import type { CmsPost, CmsProduct, SiteSettings } from "@/types/content";

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

function parseSiteLinks(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry: unknown) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const label = "label" in entry ? String(entry.label ?? "").trim() : "";
    const url = "url" in entry ? String(entry.url ?? "").trim() : "";
    return label ? [{ label, url }] : [];
  });
}

function toPublishedPost(row: Record<string, unknown>): CmsPost {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? ""),
    excerpt: String(row.excerpt ?? ""),
    date: String(row.published_at ?? row.date ?? ""),
    coverImage: String(row.cover_image_url ?? ""),
    content: String(row.content_html ?? row.content ?? ""),
    status: (row.status as CmsPost["status"]) ?? "draft",
    authorName: String(row.author_name ?? "Guotao Tao"),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function toPublishedProduct(row: Record<string, unknown>): CmsProduct {
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

function toPublishedSiteSettings(row: Record<string, unknown>): SiteSettings {
  return {
    id: String(row.id ?? "default"),
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

export function getPublishedPostsInitial() {
  return getPublishedPostsSnapshot();
}

export function getPublishedProductsInitial() {
  return getPublishedProductsSnapshot();
}

export function getPublishedPostInitial(idOrSlug: string | undefined) {
  return getPublishedPostSnapshot(idOrSlug);
}

export function getPublishedProductInitial(idOrSlug: string | undefined) {
  return getPublishedProductSnapshot(idOrSlug);
}

export function getPublishedSiteSettingsInitial() {
  return getSiteSettingsInitial();
}

export async function listPublishedPosts() {
  if (!isSupabaseEnabled()) {
    return getPublishedPostsSnapshot();
  }

  const client = getSupabaseBrowserClient();
  const { data, error } = await client!
    .from("posts")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toPublishedPost(row as Record<string, unknown>));
}

export async function listPublishedProducts() {
  if (!isSupabaseEnabled()) {
    return getPublishedProductsSnapshot();
  }

  const client = getSupabaseBrowserClient();
  const { data, error } = await client!
    .from("products")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toPublishedProduct(row as Record<string, unknown>));
}

export async function readPublishedSiteSettings() {
  if (!isSupabaseEnabled()) {
    return readSiteSettings();
  }

  const client = getSupabaseBrowserClient();
  const { data, error } = await client!.from("site_settings").select("*").eq("id", "default").maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toPublishedSiteSettings(data as Record<string, unknown>) : getSiteSettingsInitial();
}

export async function findPublishedPost(idOrSlug: string | undefined) {
  if (!idOrSlug) {
    return undefined;
  }

  if (!isSupabaseEnabled()) {
    return getPublishedPostSnapshot(idOrSlug);
  }

  const client = getSupabaseBrowserClient();
  const slugResult = await client!
    .from("posts")
    .select("*")
    .eq("status", "published")
    .eq("slug", idOrSlug)
    .maybeSingle();

  if (slugResult.error) {
    throw slugResult.error;
  }

  if (slugResult.data) {
    return toPublishedPost(slugResult.data as Record<string, unknown>);
  }

  const idResult = await client!
    .from("posts")
    .select("*")
    .eq("status", "published")
    .eq("id", idOrSlug)
    .maybeSingle();

  if (idResult.error) {
    throw idResult.error;
  }

  return idResult.data ? toPublishedPost(idResult.data as Record<string, unknown>) : undefined;
}

export async function findPublishedProduct(idOrSlug: string | undefined) {
  if (!idOrSlug) {
    return undefined;
  }

  if (!isSupabaseEnabled()) {
    return getPublishedProductSnapshot(idOrSlug);
  }

  const client = getSupabaseBrowserClient();
  const slugResult = await client!
    .from("products")
    .select("*")
    .eq("status", "published")
    .eq("slug", idOrSlug)
    .maybeSingle();

  if (slugResult.error) {
    throw slugResult.error;
  }

  if (slugResult.data) {
    return toPublishedProduct(slugResult.data as Record<string, unknown>);
  }

  const idResult = await client!
    .from("products")
    .select("*")
    .eq("status", "published")
    .eq("id", idOrSlug)
    .maybeSingle();

  if (idResult.error) {
    throw idResult.error;
  }

  return idResult.data ? toPublishedProduct(idResult.data as Record<string, unknown>) : undefined;
}
