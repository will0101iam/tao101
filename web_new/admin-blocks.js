(function (root) {
  const SLASH_COMMANDS = [
    { id: "paragraph", label: "Paragraph", hint: "Plain text block", tag: "P" },
    { id: "heading-2", label: "Heading 2", hint: "Section heading", tag: "H2" },
    { id: "heading-3", label: "Heading 3", hint: "Subsection heading", tag: "H3" },
    { id: "quote", label: "Quote", hint: "Pull quote block", tag: "BLOCKQUOTE" },
    { id: "bullet-list", label: "Bullet List", hint: "Unordered list", tag: "UL" },
    { id: "image", label: "Image", hint: "Upload local image", tag: "IMG" },
    { id: "divider", label: "Divider", hint: "Horizontal rule", tag: "HR" },
    { id: "code", label: "Code", hint: "Preformatted code", tag: "PRE" },
  ];

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }

  function isMeaningfulText(value) {
    return String(value || "").replace(/\s+/g, "").length > 0;
  }

  function trimHtml(value) {
    return String(value || "").trim();
  }

  function parseHtml(html) {
    return new DOMParser().parseFromString(String(html || ""), "text/html").body;
  }

  function imageBlockFromNode(node) {
    const image = node.tagName === "IMG" ? node : node.querySelector("img");
    const caption = node.querySelector?.("figcaption");

    if (!image?.getAttribute("src")) {
      return null;
    }

    return {
      type: "image",
      src: image.getAttribute("src"),
      alt: image.getAttribute("alt") || "",
      caption: caption ? caption.textContent.trim() : "",
    };
  }

  function nodeToBlock(node) {
    if (node.nodeType === 3) {
      const text = node.textContent.trim();
      return text ? { type: "paragraph", html: escapeHtml(text) } : null;
    }

    if (node.nodeType !== 1) {
      return null;
    }

    const tag = node.tagName;
    const innerHtml = trimHtml(node.innerHTML);

    if (/^H[1-4]$/.test(tag)) {
      return { type: "heading", level: Number(tag.slice(1)), html: innerHtml || escapeHtml(node.textContent.trim()) };
    }

    if (tag === "P") {
      return innerHtml || isMeaningfulText(node.textContent) ? { type: "paragraph", html: innerHtml } : null;
    }

    if (tag === "BLOCKQUOTE") {
      return { type: "quote", html: innerHtml || escapeHtml(node.textContent.trim()) };
    }

    if (tag === "UL" || tag === "OL") {
      const items = [...node.querySelectorAll(":scope > li")]
        .map((item) => trimHtml(item.innerHTML) || escapeHtml(item.textContent.trim()))
        .filter(Boolean);
      return items.length ? { type: "list", ordered: tag === "OL", items } : null;
    }

    if (tag === "FIGURE" || tag === "IMG") {
      return imageBlockFromNode(node);
    }

    if (tag === "HR") {
      return { type: "divider" };
    }

    if (tag === "PRE") {
      return { type: "code", code: node.textContent.replace(/\n$/, "") };
    }

    if (tag === "TABLE") {
      return { type: "html", html: node.outerHTML };
    }

    return innerHtml || isMeaningfulText(node.textContent) ? { type: "html", html: node.outerHTML } : null;
  }

  function htmlToBlocks(html) {
    const body = parseHtml(html);
    return [...body.childNodes].map(nodeToBlock).filter(Boolean);
  }

  function normalizeBlocks(blocks, fallbackHtml = "") {
    if (Array.isArray(blocks) && blocks.length) {
      return blocks
        .map((block) => {
          if (!block || typeof block !== "object") {
            return null;
          }

          if (block.type === "heading") {
            return { type: "heading", level: Number(block.level || 2), html: trimHtml(block.html || block.text || "") };
          }

          if (["paragraph", "quote"].includes(block.type)) {
            return { type: block.type, html: trimHtml(block.html || block.text || "") };
          }

          if (block.type === "list") {
            const items = Array.isArray(block.items) ? block.items.map(trimHtml).filter(Boolean) : [];
            return items.length ? { type: "list", ordered: Boolean(block.ordered), items } : null;
          }

          if (block.type === "image") {
            return block.src ? { type: "image", src: String(block.src), alt: String(block.alt || ""), caption: String(block.caption || "") } : null;
          }

          if (block.type === "divider") {
            return { type: "divider" };
          }

          if (block.type === "code") {
            return { type: "code", code: String(block.code || "") };
          }

          if (block.type === "html") {
            return block.html ? { type: "html", html: String(block.html) } : null;
          }

          return null;
        })
        .filter(Boolean);
    }

    return htmlToBlocks(fallbackHtml);
  }

  function blocksToHtml(blocks) {
    return normalizeBlocks(blocks)
      .map((block) => {
        if (block.type === "heading") {
          const level = Math.min(4, Math.max(1, Number(block.level || 2)));
          return `<h${level}>${block.html || ""}</h${level}>`;
        }

        if (block.type === "paragraph") {
          return `<p>${block.html || ""}</p>`;
        }

        if (block.type === "quote") {
          return `<blockquote>${block.html || ""}</blockquote>`;
        }

        if (block.type === "list") {
          const tag = block.ordered ? "ol" : "ul";
          return `<${tag}>${block.items.map((item) => `<li>${item}</li>`).join("")}</${tag}>`;
        }

        if (block.type === "image") {
          const caption = block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : "";
          return `<figure><img src="${escapeAttribute(block.src)}" alt="${escapeAttribute(block.alt || "")}" loading="lazy" decoding="async" referrerpolicy="no-referrer">${caption}</figure>`;
        }

        if (block.type === "divider") {
          return "<hr>";
        }

        if (block.type === "code") {
          return `<pre><code>${escapeHtml(block.code || "")}</code></pre>`;
        }

        if (block.type === "html") {
          return block.html || "";
        }

        return "";
      })
      .filter(Boolean)
      .join("");
  }

  function getSlashCommands() {
    return SLASH_COMMANDS.map((command) => ({ ...command }));
  }

  const api = {
    blocksToHtml,
    getSlashCommands,
    htmlToBlocks,
    normalizeBlocks,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  root.REY_BLOCKS = api;
})(typeof window !== "undefined" ? window : globalThis);
