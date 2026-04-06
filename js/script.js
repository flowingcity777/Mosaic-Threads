// Mosaic Threads - Knitting Pattern Generator
// Simplified working version

// Make sure everything runs after page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - JavaScript is working!');
    
    // Set up image upload
    const uploadInput = document.getElementById('imageUpload');
    if (uploadInput) {
        uploadInput.addEventListener('change', handleImageUpload);
        console.log('Upload listener added');
    } else {
        console.error('Could not find imageUpload element');
    }
    
    // Set up generate button - THIS IS THE KEY FIX
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generatePattern);
        console.log('Generate button listener added');
    } else {
        console.error('Could not find generateBtn element');
    }
    
    // Set up palette buttons
    const paletteBtns = document.querySelectorAll('.palette-btn');
    paletteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const palette = this.getAttribute('data-palette');
            showMessage(`Selected ${palette} palette`, 'info');
        });
    });
});

// Store uploaded image
let uploadedImageData = null;

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('File uploaded:', file.name);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Store image data
            uploadedImageData = img;
            
            // Show preview
            const previewDiv = document.getElementById('imagePreview');
            if (previewDiv) {
                previewDiv.innerHTML = '';
                const previewImg = document.createElement('img');
                previewImg.src = e.target.result;
                previewImg.style.maxWidth = '100%';
                previewImg.style.maxHeight = '200px';
                previewImg.style.borderRadius = '10px';
                previewDiv.appendChild(previewImg);
            }
            
            showMessage('Image uploaded successfully! Click "Generate Pattern"', 'success');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Generate pattern - FIXED VERSION
let uploadedImageData = null;
let selectedPalette = "rose";

const PALETTES = {
    rose: [
        [210, 115, 138],
        [245, 214, 220],
        [138, 74, 92],
        [250, 240, 235]
    ],
    earth: [
        [139,115,85],
        [92, 74, 58],
        [201, 183, 160],
        [227, 216, 199]
    ],
    morning: [
        [244, 228, 193],
        [255, 248, 220],
        [214, 196, 154],
        [181, 154, 112]
    ],
    ocean: [
        [74, 139, 167],
        [40, 90, 120],
        [155, 201, 220],
        [218, 238, 245]
    ],
    forest: [
        [90, 122, 74]
        [58, 84, 46],
        [170, 191, 151],
        [222, 232, 214]
    ]
};

document.addEventListener("DOMContentLoaded", () => {
    const uploadInput = 
document.getElementById("ImageUpload");
    const generateBtn = 
document.getElementById("generateBtn");

  uploadInput?.addEventListener("change", handleImageUpload);
    generateBtn?.addEventListener("click", generatePattern);

document.querySelectorAll(".palette-btn").
forEach((btn) => {
    btn.addEventListener("click", () => {
        selectedPalette =
btn.dataset.palette;
        showMessage('Selected $ 
{btn.textContent.trim()} palette',
"info");
    });
  });
});

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            uploadedImageData = img;

            const previewDiv =
document.getElementById("imagePreview");
            if (previewDiv) {
                previewDiv.innerHTML = "";
                const previewImg = 
document.createElement("img");
                previewImg.src = e.target.result;

previewDiv.appendChild(previewImg);
            }

            showMessage('Image uploaded
successfully. Click "Generate Pattern".',
"success");
        };
        img.src = e.target.result;
    };
    reader.readAsDetaURL(file);
}
    
function generatePattern() {    
    // Check if image was uploaded
    if (!uploadedImageData) {
        showMessage('Please upload an image first!', 'error');
        return;
    }
    
    // Get settings
    const stitchesPerInch = Number(document.getElementById("stitchesPerInch")?.value || 5);
    const gridSize = 24;
    const yarnWeight = document.getElementById('yarnWeight')?.value || 'worsted';

    const pattern = 
imageToPatternGrid(uploadedImageData, gridSize, PALETTES[selectedPalette]);
    renderPattern(pattern);
    renderInstructions(pattern, stitchesPerInch);

    showMessage("Pattern generated successfully!", "success");
    }

    function imageToPatternGrid(img, gridSize, palette) {
        const canvas =
    document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = gridSize;
        canvas.height.gridSize;

        ctx.drawImage(img, 0, 0, gridSize, gridSize);

        const imageData = ctx.getImageData(0, 0, gridSize, gridSize);
        const { data } = imageData;
        const grid = [];

        for (let y = 0; y < gridSize; y++) {
            const row = [];
            for (let x = 0; x < gridSize; x++) {
                const i = (y * gridSize + x) * 4;
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                const nearest = getClosestColor([r, g, b], palette);
                row.push(nearest);
            }
            grid.push(row);
        }

        return grid;
    }

function getClosestColor([r, g, b], palette) {
    let best = palette[0];
    let bestDistance = Infinity;

    for (const color of palette) {
        const dr = r - color[0];
        const dg = g - color[1];
        const db = b - color[2];
        const distance = dr * dr + dg * dg + db * db;

        if (distance < bestDistance) {
            bestDestance = distance;
            best = color;
        }
    }
    
    return best;
}

function renderPattern(grid) {
    const patternGrid = document.getElementById("patternGrid"); 
    if (!patternGrid) return; 

    let html = '<div style = "display:grid;grid-template-columns: repeat(${grid[0].length}, 16px);gap:1px;">';

    for (const row of grid) {
        for (const color of row) {
            html += '<div style="width:16px;height:16px;background:rgb($(color[0],${color[1],${color[2]});border:1px solid #eee;"></div>';
        }
    }

    html += '</div>';
    patternGrid.innerHTML = html;
}

function renderInstructions(grid, stitchesPerInch) {
    const instructionsDiv) return;

    const width = grid[0].length;
    const height = grid.length;
    const approxWidth = (width / stitchesPerInch).toFixed(1);

    instructionsDiv.innerHTML = '
        <h3>Knitting Instructions</h3>
        <p><strong>Approximate width:</strong>${approxWidth} inches</p>
        <p><strong>Tip:</strong> Read the chart from bottom to top.</p>
         ';
}

function showMessage(msg, type = "info") {
    const msgDiv = 
document.getElementById("statusMessage");
    if (!msgDiv) return;

    msgDiv.textContent = msg;
    msgDiv.style.display = "block";
    msgDiv.style.padding = "12px";
    msgDiv.style.margin = "10px 0";
    msgDiv.style.borderRadius = "8px";

    if (type === "error" ) {
        msgDiv.style.backgroundColor = "#ffe0e0";
        msgDiv.style.color = '#cc0000";
        msgDiv.style.border = "1px solid #cc0000";
    } else if (type === "success") {
        msgDiv.style.color = "#006600";
        msgDiv.style.border = "1px solid #006600";
    } else {
        msgDiv.style.backgroundColor = "#e0e0ff";
        msgDiv.style.color = "#000066";
        msgDiv.style.border = "1px solid #000066";
    }
}
        
