// Create preview images for the games
const canvas = document.createElement('canvas');
canvas.width = 400;
canvas.height = 300;
const ctx = canvas.getContext('2d');

// Snake preview
function createSnakePreview() {
  // Background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Grid
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 1;
  const gridSize = 20;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  // Snake
  ctx.fillStyle = '#0f0';
  const snake = [
    {x: 10, y: 7},
    {x: 9, y: 7},
    {x: 8, y: 7},
    {x: 7, y: 7},
    {x: 6, y: 7},
    {x: 5, y: 7},
    {x: 4, y: 7}
  ];
  
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? '#8f8' : '#0f0';
    ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
  });
  
  // Food
  ctx.fillStyle = '#f00';
  ctx.fillRect(15 * gridSize, 7 * gridSize, gridSize, gridSize);
  
  // Score
  ctx.fillStyle = '#0f0';
  ctx.font = '20px "Press Start 2P", monospace';
  ctx.fillText('Score: 60', 20, 30);
  
  return canvas.toDataURL('image/png');
}

// Pong preview
function createPongPreview() {
  // Background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Center line
  ctx.strokeStyle = '#0f0';
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
  
  // Paddles
  ctx.fillStyle = '#0f0';
  ctx.fillRect(20, canvas.height / 2 - 40, 10, 80); // Left paddle
  ctx.fillRect(canvas.width - 30, canvas.height / 2 - 40, 10, 80); // Right paddle
  
  // Ball
  ctx.fillStyle = '#fff';
  ctx.fillRect(canvas.width / 2 - 5, canvas.height / 2 - 5, 10, 10);
  
  // Scores
  ctx.fillStyle = '#0f0';
  ctx.font = '32px "Press Start 2P", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('3', canvas.width / 4, 50);
  ctx.fillText('2', 3 * canvas.width / 4, 50);
  
  return canvas.toDataURL('image/png');
}

// Tetris preview
function createTetrisPreview() {
  // Background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Board
  const boardWidth = 200;
  const boardHeight = 280;
  const boardX = (canvas.width - boardWidth) / 2 - 50;
  const boardY = (canvas.height - boardHeight) / 2;
  
  // Board border
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(boardX, boardY, boardWidth, boardHeight);
  
  // Grid
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 0.5;
  const blockSize = 20;
  for (let x = 0; x <= 10; x++) {
    ctx.beginPath();
    ctx.moveTo(boardX + x * blockSize, boardY);
    ctx.lineTo(boardX + x * blockSize, boardY + boardHeight);
    ctx.stroke();
  }
  for (let y = 0; y <= 14; y++) {
    ctx.beginPath();
    ctx.moveTo(boardX, boardY + y * blockSize);
    ctx.lineTo(boardX + boardWidth, boardY + y * blockSize);
    ctx.stroke();
  }
  
  // Tetrominos
  const colors = ['#00f0f0', '#0000f0', '#f0a000', '#f0f000', '#00f000', '#a000f0', '#f00000'];
  
  // L piece
  ctx.fillStyle = colors[2];
  ctx.fillRect(boardX + 3 * blockSize, boardY + 5 * blockSize, blockSize, blockSize);
  ctx.fillRect(boardX + 3 * blockSize, boardY + 6 * blockSize, blockSize, blockSize);
  ctx.fillRect(boardX + 3 * blockSize, boardY + 7 * blockSize, blockSize, blockSize);
  ctx.fillRect(boardX + 4 * blockSize, boardY + 7 * blockSize, blockSize, blockSize);
  
  // I piece
  ctx.fillStyle = colors[0];
  ctx.fillRect(boardX + 7 * blockSize, boardY + 4 * blockSize, blockSize, blockSize);
  ctx.fillRect(boardX + 7 * blockSize, boardY + 5 * blockSize, blockSize, blockSize);
  ctx.fillRect(boardX + 7 * blockSize, boardY + 6 * blockSize, blockSize, blockSize);
  ctx.fillRect(boardX + 7 * blockSize, boardY + 7 * blockSize, blockSize, blockSize);
  
  // Bottom filled rows
  for (let row = 11; row < 14; row++) {
    for (let col = 0; col < 10; col++) {
      if (row === 13 && col === 9) continue; // One missing block
      const colorIndex = (col + row) % colors.length;
      ctx.fillStyle = colors[colorIndex];
      ctx.fillRect(boardX + col * blockSize, boardY + row * blockSize, blockSize, blockSize);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(boardX + col * blockSize, boardY + row * blockSize, blockSize, blockSize);
    }
  }
  
  // Next piece preview
  ctx.strokeStyle = '#0f0';
  ctx.lineWidth = 2;
  const previewX = boardX + boardWidth + 20;
  const previewY = boardY + 20;
  const previewSize = 80;
  ctx.strokeRect(previewX, previewY, previewSize, previewSize);
  
  // Next piece (T)
  ctx.fillStyle = colors[5];
  const tBlockSize = previewSize / 4;
  ctx.fillRect(previewX + tBlockSize, previewY + tBlockSize, tBlockSize, tBlockSize);
  ctx.fillRect(previewX + 2 * tBlockSize, previewY + tBlockSize, tBlockSize, tBlockSize);
  ctx.fillRect(previewX + 3 * tBlockSize, previewY + tBlockSize, tBlockSize, tBlockSize);
  ctx.fillRect(previewX + 2 * tBlockSize, previewY + 2 * tBlockSize, tBlockSize, tBlockSize);
  
  // Score
  ctx.fillStyle = '#0f0';
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE: 4800', previewX, previewY + 120);
  ctx.fillText('LEVEL: 5', previewX, previewY + 150);
  
  return canvas.toDataURL('image/png');
}

