// Snake Game
class SnakeGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 20;
    this.snake = [{x: 10, y: 10}]; // Start with a single segment
    this.direction = 'right';
    this.food = this.generateFood();
    this.score = 0;
    this.gameOver = false;
    this.speed = 150; // milliseconds between moves
    this.lastRenderTime = 0;
    this.paused = false;
    
    // Retro color scheme
    this.colors = {
      background: '#000',
      snake: '#0f0', // Bright green
      food: '#f00', // Bright red
      text: '#fff'  // White
    };
    
    // Set up event listeners
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
    
    // Touch controls for mobile
    this.setupTouchControls();
    
    // Game loop
    this.gameLoop = this.gameLoop.bind(this);
    requestAnimationFrame(this.gameLoop);
  }
  
  setupTouchControls() {
    let touchStartX = 0;
    let touchStartY = 0;
    
    this.canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      e.preventDefault();
    }, false);
    
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, false);
    
    this.canvas.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      
      // Determine swipe direction
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0 && this.direction !== 'left') {
          this.direction = 'right';
        } else if (dx < 0 && this.direction !== 'right') {
          this.direction = 'left';
        }
      } else {
        // Vertical swipe
        if (dy > 0 && this.direction !== 'up') {
          this.direction = 'down';
        } else if (dy < 0 && this.direction !== 'down') {
          this.direction = 'up';
        }
      }
      
      e.preventDefault();
    }, false);
  }
  
  generateFood() {
    const maxX = this.canvas.width / this.gridSize - 1;
    const maxY = this.canvas.height / this.gridSize - 1;
    
    // Generate random position
    let foodPosition;
    do {
      foodPosition = {
        x: Math.floor(Math.random() * maxX) + 1,
        y: Math.floor(Math.random() * maxY) + 1
      };
    } while (this.isPositionOccupied(foodPosition));
    
    return foodPosition;
  }
  
  isPositionOccupied(position) {
    return this.snake.some(segment => 
      segment.x === position.x && segment.y === position.y
    );
  }
  
  handleKeyPress(e) {
    // Prevent default action for arrow keys to avoid page scrolling
    if ([37, 38, 39, 40, 32].includes(e.keyCode)) {
      e.preventDefault();
    }
    
    // Pause/resume with spacebar
    if (e.keyCode === 32) { // Space
      this.paused = !this.paused;
      return;
    }
    
    // Restart game if game over
    if (this.gameOver && e.keyCode === 13) { // Enter
      this.resetGame();
      return;
    }
    
    // If game is paused or over, don't process movement
    if (this.paused || this.gameOver) return;
    
    // Handle direction changes
    switch (e.keyCode) {
      case 37: // Left
        if (this.direction !== 'right') this.direction = 'left';
        break;
      case 38: // Up
        if (this.direction !== 'down') this.direction = 'up';
        break;
      case 39: // Right
        if (this.direction !== 'left') this.direction = 'right';
        break;
      case 40: // Down
        if (this.direction !== 'up') this.direction = 'down';
        break;
    }
  }
  
  moveSnake() {
    if (this.paused || this.gameOver) return;
    
    // Get current head position
    const head = {...this.snake[0]};
    
    // Update head position based on direction
    switch (this.direction) {
      case 'up':
        head.y -= 1;
        break;
      case 'down':
        head.y += 1;
        break;
      case 'left':
        head.x -= 1;
        break;
      case 'right':
        head.x += 1;
        break;
    }
    
    // Check for collisions
    if (this.checkCollision(head)) {
      this.gameOver = true;
      return;
    }
    
    // Add new head to the beginning of snake array
    this.snake.unshift(head);
    
    // Check if snake ate food
    if (head.x === this.food.x && head.y === this.food.y) {
      // Increase score
      this.score += 10;
      
      // Increase speed slightly
      if (this.speed > 50) {
        this.speed -= 5;
      }
      
      // Generate new food
      this.food = this.generateFood();
    } else {
      // Remove tail segment if no food was eaten
      this.snake.pop();
    }
  }
  
  checkCollision(position) {
    // Check wall collision
    if (
      position.x < 0 ||
      position.y < 0 ||
      position.x >= this.canvas.width / this.gridSize ||
      position.y >= this.canvas.height / this.gridSize
    ) {
      return true;
    }
    
    // Check self collision (except for the tail which will move out of the way)
    for (let i = 0; i < this.snake.length - 1; i++) {
      if (this.snake[i].x === position.x && this.snake[i].y === position.y) {
        return true;
      }
    }
    
    return false;
  }
  
  draw() {
    // Clear canvas
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw snake
    this.snake.forEach((segment, index) => {
      // Head is slightly different color
      this.ctx.fillStyle = index === 0 ? '#8f8' : this.colors.snake;
      this.ctx.fillRect(
        segment.x * this.gridSize,
        segment.y * this.gridSize,
        this.gridSize,
        this.gridSize
      );
      
      // Add a small border to make segments distinct
      this.ctx.strokeStyle = '#000';
      this.ctx.strokeRect(
        segment.x * this.gridSize,
        segment.y * this.gridSize,
        this.gridSize,
        this.gridSize
      );
    });
    
    // Draw food
    this.ctx.fillStyle = this.colors.food;
    this.ctx.fillRect(
      this.food.x * this.gridSize,
      this.food.y * this.gridSize,
      this.gridSize,
      this.gridSize
    );
    
    // Draw score
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = '20px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    
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
      this.ctx.fillText('Press SPACE to continue', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
  }
  
  gameLoop(currentTime) {
    requestAnimationFrame(this.gameLoop);
    
    // Calculate time since last render
    const secondsSinceLastRender = (currentTime - this.lastRenderTime) / 1000;
    
    // Only update at specified intervals
    if (secondsSinceLastRender < this.speed / 1000) return;
    
    this.lastRenderTime = currentTime;
    
    // Update game state
    this.moveSnake();
    
    // Render game
    this.draw();
  }
  
  resetGame() {
    this.snake = [{x: 10, y: 10}];
    this.direction = 'right';
    this.food = this.generateFood();
    this.score = 0;
    this.gameOver = false;
    this.paused = false;
    this.speed = 150;
  }
  
  // Public methods for external control
  pause() {
    this.paused = true;
  }
  
  resume() {
    this.paused = false;
  }
  
  restart() {
    this.resetGame();
  }
}

// Export the game class
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
  module.exports = SnakeGame;
} else {
  window.SnakeGame = SnakeGame;
}
