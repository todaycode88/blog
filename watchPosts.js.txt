const chokidar = require("chokidar");
const { exec } = require("child_process");

console.log("👀 Watching for new posts...");

chokidar.watch("post/*.html").on("add", (filePath) => {
    console.log(`📄 New post detected: ${filePath}`);
    exec("node updateIndex.js", (err, stdout, stderr) => {
        if (err) {
            console.error("❌ Error updating index:", err);
            return;
        }
        console.log(stdout);
    });
});
