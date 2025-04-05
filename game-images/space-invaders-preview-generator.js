// Simple ASCII art for Space Invaders game preview
const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 200;
const ctx = canvas.getContext('2d');

// Black background
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Aliens (3 rows of 5)
// Row 1 - top aliens
ctx.fillStyle = '#FF00FF'; // Magenta
for (let i = 0; i < 5; i++) {
  ctx.fillRect(70 + i * 30, 30, 20, 10);
  ctx.fillRect(75 + i * 30, 40, 10, 10);
  ctx.fillRect(70 + i * 30, 40, 5, 5);
  ctx.fillRect(85 + i * 30, 40, 5, 5);
}

// Row 2 - middle aliens
ctx.fillStyle = '#00FF00'; // Green
for (let i = 0; i < 5; i++) {
  ctx.fillRect(70 + i * 30, 60, 20, 15);
  ctx.fillRect(65 + i * 30, 65, 5, 5);
  ctx.fillRect(90 + i * 30, 65, 5, 5);
}

// Row 3 - bottom aliens
ctx.fillStyle = '#00FFFF'; // Cyan
for (let i = 0; i < 5; i++) {
  ctx.fillRect(70 + i * 30, 90, 20, 10);
  ctx.fillRect(65 + i * 30, 85, 5, 15);
  ctx.fillRect(90 + i * 30, 85, 5, 15);
}

// Player ship
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(140, 170, 20, 10);
ctx.fillRect(145, 160, 10, 10);

// Bullets
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(150, 150, 2, 10);
ctx.fillRect(120, 100, 2, 10);
ctx.fillRect(180, 120, 2, 10);

// Shields
ctx.fillStyle = '#00FF00';
for (let i = 0; i < 3; i++) {
  ctx.fillRect(60 + i * 70, 140, 30, 10);
}

// Text
ctx.font = '16px monospace';
ctx.fillStyle = '#FFFFFF';
ctx.fillText('SPACE INVADERS', 80, 20);

// Score
ctx.font = '12px monospace';
ctx.fillText('SCORE: 1250', 10, 15);
ctx.fillText('LIVES: 3', 230, 15);

// Border
ctx.strokeStyle = '#FFFFFF';
ctx.lineWidth = 2;
ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

// Export as PNG
const dataURL = canvas.toDataURL('image/png');
const link = document.createElement('a');
link.download = 'space-invaders-game.png';
link.href = dataURL;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
