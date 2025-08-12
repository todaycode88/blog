import os
import time
from bs4 import BeautifulSoup
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

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
    
    posts.sort(reverse=True, key=lambda x: x['filename'])  # latest first
    
    html_content = "<html><head><title>My Blog</title></head><body>"
    html_content += "<h1>Blog Posts</h1><ul>"
    for post in posts:
        html_content += f"<li><a href='post/{post['filename']}'>{post['title']}</a></li>"
    html_content += "</ul></body></html>"
    
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        f.write(html_content)
    
    print("✅ index.html updated!")

class Watcher(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith(".html"):
            print("📄 Change detected, updating index...")
            build_index()

    def on_created(self, event):
        if event.src_path.endswith(".html"):
            print("📄 New file detected, updating index...")
            build_index()

if __name__ == "__main__":
    build_index()  # initial build
    event_handler = Watcher()
    observer = Observer()
    observer.schedule(event_handler, POSTS_DIR, recursive=False)
    observer.start()
    print(f"👀 Watching '{POSTS_DIR}' for changes...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
