import { BLOG_POSTS } from "../src/data/index";

function escapeSql(value: string) {
  return value.replace(/'/g, "''");
}

function getProjectRef() {
  const explicit = process.env.SUPABASE_PROJECT_REF?.trim();
  if (explicit) {
    return explicit;
  }

  const url = process.env.VITE_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error("Missing SUPABASE_PROJECT_REF or VITE_SUPABASE_URL.");
  }

  const match = url.match(/^https:\/\/([^.]+)\.supabase\.co/);
  if (!match?.[1]) {
    throw new Error(`Unable to infer project ref from ${url}.`);
  }

  return match[1];
}

async function main() {
  const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new Error("Missing SUPABASE_ACCESS_TOKEN.");
  }

  const projectRef = getProjectRef();
  const rows = BLOG_POSTS.map((post) => ({
    title: post.title.trim(),
    coverImage: post.image?.trim() ?? "",
  })).filter((row) => row.coverImage);

  if (rows.length === 0) {
    console.log("No historical covers available for backfill.");
    return;
  }

  const valuesSql = rows
    .map((row) => `('${escapeSql(row.title)}', '${escapeSql(row.coverImage)}')`)
    .join(",\n      ");

  const query = `
    with legacy_covers(title, cover_image_url) as (
      values
      ${valuesSql}
    )
    update public.posts as posts
    set cover_image_url = legacy_covers.cover_image_url
    from legacy_covers
    where posts.title = legacy_covers.title
      and coalesce(posts.cover_image_url, '') = ''
    returning posts.slug, posts.cover_image_url;
  `;

  const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Backfill failed: ${await response.text()}`);
  }

  const result = (await response.json()) as Array<{ slug: string; cover_image_url: string }>;
  console.log(`Backfilled ${result.length} historical post covers.`);
  result.slice(0, 10).forEach((row) => {
    console.log(`${row.slug} -> ${row.cover_image_url}`);
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
