import os
import shutil
import time

# ===== CONFIGURATION =====
FOLDERS = {
    "js": [".js", ".mjs"],
    "css": [".css"],
    "images": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
}
MAX_RETRIES = 2  # For retrying failed file operations

# ===== CORE FUNCTIONS =====
def handle_errors(filename, folder):
    """Move files with error handling and retries."""
    for attempt in range(MAX_RETRIES):
        try:
            shutil.move(filename, os.path.join(folder, filename))
            print(f"Moved: {filename} → {folder}/")
            return True
        except FileNotFoundError:
            print(f"⚠️ Skipped (file not found): {filename}")
            break
        except PermissionError:
            if attempt == MAX_RETRIES - 1:
                print(f"⚠️ Skipped (permission denied after {MAX_RETRIES} tries): {filename}")
            time.sleep(1)
        except Exception as e:
            print(f"⚠️ Unexpected error with {filename}: {str(e)}")
            break
    return False

def organize_files():
    """Move files to organized folders."""
    for filename in os.listdir("."):
        if filename == os.path.basename(__file__):
            continue
        
        for folder, extensions in FOLDERS.items():
            if any(filename.endswith(ext) for ext in extensions):
                os.makedirs(folder, exist_ok=True)
                handle_errors(filename, folder)
                break

def update_html_paths():
    """Update HTML/CSS paths after moving files."""
    for filename in os.listdir("."):
        if filename.endswith(".html"):
            with open(filename, "r+") as f:
                content = f.read()
                # Fix <script> and <link> tags
                for folder, extensions in FOLDERS.items():
                    for ext in extensions:
                        content = content.replace(
                            f'src="{filename}"',
                            f'src="{folder}/{filename}"'
                        )
                        content = content.replace(
                            f'href="{filename}"',
                            f'href="{folder}/{filename}"'
                        )
                f.seek(0)
                f.write(content)
                f.truncate()
            print(f"Updated paths in: {filename}")

# ===== MAIN EXECUTION =====
if __name__ == "__main__":
    print("🚀 Starting file organization...")
    organize_files()
    update_html_paths()
    print("✅ All done! Project is now organized.")