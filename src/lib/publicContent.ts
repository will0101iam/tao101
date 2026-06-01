import {
  getPublishedPostSnapshot,
  getPublishedPostsSnapshot,
  getPublishedProductSnapshot,
  getPublishedProductsSnapshot,
} from "@/lib/cms";
import { getSupabaseBrowserClient, isSupabaseEnabled } from "@/lib/supabase";
import type { CmsPost, CmsProduct } from "@/types/content";

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
