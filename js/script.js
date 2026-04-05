// Mosaic Threads - Knitting Pattern Generator
// Full functional JavaScript

let currentImageData = null;
let currentPattern = null;

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    // Set up event listeners
    const uploadInput = document.getElementById('imageUpload');
    if (uploadInput) {
        uploadInput.addEventListener('change', handleImageUpload);
    }
    
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generatePattern);
    }
    
    // Set up palette buttons
    const paletteButtons = document.querySelectorAll('.palette-btn');
    paletteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            selectPalette(this.dataset.palette);
        });
    });
});

// Handle image upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Create canvas to process image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Resize image to reasonable size for processing
            const maxSize = 200;
            let width = img.width;
            let height = img.height;
            
            if (width > height && width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            } else if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get image data
            currentImageData = ctx.getImageData(0, 0, width, height);
            
            // Show preview
            const previewContainer = document.getElementById('imagePreview');
            if (previewContainer) {
                previewContainer.innerHTML = '';
                const previewImg = document.createElement('img');
                previewImg.src = e.target.result;
                previewImg.style.maxWidth = '100%';
                previewImg.style.maxHeight = '200px';
                previewContainer.appendChild(previewImg);
            }
            
            showMessage('Image uploaded successfully! Click Generate Pattern.');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Generate knitting pattern
function generatePattern() {
    if (!currentImageData) {
        showMessage('Please upload an image first!', 'error');
        return;
    }
    
    // Get settings
    const stitchesPerInch = document.getElementById('stitchesPerInch')?.value || 5;
    const yarnWeight = document.getElementById('yarnWeight')?.value || 'worsted';
    
    // Convert image to pattern grid
    const pattern = imageToPattern(currentImageData);
    currentPattern = pattern;
    
    // Display the pattern grid
    displayPatternGrid(pattern);
    
    // Generate written instructions
    generateWrittenInstructions(pattern);
    
    showMessage(`Pattern generated! Grid size: ${pattern.width} x ${pattern.height} stitches`);
}

// Convert image data to pattern grid
function imageToPattern(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    const pattern = [];
    const colorMap = {};
    let colorIndex = 0;
    
    for (let y = 0; y < height; y++) {
        pattern[y] = [];
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            
            // Simplify color (reduce to nearest basic color)
            const simpleColor = simplifyColor(r, g, b);
            
            // Map color to index
            if (!colorMap[simpleColor]) {
                colorMap[simpleColor] = colorIndex++;
            }
            
            pattern[y][x] = {
                color: simpleColor,
                index: colorMap[simpleColor]
            };
        }
    }
    
    return {
        grid: pattern,
        width: width,
        height: height,
        colorMap: colorMap,
        uniqueColors: colorIndex
    };
}

// Simplify RGB to basic knitting colors
function simplifyColor(r, g, b) {
    // Basic color categories
    if (r > 200 && g < 100 && b < 100) return '#CC3333'; // Red
    if (r > 200 && g > 150 && b < 100) return '#FF9933'; // Orange
    if (r > 200 && g > 200 && b < 100) return '#FFD700'; // Yellow
    if (r < 100 && g > 150 && b < 100) return '#339933'; // Green
    if (r < 100 && g < 150 && b > 200) return '#3366CC'; // Blue
    if (r > 150 && g < 100 && b > 150) return '#993399'; // Purple
    if (r > 150 && g > 100 && b > 150) return '#CC99CC'; // Pink
    if (r < 80 && g < 80 && b < 80) return '#333333'; // Dark/Black
    if (r > 200 && g > 200 && b > 200) return '#EEEEEE'; // White/Cream
    
    const avg = (r + g + b) / 3;
    if (avg > 150) return '#DDCCAA'; // Beige/Tan
    if (avg > 100) return '#998866'; // Brown
    return '#666666'; // Gray
}

