import { account } from './appwrite.js';
import { uploadPatternFile, linkPatternToUser } from './userData.js';

// 1. Elements (Make sure these IDs match your index.html!)
const patternCanvas = document.getElementById('patternCanvas');
const generatePatternBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clear-btn');

// 2. The Data (Combined and Simplified)
const yarnPalettes = {
  "Rose Garden": ["#f8d5d5", "#e6a8a8", "#d48a8a", "#a15e5e", "#6e3b3b"],
  "Ocean Blues": ["#d2e3f0", "#a3c4d8", "#7a9eb8", "#4f718a", "#30495d"],
  "Forest Greens": ["#d5e8d5", "#a8c9a8", "#7da57d", "#5e7a5e", "#3b4e3b"]
};

let activePalette = "Rose Garden";

// 3. The Logic (The "Brain")
function drawPattern() {
    const ctx = patternCanvas.getContext('2d');
    const cellSize = 40; 
    const colors = yarnPalettes[activePalette];
    
    for (let x = 0; x < patternCanvas.width; x += cellSize) {
        for (let y = 0; y < patternCanvas.height; y += cellSize) {
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillRect(x, y, cellSize, cellSize);
            ctx.strokeStyle = "rgba(0,0,0,0.05)"; 
            ctx.strokeRect(x, y, cellSize, cellSize);
        }
    }
}

// 4. Event Listeners
generatePatternBtn.addEventListener('click', drawPattern);

downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'my-stitch-pattern.png';
    link.href = patternCanvas.toDataURL();
    link.click();
});

// 5. Clear Canvas Logic
clearBtn.addEventListener('click', () => {
    const ctx = patternCanvas.getContext('2d');
    ctx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
});