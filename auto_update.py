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
    
    post_list_html = ""
    for post in posts:
        post_list_html += f"<li><a href='post/{post['filename']}'>{post['title']}</a></li>\n"
    
    with open(INDEX_FILE, "r", encoding="utf-8") as f:
        index_content = f.read()
    
    start_marker = "<!-- POSTS_START -->"
    end_marker = "<!-- POSTS_END -->"
    
    before = index_content.split(start_marker)[0]
    after = index_content.split(end_marker)[-1]
    
    new_content = before + start_marker + "\n" + post_list_html + end_marker + after
    
    with open(INDEX_FILE, "w", encoding="utf-8") as f:
        f.write(new_content)
    
    print("✅ index.html updated with new post list!")

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
