const fs = require('fs');
const cheerio = require('cheerio');

const postsPath = 'src/data/posts.json';
const posts = JSON.parse(fs.readFileSync(postsPath, 'utf-8'));

posts.forEach(post => {
  const $ = cheerio.load(post.content);
  
  // Remove all style attributes from text elements to let our CSS take over
  $('*').removeAttr('style');
  $('*').removeAttr('class');
  $('*').removeAttr('data-style');
  
  // WeChat often wraps text in multiple spans. Let's just keep the structure but clean attributes
  // Remove empty spans or sections if possible, but just removing styles is usually enough
  
  // Update the content
  post.content = $.html();
});

fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2));
console.log("Successfully cleaned inline styles from all posts.");
