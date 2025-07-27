const fs = require("fs");
const path = require("path");

// Config: Edit these extensions
const FOLDERS = {
  js: [".js", ".mjs"],
  css: [".css"],
  images: [".png", ".jpg", ".jpeg", ".gif", ".svg"],
};

function organizeFiles() {
  fs.readdirSync(".").forEach((filename) => {
    if (filename === path.basename(__filename)) return; // Skip this script

    for (const [folder, extensions] of Object.entries(FOLDERS)) {
      if (extensions.some((ext) => filename.endsWith(ext))) {
        fs.mkdirSync(folder, { recursive: true });
        fs.renameSync(filename, path.join(folder, filename));
        console.log(`Moved: ${filename} → ${folder}/`);
        break;
      }
    }
  });
}

organizeFiles();
console.log("✅ Done organizing files!");