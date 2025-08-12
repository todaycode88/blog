const fs = require('fs');
const cheerio = require('cheerio');
const path = require('path');

// Get all posts
const postDir = path.join(__dirname, 'post');
const files = fs.readdirSync(postDir)
  .filter(f => f.endsWith('.html'))
  .sort((a, b) => fs.statSync(path.join(postDir, b)).mtime - fs.statSync(path.join(postDir, a)).mtime);

if (files.length === 0) {
  console.log("❌ No post found");
  process.exit(0);
}

const latestFile = files[0];
const latestPath = path.join(postDir, latestFile);
const postHtml = fs.readFileSync(latestPath, 'utf8');
const $post = cheerio.load(postHtml);

// Extract fields from post
const title = $post('title').text().trim() || 'Untitled Post';
const image = $post('img').first().attr('src') || 'https://via.placeholder.com/300x200';
const description = $post('p').first().text().trim() || '';
const link = `post/${latestFile}`;

console.log(`🆕 Latest post: ${latestFile}`);
console.log(`Title: ${title}`);
console.log(`Image: ${image}`);
console.log(`Description: ${description}`);

// Load index.html
const indexHtmlPath = path.join(__dirname, 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
const $index = cheerio.load(indexHtml);

// Create new card HTML
const newCard = `
<div class="col-md-4 mb-4 blog-post" data-page="1">
  <div class="card">
    <div class="card-img-top">
      <img src="${image}" class="img-fluid" alt="${title}" loading="lazy">
      <div class="card-img-overlay">${title}</div>
    </div>
    <div class="card-body">
      <h5 class="card-title">${title}</h5>
      <p class="card-text">${description}</p>
      <a href="${link}" class="btn btn-custom read-more">Read More</a>
    </div>
  </div>
</div>
`;

// Insert card at top
$index('.blog-post').first().before(newCard);

// Save changes
fs.writeFileSync(indexHtmlPath, $index.html(), 'utf8');
console.log("✅ index.html updated with latest post");
