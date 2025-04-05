// Tetris Game with auto-canvas creation
// Wait for full page load before initializing
window.addEventListener('load', function() {
  console.log("Window loaded - Starting Tetris Game");
  
  // Remove loading screen if exists
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
    console.log("Loading screen removed");
  }
  
  // Create game container
  const gameContainer = document.createElement('div');
  gameContainer.id = 'tetris-game-container';
  gameContainer.style.maxWidth = '800px';
  gameContainer.style.margin = '0 auto';
  gameContainer.style.padding = '20px';
  gameContainer.style.display = 'flex';
  gameContainer.style.flexDirection = 'column';
  gameContainer.style.alignItems = 'center';
  
  // Create canvas first (at the top)
  const canvas = document.createElement('canvas');
  canvas.id = 'gameCanvas';
  canvas.width = 600;
  canvas.height = 500;
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  canvas.style.backgroundColor = '#000';
  canvas.style.border = '2px solid #fff';
  
  // Create score element
  const scoreElement = document.createElement('div');
  scoreElement.id = 'score';
  scoreElement.style.textAlign = 'center';
  scoreElement.style.margin = '10px auto';
  scoreElement.style.fontSize = '24px';
  scoreElement.style.color = '#fff';
  scoreElement.textContent = 'Score: 0 | Level: 1 | Lines: 0';
  
  // Create instructions (after the game)
  const instructionsDiv = document.createElement('div');
  instructionsDiv.style.textAlign = 'center';
  instructionsDiv.style.margin = '20px auto';
  instructionsDiv.style.padding = '10px';
  instructionsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  instructionsDiv.style.color = '#fff';
  instructionsDiv.style.borderRadius = '5px';
  instructionsDiv.innerHTML = `
    <h3>How to Play Tetris</h3>
    <p>Use the WASD keys to control the pieces:</p>
    <p>A: Move Left</p>
    <p>D: Move Right</p>
    <p>S: Soft Drop</p>
    <p>W: Rotate Piece</p>
    <p>Space: Hard Drop</p>
    <p>P: Pause/Resume</p>
    <p>F5: Restart Game</p>
    <p>Complete lines to score points and level up!</p>
  `;
  
  // Add elements to container in the desired order
  gameContainer.appendChild(canvas);
  gameContainer.appendChild(scoreElement);
  gameContainer.appendChild(instructionsDiv);
  
  // Add container to document at the beginning
  const mainContent = document.querySelector('main') || document.body;
  if (mainContent.firstChild) {
    mainContent.insertBefore(gameContainer, mainContent.firstChild);
  } else {
    mainContent.appendChild(gameContainer);
  }
  
  // Initialize the game
  const game = new TetrisGame(canvas);
});

