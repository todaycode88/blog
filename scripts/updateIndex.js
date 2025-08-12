const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");

// Find newest post in /post
const postDir = path.join(__dirname, "../post");
const files = fs.readdirSync(postDir)
  .filter(f => f.endsWith(".html"))
  .map(f => ({ name: f, time: fs.statSync(path.join(postDir, f)).mtime }))
  .sort((a, b) => b.time - a.time);

if (!files.length) {
  console.log("No post found.");
  process.exit(0);
}

const latestPostPath = path.join(postDir, files[0].name);
const postHtml = fs.readFileSync(latestPostPath, "utf-8");
const $post = cheerio.load(postHtml);

const title = $post("title").text().trim() || "Untitled Post";
const description = $post("p").first().text().trim() || "Read more...";
const imageUrl = $post("img").first().attr("src") || "https://via.placeholder.com/400x300";
const overlayText = title;
const postLink = `post/${files[0].name}`;
const fullContent = $post("body").html().replace(/"/g, '&quot;').trim();

// Read index.html
const indexPath = path.join(__dirname, "../index.html");
const indexHtml = fs.readFileSync(indexPath, "utf-8");
const $index = cheerio.load(indexHtml);

// Create new card HTML
const newCard = `
<div class="col-md-4 mb-4 blog-post" data-page="1">
    <div class="card">
        <div class="card-img-top">
            <img src="${imageUrl}" class="img-fluid" alt="${overlayText}" loading="lazy">
            <div class="card-img-overlay">${overlayText}</div>
        </div>
        <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${description}</p>
            <a href="${postLink}" class="btn btn-custom read-more" data-bs-toggle="modal" data-bs-target="#postModal" data-title="${title}" data-content="${fullContent}">Read More</a>
            <div class="social-share mt-3">
                <a href="#"><i class="fab fa-twitter"></i></a>
                <a href="#"><i class="fab fa-facebook-f"></i></a>
                <a href="#"><i class="fab fa-pinterest"></i></a>
            </div>
        </div>
    </div>
</div>
`;

// Insert at top of .row containing posts
const rowDiv = $index(".row").first();
rowDiv.prepend(newCard);

// Save file
fs.writeFileSync(indexPath, $index.html(), "utf-8");

console.log(`✅ Added latest post "${title}" to index.html`);
