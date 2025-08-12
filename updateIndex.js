const fs = require("fs");
const path = require("path");

const postsDir = path.join(__dirname, "post");
const indexFile = path.join(__dirname, "index.html");

function getLatestPost() {
    const files = fs.readdirSync(postsDir)
        .filter(file => file.endsWith(".html"))
        .map(file => ({
            name: file,
            time: fs.statSync(path.join(postsDir, file)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time);

    if (files.length === 0) return null;

    const latestFile = files[0].name;
    const content = fs.readFileSync(path.join(postsDir, latestFile), "utf-8");

    const titleMatch = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const title = titleMatch ? titleMatch[1] : latestFile;

    const descMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);
    const description = descMatch ? descMatch[1] : "";

    return { latestFile, title, description };
}

function updateIndex() {
    const latestPost = getLatestPost();
    if (!latestPost) {
        console.log("No posts found.");
        return;
    }

    let indexContent = fs.readFileSync(indexFile, "utf-8");

    const newCard = `
    <!-- Auto-added latest post -->
    <div class="col-md-4 mb-4 blog-post" data-page="1">
        <div class="card">
            <div class="card-img-top">
                <img src="https://via.placeholder.com/400x200" class="img-fluid" alt="${latestPost.title}">
                <div class="card-img-overlay">${latestPost.title}</div>
            </div>
            <div class="card-body">
                <h5 class="card-title">${latestPost.title}</h5>
                <p class="card-text">${latestPost.description}</p>
                <a href="post/${latestPost.latestFile}" class="btn btn-custom">Read More</a>
            </div>
        </div>
    </div>
    `;

    // Replace existing latest post block
    if (indexContent.includes("<!-- Auto-added latest post -->")) {
        indexContent = indexContent.replace(/<!-- Auto-added latest post -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, newCard);
    } else {
        indexContent = indexContent.replace("</div>\n</div>", `${newCard}\n</div>\n</div>`);
    }

    fs.writeFileSync(indexFile, indexContent, "utf-8");
    console.log(`✅ Index updated with latest post: ${latestPost.title}`);
}

updateIndex();
