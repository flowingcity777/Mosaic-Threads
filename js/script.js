const PALETTES = {
  rose: [
    { name: "Blush", rgb: [245, 214, 220] },
    { name: "Rose", rgb: [210, 115, 138] },
    { name: "Berry", rgb: [138, 74, 92] },
    { name: "Cream", rgb: [250, 240, 235] }
  ],
  earth: [
    { name: "Sand", rgb: [227, 216, 199] },
    { name: "Clay", rgb: [201, 183, 160] },
    { name: "Moss Brown", rgb: [139, 115, 85] },
    { name: "Walnut", rgb: [92, 74, 58] }
  ],
  morning: [
    { name: "Butter", rgb: [244, 228, 193] },
    { name: "Ivory", rgb: [255, 248, 220] },
    { name: "Wheat", rgb: [214, 196, 154] },
    { name: "Honey", rgb: [181, 154, 112] }
  ],
  ocean: [
    { name: "Mist", rgb: [218, 238, 245] },
    { name: "Foam", rgb: [155, 201, 220] },
    { name: "Sea Blue", rgb: [74, 139, 167] },
    { name: "Deep Water", rgb: [40, 90, 120] }
  ],
  forest: [
    { name: "Fern", rgb: [170, 191, 151] },
    { name: "Sage", rgb: [222, 232, 214] },
    { name: "Pine", rgb: [90, 122, 74] },
    { name: "Evergreen", rgb: [58, 84, 46] }
  ]
};

let uploadedImage = null;
let selectedPalette = "rose";

document.addEventListener("DOMContentLoaded", () => {
  const uploadInput = document.getElementById("imageUpload");
  const generateBtn = document.getElementById("generateBtn");
  const paletteButtons = document.querySelectorAll(".palette-btn");
  const downloadBtn = document.getElementById("downloadBtn"); if (downloadBtn) downloadBtn.disabled = false; 
downloadBtn?.addEventListener("click", downloadPattern);

  uploadInput?.addEventListener("change", handleImageUpload);
  generateBtn?.addEventListener("click", generatePattern);

  paletteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedPalette = btn.dataset.palette;

      paletteButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      showMessage(`Selected ${btn.textContent} palette.`, "info");
    });
  });
});

function handleImageUpload(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();

    img.onload = () => {
      uploadedImage = img;
      renderPreview(e.target.result);
      showMessage('Image uploaded successfully. Click "Generate Pattern".', "success");
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

function renderPreview(src) {
  const previewDiv = document.getElementById("imagePreview");
  if (!previewDiv) return;

  previewDiv.innerHTML = "";
  const previewImg = document.createElement("img");
  previewImg.src = src;
  previewImg.alt = "Uploaded preview";
  previewImg.style.maxWidth = "100%";
  previewImg.style.maxHeight = "260px";
  previewImg.style.borderRadius = "12px";
  previewDiv.appendChild(previewImg);
}

function generatePattern() {
  if (!uploadedImage) {
    showMessage("Please upload an image first.", "error");
    return;
  }

  showMessage("Generating pattern...", "info");

  const stitchesPerInch = Number(document.getElementById("stitchesPerInch")?.value || 5);
  const yarnWeight = document.getElementById("yarnWeight")?.value || "worsted";

  const gridWidth = Number(document.getElementById("gridWidth")?.value || 40);
  const gridHeight = getScaledHeight(uploadedImage.width, uploadedImage.height, gridWidth);
  const palette = PALETTES[selectedPalette];

  //STEP 1: generate raw pattern
  let pattern = imageToPatternGrid(uploadedImage, gridWidth, gridHeight, palette);

  //STEP 2: smooth it
  pattern = smoothGrid(pattern);

  //STEP 3: render
  renderPattern(pattern);
  renderInstructions(pattern, stitchesPerInch, yarnWeight, palette);

  document.getElementById("downloadBtn").disabled = false;
  
  showMessage("Pattern generated successfully.", "success");
}

function getScaledHeight(width, height, targetWidth) {
  if (!width || !height) return targetWidth;
  return Math.max(1, Math.round((height / width) * targetWidth));
}

function imageToPatternGrid(img, gridWidth, gridHeight, palette) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  canvas.width = gridWidth;
  canvas.height = gridHeight;

  ctx.drawImage(img, 0, 0, gridWidth, gridHeight);

  const imageData = ctx.getImageData(0, 0, gridWidth, gridHeight);
  const { data } = imageData;

  const grid = [];

  for (let y = 0; y < gridHeight; y++) {
    const row = [];

    for (let x = 0; x < gridWidth; x++) {
      const i = (y * gridWidth + x) * 4;
      const pixel = [data[i], data[i + 1], data[i + 2]];
      const closest = getClosestPaletteColor(pixel, palette);
      row.push(closest);
    }

    grid.push(row);
  }

  return grid;
}

function smoothGrid(grid) {
  const height = grid.length;
  const width = grid[0].length;

  return grid.map((row, y) =>
    row.map((cell, x) => {
      const neighbors = [];

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy;
          const nx = x + dx;

          if (grid[ny] && grid[ny][nx]) {
            neighbors.push(grid[ny][nx].name);
              }
            }
          }
      
      const counts = {}; 
      neighbors.forEach(n => counts[n] = (counts[n] || 0) + 1);

      const mostCommon = Object.entries(counts)
                                  .sort((a, b) => b[1] - a[1])[0][0];

      return PALETTES[selectedPalette].find(c => c.name === mostCommon);
    })
  );
}

