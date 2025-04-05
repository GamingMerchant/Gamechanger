// Simple ASCII art for Tetris game preview
const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 200;
const ctx = canvas.getContext('2d');

// Black background
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Game board outline
ctx.strokeStyle = '#FFFFFF';
ctx.lineWidth = 2;
ctx.strokeRect(100, 20, 100, 160);

// Tetris pieces
// L piece
ctx.fillStyle = '#FFA500'; // Orange
ctx.fillRect(110, 30, 20, 20);
ctx.fillRect(110, 50, 20, 20);
ctx.fillRect(110, 70, 20, 20);
ctx.fillRect(130, 70, 20, 20);

// Square piece
ctx.fillStyle = '#FFFF00'; // Yellow
ctx.fillRect(150, 90, 20, 20);
ctx.fillRect(170, 90, 20, 20);
ctx.fillRect(150, 110, 20, 20);
ctx.fillRect(170, 110, 20, 20);

// Line piece
ctx.fillStyle = '#00FFFF'; // Cyan
ctx.fillRect(110, 130, 20, 20);
ctx.fillRect(130, 130, 20, 20);
ctx.fillRect(150, 130, 20, 20);
ctx.fillRect(170, 130, 20, 20);

// Text
ctx.font = '20px monospace';
ctx.fillStyle = '#FFFFFF';
ctx.fillText('TETRIS', 115, 180);

// Score
ctx.font = '12px monospace';
ctx.fillText('Score: 1500', 210, 40);
ctx.fillText('Level: 5', 210, 60);
ctx.fillText('Lines: 25', 210, 80);

// Next piece preview
ctx.strokeRect(210, 100, 60, 60);
ctx.fillStyle = '#FF00FF'; // Magenta
ctx.fillRect(220, 110, 20, 20);
ctx.fillRect(240, 110, 20, 20);
ctx.fillRect(220, 130, 20, 20);
ctx.fillRect(220, 150, 20, 20);

// Export as PNG
const dataURL = canvas.toDataURL('image/png');
const link = document.createElement('a');
link.download = 'tetris-game.png';
link.href = dataURL;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
