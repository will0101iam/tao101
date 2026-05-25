const fs = require('fs');
const https = require('https');
const cheerio = require('cheerio');

const articles = JSON.parse(fs.readFileSync('nlp_agent_all_db.json', 'utf-8'));
const postsData = [];

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

// Function to wait
const delay = ms => new Promise(res => setTimeout(res, ms));

(async () => {
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    console.log(`[${i+1}/${articles.length}] Fetching ${article.title}...`);
    try {
      const html = await fetchArticle(article.url);
      const $ = cheerio.load(html);
      
      const contentDiv = $('#js_content');
      if (contentDiv.length) {
        // Replace data-src with src and add referrerpolicy
        contentDiv.find('img').each((_, img) => {
          const $img = $(img);
          const dataSrc = $img.attr('data-src');
          if (dataSrc) {
            $img.attr('src', dataSrc);
            $img.attr('referrerpolicy', 'no-referrer');
            $img.removeAttr('data-src');
          }
        });
        
        // Remove hidden visibility
        contentDiv.css('visibility', 'visible');
        contentDiv.css('opacity', '1');
        
        const htmlContent = contentDiv.html().trim();
        
        // Extract publish date if possible
        let date = "Unknown Date";
        const dateMatch = html.match(/var ct = "([^"]+)";/); // WeChat uses `var ct = "167...` for timestamp
        if (dateMatch) {
            const timestamp = parseInt(dateMatch[1]) * 1000;
            date = new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } else {
            // Check for other date formats or default to today
            date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        
        postsData.push({
          id: i + 1, // Simple incremental ID
          title: article.title,
          url: article.url,
          date: date,
          excerpt: htmlContent.replace(/<[^>]+>/g, '').slice(0, 150) + '...',
          content: htmlContent
        });
      } else {
        console.log(`  -> Warning: No content found for ${article.url}`);
      }
      
      // Be nice to WeChat servers
      await delay(500);
    } catch (e) {
      console.error(`  -> Error fetching ${article.url}:`, e.message);
    }
  }
  
  fs.writeFileSync('src/data/posts.json', JSON.stringify(postsData, null, 2));
  console.log(`\nSuccessfully scraped ${postsData.length} articles to src/data/posts.json`);
})();