// Tetris Game Class
class TetrisGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    
    // Game board dimensions
    this.cols = 10;
    this.rows = 20;
    this.blockSize = Math.min(
      Math.floor(this.canvas.width / 2 / this.cols),
      Math.floor(this.canvas.height / this.rows)
    );
    
    // Center the board
    this.boardWidth = this.cols * this.blockSize;
    this.boardHeight = this.rows * this.blockSize;
    this.boardX = (this.canvas.width - this.boardWidth) / 2;
    this.boardY = 20;
    
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
    this.ghostPiece = null;
    
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
    
    // Create touch control elements
    const touchControls = document.createElement('div');
    touchControls.id = 'tetris-touch-controls';
    touchControls.style.position = 'relative';
    touchControls.style.margin = '20px auto';
    touchControls.style.width = '300px';
    touchControls.style.height = '100px';
    touchControls.style.display = 'flex';
    touchControls.style.flexDirection = 'row';
    touchControls.style.alignItems = 'center';
    touchControls.style.justifyContent = 'space-between';
    
    // Create buttons
    const leftButton = this.createButton('←');
    const rightButton = this.createButton('→');
    const rotateButton = this.createButton('↻');
    const downButton = this.createButton('↓');
    const dropButton = this.createButton('⤓');
    const pauseButton = this.createButton('⏸️');
    
    // Create button containers
    const moveContainer = document.createElement('div');
    moveContainer.style.display = 'flex';
    moveContainer.style.flexDirection = 'row';
    
    const actionContainer = document.createElement('div');
    actionContainer.style.display = 'flex';
    actionContainer.style.flexDirection = 'row';
    
    // Add buttons to containers
    moveContainer.appendChild(leftButton);
    moveContainer.appendChild(rightButton);
    moveContainer.appendChild(downButton);
    
    actionContainer.appendChild(rotateButton);
    actionContainer.appendChild(dropButton);
    actionContainer.appendChild(pauseButton);
    
    // Add containers to controls
    touchControls.appendChild(moveContainer);
    touchControls.appendChild(actionContainer);
    
    // Add controls to document
    const gameContainer = document.getElementById('tetris-game-container');
    if (gameContainer) {
      gameContainer.appendChild(touchControls);
    }
    
    // Add event listeners
    leftButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.movePiece(-1, 0);
    });
    
    rightButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.movePiece(1, 0);
    });
    
    downButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.movePiece(0, 1);
    });
    
    rotateButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.rotatePiece();
    });
    
    dropButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.hardDrop();
    });
    
    pauseButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.togglePause();
    });
    
    // Canvas touch events for swipe controls
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
  
  createButton(text) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.width = '50px';
    button.style.height = '50px';
    button.style.margin = '5px';
    button.style.fontSize = '24px';
    button.style.backgroundColor = '#333';
    button.style.color = '#FFF';
    button.style.border = '2px solid #FFF';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
    return button;
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
    this.updateGhostPiece();
    
    // Reset game speed
    this.dropInterval = 1000;
    this.lastDropTime = 0;
    
    // Update score display
    this.updateScoreDisplay();
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
  
  updateGhostPiece() {
    if (!this.currentPiece) return;
    
    this.ghostPiece = {
      ...this.currentPiece,
      shape: JSON.parse(JSON.stringify(this.currentPiece.shape)),
      y: this.currentPiece.y
    };
    
    // Move ghost piece down until collision
    while (this.isValidMove(this.ghostPiece, 0, 1)) {
      this.ghostPiece.y++;
    }
  }
  
  handleKeyPress(e) {
    // If game is over, only respond to restart
    if (this.gameOver) {
      if (e.key === 'Enter' || e.keyCode === 13) { // Enter
        this.init();
      }
      return;
    }
    
    // Restart game with F5
    if (e.key === 'F5' || e.keyCode === 116) {
      e.preventDefault();
      this.init();
      return;
    }
    
    // Pause/resume with P key
    if (e.key === 'p' || e.key === 'P' || e.keyCode === 80) { // P
      e.preventDefault();
      this.togglePause();
      return;
    }
    
    // If game is paused, don't process other inputs
    if (this.paused) return;
    
    // Handle piece movement with WASD keys
    switch (e.key.toLowerCase()) {
      case 'a': // Left
        e.preventDefault();
        this.movePiece(-1, 0);
        break;
      case 'd': // Right
        e.preventDefault();
        this.movePiece(1, 0);
        break;
      case 's': // Down (soft drop)
        e.preventDefault();
        this.movePiece(0, 1);
        break;
      case 'w': // Rotate
        e.preventDefault();
        this.rotatePiece();
        break;
      case ' ': // Space - Hard drop
        e.preventDefault();
        this.hardDrop();
        break;
    }
  }
  
  togglePause() {
    this.paused = !this.paused;
    this.draw(); // Update display immediately
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
      this.updateGhostPiece();
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
        this.updateGhostPiece();
        return;
      }
    }
  }
  
  hardDrop() {
    if (!this.currentPiece || this.gameOver || this.paused) return;
    
    // Move piece down until collision
    while (this.movePiece(0, 1)) {
      // Keep moving down
    }
    
    // Lock piece, clear lines, and spawn new piece
    // (movePiece will handle this when it can't move down anymore)
  }
  
  lockPiece() {
    // Add current piece to the board
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (!this.currentPiece.shape[y][x]) continue;
        
        const boardX = this.currentPiece.x + x;
        const boardY = this.currentPiece.y + y;
        
        // If piece is locked above the board, game over
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
    
    // Check each row from bottom to top
    for (let y = this.rows - 1; y >= 0; y--) {
      // Check if row is full
      if (this.board[y].every(cell => cell > 0)) {
        // Remove the row
        this.board.splice(y, 1);
        // Add empty row at top
        this.board.unshift(Array(this.cols).fill(0));
        // Increment lines cleared
        linesCleared++;
        // Check the same row again (since rows shifted down)
        y++;
      }
    }
    
    if (linesCleared > 0) {
      // Update score based on lines cleared
      const points = [0, 100, 300, 500, 800]; // Points for 0, 1, 2, 3, 4 lines
      this.score += points[linesCleared] * this.level;
      
      // Update lines cleared and level
      this.linesCleared += linesCleared;
      this.level = Math.floor(this.linesCleared / 10) + 1;
      
      // Update game speed based on level
      this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
      
      // Update score display
      this.updateScoreDisplay();
    }
  }
  
  updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.score} | Level: ${this.level} | Lines: ${this.linesCleared}`;
    }
  }
  
  spawnNewPiece() {
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.generatePiece();
    this.updateGhostPiece();
    
    // Check if new piece can be placed
    if (!this.isValidMove(this.currentPiece, 0, 0)) {
      this.gameOver = true;
    }
  }
  
  draw() {
    // Clear canvas
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw board background
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(this.boardX, this.boardY, this.boardWidth, this.boardHeight);
    
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
    
    // Draw board border
    this.ctx.strokeStyle = this.colors.border;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(this.boardX, this.boardY, this.boardWidth, this.boardHeight);
    
    // Draw ghost piece
    if (this.ghostPiece && !this.gameOver && !this.paused) {
      this.ctx.fillStyle = this.colors.ghost;
      for (let y = 0; y < this.ghostPiece.shape.length; y++) {
        for (let x = 0; x < this.ghostPiece.shape[y].length; x++) {
          if (!this.ghostPiece.shape[y][x]) continue;
          
          this.ctx.fillRect(
            this.boardX + (this.ghostPiece.x + x) * this.blockSize,
            this.boardY + (this.ghostPiece.y + y) * this.blockSize,
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
        
        const colorIndex = this.board[y][x] - 1; // -1 to convert back to 0-based index
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
    this.drawNextPiece();
    
    // Draw game over message
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = this.colors.text;
      this.ctx.font = '24px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
      this.ctx.font = '16px "Press Start 2P", monospace';
      this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      this.ctx.fillText('Press ENTER to restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
      
      // Add Pi Network payment option
      this.ctx.fillStyle = '#00FFFF';
      this.ctx.fillText('Or unlock Challenge Mode with Pi', this.canvas.width / 2, this.canvas.height / 2 + 100);
      
      // Create buy button if it doesn't exist
      if (!document.getElementById('tetris-unlock-challenge-button')) {
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Unlock Challenge Mode (π3.00)';
        buyButton.id = 'tetris-unlock-challenge-button';
        buyButton.style.display = 'block';
        buyButton.style.margin = '20px auto';
        buyButton.style.padding = '10px 20px';
        buyButton.style.backgroundColor = '#333';
        buyButton.style.color = '#FFF';
        buyButton.style.border = '2px solid #FFF';
        buyButton.style.borderRadius = '5px';
        buyButton.style.fontSize = '16px';
        buyButton.style.cursor = 'pointer';
        buyButton.onclick = this.unlockChallengeMode.bind(this);
        
        const gameContainer = document.getElementById('tetris-game-container');
        if (gameContainer) {
          gameContainer.appendChild(buyButton);
        }
      }
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
      this.ctx.fillText('Press P to continue', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
  }
  
  drawNextPiece() {
    if (!this.nextPiece) return;
    
    // Draw next piece box
    const boxX = this.boardX + this.boardWidth + 20;
    const boxY = this.boardY;
    const boxWidth = 100;
    const boxHeight = 100;
    
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    this.ctx.strokeStyle = this.colors.border;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // Draw "Next" text
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('NEXT', boxX + boxWidth / 2, boxY - 10);
    
    // Draw next piece
    const blockSize = 20;
    const pieceWidth = this.nextPiece.shape[0].length * blockSize;
    const pieceHeight = this.nextPiece.shape.length * blockSize;
    const pieceX = boxX + (boxWidth - pieceWidth) / 2;
    const pieceY = boxY + (boxHeight - pieceHeight) / 2;
    
    this.ctx.fillStyle = this.colors.tetrominos[this.nextPiece.type];
    
    for (let y = 0; y < this.nextPiece.shape.length; y++) {
      for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
        if (!this.nextPiece.shape[y][x]) continue;
        
        this.ctx.fillRect(
          pieceX + x * blockSize,
          pieceY + y * blockSize,
          blockSize,
          blockSize
        );
        
        // Draw block border
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(
          pieceX + x * blockSize,
          pieceY + y * blockSize,
          blockSize,
          blockSize
        );
      }
    }
  }
  
  gameLoop(currentTime) {
    requestAnimationFrame(this.gameLoop);
    
    // Skip if game is over or paused
    if (this.gameOver || this.paused) {
      this.draw();
      return;
    }
    
    // Auto-drop piece at intervals
    if (currentTime - this.lastDropTime > this.dropInterval) {
      this.lastDropTime = currentTime;
      this.movePiece(0, 1);
    }
    
    // Render game
    this.draw();
  }
  
  unlockChallengeMode() {
    console.log("Unlock challenge mode function called");
    
    if (typeof window.RetroArcade !== 'undefined' && typeof window.RetroArcade.handlePiPayment === 'function') {
      console.log("Initiating Pi payment for challenge mode");
      
      window.RetroArcade.handlePiPayment(
        3.0, // amount
        "Challenge mode for Tetris game", // memo
        "challenge_mode", // itemType
        "tetris", // gameId
        function(payment) {
          console.log("Payment successful:", payment);
          // Start challenge mode
          this.startChallengeMode();
        }.bind(this),
        function(error) {
          console.error("Payment error:", error);
          alert("Payment failed: " + error.message);
        }
      );
    } else {
      console.warn("Pi payment function not available");
      alert("Pi payments are only available in the Pi Browser. For testing, challenge mode will be enabled for free!");
      
      // For testing outside Pi Browser, enable challenge mode for free
      this.startChallengeMode();
    }
  }
  
  startChallengeMode() {
    // Remove buy button if exists
    const buyButton = document.getElementById('tetris-unlock-challenge-button');
    if (buyButton) {
      buyButton.remove();
    }
    
    // Reset game with challenge settings
    this.init();
    
    // Challenge mode settings
    this.level = 5; // Start at higher level
    this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
    
    // Update instructions
    const instructionsDiv = document.querySelector('#tetris-game-container div:last-child');
    if (instructionsDiv) {
      instructionsDiv.innerHTML = `
        <h3>CHALLENGE MODE ACTIVATED!</h3>
        <p>Use the WASD keys to control the pieces:</p>
        <p>A: Move Left</p>
        <p>D: Move Right</p>
        <p>S: Soft Drop</p>
        <p>W: Rotate Piece</p>
        <p>Space: Hard Drop</p>
        <p>P: Pause/Resume</p>
        <p>F5: Restart Game</p>
        <p>Starting at level 5 - Good luck!</p>
      `;
    }
    
    // Update score display
    this.updateScoreDisplay();
  }
}

console.log("Tetris game script with WASD controls loaded");
