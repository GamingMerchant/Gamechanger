// Space Invaders Game
class SpaceInvadersGame {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
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
  }
  
  handleKeyPress(e) {
    // Prevent default action for game keys to avoid page scrolling
    if ([32, 37, 38, 39, 40, 13].includes(e.keyCode)) {
      e.preventDefault();
    }
    
    // Pause/resume with P key
    if (e.keyCode === 80) { // P
      this.paused = !this.paused;
      return;
    }
    
    // Restart game if game over
    if ((this.gameOver || this.victory) && e.keyCode === 13) { // Enter
      this.init();
      return;
    }
    
    // If game is paused or over, don't process other inputs
    if (this.paused || this.gameOver || this.victory) return;
    
    // Handle player movement
    switch (e.keyCode) {
      case 37: // Left arrow
        this.player.dx = -this.player.speed;
        break;
      case 39: // Right arrow
        this.player.dx = this.player.speed;
        break;
      case 32: // Space - Shoot
        this.shootBullet();
        break;
    }
  }
  
  handleKeyUp(e) {
    // Stop player movement when key is released
    if (e.keyCode === 37 || e.keyCode === 39) {
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
        
        // Check if enemies reached the bottom (player loses)
        if (enemy.y + enemy.height >= this.player.y) {
          this.gameOver = true;
        }
      });
      
      // Increase enemy speed as fewer enemies remain
      const livingEnemies = this.enemies.filter(enemy => enemy.alive).length;
      const totalEnemies = this.enemyRows * this.enemyCols;
      const speedFactor = 1 + (1 - livingEnemies / totalEnemies) * 2;
      
      this.enemyMoveInterval = Math.max(100, 1000 / speedFactor);
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
      
      // Remove bullet if it goes off screen
      if (this.playerBullet.y < 0) {
        this.playerBullet = null;
      }
    }
    
    // Move enemy bullets
    this.enemyBullets.forEach((bullet, index) => {
      bullet.y += bullet.speed;
      
      // Remove bullet if it goes off screen
      if (bullet.y > this.height) {
        this.enemyBullets.splice(index, 1);
      }
    });
    
    // Random enemy shooting
    if (Math.random() < this.enemyShootChance) {
      this.enemyShoot();
    }
    
    // Check for collisions
    this.checkCollisions();
    
    // Check for victory
    if (this.enemies.every(enemy => !enemy.alive)) {
      this.victory = true;
    }
  }
  
  checkCollisions() {
    // Player bullet vs enemies
    if (this.playerBullet) {
      for (let i = 0; i < this.enemies.length; i++) {
        const enemy = this.enemies[i];
        
        if (enemy.alive && this.checkCollision(this.playerBullet, enemy)) {
          // Enemy hit
          enemy.alive = false;
          this.playerBullet = null;
          
          // Add score based on enemy type (row)
          const pointValues = [30, 20, 20, 10, 10]; // Points for different enemy types
          this.score += pointValues[enemy.type] || 10;
          
          break;
        }
      }
    }
    
    // Player bullet vs shields
    if (this.playerBullet) {
      for (let i = 0; i < this.shields.length; i++) {
        const shield = this.shields[i];
        
        for (let j = 0; j < shield.blocks.length; j++) {
          const block = shield.blocks[j];
          
          if (block.health > 0 && this.checkCollision(this.playerBullet, block)) {
            // Shield block hit
            block.health--;
            this.playerBullet = null;
            break;
          }
        }
        
        if (!this.playerBullet) break;
      }
    }
    
    // Enemy bullets vs player
    for (let i = 0; i < this.enemyBullets.length; i++) {
      const bullet = this.enemyBullets[i];
      
      if (this.checkCollision(bullet, {
        x: this.player.x - this.player.width / 2,
        y: this.player.y - this.player.height / 2,
        width: this.player.width,
        height: this.player.height
      })) {
        // Player hit
        this.lives--;
        this.enemyBullets.splice(i, 1);
        
        if (this.lives <= 0) {
          this.gameOver = true;
        }
        
        break;
      }
    }
    
    // Enemy bullets vs shields
    for (let i = 0; i < this.enemyBullets.length; i++) {
      const bullet = this.enemyBullets[i];
      let bulletRemoved = false;
      
      for (let j = 0; j < this.shields.length; j++) {
        const shield = this.shields[j];
        
        for (let k = 0; k < shield.blocks.length; k++) {
          const block = shield.blocks[k];
          
          if (block.health > 0 && this.checkCollision(bullet, block)) {
            // Shield block hit
            block.health--;
            this.enemyBullets.splice(i, 1);
            bulletRemoved = true;
            break;
          }
        }
        
        if (bulletRemoved) break;
      }
      
      if (bulletRemoved) {
        i--; // Adjust index after removing bullet
      }
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
  
  draw() {
    // Clear canvas
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    // Draw player
    this.ctx.fillStyle = this.colors.player;
    this.ctx.fillRect(
      this.player.x - this.player.width / 2,
      this.player.y - this.player.height / 2,
      this.player.width,
      this.player.height
    );
    
    // Draw cannon on top of player
    this.ctx.fillRect(
      this.player.x - 3,
      this.player.y - this.player.height / 2 - 10,
      6,
      10
    );
    
    // Draw enemies
    this.enemies.forEach(enemy => {
      if (!enemy.alive) return;
      
      this.ctx.fillStyle = this.colors.enemy;
      
      // Different enemy shapes based on type (row)
      switch (enemy.type) {
        case 0: // Top row - special enemy
          // Draw octopus-like shape
          this.ctx.fillRect(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
          );
          // Tentacles
          this.ctx.fillRect(enemy.x + 5, enemy.y + enemy.height, 4, 5);
          this.ctx.fillRect(enemy.x + enemy.width - 9, enemy.y + enemy.height, 4, 5);
          break;
          
        case 1:
        case 2: // Middle rows
          // Draw crab-like shape
          this.ctx.fillRect(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
          );
          // Claws
          this.ctx.fillRect(enemy.x - 5, enemy.y + 5, 5, 5);
          this.ctx.fillRect(enemy.x + enemy.width, enemy.y + 5, 5, 5);
          break;
          
        default: // Bottom rows
          // Draw squid-like shape
          this.ctx.fillRect(
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
          );
          // Tentacles
          this.ctx.fillRect(enemy.x + 5, enemy.y - 5, 5, 5);
          this.ctx.fillRect(enemy.x + enemy.width - 10, enemy.y - 5, 5, 5);
      }
    });
    
    // Draw shields
    this.shields.forEach(shield => {
      shield.blocks.forEach(block => {
        if (block.health <= 0) return;
        
        // Color based on health
        let alpha = block.health / 3;
        this.ctx.fillStyle = `rgba(0, 0, 255, ${alpha})`;
        
        this.ctx.fillRect(
          block.x,
          block.y,
          block.width,
          block.height
        );
      });
    });
    
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
    this.enemyBullets.forEach(bullet => {
      this.ctx.fillStyle = this.colors.bullet;
      this.ctx.fillRect(
        bullet.x - bullet.width / 2,
        bullet.y,
        bullet.width,
        bullet.height
      );
    });
    
    // Draw score
    this.ctx.fillStyle = this.colors.text;
    this.ctx.font = '16px "Press Start 2P", monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`SCORE: ${this.score}`, 20, 30);
    
    // Draw lives
    this.ctx.fillText(`LIVES: ${this.lives}`, this.width - 150, 30);
    
    // Draw game over message
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = this.colors.text;
      this.ctx.font = '24px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 20);
      
      this.ctx.font = '16px "Press Start 2P", monospace';
      this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.width / 2, this.height / 2 + 20);
      this.ctx.fillText('PRESS ENTER TO RESTART', this.width / 2, this.height / 2 + 60);
    }
    
    // Draw victory message
    if (this.victory) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      
      this.ctx.fillStyle = this.colors.text;
      this.ctx.font = '24px "Press Start 2P", monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('VICTORY!', this.width / 2, this.height / 2 - 20);
      
      this.ctx.font = '16px "Press Start 2P", monospace';
      this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.width / 2, this.height / 2 + 20);
      this.ctx.fillText('PRESS ENTER TO PLAY AGAIN', this.width / 2, this.height / 2 + 60);
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
      this.ctx.fillText('PRESS P TO CONTINUE', this.width / 2, this.height / 2 + 40);
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
  module.exports = SpaceInvadersGame;
} else {
  window.SpaceInvadersGame = SpaceInvadersGame;
}
