// Snake Game with auto-canvas creation
// Wait for full page load before initializing
window.addEventListener('load', function() {
  console.log("Window loaded - Starting Snake Game");
  
  // Remove loading screen if exists
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
    console.log("Loading screen removed");
  }
  
  // Create game container
  const gameContainer = document.createElement('div');
  gameContainer.id = 'snake-game-container';
  gameContainer.style.maxWidth = '800px';
  gameContainer.style.margin = '0 auto';
  gameContainer.style.padding = '20px';
  
  // Create canvas first (at the top)
  const canvas = document.createElement('canvas');
  canvas.id = 'gameCanvas';
  canvas.width = 600;
  canvas.height = 400;
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
  scoreElement.textContent = 'Score: 0';
  
  // Create instructions (after the game)
  const instructionsDiv = document.createElement('div');
  instructionsDiv.style.textAlign = 'center';
  instructionsDiv.style.margin = '20px auto';
  instructionsDiv.style.padding = '10px';
  instructionsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  instructionsDiv.style.color = '#fff';
  instructionsDiv.style.borderRadius = '5px';
  instructionsDiv.innerHTML = `
    <h3>How to Play Snake</h3>
    <p>Use the WASD keys to control the snake:</p>
    <p>W: Move Up</p>
    <p>A: Move Left</p>
    <p>S: Move Down</p>
    <p>D: Move Right</p>
    <p>Space: Pause/Resume</p>
    <p>F5: Restart Game</p>
    <p>Eat the red food to grow longer, but don't hit the walls or yourself!</p>
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
  const game = new SnakeGame(canvas);
});

// Snake Game Class
class SnakeGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 20;
    this.snake = [{x: 10, y: 10}]; // Start with a single segment
    this.direction = 'right';
    this.nextDirection = 'right';
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
          this.nextDirection = 'right';
        } else if (dx < 0 && this.direction !== 'right') {
          this.nextDirection = 'left';
        }
      } else {
        // Vertical swipe
        if (dy > 0 && this.direction !== 'up') {
          this.nextDirection = 'down';
        } else if (dy < 0 && this.direction !== 'down') {
          this.nextDirection = 'up';
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
    // Pause/resume with spacebar
    if (e.key === ' ' || e.keyCode === 32) { // Space
      e.preventDefault();
      this.paused = !this.paused;
      return;
    }
    
    // Restart game with F5
    if (e.key === 'F5' || e.keyCode === 116) {
      e.preventDefault();
      this.resetGame();
      return;
    }
    
    // Restart game if game over
    if (this.gameOver && (e.key === 'Enter' || e.keyCode === 13)) { // Enter
      this.resetGame();
      return;
    }
    
    // If game is paused or over, don't process movement
    if (this.paused || this.gameOver) return;
    
    // Handle direction changes with WASD keys
    switch (e.key.toLowerCase()) {
      case 'a': // Left
        if (this.direction !== 'right') this.nextDirection = 'left';
        break;
      case 'w': // Up
        if (this.direction !== 'down') this.nextDirection = 'up';
        break;
      case 'd': // Right
        if (this.direction !== 'left') this.nextDirection = 'right';
        break;
      case 's': // Down
        if (this.direction !== 'up') this.nextDirection = 'down';
        break;
    }
  }
  
  moveSnake() {
    if (this.paused || this.gameOver) return;
    
    // Update direction
    this.direction = this.nextDirection;
    
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
      this.updateScore();
      
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
  
  updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.score}`;
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
      
      // Add Pi Network payment option
      this.ctx.fillStyle = '#00FFFF';
      this.ctx.fillText('Or buy extra lives with Pi', this.canvas.width / 2, this.canvas.height / 2 + 100);
      
      // Create buy button if it doesn't exist
      if (!document.getElementById('snake-buy-lives-button')) {
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Buy Extra Lives (π1.00)';
        buyButton.id = 'snake-buy-lives-button';
        buyButton.style.display = 'block';
        buyButton.style.margin = '20px auto';
        buyButton.style.padding = '10px 20px';
        buyButton.style.backgroundColor = '#333';
        buyButton.style.color = '#FFF';
        buyButton.style.border = '2px solid #FFF';
        buyButton.style.borderRadius = '5px';
        buyButton.style.fontSize = '16px';
        buyButton.style.cursor = 'pointer';
        buyButton.onclick = this.buyExtraLives.bind(this);
        
        const gameContainer = document.getElementById('snake-game-container');
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
    // Remove buy button if exists
    const buyButton = document.getElementById('snake-buy-lives-button');
    if (buyButton) {
      buyButton.remove();
    }
    
    this.snake = [{x: 10, y: 10}];
    this.direction = 'right';
    this.nextDirection = 'right';
    this.food = this.generateFood();
    this.score = 0;
    this.gameOver = false;
    this.paused = false;
    this.speed = 150;
    this.updateScore();
  }
  
  buyExtraLives() {
    console.log("Buy extra lives function called");
    
    if (typeof window.RetroArcade !== 'undefined' && typeof window.RetroArcade.handlePiPayment === 'function') {
      console.log("Initiating Pi payment for extra lives");
      
      window.RetroArcade.handlePiPayment(
        1.0, // amount
        "Extra lives for Snake game", // memo
        "extra_lives", // itemType
        "snake", // gameId
        function(payment) {
          console.log("Payment successful:", payment);
          // Reset game with extra lives
          this.resetGame();
        }.bind(this),
        function(error) {
          console.error("Payment error:", error);
          alert("Payment failed: " + error.message);
        }
      );
    } else {
      console.warn("Pi payment function not available");
      alert("Pi payments are only available in the Pi Browser. For testing, game will be reset for free!");
      
      // For testing outside Pi Browser, reset game for free
      this.resetGame();
    }
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

console.log("Snake game script with WASD controls loaded");
