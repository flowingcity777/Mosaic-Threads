document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const imageUpload = document.getElementById('imageUpload');
    const patternControls = document.getElementById('patternControls');
    const generatePatternBtn = document.getElementById('generatePattern');
    const patternPreview = document.getElementById('patternPreview');
    const patternCanvas = document.getElementById('patternCanvas');
    const downloadBtn = document.getElementById('downloadPattern');
    const paletteGrid = document.getElementById('paletteGrid');
    const instructionsContent = document.getElementById('instructionsContent');
    const downloadPDFBtn = document.getElementById('downloadPDF');
    // Auth Elements
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const signupBtn = document.getElementById('signupBtn');
    const loginBtn = document.getElementById('loginBtn');

    // Sign Up (Free Forever)
    signupBtn.addEventListener('click', () => {
      const email = emailInput.value;
      const password = passwordInput.value;
  
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
          alert("Welcome! Your account is ready.");
        })
        .catch((error) => {
          alert("Oops: " + error.message); // e.g., "Weak password"
        });
    });

    // Yarn Color Palettes (Name + Hex Colors)
    const yarnPalettes = {
      "Rose Garden": ["#f8d5d5", "#e6a8a8", "#d48a8a", "#a15e5e", "#6e3b3b"],
      "Ocean Blues": ["#d2e3f0", "#a3c4d8", "#7a9eb8", "#4f718a", "#30495d"],
      "Forest Greens": ["#d5e8d5", "#a8c9a8", "#7da57d", "#5e7a5e", "#3b4e3b"],
      "Earth Tones": ["#d4c8b0", "#a89f84", "#7d755d", "#5a5340", "#3a3526"],
      "Sunset Glow": ["#f0e6d2", "#d8c9a3", "#b8a57a", "#8a794f", "#5d4e30"]
    };
    
    let uploadedImage = null;
    let activePalette = "Rose Garden";
    
    // Initialize Palette Grid
    function initPalettes() {
        paletteGrid.innerHTML = '';

        // Generate cards for each palette
        Object.entries(yarnPalettes).forEach(([paletteName, colors]) => {
        // Create card element
        const card = document.createElement('div');
        card.className = 'palette-card';
        card.dataset.palette = paletteName;
    
        // Build inner HTML (swatches + name)
        card.innerHTML = `
         <div class="palette-swatches">
        ${colors.map(color => `
          <div 
            style="background: ${color};" 
            title="${color.toUpperCase()}"
          ></div>
        `).join('')}
      </div>
      <div class="palette-name">${paletteName}</div>
    `;

    // Add click handler for selection
    card.addEventListener('click', () => {
      // Remove active class from all cards
      document.querySelectorAll('.palette-card').forEach(c => {
        c.classList.remove('active');
      });
      
      // Mark this card as active
      card.classList.add('active');
      
      // Update global active palette
      activePalette = paletteName;
      
      // Optional: Trigger a preview update
      if (uploadedImage) updatePatternPreview(); 
    });

    // Add to DOM
    paletteGrid.appendChild(card);
  });

  // Activate first palette by default
  document.querySelector('.palette-card')?.classList.add('active');
}
    
    // Find closest yarn color (simple RGB distance)
    function findClosestYarnColor(pixel, palette) {
        const [r, g, b] = pixel;
        let minDistance = Infinity;
        let closestColor = palette[0];
        
        palette.forEach(color => {
            const hex = color.startsWith('#') ? color : `#${color}`;
            const cr = parseInt(hex.slice(1, 3), 16);
            const cg = parseInt(hex.slice(3, 5), 16);
            const cb = parseInt(hex.slice(5, 7), 16);
            
            const distance = Math.sqrt(
                Math.pow(r - cr, 2) + 
                Math.pow(g - cg, 2) + 
                Math.pow(b - cb, 2)
            );
            
            if (distance < minDistance) {
                minDistance = distance;
                closestColor = hex;
            }
        });
        
        return closestColor;
    }
    
    // Draw grid on canvas
    function drawGrid(ctx, width, height, gridSize) {
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    
    // Generate knitting instructions
    function generateInstructions(canvas, palette) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const gridSize = parseInt(document.getElementById('gridSize').value);
        const colors = yarnPalettes[activePalette];
        
        let instructions = `Pattern using ${activePalette} palette:\n\n`;
        let stitchCount = 0;
        
        for (let y = 0; y < height; y += gridSize) {
            let rowInstructions = `Row ${Math.floor(y/gridSize)+1}: `;
            let currentStitch = '';
            let currentCount = 0;
            
            for (let x = 0; x < width; x += gridSize) {
                const pixelData = ctx.getImageData(x, y, 1, 1).data;
                const hexColor = rgbToHex(pixelData[0], pixelData[1], pixelData[2]);
                const closestColor = findClosestYarnColor([pixelData[0], pixelData[1], pixelData[2]], colors);
                const colorIndex = colors.indexOf(closestColor);
                const stitchSymbol = colorIndex >= 0 ? colorIndex + 1 : '?'; // Use numbers for colors
                
                if (stitchSymbol === currentStitch) {
                    currentCount++;
                } else {
                    if (currentCount > 0) {
                        rowInstructions += `${currentStitch}(${currentCount}) `;
                        stitchCount += currentCount;
                    }
                    currentStitch = stitchSymbol;
                    currentCount = 1;
                }
            }
            
            // Add the last stitch group
            rowInstructions += `${currentStitch}(${currentCount})\n`;
            stitchCount += currentCount;
            
            instructions += rowInstructions;
        }
        
        instructions += `\nTotal stitches: ${stitchCount}`;
        return instructions;
    }
    
    // Helper: RGB to Hex
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }
    
    // Handle image upload
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                uploadedImage = new Image();
                uploadedImage.onload = function() {
                    patternControls.style.display = 'block';
                };
                uploadedImage.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    //Generate PDF file
    function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(140, 106, 86); // Yarn color
    doc.text('Knitting Pattern Instructions', 105, 20, { align: 'center' });
    
    // Palette info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Yarn Palette: ${activePalette}`, 14, 30);
    
    // Instructions
    const instructions = instructionsContent.textContent;
    doc.setFont('courier'); // Monospace for pattern
    doc.setFontSize(10);
    doc.text(instructions, 14, 40, { maxWidth: 180 });
    
    // Save
    doc.save(`knitting-pattern-${new Date().getTime()}.pdf`);
}
    
