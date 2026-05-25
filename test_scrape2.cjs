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
  const html = await fetchArticle('https://mp.weixin.qq.com/s/IBcSjuXRv0HPhQXhTE8Tcw');
  fs.writeFileSync('test_full.html', html);
  console.log("Saved full HTML, length:", html.length);
})();
