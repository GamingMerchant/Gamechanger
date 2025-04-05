// Simple ASCII art for Pong game preview
const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 200;
const ctx = canvas.getContext('2d');

// Black background
ctx.fillStyle = '#000000';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Paddles
ctx.fillStyle = '#FFFFFF';
ctx.fillRect(20, 70, 10, 60); // Left paddle
ctx.fillRect(270, 50, 10, 60); // Right paddle

// Ball
ctx.fillRect(140, 90, 10, 10);

// Center line
ctx.setLineDash([5, 5]);
ctx.beginPath();
ctx.moveTo(150, 0);
ctx.lineTo(150, 200);
ctx.strokeStyle = '#FFFFFF';
ctx.stroke();

// Score
ctx.font = '30px monospace';
ctx.fillStyle = '#FFFFFF';
ctx.fillText('3', 130, 30);
ctx.fillText('5', 160, 30);

// Text
ctx.font = '20px monospace';
ctx.fillStyle = '#FFFFFF';
ctx.fillText('PONG', 120, 180);

// Border
ctx.setLineDash([]);
ctx.strokeStyle = '#FFFFFF';
ctx.lineWidth = 2;
ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10);

// Export as PNG
const dataURL = canvas.toDataURL('image/png');
const link = document.createElement('a');
link.download = 'pong-game.png';
link.href = dataURL;
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
