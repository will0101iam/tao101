import { createClient } from "@supabase/supabase-js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const webNewRoot = path.resolve(path.dirname(currentFile), "..");

const supabaseUrl = process.env.WEB_NEW_SUPABASE_URL?.trim();
const serviceRoleKey = process.env.WEB_NEW_SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing WEB_NEW_SUPABASE_URL or WEB_NEW_SUPABASE_SERVICE_ROLE_KEY.");
}

const client = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9一-龥\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toDate(value) {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

async function readJson(relativePath) {
  return JSON.parse(await fs.readFile(path.join(webNewRoot, relativePath), "utf8"));
}

async function seedPosts() {
  const posts = await readJson("data/posts.json");
  const payload = posts.map((post) => ({
    slug: slugify(post.slug || post.title),
    title: post.title || "Untitled",
    excerpt: post.excerpt || "",
    published_at: toDate(post.date),
    cover_image_url: post.coverImage || post.image || "",
    content_html: post.content || "<p></p>",
    source_url: post.url || "",
    status: "published",
    author_name: "Guotao Tao",
  }));

  const { error } = await client.from("posts").upsert(payload, { onConflict: "slug" });

  if (error) {
    throw error;
  }

  console.log(`Seeded ${payload.length} posts.`);
}

async function seedProducts() {
  const products = await readJson("data/products.json");
  const payload = products.map((product) => ({
    slug: slugify(product.slug || product.title),
    title: product.title || "Untitled",
    excerpt: product.excerpt || "",
    published_at: toDate(product.date),
    cover_image_url: product.coverImage || product.image || "",
    screenshots: Array.isArray(product.screenshots) ? product.screenshots : [],
    content_html: product.content || "<p></p>",
    cta_label: product.ctaLabel || "",
    cta_url: product.ctaUrl || "",
    status: product.status || "published",
  }));

  const { error } = await client.from("products").upsert(payload, { onConflict: "slug" });

  if (error) {
    throw error;
  }

  console.log(`Seeded ${payload.length} products.`);
}

await seedPosts();
await seedProducts();
