// script.js
import { account } from './appwrite.js';
import { uploadPatternFile, linkPatternToUser } from './userData.js';

// ===== DOM Elements =====
const imageUpload = document.getElementById('imageUpload');
const patternControls = document.getElementById('patternControls');
const generatePatternBtn = document.getElementById('generatePattern');
const patternPreview = document.getElementById('patternPreview');
const patternCanvas = document.getElementById('patternCanvas');
const downloadBtn = document.getElementById('downloadPattern');
const paletteGrid = document.getElementById('paletteGrid');
const instructionsContent = document.getElementById('instructionsContent');
const downloadPDFBtn = document.getElementById('downloadPDF');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signupBtn');
const loginBtn = document.getElementById('loginBtn');

// ===== Yarn Color Palettes =====
const yarnPalettes = {
  "Rose Garden": ["#f8d5d5", "#e6a8a8", "#d48a8a", "#a15e5e", "#6e3b3b"],
  "Ocean Blues": ["#d2e3f0", "#a3c4d8", "#7a9eb8", "#4f718a", "#30495d"],
  "Forest Greens": ["#d5e8d5", "#a8c9a8", "#7da57d", "#5e7a5e", "#3b4e3b"],
  "Earth Tones": ["#d4c8b0", "#a89f84", "#7d755d", "#5a5340", "#3a3526"],
  "Sunset Glow": ["#f0e6d2", "#d8c9a3", "#b8a57a", "#8a794f", "#5d4e30"]
};

let uploadedImage = null;
let activePalette = "Rose Garden";

// ===== Initialize Palette Grid =====
function initPalettes() {
  paletteGrid.innerHTML = '';
  Object.entries(yarnPalettes).forEach(([paletteName, colors]) => {
    const card = document.createElement('div');
    card.className = 'palette-card';
    card.dataset.palette = paletteName;
    card.innerHTML = `
      <div class="palette-swatches">
        ${colors.map(color => `<div style="background: ${color};" title="${color.toUpperCase()}"></div>`).join('')}
      </div>
      <div class="palette-name">${paletteName}</div>
    `;
    card.addEventListener('click', () => {
      document.querySelectorAll('.palette-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activePalette = paletteName;
      if (uploadedImage) updatePatternPreview();
    });
    paletteGrid.appendChild(card);
  });
  document.querySelector('.palette-card')?.classList.add('active');
}

// ===== Helper Functions =====
function findClosestYarnColor(pixel, palette) {
  const [r, g, b] = pixel;
  let minDistance = Infinity;
  let closestColor = palette[0];
  palette.forEach(color => {
    const hex = color.startsWith('#') ? color : `#${color}`;
    const cr = parseInt(hex.slice(1, 3), 16);
    const cg = parseInt(hex.slice(3, 5), 16);
    const cb = parseInt(hex.slice(5, 7), 16);
    const distance = Math.sqrt(Math.pow(r - cr, 2) + Math.pow(g - cg, 2) + Math.pow(b - cb, 2));
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = hex;
    }
  });
  return closestColor;
}

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
      const closestColor = findClosestYarnColor([pixelData[0], pixelData[1], pixelData[2]], colors);
      const colorIndex = colors.indexOf(closestColor);
      const stitchSymbol = colorIndex >= 0 ? colorIndex + 1 : '?';
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
    rowInstructions += `${currentStitch}(${currentCount})\n`;
    stitchCount += currentCount;
    instructions += rowInstructions;
  }
  instructions += `\nTotal stitches: ${stitchCount}`;
  return instructions;
}

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(140, 106, 86);
  doc.text('Knitting Pattern Instructions', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Yarn Palette: ${activePalette}`, 14, 30);
  doc.setFont('courier');
  doc.setFontSize(10);
  doc.text(instructionsContent.textContent, 14, 40, { maxWidth: 180 });
  doc.save(`knitting-pattern-${new Date().getTime()}.pdf`);
}

// ===== Event Listeners =====
// Sign Up
signupBtn.addEventListener('click', async () => {
  try {
    await account.create(emailInput.value, passwordInput.value);
    alert("Welcome! Your account is ready.");
  } catch (error) {
    alert("Oops: " + error.message);
  }
});

// Log In
loginBtn.addEventListener('click', async () => {
  try {
    await account.createEmailSession(emailInput.value, passwordInput.value);
    alert("Logged in successfully!");
  } catch (error) {
    alert("Error: " + error.message);
  }
});

// Image Upload
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

// Generate Pattern
generatePatternBtn.addEventListener('click', function() {
  if (!uploadedImage) return;
  const width = Math.min(uploadedImage.width, 800);
  const height = (uploadedImage.height / uploadedImage.width) * width;
  patternCanvas.width = width;
  patternCanvas.height = height;
  const ctx = patternCanvas.getContext('2d');
  ctx.drawImage(uploadedImage, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const colors = yarnPalettes[activePalette];
  for (let i = 0; i < data.length; i += 4) {
    const pixelColor = [data[i], data[i+1], data[i+2]];
    const hexColor = findClosestYarnColor(pixelColor, colors);
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    data[i] = r;
    data[i+1] = g;
    data[i+2] = b;
  }
  ctx.putImageData(imageData, 0, 0);
  if (document.getElementById('showGrid').checked) {
    const gridSize = parseInt(document.getElementById('gridSize').value);
    drawGrid(ctx, width, height, gridSize);
  }
  instructionsContent.textContent = generateInstructions(patternCanvas, activePalette);
  patternPreview.style.display = 'block';
});

// Download Pattern (and save to Appwrite)
downloadBtn.addEventListener('click', async function() {
  const dataUrl = patternCanvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `knitting-pattern-${Date.now()}.png`;
  link.href = dataUrl;
  link.click();

  try {
    const user = await account.get();
    if (user) {
      const fileId = await uploadPatternFile(dataUrl);
      await linkPatternToUser(user.$id, fileId);
      alert("Pattern saved to your account!");
    }
  } catch (error) {
    console.log("Not logged in or error saving:", error);
  }
});

// PDF Download
downloadPDFBtn.addEventListener('click', generatePDF);

// Initialize
initPalettes();
document.getElementById('current-year').textContent = new Date().getFullYear();