// Space Invaders preview
function createSpaceInvadersPreview() {
  // Background
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Enemies
  const enemyRows = 5;
  const enemyCols = 11;
  const enemyWidth = 30;
  const enemyHeight = 20;
  const enemyPadding = 10;
  const enemyOffsetTop = 60;
  const enemyOffsetLeft = (canvas.width - (enemyCols * (enemyWidth + enemyPadding))) / 2;
  
  ctx.fillStyle = '#f00';
  for (let row = 0; row < enemyRows; row++) {
    for (let col = 0; col < enemyCols; col++) {
      // Skip some enemies to show they've been destroyed
      if ((row === 0 && col === 3) || (row === 1 && col === 7) || 
          (row === 2 && col === 5) || (row === 3 && col === 2) ||
          (row === 4 && col === 9)) {
        continue;
      }
      
      const x = enemyOffsetLeft + col * (enemyWidth + enemyPadding);
      const y = enemyOffsetTop + row * (enemyHeight + enemyPadding);
      
      // Different enemy shapes based on row
      switch (row) {
        case 0: // Top row - special enemy
          ctx.fillRect(x, y, enemyWidth, enemyHeight);
          ctx.fillRect(x + 5, y + enemyHeight, 4, 5);
          ctx.fillRect(x + enemyWidth - 9, y + enemyHeight, 4, 5);
          break;
          
        case 1:
        case 2: // Middle rows
          ctx.fillRect(x, y, enemyWidth, enemyHeight);
          ctx.fillRect(x - 5, y + 5, 5, 5);
          ctx.fillRect(x + enemyWidth, y + 5, 5, 5);
          break;
          
        default: // Bottom rows
          ctx.fillRect(x, y, enemyWidth, enemyHeight);
          ctx.fillRect(x + 5, y - 5, 5, 5);
          ctx.fillRect(x + enemyWidth - 10, y - 5, 5, 5);
      }
    }
  }
  
  // Shields
  ctx.fillStyle = '#00f';
  const shieldCount = 4;
  const shieldWidth = 60;
  const shieldHeight = 40;
  const shieldPadding = (canvas.width - (shieldCount * shieldWidth)) / (shieldCount + 1);
  
  for (let i = 0; i < shieldCount; i++) {
    const shieldX = shieldPadding + i * (shieldWidth + shieldPadding);
    const shieldY = canvas.height - 100;
    
    // Create shield shape (inverted U)
    for (let row = 0; row < shieldHeight / 6; row++) {
      for (let col = 0; col < shieldWidth / 6; col++) {
        // Add some random damage to shields
        if (Math.random() > 0.7) continue;
        
        if (row > 0 || col < 2 || col >= shieldWidth / 6 - 2) {
          ctx.fillRect(shieldX + col * 6, shieldY + row * 6, 6, 6);
        }
      }
    }
  }
  
  // Player
  ctx.fillStyle = '#0f0';
  ctx.fillRect(canvas.width / 2 - 20, canvas.height - 40, 40, 20);
  ctx.fillRect(canvas.width / 2 - 3, canvas.height - 50, 6, 10);
  
  // Bullets
  ctx.fillStyle = '#fff';
  ctx.fillRect(canvas.width / 2 - 1, canvas.height - 60, 3, 15); // Player bullet
  ctx.fillRect(enemyOffsetLeft + 3 * (enemyWidth + enemyPadding) + enemyWidth / 2, 
               enemyOffsetTop + 4 * (enemyHeight + enemyPadding) + enemyHeight, 3, 15); // Enemy bullet
  
  // Score
  ctx.fillStyle = '#0f0';
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SCORE: 1540', 20, 30);
  
  // Lives
  ctx.fillText('LIVES: 3', canvas.width - 150, 30);
  
  return canvas.toDataURL('image/png');
}

// Export the preview images
const snakePreview = createSnakePreview();
const pongPreview = createPongPreview();
const tetrisPreview = createTetrisPreview();
const spaceInvadersPreview = createSpaceInvadersPreview();

// Download links for the images
console.log('Snake Preview:', snakePreview);
console.log('Pong Preview:', pongPreview);
console.log('Tetris Preview:', tetrisPreview);
console.log('Space Invaders Preview:', spaceInvadersPreview);
