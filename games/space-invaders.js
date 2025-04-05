// Space Invaders Game with auto-canvas creation
// Wait for full page load before initializing
window.addEventListener('load', function() {
  console.log("Window loaded - Starting Space Invaders Game");
  
  // Remove loading screen if exists
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
    console.log("Loading screen removed");
  }
  
  // Create game container
  const gameContainer = document.createElement('div');
  gameContainer.id = 'space-invaders-game-container';
  gameContainer.style.maxWidth = '800px';
  gameContainer.style.margin = '0 auto';
  gameContainer.style.padding = '20px';
  
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
  scoreElement.textContent = 'Score: 0 | Lives: 3 | Level: 1';
  
  // Create instructions (after the game)
  const instructionsDiv = document.createElement('div');
  instructionsDiv.style.textAlign = 'center';
  instructionsDiv.style.margin = '20px auto';
  instructionsDiv.style.padding = '10px';
  instructionsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  instructionsDiv.style.color = '#fff';
  instructionsDiv.style.borderRadius = '5px';
  instructionsDiv.innerHTML = `
    <h3>How to Play Space Invaders</h3>
    <p>Use the WASD keys to control your ship:</p>
    <p>A: Move Left</p>
    <p>D: Move Right</p>
    <p>Space: Fire</p>
    <p>P: Pause/Resume</p>
    <p>F5: Restart Game</p>
    <p>Destroy all aliens before they reach the bottom of the screen!</p>
    <p>Use the shields for protection, but be careful - they can be destroyed.</p>
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
  const game = new SpaceInvadersGame(canvas);
});

// Space Invaders Game Class
class SpaceInvadersGame {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    
    // Game dimensions
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    
    // Game state
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    this.victory = false;
    
    // Game speed
    this.lastTime = 0;
    this.enemyMoveInterval = 1000; // milliseconds between enemy moves
    this.lastEnemyMove = 0;
    
    // Retro color scheme
    this.colors = {
      background: '#000',
      player: '#0f0',    // Bright green
      enemy: '#f00',     // Bright red
      bullet: '#fff',    // White
      text: '#0f0',      // Bright green
      shield: '#00f'     // Blue
    };
    
    // Initialize game objects
    this.init();
    
    // Set up event listeners
    document.addEventListener('keydown', this.handleKeyPress.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Touch controls for mobile
    this.setupTouchControls();
    
    // Game loop
    this.gameLoop = this.gameLoop.bind(this);
    requestAnimationFrame(this.gameLoop);
  }
  
  setupTouchControls() {
    // Create touch control elements
    const touchControls = document.createElement('div');
    touchControls.id = 'space-invaders-touch-controls';
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
    const fireButton = this.createButton('🔥');
    const pauseButton = this.createButton('⏸️');
    
    // Add buttons to controls
    touchControls.appendChild(leftButton);
    touchControls.appendChild(rightButton);
    touchControls.appendChild(fireButton);
    touchControls.appendChild(pauseButton);
    
    // Add controls to document
    const gameContainer = document.getElementById('space-invaders-game-container');
    if (gameContainer) {
      gameContainer.appendChild(touchControls);
    }
    
    // Add event listeners
    leftButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.player.dx = -this.player.speed;
    });
    
    leftButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (this.player.dx < 0) this.player.dx = 0;
    });
    
    rightButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.player.dx = this.player.speed;
    });
    
    rightButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (this.player.dx > 0) this.player.dx = 0;
    });
    
    fireButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.shootBullet();
    });
    
    pauseButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.paused = !this.paused;
    });
    
    // Canvas touch events for tap to shoot
    let touchStartX = 0;
    let isShooting = false;
    
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      touchStartX = touch.clientX - rect.left;
      
      // Tap top half of screen to shoot
      if (touch.clientY - rect.top < this.height / 2) {
        this.shootBullet();
        isShooting = true;
      }
      
      e.preventDefault();
    }, false);
    
    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const currentX = touch.clientX - rect.left;
      
      // Move player based on touch position
      this.player.x = Math.max(
        this.player.width / 2,
        Math.min(this.width - this.player.width / 2, currentX)
      );
      
      e.preventDefault();
    }, false);
    
    this.canvas.addEventListener('touchend', (e) => {
      isShooting = false;
      e.preventDefault();
    }, false);
  }
  
  createButton(text) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.width = '60px';
    button.style.height = '60px';
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
    // Player properties
    this.player = {
      width: 40,
      height: 20,
      x: this.width / 2,
      y: this.height - 40,
      speed: 5,
      dx: 0
    };
    
    // Bullet properties
    this.playerBullet = null;
    this.enemyBullets = [];
    this.bulletSpeed = 7;
    this.enemyBulletSpeed = 3;
    this.enemyShootChance = 0.02; // Chance of enemy shooting per frame
    
    // Enemy properties
    this.enemyRows = 5;
    this.enemyCols = 11;
    this.enemyWidth = 30;
    this.enemyHeight = 20;
    this.enemyPadding = 10;
    this.enemyOffsetTop = 60;
    this.enemyOffsetLeft = (this.width - (this.enemyCols * (this.enemyWidth + this.enemyPadding))) / 2;
    this.enemyDirection = 1; // 1 for right, -1 for left
    this.enemySpeed = 1;
    this.enemyDropAmount = 20; // How far enemies drop when reaching edge
    
    // Create enemies
    this.enemies = [];
    for (let row = 0; row < this.enemyRows; row++) {
      for (let col = 0; col < this.enemyCols; col++) {
        this.enemies.push({
          x: this.enemyOffsetLeft + col * (this.enemyWidth + this.enemyPadding),
          y: this.enemyOffsetTop + row * (this.enemyHeight + this.enemyPadding),
          width: this.enemyWidth,
          height: this.enemyHeight,
          type: row, // Different enemy types based on row
          alive: true
        });
      }
    }
    
    // Create shields
    this.shields = [];
    const shieldCount = 4;
    const shieldWidth = 60;
    const shieldHeight = 40;
    const shieldPadding = (this.width - (shieldCount * shieldWidth)) / (shieldCount + 1);
    
    for (let i = 0; i < shieldCount; i++) {
      const shield = {
        x: shieldPadding + i * (shieldWidth + shieldPadding),
        y: this.height - 100,
        width: shieldWidth,
        height: shieldHeight,
        blocks: []
      };
      
      // Create shield blocks (smaller rectangles that make up the shield)
      const blockSize = 6;
      for (let row = 0; row < shieldHeight / blockSize; row++) {
        for (let col = 0; col < shieldWidth / blockSize; col++) {
          // Create shield shape (inverted U)
          if (row > 0 || col < 2 || col >= shieldWidth / blockSize - 2) {
            shield.blocks.push({
              x: shield.x + col * blockSize,
              y: shield.y + row * blockSize,
              width: blockSize,
              height: blockSize,
              health: 3 // Blocks can take multiple hits
            });
          }
        }
      }
      
      this.shields.push(shield);
    }
    
    // Reset game state
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;
    this.victory = false;
    
    // Reset game speed
    this.enemyMoveInterval = 1000;
    
    // Update score display
    this.updateScoreDisplay();
  }
  
  updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = `Score: ${this.score} | Lives: ${this.lives} | Level: ${this.level}`;
    }
  }
  
  handleKeyPress(e) {
    // Restart game with F5
    if (e.key === 'F5' || e.keyCode === 116) {
      e.preventDefault();
      this.init();
      return;
    }
    
    // Pause/resume with P key
    if (e.key === 'p' || e.key === 'P' || e.keyCode === 80) { // P
      e.preventDefault();
      this.paused = !this.paused;
      return;
    }
    
    // Restart game if game over or victory
    if ((this.gameOver || this.victory) && (e.key === 'Enter' || e.keyCode === 13)) { // Enter
      this.init();
      return;
    }
    
    // If game is paused or over, don't process other inputs
    if (this.paused || this.gameOver || this.victory) return;
    
    // Handle player movement with WASD keys
    switch (e.key.toLowerCase()) {
      case 'a': // Left
        e.preventDefault();
        this.player.dx = -this.player.speed;
        break;
      case 'd': // Right
        e.preventDefault();
        this.player.dx = this.player.speed;
        break;
      case ' ': // Space - Shoot
        e.preventDefault();
        this.shootBullet();
        break;
    }
  }
  
  handleKeyUp(e) {
    // Stop player movement when key is released
    if (e.key === 'a' || e.key === 'A' || e.key === 'd' || e.key === 'D') {
      this.player.dx = 0;
    }
  }
  
  shootBullet() {
    // Only allow one player bullet at a time
    if (!this.playerBullet && !this.gameOver && !this.paused && !this.victory) {
      this.playerBullet = {
        x: this.player.x,
        y: this.player.y - 10,
        width: 3,
        height: 15,
        speed: this.bulletSpeed
      };
    }
  }
  
  enemyShoot() {
    // Only living enemies can shoot
    const livingEnemies = this.enemies.filter(enemy => enemy.alive);
    if (livingEnemies.length === 0) return;
    
    // Find the lowest enemy in each column
    const columns = {};
    livingEnemies.forEach(enemy => {
      const col = Math.floor((enemy.x - this.enemyOffsetLeft) / (this.enemyWidth + this.enemyPadding));
      if (!columns[col] || enemy.y > columns[col].y) {
        columns[col] = enemy;
      }
    });
    
    // Randomly select a column to shoot from
    const lowestEnemies = Object.values(columns);
    const randomEnemy = lowestEnemies[Math.floor(Math.random() * lowestEnemies.length)];
    
    this.enemyBullets.push({
      x: randomEnemy.x + randomEnemy.width / 2,
      y: randomEnemy.y + randomEnemy.height,
      width: 3,
      height: 15,
      speed: this.enemyBulletSpeed
    });
  }
  
  moveEnemies(currentTime) {
    // Move enemies at intervals
    if (currentTime - this.lastEnemyMove > this.enemyMoveInterval) {
      this.lastEnemyMove = currentTime;
      
      let moveDown = false;
      let leftMost = this.width;
      let rightMost = 0;
      
      // Find leftmost and rightmost enemies
      this.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        leftMost = Math.min(leftMost, enemy.x);
        rightMost = Math.max(rightMost, enemy.x + enemy.width);
      });
      
      // Check if enemies hit edge of screen
      if (rightMost >= this.width - 10 && this.enemyDirection > 0) {
        this.enemyDirection = -1;
        moveDown = true;
      } else if (leftMost <= 10 && this.enemyDirection < 0) {
        this.enemyDirection = 1;
        moveDown = true;
      }
      
      // Move all enemies
      this.enemies.forEach(enemy => {
        if (!enemy.alive) return;
        
        enemy.x += this.enemyDirection * this.enemySpeed;
        
        if (moveDown) {
          enemy.y += this.enemyDropAmount;
        }
        
        // Check if enemies reached bottom (game over)
        if (enemy.y + enemy.height >= this.player.y) {
          this.gameOver = true;
        }
      });
    }
  }
  
  update(currentTime) {
    if (this.gameOver || this.paused || this.victory) return;
    
    // Move player
    this.player.x += this.player.dx;
    
    // Keep player within bounds
    if (this.player.x < this.player.width / 2) {
      this.player.x = this.player.width / 2;
    } else if (this.player.x > this.width - this.player.width / 2) {
      this.player.x = this.width - this.player.width / 2;
    }
    
    // Move enemies
    this.moveEnemies(currentTime);
    
    // Move player bullet
    if (this.playerBullet) {
      this.playerBullet.y -= this.playerBullet.speed;
      
      // Check if bullet is off screen
      if (this.playerBullet.y + this.playerBullet.height < 0) {
        this.playerBullet = null;
      } else {
        // Check for collision with enemies
        for (let i = 0; i < this.enemies.length; i++) {
          const enemy = this.enemies[i];
          if (!enemy.alive) continue;
          
          if (this.checkCollision(this.playerBullet, enemy)) {
            // Enemy hit
            enemy.alive = false;
            this.playerBullet = null;
            
            // Add score based on enemy type
            this.score += (5 - enemy.type) * 10; // Higher rows worth more
            this.updateScoreDisplay();
            
            // Check if all enemies are defeated
            if (this.enemies.every(e => !e.alive)) {
              this.levelComplete();
            }
            
            break;
          }
        }
        
        // Check for collision with shields
        if (this.playerBullet) {
          this.checkShieldCollision(this.playerBullet, true);
        }
      }
    }
    
    // Move enemy bullets
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];
      bullet.y += bullet.speed;
      
      // Check if bullet is off screen
      if (bullet.y > this.height) {
        this.enemyBullets.splice(i, 1);
        continue;
      }
      
      // Check for collision with player
      if (this.checkCollision(bullet, this.player)) {
        // Player hit
        this.enemyBullets.splice(i, 1);
        this.lives--;
        this.updateScoreDisplay();
        
        if (this.lives <= 0) {
          this.gameOver = true;
        }
        
        continue;
      }
      
      // Check for collision with shields
      this.checkShieldCollision(bullet, false);
    }
    
    // Random enemy shooting
    if (Math.random() < this.enemyShootChance) {
      this.enemyShoot();
    }
  }
  
  checkCollision(rect1, rect2) {
    return (
      rect1.x < rect2.x + rect2.width &&
      rect1.x + rect1.width > rect2.x &&
      rect1.y < rect2.y + rect2.height &&
      rect1.y + rect1.height > rect2.y
    );
  }
  
  checkShieldCollision(bullet, isPlayerBullet) {
    for (const shield of this.shields) {
      for (let i = shield.blocks.length - 1; i >= 0; i--) {
        const block = shield.blocks[i];
        
        if (this.checkCollision(bullet, block)) {
          // Reduce block health
          block.health--;
          
          // Remove block if health depleted
          if (block.health <= 0) {
            shield.blocks.splice(i, 1);
          }
          
          // Remove bullet
          if (isPlayerBullet) {
            this.playerBullet = null;
          } else {
            const index = this.enemyBullets.indexOf(bullet);
            if (index !== -1) {
              this.enemyBullets.splice(index, 1);
            }
          }
          
          return true;
        }
      }
    }
    
    return false;
  }
  
  levelComplete() {
    this.victory = true;
    
    // Create next level button if it doesn't exist
    if (!document.getElementById('space-invaders-next-level-button')) {
      const nextLevelButton = document.createElement('button');
      nextLevelButton.textContent = 'Next Level';
      nextLevelButton.id = 'space-invaders-next-level-button';
      nextLevelButton.style.display = 'block';
      nextLevelButton.style.margin = '20px auto';
      nextLevelButton.style.padding = '10px 20px';
      nextLevelButton.style.backgroundColor = '#333';
      nextLevelButton.style.color = '#FFF';
      nextLevelButton.style.border = '2px solid #FFF';
      nextLevelButton.style.borderRadius = '5px';
      nextLevelButton.style.fontSize = '16px';
      nextLevelButton.style.cursor = 'pointer';
      nextLevelButton.onclick = this.nextLevel.bind(this);
      
      const gameContainer = document.getElementById('space-invaders-game-container');
      if (gameContainer) {
        gameContainer.appendChild(nextLevelButton);
      }
    }
  }
  
  nextLevel() {
    // Remove next level button if exists
    const nextLevelButton = document.getElementById('space-invaders-next-level-button');
    if (nextLevelButton) {
      nextLevelButton.remove();
    }
    
    // Increment level
    this.level++;
    
    // Reset game state but keep score and lives
    this.playerBullet = null;
    this.enemyBullets = [];
    this.victory = false;
    
    // Increase difficulty
    this.enemyMoveInterval = Math.max(200, 1000 - (this.level - 1) * 100);
    this.enemySpeed = Math.min(3, 1 + (this.level - 1) * 0.5);
    this.enemyShootChance = Math.min(0.05, 0.02 + (this.level - 1) * 0.005);
    
    // Reset enemies
    this.enemies = [];
    for (let row = 0; row < this.enemyRows; row++) {
      for (let col = 0; col < this.enemyCols; col++) {
        this.enemies.push({
          x: this.enemyOffsetLeft + col * (this.enemyWidth + this.enemyPadding),
          y: this.enemyOffsetTop + row * (this.enemyHeight + this.enemyPadding),
          width: this.enemyWidth,
          height: this.enemyHeight,
          type: row, // Different enemy types based on row
          alive: true
        });
      }
    }
    
    // Reset shields
    this.shields = [];
    const shieldCount = 4;
    const shieldWidth = 60;
    const shieldHeight = 40;
    const shieldPadding = (this.width - (shieldCount * shieldWidth)) / (shieldCount + 1);
    
    for (let i = 0; i < shieldCount; i++) {
      const shield = {
        x: shieldPadding + i * (shieldWidth + shieldPadding),
        y: this.height - 100,
        width: shieldWidth,
        height: shieldHeight,
        blocks: []
      };
      
      // Create shield blocks (smaller rectangles that make up the shield)
      const blockSize = 6;
      for (let row = 0; row < shieldHeight / blockSize; row++) {
        for (let col = 0; col < shieldWidth / blockSize; col++) {
          // Create shield shape (inverted U)
          if (row > 0 || col < 2 || col >= shieldWidth / blockSize - 2) {
            shield.blocks.push({
              x: shield.x + col * blockSize,
              y: shield.y + row * blockSize,
              width: blockSize,
              height: blockSize,
              health: 3 // Blocks can take multiple hits
            });
          }
        }
      }
      
      this.shields.push(shield);
    }
    
    // Update score display
    this.updateScoreDisplay();
  }
  
  draw() {
    // Clear canvas
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw player
    this.ctx.fillStyle = this.colors.player;
    this.ctx.fillRect(
      this.player.x - this.player.width / 2,
      this.player.y,
      this.player.width,
      this.player.height
    );
    
    // Draw player bullet
    if (this.playerBullet) {
      this.ctx.fillStyle = this.colors.bullet;
      this.ctx.fillRect(
        this.playerBullet.x - this.playerBullet.width / 2,
        this.playerBullet.y,
        this.playerBullet.width,
        this.playerBullet.height
      );
    }
    
    // Draw enemy bullets
    this.ctx.fillStyle = this.colors.enemy;
    this.enemyBullets.forEach(bullet => {
      this.ctx.fillRect(
        bullet.x - bullet.width / 2,
        bullet.y,
        bullet.width,
        bullet.height
      );
    });
    
    // Draw enemies
    this.enemies.forEach(enemy => {
      if (!enemy.alive) return;
      
      // Different colors based on enemy type
      switch (enemy.type) {
        case 0:
          this.ctx.fillStyle = '#f00'; // Red
          break;
        case 1:
          this.ctx.fillStyle = '#f0a'; // Pink
          break;
        case 2:
          this.ctx.fillStyle = '#a0f'; // Purple
          break;
        case 3:
          this.ctx.fillStyle = '#0af'; // Light blue
          break;
        case 4:
          this.ctx.fillStyle = '#0f0'; // Green
          break;
        default:
          this.ctx.fillStyle = '#fff'; // White
      }
      
      this.ctx.fillRect(
        enemy.x,
        enemy.y,
        enemy.width,
        enemy.height
      );
      
      // Draw enemy details
      this.ctx.fillStyle = '#000';
      this.ctx.fillRect(
        enemy.x + 5,
        enemy.y + 5,
        enemy.width - 10,
        enemy.height - 10
      );
      
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(
        enemy.x + 8,
        enemy.y + 8,
        enemy.width - 16,
        enemy.height - 16
      );
    });
    
    // Draw shields
    this.ctx.fillStyle = this.colors.shield;
    this.shields.forEach(shield => {
      shield.blocks.forEach(block => {
        // Color based on health
        switch (block.health) {
          case 3:
            this.ctx.fillStyle = '#00f'; // Blue
            break;
          case 2:
            this.ctx.fillStyle = '#008'; // Dark blue
            break;
          case 1:
            this.ctx.fillStyle = '#004'; // Very dark blue
            break;
        }
        
        this.ctx.fillRect(
          block.x,
          block.y,
          block.width,
          block.height
        );
      });
    });
    
    // Draw game over message
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = this.colors.text;
      this.ctx.font = '24px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 20);
      this.ctx.font = '16px "Press Start 2P", monospace';
      this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 20);
      this.ctx.fillText('Press ENTER to restart', this.width / 2, this.height / 2 + 60);
      
      // Add Pi Network payment option
      this.ctx.fillStyle = '#00FFFF';
      this.ctx.fillText('Or unlock Special Weapons with Pi', this.width / 2, this.height / 2 + 100);
      
      // Create buy button if it doesn't exist
      if (!document.getElementById('space-invaders-unlock-weapons-button')) {
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Unlock Special Weapons (π2.50)';
        buyButton.id = 'space-invaders-unlock-weapons-button';
        buyButton.style.display = 'block';
        buyButton.style.margin = '20px auto';
        buyButton.style.padding = '10px 20px';
        buyButton.style.backgroundColor = '#333';
        buyButton.style.color = '#FFF';
        buyButton.style.border = '2px solid #FFF';
        buyButton.style.borderRadius = '5px';
        buyButton.style.fontSize = '16px';
        buyButton.style.cursor = 'pointer';
        buyButton.onclick = this.unlockSpecialWeapons.bind(this);
        
        const gameContainer = document.getElementById('space-invaders-game-container');
        if (gameContainer) {
          gameContainer.appendChild(buyButton);
        }
      }
    }
    
    // Draw victory message
    if (this.victory) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = '#0f0';
      this.ctx.font = '24px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('LEVEL COMPLETE!', this.width / 2, this.height / 2 - 20);
      this.ctx.font = '16px "Press Start 2P", monospace';
      this.ctx.fillText(`Score: ${this.score}`, this.width / 2, this.height / 2 + 20);
      this.ctx.fillText('Click "Next Level" to continue', this.width / 2, this.height / 2 + 60);
    }
    
    // Draw pause message
    if (this.paused && !this.gameOver && !this.victory) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = this.colors.text;
      this.ctx.font = '24px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
      this.ctx.font = '16px "Press Start 2P", monospace';
      this.ctx.fillText('Press P to continue', this.width / 2, this.height / 2 + 40);
    }
  }
  
  gameLoop(currentTime) {
    requestAnimationFrame(this.gameLoop);
    
    // Update game state
    this.update(currentTime);
    
    // Render game
    this.draw();
  }
  
  unlockSpecialWeapons() {
    console.log("Unlock special weapons function called");
    
    if (typeof window.RetroArcade !== 'undefined' && typeof window.RetroArcade.handlePiPayment === 'function') {
      console.log("Initiating Pi payment for special weapons");
      
      window.RetroArcade.handlePiPayment(
        2.5, // amount
        "Special weapons for Space Invaders game", // memo
        "special_weapons", // itemType
        "space_invaders", // gameId
        function(payment) {
          console.log("Payment successful:", payment);
          // Start game with special weapons
          this.startSpecialWeaponsMode();
        }.bind(this),
        function(error) {
          console.error("Payment error:", error);
          alert("Payment failed: " + error.message);
        }
      );
    } else {
      console.warn("Pi payment function not available");
      alert("Pi payments are only available in the Pi Browser. For testing, special weapons will be enabled for free!");
      
      // For testing outside Pi Browser, enable special weapons for free
      this.startSpecialWeaponsMode();
    }
  }
  
  startSpecialWeaponsMode() {
    // Remove buy button if exists
    const buyButton = document.getElementById('space-invaders-unlock-weapons-button');
    if (buyButton) {
      buyButton.remove();
    }
    
    // Reset game with special weapons
    this.init();
    
    // Special weapons settings
    this.bulletSpeed = 10; // Faster bullets
    this.playerBullet = null;
    
    // Update player appearance
    this.player.width = 50; // Wider ship
    
    // Update instructions
    const instructionsDiv = document.querySelector('#space-invaders-game-container div:last-child');
    if (instructionsDiv) {
      instructionsDiv.innerHTML = `
        <h3>SPECIAL WEAPONS ACTIVATED!</h3>
        <p>Use the WASD keys to control your ship:</p>
        <p>A: Move Left</p>
        <p>D: Move Right</p>
        <p>Space: Fire Special Weapon</p>
        <p>P: Pause/Resume</p>
        <p>F5: Restart Game</p>
        <p>Your ship now has enhanced firepower!</p>
      `;
    }
    
    // Override shootBullet method for special weapons
    this.originalShootBullet = this.shootBullet;
    this.shootBullet = this.shootSpecialWeapon;
  }
  
  shootSpecialWeapon() {
    // Triple shot special weapon
    if (!this.gameOver && !this.paused && !this.victory) {
      // Center bullet
      this.playerBullet = {
        x: this.player.x,
        y: this.player.y - 10,
        width: 3,
        height: 15,
        speed: this.bulletSpeed
      };
      
      // Side bullets (implemented as enemy bullets but moving upward)
      this.enemyBullets.push({
        x: this.player.x - 10,
        y: this.player.y - 5,
        width: 3,
        height: 15,
        speed: -this.bulletSpeed, // Negative speed to move upward
        isPlayerBullet: true // Flag to identify as player bullet
      });
      
      this.enemyBullets.push({
        x: this.player.x + 10,
        y: this.player.y - 5,
        width: 3,
        height: 15,
        speed: -this.bulletSpeed, // Negative speed to move upward
        isPlayerBullet: true // Flag to identify as player bullet
      });
    }
  }
}

console.log("Space Invaders game script with WASD controls loaded");