// Add event listener
downloadPDFBtn.addEventListener('click', generatePDF);
        
    // Generate pattern button
    generatePatternBtn.addEventListener('click', function() {
        if (!uploadedImage) return;
        
        // Set canvas dimensions
        const width = Math.min(uploadedImage.width, 800);
        const height = (uploadedImage.height / uploadedImage.width) * width;
        
        patternCanvas.width = width;
        patternCanvas.height = height;
        
        const ctx = patternCanvas.getContext('2d');
        ctx.drawImage(uploadedImage, 0, 0, width, height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const colors = yarnPalettes[activePalette];
        
        // Color reduction to yarn palette
        for (let i = 0; i < data.length; i += 4) {
            const pixelColor = [data[i], data[i+1], data[i+2]];
            const hexColor = findClosestYarnColor(pixelColor, colors);
            
            // Convert hex to RGB
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            
            data[i] = r;     // R
            data[i+1] = g;   // G
            data[i+2] = b;   // B
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Draw grid if enabled
        if (document.getElementById('showGrid').checked) {
            const gridSize = parseInt(document.getElementById('gridSize').value);
            drawGrid(ctx, width, height, gridSize);
        }
        
        // Generate instructions
        instructionsContent.textContent = generateInstructions(patternCanvas, activePalette);
        
        // Show preview
        patternPreview.style.display = 'block';
    });
    
    // Download pattern
    downloadBtn.addEventListener('click', function() {
        const link = document.createElement('a');
        link.download = `knitting-pattern-${new Date().getTime()}.png`;
        link.href = patternCanvas.toDataURL('image/png');
        link.click();
    });
    
    // Initialize
    initPalettes();
});

// Log In
loginBtn.addEventListener('click', () => {
  firebase.auth().signInWithEmailAndPassword(emailInput.value, passwordInput.value)
    .catch((error) => {
      alert("Error: " + error.message);
    });
});

// Listen for Auth State (Save Patterns)
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log("User logged in:", user.uid);
    // Save patterns to user’s account here later!
  }
});

// Update copyright year automatically
document.getElementById('current-year').textContent = new Date().getFullYear();