// Display pattern as grid on the page
function displayPatternGrid(pattern) {
    const container = document.getElementById('patternGrid');
    if (!container) return;
    
    container.innerHTML = '';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${Math.min(pattern.width, 30)}, 20px)`;
    container.style.gap = '1px';
    container.style.marginTop = '20px';
    container.style.overflowX = 'auto';
    
    // Limit display to reasonable size
    const displayHeight = Math.min(pattern.height, 30);
    const displayWidth = Math.min(pattern.width, 30);
    
    for (let y = 0; y < displayHeight; y++) {
        for (let x = 0; x < displayWidth; x++) {
            const cell = document.createElement('div');
            const color = pattern.grid[y][x].color;
            cell.style.width = '20px';
            cell.style.height = '20px';
            cell.style.backgroundColor = color;
            cell.style.border = '1px solid #ddd';
            cell.title = `Row ${y + 1}, Stitch ${x + 1}: ${color}`;
            container.appendChild(cell);
        }
    }
    
    // Add note if pattern was truncated
    if (pattern.width > 30 || pattern.height > 30) {
        const note = document.createElement('div');
        note.style.gridColumn = '1/-1';
        note.style.textAlign = 'center';
        note.style.fontSize = '12px';
        note.style.padding = '10px';
        note.textContent = `Showing preview (${displayWidth}×${displayHeight}). Full pattern: ${pattern.width}×${pattern.height} stitches.`;
        container.appendChild(note);
    }
}

// Generate written knitting instructions
function generateWrittenInstructions(pattern) {
    const container = document.getElementById('writtenInstructions');
    if (!container) return;
    
    let html = '<h3>Knitting Instructions</h3>';
    html += `<p>Grid size: ${pattern.width} stitches wide × ${pattern.height} rows tall</p>`;
    html += `<p>Colors needed: ${pattern.uniqueColors}</p>`;
    html += '<div style="max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 12px;">';
    
    // Generate row-by-row instructions (simplified for preview)
    for (let y = 0; y < Math.min(pattern.height, 20); y++) {
        const rowColors = [];
        for (let x = 0; x < Math.min(pattern.width, 40); x++) {
            const color = pattern.grid[y][x].color;
            let symbol = '●';
            if (color === '#CC3333') symbol = 'R';
            else if (color === '#339933') symbol = 'G';
            else if (color === '#3366CC') symbol = 'B';
            else if (color === '#FFD700') symbol = 'Y';
            else if (color === '#333333') symbol = 'K';
            else if (color === '#EEEEEE') symbol = 'W';
            else symbol = '▪';
            rowColors.push(symbol);
        }
        html += `<div>Row ${y + 1}: ${rowColors.join(' ')}</div>`;
    }
    
    if (pattern.height > 20) {
        html += `<div>... and ${pattern.height - 20} more rows</div>`;
    }
    
    html += '</div>';
    html += '<p><strong>Tip:</strong> Each symbol represents one stitch. Use the color key above to match yarn colors.</p>';
    
    container.innerHTML = html;
}

// Select color palette
function selectPalette(paletteName) {
    const palettes = {
        'rose': ['#CC3333', '#FF6699', '#FF9999', '#993333'],
        'earth': ['#8B7355', '#A0896C', '#C4A882', '#6B5B3D'],
        'morning': ['#FFF8DC', '#FFFACD', '#FAF0E6', '#F5DEB3'],
        'ocean': ['#3366CC', '#3399FF', '#66CCFF', '#003366'],
        'forest': ['#339933', '#66CC66', '#99CC66', '#336633']
    };
    
    const selected = palettes[paletteName];
    if (selected) {
        showMessage(`Selected ${paletteName} palette. Regenerate pattern to see changes.`);
    }
}

// Show status messages
function showMessage(msg, type = 'info') {
    const msgContainer = document.getElementById('statusMessage');
    if (!msgContainer) {
        // Create temporary alert if no container
        console.log(msg);
        return;
    }
    
    msgContainer.textContent = msg;
    msgContainer.style.padding = '10px';
    msgContainer.style.margin = '10px 0';
    msgContainer.style.borderRadius = '5px';
    
    if (type === 'error') {
        msgContainer.style.backgroundColor = '#ffeeee';
        msgContainer.style.color = '#cc0000';
        msgContainer.style.border = '1px solid #cc0000';
    } else {
        msgContainer.style.backgroundColor = '#eeffee';
        msgContainer.style.color = '#006600';
        msgContainer.style.border = '1px solid #006600';
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
        if (msgContainer) {
            msgContainer.style.backgroundColor = '';
            msgContainer.textContent = '';
        }
    }, 3000);
}
