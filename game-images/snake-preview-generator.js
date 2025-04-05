// Simple ASCII art for Snake game preview
const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 200;
const ctx = canvas.getContext('2d');

// Black background
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Green snake
ctx.fillStyle = '#00FF00';
ctx.fillRect(100, 100, 10, 10); // Head
ctx.fillRect(90, 100, 10, 10);  // Body segment 1
ctx.fillRect(80, 100, 10, 10);  // Body segment 2
ctx.fillRect(70, 100, 10, 10);  // Body segment 3

// Red food
ctx.fillStyle = '#FF0000';
ctx.fillRect(150, 100, 10, 10);

// Text
ctx.font = '20px monospace';
ctx.fillStyle = '#FFFFFF';
ctx.fillText('SNAKE', 120, 50);
ctx.font = '12px monospace';
ctx.fillText('Score: 42', 120, 180);

// Border
ctx.strokeStyle = '#00FF00';
ctx.lineWidth = 2;
ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

// Export as PNG
const dataURL = canvas.toDataURL('image/png');
const link = document.createElement('a');
link.download = 'snake-game.png';
link.href = dataURL;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
