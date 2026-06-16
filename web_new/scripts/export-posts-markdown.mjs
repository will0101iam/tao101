import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const outputDir = path.join(rootDir, "exports", "blogs-md");
const postsJsonPath = path.join(rootDir, "data", "posts.json");
const configPath = path.join(rootDir, "config.js");

function escapeYaml(value) {
  return String(value ?? "").replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function decodeText(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugify(value, fallback) {
  const slug = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || fallback;
}

function parseConfig(source) {
  const supabaseUrl = source.match(/supabaseUrl:\s*"([^"]+)"/)?.[1] || "";
  const supabaseAnonKey = source.match(/supabaseAnonKey:\s*"([^"]+)"/)?.[1] || "";
  return { supabaseUrl, supabaseAnonKey };
}

function mapPost(row) {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? "Untitled"),
    excerpt: String(row.excerpt ?? ""),
    date: String(row.published_at ?? row.date ?? ""),
    coverImage: String(row.cover_image_url ?? row.coverImage ?? ""),
    content: String(row.content_html ?? row.content ?? ""),
    status: String(row.status ?? "published"),
    authorName: String(row.author_name ?? row.authorName ?? "Guotao Tao"),
    url: String(row.source_url ?? row.url ?? ""),
    createdAt: String(row.created_at ?? row.createdAt ?? ""),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? ""),
  };
}

function parseDateTime(value) {
  const time = Date.parse(value || "");
  return Number.isNaN(time) ? 0 : time;
}

function sortPosts(posts) {
  return [...posts].sort((a, b) => parseDateTime(b.date || b.updatedAt) - parseDateTime(a.date || a.updatedAt));
}

async function fetchRemotePosts() {
  const config = parseConfig(await fs.readFile(configPath, "utf8"));
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error("Supabase config is missing.");
  }

  const url = new URL(`${config.supabaseUrl}/rest/v1/posts`);
  url.searchParams.set("select", "*");
  url.searchParams.set("status", "eq.published");
  url.searchParams.set("order", "published_at.desc.nullslast,updated_at.desc");

  const response = await fetch(url, {
    headers: {
      apikey: config.supabaseAnonKey,
      Authorization: `Bearer ${config.supabaseAnonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Remote posts unavailable: ${response.status}`);
  }

  return (await response.json()).map(mapPost);
}

async function loadLocalPosts() {
  const rows = JSON.parse(await fs.readFile(postsJsonPath, "utf8"));
  return sortPosts(rows.map(mapPost).filter((post) => post.status === "published"));
}

function nodeText($, node) {
  return decodeText($(node).text());
}

function inlineMarkdown($, node) {
  const parts = [];

  $(node)
    .contents()
    .each((_, child) => {
      if (child.type === "text") {
        parts.push(child.data || "");
        return;
      }

      if (child.type !== "tag") {
        return;
      }

      const tag = child.tagName?.toLowerCase();
      const text = inlineMarkdown($, child);

      if (tag === "br") {
        parts.push("\n");
      } else if (tag === "strong" || tag === "b") {
        parts.push(text ? `**${text}**` : "");
      } else if (tag === "em" || tag === "i") {
        parts.push(text ? `*${text}*` : "");
      } else if (tag === "code") {
        parts.push(text ? `\`${text.replaceAll("`", "\\`")}\`` : "");
      } else if (tag === "a") {
        const href = $(child).attr("href");
        parts.push(href ? `[${text || href}](${href})` : text);
      } else if (tag === "img") {
        const src = $(child).attr("src");
        const alt = $(child).attr("alt") || "";
        parts.push(src ? `![${alt}](${src})` : "");
      } else {
        parts.push(text);
      }
    });

  return decodeText(parts.join(""));
}

function tableToMarkdown($, table) {
  const rows = [];
  $(table)
    .find("tr")
    .each((_, row) => {
      const cells = [];
      $(row)
        .children("th,td")
        .each((__, cell) => cells.push(inlineMarkdown($, cell).replace(/\|/g, "\\|")));
      if (cells.length) {
        rows.push(cells);
      }
    });

  if (!rows.length) {
    return "";
  }

  const width = Math.max(...rows.map((row) => row.length));
  const normalized = rows.map((row) => [...row, ...Array(Math.max(0, width - row.length)).fill("")]);
  const header = normalized[0];
  const separator = Array(width).fill("---");
  const body = normalized.slice(1);
  return [header, separator, ...body].map((row) => `| ${row.join(" | ")} |`).join("\n");
}

