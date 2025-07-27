import os
import shutil

# Config: Edit these to match your file extensions
FOLDERS = {
    "js": [".js", ".mjs"],
    "css": [".css"],
    "images": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
}

def organize_files():
    for filename in os.listdir("."):
        if filename == os.path.basename(__file__):  # Skip this script
            continue
        
        for folder, extensions in FOLDERS.items():
            if any(filename.endswith(ext) for ext in extensions):
                os.makedirs(folder, exist_ok=True)
                shutil.move(filename, os.path.join(folder, filename))
                print(f"Moved: {filename} → {folder}/")
                break

def update_html_paths():
    for filename in os.listdir("."):
        if filename.endswith(".html"):
            with open(filename, "r+") as f:
                content = f.read()
                # Fix paths for moved files
                for folder in FOLDERS.keys():
                    content = content.replace(
                        f'src="{filename}"',          # Old path (e.g., src="script.js")
                        f'src="{folder}/{filename}"'  # New path (e.g., src="js/script.js")
                    )
                f.seek(0)
                f.write(content)
                f.truncate()
            print(f"Updated paths in: {filename}")

if __name__ == "__main__":
    organize_files()
    update_html_paths()  # Call the bonus function here
    print("✅ Done organizing files and updating HTML!")