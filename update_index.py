import os
from bs4 import BeautifulSoup

POSTS_DIR = "post"
INDEX_FILE = "index.html"

def get_post_metadata(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")
    title = soup.title.string if soup.title else os.path.basename(file_path)
    return {
        "title": title,
        "filename": os.path.basename(file_path)
    }

def build_index():
    posts = []
    for filename in os.listdir(POSTS_DIR):
        if filename.endswith(".html"):
            filepath = os.path.join(POSTS_DIR, filename)
            posts.append(get_post_metadata(filepath))
    
    # Sort by filename (latest first)
    posts.sort(reverse=True, key=lambda x: x['filename'])
    
    # Build HTML
    html_content = "<html><head><title>My Blog</title></head><body>"
    html_content += "<h1>Blog Posts</h1><ul>"
    for post in posts:
        html_content += f"<li><a href='post/{post['filename']}'>{post['title']}</a></li>"
    html_content += "</ul></body></html>"
    
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print("index.html updated!")

if __name__ == "__main__":
    build_index()
