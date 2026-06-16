(function () {
  const config = window.REY_CMS_CONFIG || {};
  const blocksApi = window.REY_BLOCKS;
  const loginPanel = document.querySelector("[data-admin-login]");
  const consolePanel = document.querySelector("[data-admin-console]");
  const loginForm = document.querySelector("[data-login-form]");
  const loginMessage = document.querySelector("[data-login-message]");
  const sessionEmail = document.querySelector("[data-session-email]");
  const signOutButton = document.querySelector("[data-sign-out]");
  const tabs = document.querySelectorAll("[data-admin-tab]");
  const listRoot = document.querySelector("[data-entry-list]");
  const newButton = document.querySelector("[data-new-entry]");
  const editorForm = document.querySelector("[data-editor-form]");
  const editorEmpty = document.querySelector("[data-editor-empty]");
  const editorKicker = document.querySelector("[data-editor-kicker]");
  const editorTitle = document.querySelector("[data-editor-title]");
  const editorMessage = document.querySelector("[data-editor-message]");
  const deleteButton = document.querySelector("[data-delete-entry]");
  const cancelButton = document.querySelector("[data-cancel-edit]");
  const settingsToggle = document.querySelector("[data-settings-toggle]");
  const settingsPanel = document.querySelector("[data-settings-panel]");
  const coverPreview = document.querySelector("[data-cover-preview] div");
  const entryPreview = document.querySelector("[data-entry-preview]");
  const imageStrip = document.querySelector("[data-image-strip]");
  const previewStatus = document.querySelector("[data-preview-status]");
  const previewDate = document.querySelector("[data-preview-date]");
  const visualModeButtons = document.querySelectorAll("[data-visual-mode]");
  const slashMenu = document.querySelector("[data-slash-menu]");
  const slashImageUpload = document.querySelector("[data-slash-image-upload]");
  const productFields = document.querySelectorAll("[data-product-fields]");
  const slashTriggerChars = new Set(["/", "／", "、"]);

  let client = null;
  let activeType = "posts";
  let activeVisualMode = "preview";
  let activeSlashIndex = 0;
  let slashState = null;
  let pendingImageBlock = null;
  let entries = [];
  let editingEntry = null;

  if (!blocksApi) {
    throw new Error("Blocks editor utilities did not load.");
  }

  function setMessage(target, message, tone = "neutral") {
    if (!target) {
      return;
    }
    target.textContent = message;
    target.dataset.tone = tone;
  }

  function setVisible(element, visible) {
    element?.classList.toggle("is-hidden", !visible);
  }

  function requireClient() {
    if (!window.supabase?.createClient) {
      throw new Error("Supabase client did not load.");
    }

    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error("Supabase config is missing.");
    }

    if (!client) {
      client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    }

    return client;
  }

  function slugify(value) {
    return String(value)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9一-龥\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function normalizeLoginAccount(value) {
    const account = String(value || "").trim();
    return account === "admin" ? "admin@web-new.local" : account;
  }

  function toDateInputValue(value) {
    if (!value) {
      return new Date().toISOString().slice(0, 10);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toISOString().slice(0, 10);
  }

  function parseLines(value) {
    return String(value || "")
      .split("\n")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function mapPost(row) {
    return {
      id: String(row.id ?? ""),
      slug: String(row.slug ?? ""),
      title: String(row.title ?? ""),
      excerpt: String(row.excerpt ?? ""),
      date: String(row.published_at ?? ""),
      coverImage: String(row.cover_image_url ?? ""),
      content: String(row.content_html ?? ""),
      blocks: blocksApi.normalizeBlocks(row.blocks_json, row.content_html),
      status: row.status || "draft",
      authorName: String(row.author_name ?? "Guotao Tao"),
      createdAt: String(row.created_at ?? ""),
      updatedAt: String(row.updated_at ?? ""),
    };
  }

  function mapProduct(row) {
    const screenshots = Array.isArray(row.screenshots) ? row.screenshots : [];
    return {
      id: String(row.id ?? ""),
      slug: String(row.slug ?? ""),
      title: String(row.title ?? ""),
      excerpt: String(row.excerpt ?? ""),
      date: String(row.published_at ?? ""),
      coverImage: String(row.cover_image_url ?? ""),
      screenshots,
      content: String(row.content_html ?? ""),
      blocks: blocksApi.normalizeBlocks(row.blocks_json, row.content_html),
      ctaLabel: String(row.cta_label ?? ""),
      ctaUrl: String(row.cta_url ?? ""),
      status: row.status || "draft",
      createdAt: String(row.created_at ?? ""),
      updatedAt: String(row.updated_at ?? ""),
    };
  }

  function sortEntries(items) {
    return [...items].sort((a, b) => {
      const left = Date.parse(b.date || b.updatedAt || "");
      const right = Date.parse(a.date || a.updatedAt || "");
      return (Number.isNaN(left) ? 0 : left) - (Number.isNaN(right) ? 0 : right);
    });
  }

  function tableName() {
    return activeType === "posts" ? "posts" : "products";
  }

  function mapRow(row) {
    return activeType === "posts" ? mapPost(row) : mapProduct(row);
  }

  async function refreshSession() {
    try {
      const supabaseClient = requireClient();
      const result = await supabaseClient.auth.getSession();
      const session = result.data.session;

      setVisible(loginPanel, !session);
      setVisible(consolePanel, Boolean(session));

      if (session?.user?.email) {
        sessionEmail.textContent = session.user.email;
        await loadEntries();
      }
    } catch (error) {
      setMessage(loginMessage, error.message, "error");
    }
  }

  async function loadEntries() {
    if (!listRoot) {
      return;
    }

    listRoot.innerHTML = '<p class="inline-status">[LOADING CONTENT...]</p>';
    setVisible(editorForm, false);
    setVisible(editorEmpty, true);
    editingEntry = null;

    const supabaseClient = requireClient();
    const { data, error } = await supabaseClient.from(tableName()).select("*");

    if (error) {
      listRoot.innerHTML = `<p class="inline-status">[ERROR: ${escapeHtml(error.message)}]</p>`;
      return;
    }

    entries = sortEntries((data || []).map(mapRow));
    renderList();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function sanitizePreviewHtml(html) {
    const parser = new DOMParser();
    const documentBody = parser.parseFromString(String(html || ""), "text/html").body;
    const allowedTags = new Set([
      "A",
      "B",
      "BLOCKQUOTE",
      "BR",
      "CODE",
      "EM",
      "FIGCAPTION",
      "FIGURE",
      "H1",
      "H2",
      "H3",
      "H4",
      "HR",
      "I",
      "IMG",
      "LI",
      "OL",
      "P",
      "PRE",
      "S",
      "SECTION",
      "SPAN",
      "STRONG",
      "TABLE",
      "TBODY",
      "TD",
      "TFOOT",
      "TH",
      "THEAD",
      "TR",
      "U",
      "UL",
    ]);

    documentBody.querySelectorAll("script, style, iframe, object, embed, form, input, button, mp-style-type").forEach((node) => {
      node.remove();
    });
    documentBody.querySelectorAll("[data-lark-record-format], mp-common-search").forEach((node) => node.remove());

    [...documentBody.querySelectorAll("*")].forEach((node) => {
      if (!allowedTags.has(node.tagName)) {
        node.replaceWith(...node.childNodes);
        return;
      }

      [...node.attributes].forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        const isAllowed =
          (node.tagName === "A" && ["href", "target", "rel"].includes(name)) ||
          (node.tagName === "IMG" && ["src", "alt", "loading", "decoding", "referrerpolicy"].includes(name)) ||
          (["TD", "TH"].includes(node.tagName) && ["colspan", "rowspan"].includes(name));

        if (!isAllowed) {
          node.removeAttribute(attribute.name);
        }
      });
    });

    documentBody.querySelectorAll("a").forEach((link) => {
      link.target = "_blank";
      link.rel = "noreferrer";
    });

    documentBody.querySelectorAll("img").forEach((image) => {
      image.loading = "lazy";
      image.decoding = "async";
      image.referrerPolicy = "no-referrer";
      image.alt = image.alt || "Article image";
    });

    return documentBody.innerHTML.trim();
  }

  function normalizeEditableHtml(html) {
    const parser = new DOMParser();
    const documentBody = parser.parseFromString(String(html || ""), "text/html").body;
    const normalizedBody = document.implementation.createHTMLDocument("").body;
    const blockTags = new Set(["P", "H1", "H2", "H3", "H4", "BLOCKQUOTE", "UL", "OL", "FIGURE", "HR", "PRE", "TABLE", "SECTION"]);
    let paragraph = null;

    function ensureParagraph() {
      if (!paragraph) {
        paragraph = document.createElement("p");
      }

      return paragraph;
    }

    function flushParagraph() {
      if (!paragraph) {
        return;
      }

      if (paragraph.textContent.trim() || paragraph.querySelector("img, br, a, strong, em, code, span")) {
        normalizedBody.append(paragraph);
      }

      paragraph = null;
    }

    function ensureEmptyEditableBlock(element) {
      if (element?.matches("p, li, blockquote, h1, h2, h3, h4") && !element.textContent.trim() && !element.querySelector("img, br")) {
        element.append(document.createElement("br"));
      }

      element?.querySelectorAll("p, li, blockquote, h1, h2, h3, h4").forEach((block) => {
        if (!block.textContent.trim() && !block.querySelector("img, br")) {
          block.append(document.createElement("br"));
        }
      });

      return element;
    }

    [...documentBody.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.trim();

        if (text) {
          ensureParagraph().append(document.createTextNode(text));
        }

        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) {
        return;
      }

      if (node.tagName === "BR") {
        flushParagraph();
        return;
      }

      if (blockTags.has(node.tagName)) {
        flushParagraph();
        normalizedBody.append(ensureEmptyEditableBlock(node.cloneNode(true)));
        return;
      }

      ensureParagraph().append(node.cloneNode(true));
    });

    flushParagraph();

    const lastElement = normalizedBody.lastElementChild;
    if (!lastElement || !lastElement.matches("p, li")) {
      const trailingParagraph = document.createElement("p");
      trailingParagraph.append(document.createElement("br"));
      normalizedBody.append(trailingParagraph);
    }

    return normalizedBody.innerHTML || "<p></p>";
  }

  function collectImageUrls(html) {
    const parser = new DOMParser();
    const documentBody = parser.parseFromString(String(html || ""), "text/html").body;
    const urls = [...documentBody.querySelectorAll("img")]
      .map((image) => image.getAttribute("src"))
      .filter(Boolean);

    return [...new Set(urls)].slice(0, 18);
  }

  function currentVisualEditor() {
    return entryPreview?.querySelector("[data-visual-editor]");
  }

  function renderImageStripFromContent(content) {
    if (!imageStrip) {
      return;
    }

    const imageUrls = collectImageUrls(content);
    imageStrip.innerHTML = imageUrls.length
      ? `
          <div class="admin-panel-title">
            <span>${String(imageUrls.length).padStart(2, "0")}</span>
            <strong>Images Found</strong>
          </div>
          <div class="admin-image-grid">
            ${imageUrls
              .map(
                (url) => `
                  <button type="button" data-copy-cover="${escapeHtml(url)}" title="Use as cover">
                    <img src="${escapeHtml(url)}" alt="Article asset" loading="lazy" referrerpolicy="no-referrer" />
                  </button>
                `,
              )
              .join("")}
          </div>
        `
      : '<p class="inline-status">[NO BODY IMAGES FOUND]</p>';
  }

  function updateEditingBlocksFromContent(content) {
    if (editingEntry) {
      editingEntry.blocks = blocksApi.htmlToBlocks(content);
    }
  }

  function slashCommands() {
    return blocksApi.getSlashCommands();
  }

  function filteredSlashCommands(query = "") {
    const normalizedQuery = query.toLowerCase();
    const commands = slashCommands();

    if (!normalizedQuery) {
      return commands;
    }

    return commands.filter((command) => {
      const tagAlias = normalizedQuery.length > 1 ? command.tag || "" : "";
      const searchable = `${command.id} ${command.label} ${tagAlias}`.toLowerCase();
      const words = searchable.split(/[\s-]+/);
      const compact = searchable.replace(/[^a-z0-9]/g, "");
      return words.some((word) => word.startsWith(normalizedQuery)) || compact.startsWith(normalizedQuery);
    });
  }

  function hideSlashMenu() {
    setVisible(slashMenu, false);
    activeSlashIndex = 0;
    slashState = null;
  }

  function rangeRect(range, fallbackElement) {
    const rect = range?.getBoundingClientRect();
    return rect?.width || rect?.height ? rect : fallbackElement.getBoundingClientRect();
  }

  function editableBlockFromSelection(editor, range) {
    const startNode = range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement;

    if (!startNode || !editor.contains(startNode)) {
      return null;
    }

    return startNode.closest("p, h1, h2, h3, h4, blockquote, li");
  }

  function isForbiddenSlashContext(node) {
    const element = node?.nodeType === 1 ? node : node?.parentElement;
    return Boolean(element?.closest("a, code, pre, figcaption, figure, table"));
  }

  function isSlashCommandBlock(block) {
    return Boolean(block?.matches("p, li"));
  }

  function textBeforeRangeInBlock(block, range) {
    const blockRange = document.createRange();
    blockRange.selectNodeContents(block);
    blockRange.setEnd(range.startContainer, range.startOffset);
    return blockRange.toString();
  }

  function textAfterRangeInBlock(block, range) {
    const blockRange = document.createRange();
    blockRange.selectNodeContents(block);
    blockRange.setStart(range.startContainer, range.startOffset);
    return blockRange.toString();
  }

  function normalizeRootSlashText(editor) {
    const selection = window.getSelection();

    if (!selection?.rangeCount || !selection.isCollapsed) {
      return;
    }

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    if (textNode.nodeType !== 3 || textNode.parentNode !== editor) {
      return;
    }

    const before = textNode.textContent.slice(0, range.startOffset);
    const after = textNode.textContent.slice(range.startOffset);
    if (!/^\s*[\/／、][a-z0-9-]*$/i.test(before) || after.trim()) {
      return;
    }

    const nextElement = textNode.nextElementSibling;
    if (nextElement && (!nextElement.matches("p") || nextElement.textContent.trim())) {
      return;
    }

    const paragraph = document.createElement("p");
    const paragraphText = document.createTextNode(before.trimStart());
    paragraph.append(paragraphText);
    textNode.replaceWith(paragraph);

    if (paragraph.nextElementSibling?.matches("p") && !paragraph.nextElementSibling.textContent.trim()) {
      paragraph.nextElementSibling.remove();
    }

    const nextRange = document.createRange();
    nextRange.setStart(paragraphText, paragraphText.textContent.length);
    nextRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(nextRange);
  }

  function primeSlashInEmptyBlock(editor) {
    const selection = window.getSelection();

    if (!selection?.rangeCount || !selection.isCollapsed) {
      return false;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.startContainer) || isForbiddenSlashContext(range.startContainer)) {
      return false;
    }

    const block = editableBlockFromSelection(editor, range);
    if (!isSlashCommandBlock(block)) {
      return false;
    }

    const textBefore = textBeforeRangeInBlock(block, range);
    const textAfter = textAfterRangeInBlock(block, range);
    if (textBefore.trim() || textAfter.trim()) {
      return false;
    }

    block.innerHTML = "";
    const textNode = document.createTextNode("/");
    block.append(textNode);

    const triggerRange = document.createRange();
    triggerRange.setStart(textNode, 1);
    triggerRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(triggerRange);
    updateSlashMenuFromSelection();
    return true;
  }

  function currentSlashTrigger(editor) {
    const selection = window.getSelection();

    if (!selection?.rangeCount || !selection.isCollapsed) {
      return null;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.startContainer) || isForbiddenSlashContext(range.startContainer)) {
      return null;
    }

    const block = editableBlockFromSelection(editor, range);
    if (!isSlashCommandBlock(block)) {
      return null;
    }

    const textBefore = textBeforeRangeInBlock(block, range);
    const match = textBefore.trimStart().match(/^[\/／、]([a-z0-9-]*)$/i);

    if (!match || range.startContainer.nodeType !== 3) {
      return null;
    }

    const textNode = range.startContainer;
    const slashStart = range.startOffset - match[0].length;
    if (slashStart < 0 || textNode.textContent.slice(slashStart, range.startOffset) !== match[0]) {
      return null;
    }

    const triggerRange = document.createRange();
    triggerRange.setStart(textNode, slashStart);
    triggerRange.setEnd(textNode, range.startOffset);

    return {
      block,
      commands: filteredSlashCommands(match[1]),
      query: match[1],
      range: triggerRange,
    };
  }

  function showSlashMenu(trigger) {
    if (!slashMenu || !trigger || activeVisualMode !== "edit") {
      return;
    }

    if (!trigger.commands.length) {
      hideSlashMenu();
      return;
    }

    slashState = trigger;
    activeSlashIndex = Math.min(activeSlashIndex, trigger.commands.length - 1);
    const rect = rangeRect(trigger.range, trigger.block);
    slashMenu.innerHTML = trigger.commands
      .map(
        (command, index) => `
          <button class="${index === activeSlashIndex ? "is-active" : ""}" type="button" data-slash-command="${escapeHtml(command.id)}" role="menuitem">
            <span>${escapeHtml(command.label)}</span>
            <em>${escapeHtml(command.hint)}</em>
          </button>
        `,
      )
      .join("");

    slashMenu.style.left = `${Math.min(window.innerWidth - 300, Math.max(16, rect.left))}px`;
    slashMenu.style.top = `${Math.min(window.innerHeight - 340, Math.max(16, rect.bottom + 10))}px`;
    setVisible(slashMenu, true);
  }

  function updateSlashMenuFromSelection() {
    const visualEditor = currentVisualEditor();
    if (!visualEditor || activeVisualMode !== "edit") {
      hideSlashMenu();
      return;
    }

    const trigger = currentSlashTrigger(visualEditor);
    if (!trigger) {
      hideSlashMenu();
      return;
    }

    showSlashMenu(trigger);
  }

  function restoreSlashSelection() {
    if (!slashState?.range) {
      return false;
    }

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(slashState.range);
    return true;
  }

  function removeSlashTrigger() {
    if (!restoreSlashSelection()) {
      return null;
    }

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const block = slashState?.block;
    range.deleteContents();
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    return block;
  }

  function ensureCaretTextTarget(block) {
    if (!block) {
      return;
    }

    if (!block.textContent.trim() && !block.querySelector("img, br")) {
      block.appendChild(document.createTextNode(""));
    }
  }

  function placeCaretAtEnd(node) {
    if (!node) {
      return;
    }

    const target = node.nodeType === 1 && node.matches("pre") ? node.querySelector("code") || node : node;
    ensureCaretTextTarget(target);
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    target.focus?.();
  }

  function replaceBlock(block, replacement, focusTarget = replacement) {
    if (!block || !replacement) {
      return;
    }

    block.replaceWith(replacement);
    placeCaretAtEnd(focusTarget);
  }

  function emptyParagraph() {
    const paragraph = document.createElement("p");
    paragraph.append(document.createElement("br"));
    return paragraph;
  }

  function emptyListItem() {
    const item = document.createElement("li");
    item.append(document.createElement("br"));
    return item;
  }

  function emptyQuote() {
    const quote = document.createElement("blockquote");
    quote.append(document.createElement("br"));
    return quote;
  }

  function blockTextOrBreak(block) {
    const text = block?.textContent || "";
    return text.trim() ? document.createTextNode(text) : document.createElement("br");
  }

  function transformCurrentBlock(block, commandId) {
    if (!block) {
      return;
    }

    if (commandId === "paragraph" || commandId === "heading-2" || commandId === "heading-3" || commandId === "quote") {
      const tag = commandId === "heading-2" ? "h2" : commandId === "heading-3" ? "h3" : commandId === "quote" ? "blockquote" : "p";
      const replacement = document.createElement(tag);
      replacement.append(blockTextOrBreak(block));
      replaceBlock(block, replacement);
    } else if (commandId === "bullet-list") {
      const list = document.createElement("ul");
      const item = document.createElement("li");
      item.append(blockTextOrBreak(block));
      list.append(item);
      replaceBlock(block, list, item);
    } else if (commandId === "divider") {
      const divider = document.createElement("hr");
      const paragraph = emptyParagraph();
      block.replaceWith(divider, paragraph);
      placeCaretAtEnd(paragraph);
    } else if (commandId === "code") {
      const pre = document.createElement("pre");
      const code = document.createElement("code");
      code.textContent = block.textContent.trim() || "// code";
      pre.append(code);
      const paragraph = emptyParagraph();
      block.replaceWith(pre, paragraph);
      placeCaretAtEnd(code);
    }
  }

  function insertImageBlockAtTarget(block, imageUrl) {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    const caption = document.createElement("figcaption");
    const nextParagraph = document.createElement("p");

    image.src = imageUrl;
    image.alt = "Article image";
    image.loading = "lazy";
    image.decoding = "async";
    image.referrerPolicy = "no-referrer";
    caption.textContent = "";
    nextParagraph.append(document.createElement("br"));
    figure.append(image, caption);

    if (block?.isConnected) {
      block.replaceWith(figure, nextParagraph);
    } else {
      currentVisualEditor()?.append(figure, nextParagraph);
    }

    placeCaretAtEnd(nextParagraph);
  }

  function caretIsAtBlockEnd(block, range) {
    return !textAfterRangeInBlock(block, range).trim();
  }

  function insertParagraphAfterBlock(block) {
    const paragraph = emptyParagraph();
    block.after(paragraph);
    placeCaretAtEnd(paragraph);
    return paragraph;
  }

  function handleListEnter(block, range) {
    if (!block?.matches("li") || !caretIsAtBlockEnd(block, range)) {
      return false;
    }

    const list = block.closest("ul, ol");
    if (!list) {
      return false;
    }

    if (block.textContent.trim()) {
      const item = emptyListItem();
      block.after(item);
      placeCaretAtEnd(item);
      return true;
    }

    const paragraph = emptyParagraph();
    block.remove();
    list.after(paragraph);
    if (!list.querySelector("li")) {
      list.remove();
    }
    placeCaretAtEnd(paragraph);
    return true;
  }

  function handleBlockEnter(editor) {
    const selection = window.getSelection();

    if (!selection?.rangeCount || !selection.isCollapsed) {
      return false;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.startContainer) || isForbiddenSlashContext(range.startContainer)) {
      return false;
    }

    const block = editableBlockFromSelection(editor, range);
    if (!block) {
      return false;
    }

    if (handleListEnter(block, range)) {
      return true;
    }

    if (block.matches("blockquote") && caretIsAtBlockEnd(block, range)) {
      const quote = emptyQuote();
      block.after(quote);
      placeCaretAtEnd(quote);
      return true;
    }

    if (block.matches("h1, h2, h3, h4") && caretIsAtBlockEnd(block, range)) {
      insertParagraphAfterBlock(block);
      return true;
    }

    return false;
  }

  function convertBlockToParagraph(block) {
    if (!block) {
      return false;
    }

    const paragraph = emptyParagraph();
    block.replaceWith(paragraph);
    placeCaretAtEnd(paragraph);
    return true;
  }

  function handleBlockBackspace(editor) {
    const selection = window.getSelection();

    if (!selection?.rangeCount || !selection.isCollapsed) {
      return false;
    }

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.startContainer) || isForbiddenSlashContext(range.startContainer)) {
      return false;
    }

    const block = editableBlockFromSelection(editor, range);
    if (!block || block.textContent.trim() || textBeforeRangeInBlock(block, range).trim()) {
      return false;
    }

    if (block.matches("blockquote, h1, h2, h3, h4")) {
      return convertBlockToParagraph(block);
    }

    if (block.matches("li")) {
      const list = block.closest("ul, ol");
      const paragraph = emptyParagraph();
      block.remove();
      list?.after(paragraph);
      if (list && !list.querySelector("li")) {
        list.remove();
      }
      placeCaretAtEnd(paragraph);
      return true;
    }

    return false;
  }

  function applySlashCommand(commandId) {
    const visualEditor = currentVisualEditor();
    if (!visualEditor || activeVisualMode !== "edit" || !slashState) {
      return;
    }

    visualEditor.focus();
    const block = removeSlashTrigger();

    if (commandId === "image") {
      pendingImageBlock = block;
      if (!slashImageUpload) {
        setMessage(editorMessage, "Image upload input is missing.", "error");
        return;
      }

      slashImageUpload.value = "";
      slashImageUpload?.click();
    } else {
      transformCurrentBlock(block, commandId);
    }

    syncVisualEditorToSource();
    renderImageStripFromContent(editorForm.elements.content.value);
    hideSlashMenu();
  }

  function slashMenuIsOpen() {
    return Boolean(slashMenu && !slashMenu.classList.contains("is-hidden"));
  }

  function moveSlashSelection(delta) {
    const commands = slashState?.commands || [];
    if (!commands.length) {
      return;
    }

    activeSlashIndex = (activeSlashIndex + delta + commands.length) % commands.length;
    showSlashMenu(slashState);
  }

  function focusEditorEnd() {
    const visualEditor = currentVisualEditor();
    if (!visualEditor || activeVisualMode !== "edit") {
      return;
    }

    const range = document.createRange();
    const target = visualEditor.querySelector("p, h2, h3, blockquote, li, pre") || visualEditor;
    const focusTarget = target.matches?.("pre") ? target.querySelector("code") || target : target;
    ensureCaretTextTarget(focusTarget);
    visualEditor.focus();
    range.selectNodeContents(target);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    focusTarget.focus?.();
  }

  function renderList() {
    if (!entries.length) {
      listRoot.innerHTML = '<p class="inline-status">[NO ENTRIES YET]</p>';
      return;
    }

    listRoot.innerHTML = entries
      .map(
        (entry, index) => `
          <button class="admin-list-row" type="button" data-entry-id="${escapeHtml(entry.id)}">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(entry.title || "Untitled")}</strong>
            <em>${escapeHtml(entry.date || "No date")} / ${escapeHtml(entry.status)}</em>
          </button>
        `,
      )
      .join("");
  }

  function blankEntry() {
    return activeType === "posts"
      ? {
          id: "",
          slug: "",
          title: "",
          excerpt: "",
          date: new Date().toISOString().slice(0, 10),
          coverImage: "",
          content: "<p></p>",
          blocks: [],
          status: "draft",
          authorName: "Guotao Tao",
        }
      : {
          id: "",
          slug: "",
          title: "",
          excerpt: "",
          date: new Date().toISOString().slice(0, 10),
          coverImage: "",
          screenshots: [],
          content: "<p></p>",
          blocks: [],
          ctaLabel: "",
          ctaUrl: "",
          status: "draft",
        };
  }

  function setProductFieldsVisible(visible) {
    productFields.forEach((field) => setVisible(field, visible));
  }

  function setVisualMode(mode) {
    activeVisualMode = mode === "edit" ? "edit" : "preview";
    visualModeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.visualMode === activeVisualMode);
    });
    hideSlashMenu();
    renderEntryPreview();
  }

  function editEntry(entry) {
    editingEntry = entry;
    editorForm.reset();
    setVisible(editorForm, true);
    setVisible(editorEmpty, false);
    setProductFieldsVisible(activeType === "products");
    setMessage(editorMessage, "");

    editorKicker.textContent = activeType === "posts" ? "/ EDIT POST" : "/ EDIT PRODUCT";
    editorTitle.textContent = entry.id ? entry.title || "Untitled" : activeType === "posts" ? "New Post" : "New Product";
    deleteButton.disabled = !entry.id;
    if (settingsPanel) {
      settingsPanel.open = !entry.id;
    }

    editorForm.elements.id.value = entry.id || "";
    editorForm.elements.slug.value = entry.slug || "";
    editorForm.elements.title.value = entry.title || "";
    editorForm.elements.date.value = toDateInputValue(entry.date);
    editorForm.elements.excerpt.value = entry.excerpt || "";
    editorForm.elements.status.value = entry.status || "draft";
    editorForm.elements.coverImage.value = entry.coverImage || "";
    editorForm.elements.content.value = entry.content || "<p></p>";
    activeVisualMode = "edit";
    visualModeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.visualMode === activeVisualMode);
    });
    hideSlashMenu();

    if (activeType === "products") {
      editorForm.elements.ctaLabel.value = entry.ctaLabel || "";
      editorForm.elements.ctaUrl.value = entry.ctaUrl || "";
      editorForm.elements.screenshots.value = (entry.screenshots || []).join("\n");
    }

    renderCoverPreview();
    renderEntryPreview();
    if (!entry.id) {
      window.requestAnimationFrame(() => {
        focusEditorEnd();
        window.setTimeout(focusEditorEnd, 0);
      });
    }
  }

  function renderCoverPreview() {
    const url = editorForm?.elements.coverImage.value.trim();
    if (!coverPreview) {
      return;
    }

    coverPreview.innerHTML = url
      ? `<img src="${escapeHtml(url)}" alt="Cover preview" />`
      : '<p class="inline-status">[NO COVER SELECTED]</p>';
  }

  function renderEntryPreview() {
    if (!editorForm || !entryPreview) {
      return;
    }

    const title = editorForm.elements.title.value.trim() || "Untitled";
    const date = editorForm.elements.date.value.trim();
    const status = editorForm.elements.status.value || "draft";
    const excerpt = editorForm.elements.excerpt.value.trim();
    const content = editorForm.elements.content.value.trim();
    const sanitizedContent = normalizeEditableHtml(sanitizePreviewHtml(content));
    const isEditing = activeVisualMode === "edit";

    previewStatus.textContent = `[${status.toUpperCase()}]`;
    previewDate.textContent = date ? `[${date}]` : "[NO DATE]";
    editorTitle.textContent = title;
    entryPreview.innerHTML = `
      <div class="article-content admin-preview-body" data-visual-editor contenteditable="${isEditing ? "true" : "false"}" spellcheck="true" aria-label="${escapeHtml(title)}">
        ${sanitizedContent || '<p class="inline-status">[EMPTY BODY]</p>'}
      </div>
    `;

    renderImageStripFromContent(content);
  }

  function syncVisualEditorToSource() {
    const visualEditor = entryPreview?.querySelector("[data-visual-editor]");

    if (!visualEditor || activeVisualMode !== "edit") {
      return;
    }

    editorForm.elements.content.value = sanitizePreviewHtml(visualEditor.innerHTML) || "<p></p>";
    updateEditingBlocksFromContent(editorForm.elements.content.value);
  }

  function rangeIsInsideEditor(editor, range) {
    return editor.contains(range.commonAncestorContainer);
  }

  function wrapSelectionWithStrong(editor) {
    const selection = window.getSelection();

    if (!selection?.rangeCount) {
      return false;
    }

    const range = selection.getRangeAt(0);

    if (range.collapsed || !rangeIsInsideEditor(editor, range)) {
      return false;
    }

    const strong = document.createElement("strong");
    strong.append(range.extractContents());
    range.insertNode(strong);
    strong.normalize();

    const nextRange = document.createRange();
    nextRange.setStartAfter(strong);
    nextRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(nextRange);
    return true;
  }

  function handleBoldShortcut(event, editor) {
    if (event.key.toLowerCase() !== "b" || (!event.ctrlKey && !event.metaKey) || event.altKey) {
      return false;
    }

    event.preventDefault();
    hideSlashMenu();

    if (!wrapSelectionWithStrong(editor)) {
      document.execCommand?.("bold", false);
    }

    syncVisualEditorToSource();
    renderImageStripFromContent(editorForm.elements.content.value);
    return true;
  }

  async function uploadCover(file) {
    if (!file) {
      return "";
    }

    const supabaseClient = requireClient();
    const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
    const path = `${Date.now()}-${safeName}`;
    const { error } = await supabaseClient.storage.from("media").upload(path, file, { upsert: true });

    if (error) {
      throw error;
    }

    return supabaseClient.storage.from("media").getPublicUrl(path).data.publicUrl;
  }

  async function saveEntry(event) {
    event.preventDefault();
    syncVisualEditorToSource();
    setMessage(editorMessage, "Saving...");

    try {
      const form = editorForm.elements;
      const uploadedCover = await uploadCover(form.coverUpload.files?.[0]);
      const title = form.title.value.trim();
      const slug = form.slug.value.trim() || slugify(title);
      const contentHtml = form.content.value.trim() || "<p></p>";
      const blocksJson = blocksApi.htmlToBlocks(contentHtml);
      const basePayload = {
        slug,
        title,
        excerpt: form.excerpt.value.trim(),
        published_at: form.date.value || null,
        cover_image_url: uploadedCover || form.coverImage.value.trim(),
        content_html: contentHtml,
        blocks_json: blocksJson,
        status: form.status.value,
      };

      const payload =
        activeType === "posts"
          ? {
              ...basePayload,
              author_name: "Guotao Tao",
            }
          : {
              ...basePayload,
              screenshots: parseLines(form.screenshots.value),
              cta_label: form.ctaLabel.value.trim(),
              cta_url: form.ctaUrl.value.trim(),
            };

      const supabaseClient = requireClient();
      const id = form.id.value.trim();
      const query = id
        ? supabaseClient.from(tableName()).update(payload).eq("id", id).select().single()
        : supabaseClient.from(tableName()).insert(payload).select().single();
      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setMessage(editorMessage, "Saved. Published entries will appear on the site after refresh.", "success");
      await loadEntries();
      editEntry(mapRow(data));
    } catch (error) {
      setMessage(editorMessage, error.message || "Failed to save entry.", "error");
    }
  }

  async function deleteEntry() {
    const id = editorForm.elements.id.value.trim();
    if (!id || !window.confirm("Delete this entry?")) {
      return;
    }

    setMessage(editorMessage, "Deleting...");

    try {
      const supabaseClient = requireClient();
      const { error } = await supabaseClient.from(tableName()).delete().eq("id", id);

      if (error) {
        throw error;
      }

      await loadEntries();
    } catch (error) {
      setMessage(editorMessage, error.message || "Failed to delete entry.", "error");
    }
  }

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    setMessage(loginMessage, "Signing in...");

    try {
      const supabaseClient = requireClient();
      const formData = new FormData(loginForm);
      const { error } = await supabaseClient.auth.signInWithPassword({
        email: normalizeLoginAccount(formData.get("email")),
        password: String(formData.get("password") || ""),
      });

      if (error) {
        throw error;
      }

      setMessage(loginMessage, "");
      await refreshSession();
    } catch (error) {
      setMessage(loginMessage, error.message || "Login failed.", "error");
    }
  });

  signOutButton?.addEventListener("click", async () => {
    const supabaseClient = requireClient();
    await supabaseClient.auth.signOut();
    await refreshSession();
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", async () => {
      activeType = tab.dataset.adminTab;
      tabs.forEach((item) => item.classList.toggle("is-active", item === tab));
      await loadEntries();
    });
  });

  listRoot?.addEventListener("click", (event) => {
    const row = event.target.closest("[data-entry-id]");
    if (!row) {
      return;
    }

    const entry = entries.find((item) => item.id === row.dataset.entryId);
    if (entry) {
      editEntry(entry);
    }
  });

  newButton?.addEventListener("click", () => editEntry(blankEntry()));
  cancelButton?.addEventListener("click", () => {
    setVisible(editorForm, false);
    setVisible(editorEmpty, true);
  });
  settingsToggle?.addEventListener("click", () => {
    if (settingsPanel) {
      settingsPanel.open = !settingsPanel.open;
    }
  });
  deleteButton?.addEventListener("click", deleteEntry);
  editorForm?.addEventListener("submit", saveEntry);
  editorForm?.addEventListener("input", (event) => {
    if (event.target?.name === "coverImage") {
      renderCoverPreview();
    }

    if (["title", "date", "excerpt", "status", "content"].includes(event.target?.name)) {
      renderEntryPreview();
    }
  });
  entryPreview?.addEventListener("input", (event) => {
    const visualEditor = event.target.closest("[data-visual-editor]");
    if (!visualEditor) {
      return;
    }

    normalizeRootSlashText(visualEditor);
    syncVisualEditorToSource();
    renderImageStripFromContent(editorForm.elements.content.value);
    updateSlashMenuFromSelection();
  });
  entryPreview?.addEventListener("keydown", (event) => {
    const visualEditor = event.target.closest("[data-visual-editor]");
    if (!visualEditor) {
      return;
    }

    if (event.isComposing) {
      hideSlashMenu();
      return;
    }

    if (handleBoldShortcut(event, visualEditor)) {
      return;
    }

    if (!slashMenuIsOpen() && slashTriggerChars.has(event.key) && primeSlashInEmptyBlock(visualEditor)) {
      event.preventDefault();
    } else if (slashMenuIsOpen() && event.key === "Escape") {
      event.preventDefault();
      hideSlashMenu();
    } else if (slashMenuIsOpen() && event.key === "ArrowDown") {
      event.preventDefault();
      moveSlashSelection(1);
    } else if (slashMenuIsOpen() && event.key === "ArrowUp") {
      event.preventDefault();
      moveSlashSelection(-1);
    } else if (slashMenuIsOpen() && event.key === "Enter") {
      event.preventDefault();
      applySlashCommand(slashState?.commands?.[activeSlashIndex]?.id);
    } else if (!slashMenuIsOpen() && event.key === "Enter" && !event.shiftKey && handleBlockEnter(visualEditor)) {
      event.preventDefault();
      syncVisualEditorToSource();
      renderImageStripFromContent(editorForm.elements.content.value);
    } else if (!slashMenuIsOpen() && event.key === "Backspace" && handleBlockBackspace(visualEditor)) {
      event.preventDefault();
      syncVisualEditorToSource();
      renderImageStripFromContent(editorForm.elements.content.value);
    } else if (slashMenuIsOpen() && event.key === " ") {
      hideSlashMenu();
    }
  });
  entryPreview?.addEventListener("keyup", (event) => {
    const visualEditor = event.target.closest("[data-visual-editor]");
    if (!visualEditor || activeVisualMode !== "edit") {
      hideSlashMenu();
      return;
    }

    if (["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(event.key) || event.isComposing) {
      return;
    }

    if (slashTriggerChars.has(event.key) || slashMenuIsOpen()) {
      activeSlashIndex = 0;
      updateSlashMenuFromSelection();
    }
  });
  visualModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      syncVisualEditorToSource();
      setVisualMode(button.dataset.visualMode);
    });
  });
  slashMenu?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-slash-command]");

    if (!button) {
      return;
    }

    applySlashCommand(button.dataset.slashCommand);
  });
  slashImageUpload?.addEventListener("change", async () => {
    const file = slashImageUpload.files?.[0];
    if (!file || !pendingImageBlock) {
      pendingImageBlock = null;
      return;
    }

    try {
      setMessage(editorMessage, "Uploading image...");
      const imageUrl = await uploadCover(file);
      insertImageBlockAtTarget(pendingImageBlock, imageUrl);
      syncVisualEditorToSource();
      renderImageStripFromContent(editorForm.elements.content.value);
      setMessage(editorMessage, "Image uploaded into body.", "success");
    } catch (error) {
      setMessage(editorMessage, error.message || "Failed to upload image.", "error");
    } finally {
      pendingImageBlock = null;
      slashImageUpload.value = "";
    }
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest("[data-slash-menu]") || event.target.closest("[data-visual-editor]") || event.target === slashImageUpload) {
      return;
    }

    hideSlashMenu();
  });
  imageStrip?.addEventListener("click", (event) => {
    const coverButton = event.target.closest("[data-copy-cover]");
    if (!coverButton || !editorForm?.elements.coverImage) {
      return;
    }

    editorForm.elements.coverImage.value = coverButton.dataset.copyCover;
    renderCoverPreview();
    setMessage(editorMessage, "Cover URL copied from body image.", "success");
  });

  refreshSession();
})();