function blockMarkdown($, node, depth = 0) {
  if (node.type === "text") {
    return decodeText(node.data || "");
  }

  if (node.type !== "tag") {
    return "";
  }

  const tag = node.tagName?.toLowerCase();

  if (tag === "script" || tag === "style" || tag === "mp-style-type") {
    return "";
  }

  if (tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") {
    const level = Number(tag.slice(1));
    const text = inlineMarkdown($, node);
    return text ? `${"#".repeat(level)} ${text}` : "";
  }

  if (tag === "p") {
    const images = $(node).children("img");
    if (images.length && !nodeText($, node)) {
      return images
        .map((_, image) => {
          const src = $(image).attr("src");
          const alt = $(image).attr("alt") || "";
          return src ? `![${alt}](${src})` : "";
        })
        .get()
        .filter(Boolean)
        .join("\n\n");
    }
    return inlineMarkdown($, node);
  }

  if (tag === "img") {
    const src = $(node).attr("src");
    const alt = $(node).attr("alt") || "";
    return src ? `![${alt}](${src})` : "";
  }

  if (tag === "figure") {
    const image = $(node).find("img").first();
    const caption = nodeText($, $(node).find("figcaption").first());
    const src = image.attr("src");
    const alt = image.attr("alt") || caption || "";
    return [src ? `![${alt}](${src})` : "", caption ? `_${caption}_` : ""].filter(Boolean).join("\n\n");
  }

  if (tag === "blockquote") {
    const text = childBlocks($, node, depth).join("\n\n") || inlineMarkdown($, node);
    return text
      .split("\n")
      .map((line) => `> ${line}`)
      .join("\n");
  }

  if (tag === "pre") {
    const lang = $(node).attr("data-lang") || "";
    const code = nodeText($, node).replace(/\n{3,}/g, "\n\n");
    return `\`\`\`${lang}\n${code}\n\`\`\``;
  }

  if (tag === "ul" || tag === "ol") {
    const ordered = tag === "ol";
    const items = [];
    $(node)
      .children("li")
      .each((index, li) => {
        const content = childBlocks($, li, depth + 1).join("\n\n") || inlineMarkdown($, li);
        if (!content) {
          return;
        }
        const prefix = ordered ? `${index + 1}. ` : "- ";
        items.push(
          content
            .split("\n")
            .map((line, lineIndex) => (lineIndex === 0 ? `${prefix}${line}` : `  ${line}`))
            .join("\n"),
        );
      });
    return items.join("\n");
  }

  if (tag === "table") {
    return tableToMarkdown($, node);
  }

  if (tag === "hr") {
    return "---";
  }

  return childBlocks($, node, depth).join("\n\n") || inlineMarkdown($, node);
}

function childBlocks($, node, depth = 0) {
  const blocks = [];
  $(node)
    .contents()
    .each((_, child) => {
      const markdown = blockMarkdown($, child, depth);
      if (markdown) {
        blocks.push(markdown);
      }
    });
  return blocks;
}

function htmlToMarkdown(html) {
  const $ = cheerio.load(html || "");
  $("span[data-lark-record-format], mp-common-search, mp-style-type").remove();
  const root = $("body").length ? $("body").first() : $.root();
  return childBlocks($, root[0]).join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function postToMarkdown(post, index) {
  const body = htmlToMarkdown(post.content);
  const frontmatter = [
    "---",
    `title: "${escapeYaml(post.title)}"`,
    `date: "${escapeYaml(post.date)}"`,
    `status: "${escapeYaml(post.status)}"`,
    `author: "${escapeYaml(post.authorName)}"`,
    `source_url: "${escapeYaml(post.url)}"`,
    `cover_image: "${escapeYaml(post.coverImage)}"`,
    `id: "${escapeYaml(post.id)}"`,
    `slug: "${escapeYaml(post.slug)}"`,
    `export_index: ${index}`,
    "---",
  ].join("\n");

  return `${frontmatter}\n\n# ${post.title}\n\n${post.excerpt ? `> ${post.excerpt}\n\n` : ""}${body}\n`;
}

async function writeExports(posts, source) {
  await fs.rm(outputDir, { recursive: true, force: true });
  await fs.mkdir(outputDir, { recursive: true });

  const exports = posts.map((post, index) => ({
    post,
    index: index + 1,
    filename: `${String(index + 1).padStart(2, "0")}-${slugify(post.slug || post.title, `post-${post.id || index + 1}`)}.md`,
  }));

  const indexLines = [
    `# Blog Markdown Export`,
    "",
    `Source: ${source}`,
    `Count: ${posts.length}`,
    "",
    ...exports.map(({ post, index, filename }) => `- ${String(index).padStart(2, "0")} [${post.title}](./${filename})`),
  ];

  await Promise.all(
    exports.map(({ post, index, filename }) => fs.writeFile(path.join(outputDir, filename), postToMarkdown(post, index), "utf8")),
  );

  await fs.writeFile(path.join(outputDir, "_index.md"), `${indexLines.join("\n")}\n`, "utf8");
}

async function main() {
  let posts;
  let source = "Supabase published posts";

  try {
    posts = await fetchRemotePosts();
  } catch (error) {
    source = `local posts.json fallback (${error.message})`;
    posts = await loadLocalPosts();
  }

  posts = sortPosts(posts);
  await writeExports(posts, source);
  console.log(`Exported ${posts.length} posts from ${source}`);
  console.log(outputDir);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
