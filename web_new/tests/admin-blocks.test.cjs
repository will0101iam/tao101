const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { JSDOM } = require("jsdom");

function loadBlocksApi() {
  const source = fs.readFileSync(path.join(__dirname, "..", "admin-blocks.js"), "utf8");
  const dom = new JSDOM("<!doctype html><body></body>");
  const sandbox = {
    DOMParser: dom.window.DOMParser,
    document: dom.window.document,
    module: { exports: {} },
    window: {},
  };

  vm.runInNewContext(source, sandbox, { filename: "admin-blocks.js" });
  return sandbox.module.exports;
}

const blocksApi = loadBlocksApi();

function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

{
  const blocks = blocksApi.htmlToBlocks(`
    <h2>Section Title</h2>
    <p>Hello <strong>world</strong></p>
    <blockquote>Quoted idea</blockquote>
    <ul><li>One</li><li>Two</li></ul>
    <figure><img src="https://example.com/a.png" alt="A" /><figcaption>Caption</figcaption></figure>
    <hr />
    <pre><code>const answer = 42;</code></pre>
  `);

  assert.deepEqual(
    plain(blocks.map((block) => block.type)),
    ["heading", "paragraph", "quote", "list", "image", "divider", "code"],
  );
  assert.equal(blocks[0].level, 2);
  assert.equal(blocks[1].html, "Hello <strong>world</strong>");
  assert.deepEqual(plain(blocks[3].items), ["One", "Two"]);
  assert.equal(blocks[4].src, "https://example.com/a.png");
  assert.equal(blocks[4].caption, "Caption");
  assert.equal(blocks[6].code, "const answer = 42;");
}

{
  const html = blocksApi.blocksToHtml([
    { type: "heading", level: 3, html: "Nested Idea" },
    { type: "paragraph", html: "Body <em>copy</em>" },
    { type: "quote", html: "A quote" },
    { type: "list", items: ["First", "Second"] },
    { type: "image", src: "https://example.com/b.png", alt: "B", caption: "Image caption" },
    { type: "divider" },
    { type: "code", code: "console.log('ok');" },
  ]);

  assert.match(html, /<h3>Nested Idea<\/h3>/);
  assert.match(html, /<p>Body <em>copy<\/em><\/p>/);
  assert.match(html, /<blockquote>A quote<\/blockquote>/);
  assert.match(html, /<ul><li>First<\/li><li>Second<\/li><\/ul>/);
  assert.match(html, /<figure><img src="https:\/\/example.com\/b.png" alt="B" loading="lazy" decoding="async" referrerpolicy="no-referrer"><figcaption>Image caption<\/figcaption><\/figure>/);
  assert.match(html, /<hr>/);
  assert.match(html, /<pre><code>console\.log\(&#039;ok&#039;\);<\/code><\/pre>/);
}

{
  const commands = blocksApi.getSlashCommands();
  const ids = commands.map((command) => command.id);

  assert.deepEqual(plain(ids), ["paragraph", "heading-2", "heading-3", "quote", "bullet-list", "image", "divider", "code"]);
  assert.equal(commands.some((command) => command.id === "bold"), false);
  assert.equal(commands.some((command) => command.id === "italic"), false);
}

console.log("admin-blocks tests passed");
