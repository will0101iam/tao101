const fs = require('fs');
const cheerio = require('cheerio');

const postsPath = 'src/data/posts.json';
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

posts.forEach(post => {
  const $ = cheerio.load(post.content);
  
  // WeChat code blocks often put each line in a <code><span>line</span></code> wrapper.
  // We need to ensure they have line breaks if they are block elements.
  $('pre code').each((_, codeEl) => {
    // WeChat's format: <pre><code><span>line1</span></code><code><span>line2</span></code></pre>
    // Sometimes it's <pre><code>line1</code><code>line2</code></pre>
    // We should make sure each <code> block inside <pre> is followed by a newline, or displayed as block.
    // CSS might handle this if we make `pre code` display:block, but let's be safe.
    $(codeEl).append('\n');
  });
  
  post.content = $.html();
});

fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
console.log("Successfully fixed code block line breaks.");