function getClosestPaletteColor(pixel, palette) {
  let winner = palette[0];
  let smallestDistance = Infinity;

  for (const color of palette) {
    const distance = colorDistance(pixel, color.rgb);
    if (distance < smallestDistance) {
      smallestDistance = distance;
      winner = color;
    }
  }

  return winner;
}

function colorDistance(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  
  return (0.3 * dr * dr) + (0.59 * dg * dg) + (0.11 * db * db);
}

function renderPattern(grid) {
  const patternGrid = document.getElementById("patternGrid");
  if (!patternGrid || !grid.length) return;

  const cols = grid[0].length;
  let html = `<div class="chart" style="display:grid;grid-template-columns:repeat(${cols}, 14px);gap:1px;">`;

  for (const row of grid) {
    for (const cell of row) {
      html += `
        <div
          title="${cell.name}"
          
        style="display:flex;align-items:center;
        justify-content:center;
                  width:18px;height:18px;
                  background:rgb(${cell.rgb[0]}, ${cell.rgb[1]}, ${cell.rgb[2]});
                  border:1px solid #ddd;
                  font-size:10px;
                  color:#000;">
          ${cell.name[0]}
        </div>
      `;
    }
  }

  html += `</div>`;
  patternGrid.innerHTML = html;
}

function renderInstructions(grid, stitchesPerInch, yarnWeight, palette) {
  const instructionsDiv = document.getElementById("writtenInstructions");
  if (!instructionsDiv || !grid.length) return;

  const width = grid[0].length;
  const height = grid.length;
  const widthInches = (width / stitchesPerInch).toFixed(1);

  const counts = countColors(grid);
  const legend = palette
    .map((color) => `<li><strong>${color.name}</strong>: ${counts[color.name] || 0} stitches</li>`)
    .join("");

  instructionsDiv.innerHTML = `
    <h3>Knitting Instructions</h3>
    <p><strong>Pattern size:</strong> ${width} stitches × ${height} rows</p>
    <p><strong>Approximate width:</strong> ${widthInches} inches</p>
    <p><strong>Yarn weight:</strong> ${yarnWeight}</p>
    <p><strong>How to read:</strong> Read the chart from bottom to top.</p>
    <h4>Color Usage</h4>
    <h4>Row-by-Row Chart</h4>
    <ul>${legend}</ul>
    <p style="font-family:monospace;font-size:12px;">
      ${generateRowInstructions(grid)}
    </p>
  `;
}

function generateRowInstructions(grid) {
  return grid.map((row, i) => {
    const sequence = row.map(cell =>
cell.name[0]).join(" ");
    return `Row ${i + 1}: ${sequence}`;
  }).join("<br>");
}

function countColors(grid) {
  const map = {};

  for (const row of grid) {
    for (const cell of row) {
      map[cell.name] = (map[cell.name] || 0) + 1;
    }
  }

  return map;
}

function showMessage(message, type = "info") {
  const msgDiv = document.getElementById("statusMessage");
  if (!msgDiv) return;

  msgDiv.textContent = message;
  msgDiv.style.display = "block";
  msgDiv.style.padding = "12px";
  msgDiv.style.marginTop = "12px";
  msgDiv.style.borderRadius = "10px";

  if (type === "error") {
    msgDiv.style.background = "#fde8e8";
    msgDiv.style.color = "#b42318";
    msgDiv.style.border = "1px solid #f5c2c7";
  } else if (type === "success") {
    msgDiv.style.background = "#e8f7ec";
    msgDiv.style.color = "#1d7a34";
    msgDiv.style.border = "1px solid #b7e4c7";
  } else {
    msgDiv.style.background = "#eef4ff";
    msgDiv.style.color = "#1d4ed8";
    msgDiv.style.border = "1px solid #c7d7fe";
  }
}

function downloadPattern() {  
  const gridElement = 
document.querySelector("#patternGrid .chart");
  console.log(gridElement);
  
  if (!gridElement) {
    showMessage("Generate a pattern first.", "error");
      return;
  }

  const cells = gridElement.children;
  const cols = getComputedStyle(gridElement).gridTemplateColumns.split(" ").length;
  const rows = cells.length / cols;

  const cellSize = 20;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = cols * cellSize;
  canvas.height = rows * cellSize;

  let index = 0; 

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = cells[index];
      const bg = cell.style.background;

      ctx.fillStyle = bg; 
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

          index++;
      }
    }

   const link = document.createElement("a");
    link.download = "knitting-pattern.png";
    link.href = canvas.toDataURL();
    link.click();
 }
