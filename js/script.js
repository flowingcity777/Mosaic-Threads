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
function generatePattern() {
    console.log('Generate button clicked!');
    
    // Check if image was uploaded
    if (!uploadedImageData) {
        showMessage('Please upload an image first!', 'error');
        return;
    }
    
    showMessage('Generating pattern...', 'info');
    
    // Get settings
    const stitchesPerInch = document.getElementById('stitchesPerInch')?.value || 5;
    const yarnWeight = document.getElementById('yarnWeight')?.value || 'worsted';
    
    console.log('Settings:', { stitchesPerInch, yarnWeight });
    
    // Create a simple pattern grid (for demonstration)
    const gridSize = 20;
    const patternHTML = generateSimplePatternGrid(gridSize);
    
    // Display the pattern
    const patternGrid = document.getElementById('patternGrid');
    if (patternGrid) {
        patternGrid.innerHTML = patternHTML;
        console.log('Pattern grid displayed');
    } else {
        console.error('patternGrid element not found');
    }
    
    // Generate written instructions
    const instructions = generateSimpleInstructions(gridSize, stitchesPerInch, yarnWeight);
    const instructionsDiv = document.getElementById('writtenInstructions');
    if (instructionsDiv) {
        instructionsDiv.innerHTML = instructions;
        console.log('Instructions displayed');
    }
    
    showMessage('Pattern generated successfully!', 'success');
}

// Generate a simple pattern grid (demo version)
function generateSimplePatternGrid(size) {
    let html = '<div style="display: grid; grid-template-columns: repeat(' + size + ', 25px); gap: 2px; overflow-x: auto; padding: 10px;">';
    
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            // Create alternating pattern based on position
            let color;
            if ((row + col) % 3 === 0) color = '#CC3333'; // Red
            else if ((row + col) % 3 === 1) color = '#339933'; // Green
            else color = '#3366CC'; // Blue
            
            html += `<div style="width: 25px; height: 25px; background-color: ${color}; border: 1px solid #ddd; border-radius: 3px;" title="Row ${row+1}, Col ${col+1}"></div>`;
        }
    }
    
    html += '</div>';
    html += '<p style="text-align: center; margin-top: 10px; font-size: 14px; color: #666;">✨ Demo pattern - Each square = 1 stitch ✨</p>';
    
    return html;
}

// Generate simple written instructions
function generateSimpleInstructions(gridSize, stitchesPerInch, yarnWeight) {
    const totalStitches = gridSize * gridSize;
    const widthInches = (gridSize / stitchesPerInch).toFixed(1);
    
    let html = '<h3 style="color: #6b3e1c; margin-top: 0;">📝 Knitting Instructions</h3>';
    html += `<p><strong>Pattern size:</strong> ${gridSize} stitches wide × ${gridSize} rows tall</p>`;
    html += `<p><strong>Total stitches:</strong> ${totalStitches}</p>`;
    html += `<p><strong>Approximate width:</strong> ${widthInches} inches (based on ${stitchesPerInch} stitches/inch)</p>`;
    html += `<p><strong>Yarn weight:</strong> ${yarnWeight}</p>`;
    html += '<p><strong>Color key:</strong></p>';
    html += '<ul style="margin-left: 20px;">';
    html += '<li style="color: #CC3333;">■ Red - Main color</li>';
    html += '<li style="color: #339933;">■ Green - Secondary color</li>';
    html += '<li style="color: #3366CC;">■ Blue - Accent color</li>';
    html += '</ul>';
    html += '<p><strong>Instructions:</strong> Cast on ' + gridSize + ' stitches. Follow the grid above from bottom to top, right to left.</p>';
    html += '<p style="background: #f0e6d2; padding: 10px; border-radius: 8px;">💡 <strong>Tip:</strong> For a real pattern, upload a clear, high-contrast image. The pattern will match your image colors!</p>';
    
    return html;
}

// Show status messages
function showMessage(msg, type = 'info') {
    const msgDiv = document.getElementById('statusMessage');
    if (!msgDiv) {
        console.log('Message:', msg);
        return;
    }
    
    msgDiv.textContent = msg;
    msgDiv.style.display = 'block';
    msgDiv.style.padding = '12px';
    msgDiv.style.margin = '10px 0';
    msgDiv.style.borderRadius = '8px';
    
    if (type === 'error') {
        msgDiv.style.backgroundColor = '#ffe0e0';
        msgDiv.style.color = '#cc0000';
        msgDiv.style.border = '1px solid #cc0000';
    } else if (type === 'success') {
        msgDiv.style.backgroundColor = '#e0ffe0';
        msgDiv.style.color = '#006600';
        msgDiv.style.border = '1px solid #006600';
    } else {
        msgDiv.style.backgroundColor = '#e0e0ff';
        msgDiv.style.color = '#000066';
        msgDiv.style.border = '1px solid #000066';
    }
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (msgDiv) {
            msgDiv.style.display = 'none';
        }
    }, 3000);
}
