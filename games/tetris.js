// Tetris Game
class TetrisGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    
    // Game board dimensions
    this.cols = 10;
    this.rows = 20;
    this.blockSize = Math.min(
      Math.floor(this.canvas.width / this.cols),
      Math.floor(this.canvas.height / this.rows)
    );
    
    // Center the board
    this.boardWidth = this.cols * this.blockSize;
    this.boardHeight = this.rows * this.blockSize;
    this.boardX = (this.canvas.width - this.boardWidth) / 2;
    this.boardY = (this.canvas.height - this.boardHeight) / 2;
    
    // Game state
    this.board = this.createEmptyBoard();
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.gameOver = false;
    this.paused = false;
    
    // Tetromino properties
    this.currentPiece = null;
    this.nextPiece = null;
    
    // Game speed (milliseconds per drop)
    this.dropInterval = 1000;
    this.lastDropTime = 0;
    
    // Input handling
    this.lastMoveTime = 0;
    this.moveDelay = 100; // Milliseconds between moves
    
    // Retro color scheme
    this.colors = {
      background: '#000',
      grid: '#333',
      border: '#0f0',
      text: '#0f0',
      ghost: 'rgba(255, 255, 255, 0.2)',
      tetrominos: [
        '#00f0f0', // I - Cyan
        '#0000f0', // J - Blue
        '#f0a000', // L - Orange
        '#f0f000', // O - Yellow
        '#00f000', // S - Green
        '#a000f0', // T - Purple
        '#f00000'  // Z - Red
      ]
    };
    
    // Tetromino shapes
    this.tetrominoShapes = [
      // I
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      // J
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      // L
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
      ],
      // O
      [
        [1, 1],
        [1, 1]
      ],
      // S
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
      ],
      // T
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      // Z
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
      ]
    ];
    
    // Set up event listeners
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
    
    // Touch controls for mobile
    this.setupTouchControls();
    
    // Start the game
    this.init();
    
    // Game loop
    this.gameLoop = this.gameLoop.bind(this);
    requestAnimationFrame(this.gameLoop);
  }
  
  setupTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    
    this.canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      e.preventDefault();
    }, false);
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, false);
    
    this.canvas.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      const touchDuration = touchEndTime - touchStartTime;
      
      // Detect tap (quick touch)
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10 && touchDuration < 300) {
        // Tap to rotate
        this.rotatePiece();
        return;
      }
      
      // Determine swipe direction
      const swipeThreshold = 30;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (Math.abs(dx) > swipeThreshold) {
          if (dx > 0) {
            this.movePiece(1, 0); // Right
          } else {
            this.movePiece(-1, 0); // Left
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(dy) > swipeThreshold) {
          if (dy > 0) {
            // Swipe down - hard drop
            this.hardDrop();
          }
        }
      }
      
      e.preventDefault();
    }, false);
  }
  
  init() {
    this.board = this.createEmptyBoard();
    this.score = 0;
    this.level = 1;
    this.linesCleared = 0;
    this.gameOver = false;
    this.paused = false;
    
    // Generate first pieces
    this.currentPiece = this.generatePiece();
    this.nextPiece = this.generatePiece();
    
    // Reset game speed
    this.dropInterval = 1000;
    this.lastDropTime = 0;
  }
  
  createEmptyBoard() {
    return Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
  }
  
  generatePiece() {
    const type = Math.floor(Math.random() * this.tetrominoShapes.length);
    const shape = this.tetrominoShapes[type];
    
    return {
      type,
      shape,
      x: Math.floor((this.cols - shape[0].length) / 2),
      y: 0
    };
  }
  
  handleKeyPress(e) {
    // Prevent default action for game keys to avoid page scrolling
    if ([32, 37, 38, 39, 40, 13].includes(e.keyCode)) {
      e.preventDefault();
    }
    
    // If game is over, only respond to restart
    if (this.gameOver) {
      if (e.keyCode === 13) { // Enter
        this.init();
      }
      return;
    }
    
    // Pause/resume with spacebar
    if (e.keyCode === 32) { // Space
      this.paused = !this.paused;
      return;
    }
    
    // If game is paused, don't process other inputs
    if (this.paused) return;
    
    // Handle piece movement
    switch (e.keyCode) {
      case 37: // Left arrow
        this.movePiece(-1, 0);
        break;
      case 39: // Right arrow
        this.movePiece(1, 0);
        break;
      case 40: // Down arrow
        this.movePiece(0, 1);
        break;
      case 38: // Up arrow
        this.rotatePiece();
        break;
      case 32: // Space - Hard drop
        this.hardDrop();
        break;
    }
  }
  
  isValidMove(piece, offsetX, offsetY) {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (!piece.shape[y][x]) continue;
        
        const newX = piece.x + x + offsetX;
        const newY = piece.y + y + offsetY;
        
        // Check if out of bounds
        if (newX < 0 || newX >= this.cols || newY >= this.rows) {
          return false;
        }
        
        // Check if already filled
        if (newY >= 0 && this.board[newY][newX]) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  movePiece(dx, dy) {
    if (!this.currentPiece || this.gameOver || this.paused) return false;
    
    // Check if move is valid
    if (this.isValidMove(this.currentPiece, dx, dy)) {
      this.currentPiece.x += dx;
      this.currentPiece.y += dy;
      return true;
    }
    
    // If moving down and hit something, lock the piece
    if (dy > 0) {
      this.lockPiece();
      this.clearLines();
      this.spawnNewPiece();
    }
    
    return false;
  }
  
  rotatePiece() {
    if (!this.currentPiece || this.gameOver || this.paused) return;
    
    // Clone the current piece
    const piece = {
      ...this.currentPiece,
      shape: JSON.parse(JSON.stringify(this.currentPiece.shape))
    };
    
    // Rotate the shape (90 degrees clockwise)
    const rotated = [];
    for (let y = 0; y < piece.shape[0].length; y++) {
      rotated[y] = [];
      for (let x = 0; x < piece.shape.length; x++) {
        rotated[y][x] = piece.shape[piece.shape.length - 1 - x][y];
      }
    }
    
    piece.shape = rotated;
    
    // Wall kick - try to adjust position if rotation would cause collision
    const originalX = piece.x;
    const wallKickOffsets = [0, -1, 1, -2, 2]; // Try original position, then left, right, etc.
    
    for (const offset of wallKickOffsets) {
      piece.x = originalX + offset;
      if (this.isValidMove(piece, 0, 0)) {
        this.currentPiece = piece;
        return;
      }
    }
  }
  
  hardDrop() {
    if (!this.currentPiece || this.gameOver || this.paused) return;
    
    // Move down until collision
    let dropDistance = 0;
    while (this.isValidMove(this.currentPiece, 0, dropDistance + 1)) {
      dropDistance++;
    }
    
    if (dropDistance > 0) {
      this.score += dropDistance * 2; // Bonus points for hard drop
      this.currentPiece.y += dropDistance;
    }
    
    this.lockPiece();
    this.clearLines();
    this.spawnNewPiece();
  }
  
  getGhostPiecePosition() {
    if (!this.currentPiece || this.gameOver || this.paused) return null;
    
    // Clone the current piece
    const ghost = {
      ...this.currentPiece,
      shape: this.currentPiece.shape
    };
    
    // Move down until collision
    let dropDistance = 0;
    while (this.isValidMove(ghost, 0, dropDistance + 1)) {
      dropDistance++;
    }
    
    if (dropDistance > 0) {
      ghost.y += dropDistance;
    }
    
    return ghost;
  }
  
  lockPiece() {
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (!this.currentPiece.shape[y][x]) continue;
        
        const boardY = this.currentPiece.y + y;
        const boardX = this.currentPiece.x + x;
        
        // If piece is partially above the board, game over
        if (boardY < 0) {
          this.gameOver = true;
          return;
        }
        
        this.board[boardY][boardX] = this.currentPiece.type + 1; // +1 to avoid 0 (empty)
      }
    }
  }
  
  clearLines() {
    let linesCleared = 0;
    
    for (let y = this.rows - 1; y >= 0; y--) {
      // Check if row is full
      if (this.board[y].every(cell => cell !== 0)) {
        // Remove the row
        this.board.splice(y, 1);
        // Add empty row at top
        this.board.unshift(Array(this.cols).fill(0));
        // Since we removed a row, we need to check the same index again
        y++;
        linesCleared++;
      }
    }
    
    if (linesCleared > 0) {
      // Update score based on number of lines cleared
      const points = [0, 100, 300, 500, 800]; // Points for 0, 1, 2, 3, 4 lines
      this.score += points[linesCleared] * this.level;
      
      // Update total lines cleared
      this.linesCleared += linesCleared;
      
      // Update level
      this.level = Math.floor(this.linesCleared / 10) + 1;
      
      // Update game speed
      this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
    }
  }
  
  spawnNewPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.generatePiece();
    
    // Check if new piece can be placed
    if (!this.isValidMove(this.currentPiece, 0, 0)) {
      this.gameOver = true;
    }
  }
  
  update(currentTime) {
    if (this.gameOver || this.paused) return;
    
    // Auto drop piece
    if (currentTime - this.lastDropTime > this.dropInterval) {
      this.lastDropTime = currentTime;
      this.movePiece(0, 1);
    }
  }
  
  draw() {
    // Clear canvas
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw board background
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(
      this.boardX,
      this.boardY,
      this.boardWidth,
      this.boardHeight
    );
    
    // Draw board border
    this.ctx.strokeStyle = this.colors.border;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      this.boardX - 1,
      this.boardY - 1,
      this.boardWidth + 2,
      this.boardHeight + 2
    );
    
    // Draw grid
    this.ctx.strokeStyle = this.colors.grid;
    this.ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x <= this.cols; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.boardX + x * this.blockSize, this.boardY);
      this.ctx.lineTo(this.boardX + x * this.blockSize, this.boardY + this.boardHeight);
      this.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= this.rows; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.boardX, this.boardY + y * this.blockSize);
      this.ctx.lineTo(this.boardX + this.boardWidth, this.boardY + y * this.blockSize);
      this.ctx.stroke();
    }
    
    // Draw ghost piece
    const ghostPiece = this.getGhostPiecePosition();
    if (ghostPiece && !this.gameOver && !this.paused) {
      this.ctx.fillStyle = this.colors.ghost;
      for (let y = 0; y < ghostPiece.shape.length; y++) {
        for (let x = 0; x < ghostPiece.shape[y].length; x++) {
          if (!ghostPiece.shape[y][x]) continue;
          
          this.ctx.fillRect(
            this.boardX + (ghostPiece.x + x) * this.blockSize,
            this.boardY + (ghostPiece.y + y) * this.blockSize,
            this.blockSize,
            this.blockSize
          );
        }
      }
    }
    
    // Draw board pieces
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (!this.board[y][x]) continue;
        
        const colorIndex = this.board[y][x] - 1; // -1 because we added 1 when storing
        this.ctx.fillStyle = this.colors.tetrominos[colorIndex];
        
        this.ctx.fillRect(
          this.boardX + x * this.blockSize,
          this.boardY + y * this.blockSize,
          this.blockSize,
          this.blockSize
        );
        
        // Draw block border
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
          this.boardX + x * this.blockSize,
          this.boardY + y * this.blockSize,
          this.blockSize,
          this.blockSize
        );
      }
    }
    
    // Draw current piece
    if (this.currentPiece && !this.gameOver) {
      this.ctx.fillStyle = this.colors.tetrominos[this.currentPiece.type];
      
      for (let y = 0; y < this.currentPiece.shape.length; y++) {
        for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
          if (!this.currentPiece.shape[y][x]) continue;
          
          // Only draw if on board (y >= 0)
          if (this.currentPiece.y + y >= 0) {
            this.ctx.fillRect(
              this.boardX + (this.currentPiece.x + x) * this.blockSize,
              this.boardY + (this.currentPiece.y + y) * this.blockSize,
              this.blockSize,
              this.blockSize
            );
            
            // Draw block border
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(
              this.boardX + (this.currentPiece.x + x) * this.blockSize,
              this.boardY + (this.currentPiece.y + y) * this.blockSize,
              this.blockSize,
              this.blockSize
            );
          }
        }
      }
    }
    
    // Draw next piece preview
    if (this.nextPiece) {
      const previewSize = 4 * this.blockSize;
      const previewX = this.boardX + this.boardWidth + 20;
      const previewY = this.boardY + 20;
      
      // Draw preview box
      this.ctx.strokeStyle = this.colors.border;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(previewX, previewY, previewSize, previewSize);
      
      // Draw "NEXT" text
      this.ctx.fillStyle = this.colors.text;
      this.ctx.font = '16px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('NEXT', previewX + previewSize / 2, previewY - 10);
      
      // Draw next piece
      this.ctx.fillStyle = this.colors.tetrominos[this.nextPiece.type];
      
      const pieceWidth = this.nextPiece.shape[0].length;
      const pieceHeight = this.nextPiece.shape.length;
      const blockSizePreview = Math.min(
        previewSize / Math.max(pieceWidth, pieceHeight),
        this.blockSize
      );
      
      const offsetX = previewX + (previewSize - pieceWidth * blockSizePreview) / 2;
      const offsetY = previewY + (previewSize - pieceHeight * blockSizePreview) / 2;
      
      for (let y = 0; y < this.nextPiece.shape.length; y++) {
        for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
          if (!this.nextPiece.shape[y][x]) continue;
          
          this.ctx.fillRect(
            offsetX + x * blockSizePreview,
            offsetY + y * blockSizePreview,
            blockSizePreview,
            blockSizePreview
          );
          
          // Draw block border
          this.ctx.strokeStyle = '#000';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(
            offsetX + x * blockSizePreview,
            offsetY + y * blockSizePreview,
            blockSizePreview,
            blockSizePreview
          );
        }
      }
    }
    
    // Draw score and level
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    
    const statsX = this.boardX + this.boardWidth + 20;
    const statsY = this.boardY + 150;
    
    this.ctx.fillText(`SCORE: ${this.score}`, statsX, statsY);
    this.ctx.fillText(`LEVEL: ${this.level}`, statsX, statsY + 30);
    this.ctx.fillText(`LINES: ${this.linesCleared}`, statsX, statsY + 60);
    
    // Draw controls help
    this.ctx.font = '12px "Press Start 2P", monospace';
    this.ctx.fillText('CONTROLS:', statsX, statsY + 100);
    this.ctx.fillText('← → : MOVE', statsX, statsY + 125);
    this.ctx.fillText('↑ : ROTATE', statsX, statsY + 150);
    this.ctx.fillText('↓ : SOFT DROP', statsX, statsY + 175);
    this.ctx.fillText('SPACE : HARD DROP', statsX, statsY + 200);
    
    // Draw game over message
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = this.colors.text;
      this.ctx.font = '24px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
      
      this.ctx.font = '16px "Press Start 2P", monospace';
      this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      this.ctx.fillText('PRESS ENTER TO RESTART', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }
    
    // Draw pause message
    if (this.paused && !this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = this.colors.text;
      this.ctx.font = '24px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
      
      this.ctx.font = '16px "Press Start 2P", monospace';
      this.ctx.fillText('PRESS SPACE TO CONTINUE', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
  }
  
  gameLoop(currentTime) {
    requestAnimationFrame(this.gameLoop);
    
    // Update game state
    this.update(currentTime);
    
    // Render game
    this.draw();
  }
  
  // Public methods for external control
  pause() {
    this.paused = true;
  }
  
  resume() {
    this.paused = false;
  }
  
  restart() {
    this.init();
  }
}

// Export the game class
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = TetrisGame;
} else {
  window.TetrisGame = TetrisGame;
}
