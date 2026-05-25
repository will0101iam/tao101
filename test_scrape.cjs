const fs = require('fs');
const https = require('https');

async function fetchArticle(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const html = await fetchArticle('https://mp.weixin.qq.com/s/IBcSjuXRv0HPhQXhTE8Tcw');
    // Extract title
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const title = titleMatch ? titleMatch[1] : 'No title';
    
    // Extract content
    const contentMatch = html.match(/<div class="rich_media_content.*?" id="js_content"[^>]*>([\s\S]*?)<\/div>\s*<script/);
    let content = contentMatch ? contentMatch[1] : 'No content';
    
    // Replace data-src with src and add referrerpolicy
    content = content.replace(/data-src="([^"]+)"/g, 'src="$1" referrerpolicy="no-referrer"');
    content = content.replace(/style="[^"]*visibility:\s*hidden;?[^"]*"/g, '');
    
    console.log("Title:", title);
    console.log("Content length:", content.length);
    fs.writeFileSync('test_article.html', content);
  } catch (e) {
    console.error(e);
  }
})();
