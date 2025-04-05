// Updated Pong Game with WASD controls and top positioning
// This version creates its own canvas and works with any HTML structure

// Wait for full page load before initializing
window.addEventListener('load', function() {
    console.log("Window loaded - Starting Pong Game");
    
    // Remove loading screen if exists
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
        console.log("Loading screen removed");
    }
    
    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.id = 'pong-game-container';
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
    scoreElement.textContent = 'Player: 0 | AI: 0';
    
    // Create difficulty selector
    const difficultyContainer = document.createElement('div');
    difficultyContainer.style.textAlign = 'center';
    difficultyContainer.style.margin = '10px auto';
    
    const difficultyLabel = document.createElement('span');
    difficultyLabel.textContent = 'Difficulty: ';
    difficultyLabel.style.color = '#fff';
    difficultyLabel.style.marginRight = '10px';
    
    const difficultySelect = document.createElement('select');
    difficultySelect.id = 'difficulty';
    difficultySelect.style.padding = '5px';
    difficultySelect.style.backgroundColor = '#333';
    difficultySelect.style.color = '#fff';
    difficultySelect.style.border = '1px solid #fff';
    
    const difficulties = ['Easy', 'Medium', 'Hard'];
    difficulties.forEach(diff => {
        const option = document.createElement('option');
        option.value = diff.toLowerCase();
        option.textContent = diff;
        difficultySelect.appendChild(option);
    });
    
    difficultyContainer.appendChild(difficultyLabel);
    difficultyContainer.appendChild(difficultySelect);
    
    // Create instructions (after the game)
    const instructionsDiv = document.createElement('div');
    instructionsDiv.style.textAlign = 'center';
    instructionsDiv.style.margin = '20px auto';
    instructionsDiv.style.padding = '10px';
    instructionsDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    instructionsDiv.style.color = '#fff';
    instructionsDiv.style.borderRadius = '5px';
    instructionsDiv.innerHTML = `
        <h3>How to Play Pong</h3>
        <p>Use the W and S keys to move your paddle up and down:</p>
        <p>W: Move Paddle Up</p>
        <p>S: Move Paddle Down</p>
        <p>Space: Pause/Resume</p>
        <p>F5: Restart Game</p>
        <p>First player to reach 10 points wins!</p>
    `;
    
    // Add elements to container in the desired order
    gameContainer.appendChild(canvas);
    gameContainer.appendChild(scoreElement);
    gameContainer.appendChild(difficultyContainer);
    gameContainer.appendChild(instructionsDiv);
    
    // Add container to document at the beginning
    const mainContent = document.querySelector('main') || document.body;
    if (mainContent.firstChild) {
        mainContent.insertBefore(gameContainer, mainContent.firstChild);
    } else {
        mainContent.appendChild(gameContainer);
    }
    
    // Get canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("Could not get canvas context");
        alert("Your browser doesn't support canvas. Please try a different browser.");
        return;
    }
    
    // Game variables
    const paddleWidth = 10;
    const paddleHeight = 80;
    const ballSize = 10;
    let playerScore = 0;
    let aiScore = 0;
    let gameRunning = true;
    let gamePaused = false;
    let multiplayer = false;
    let gameLoop;
    
    // Player paddle
    let playerPaddle = {
        x: 50,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        speed: 8,
        isMovingUp: false,
        isMovingDown: false
    };
    
    // AI paddle
    let aiPaddle = {
        x: canvas.width - 50 - paddleWidth,
        y: canvas.height / 2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        speed: 5
    };
    
    // Ball
    let ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: ballSize,
        speedX: 5,
        speedY: 5
    };
    
    // Initialize game
    setupControls();
    setupDifficultySelector();
    startGameLoop();
    
    // Set up difficulty selector
    function setupDifficultySelector() {
        difficultySelect.addEventListener('change', function() {
            const difficulty = this.value;
            
            switch(difficulty) {
                case 'easy':
                    aiPaddle.speed = 3;
                    break;
                case 'medium':
                    aiPaddle.speed = 5;
                    break;
                case 'hard':
                    aiPaddle.speed = 7;
                    break;
            }
        });
    }
    
    // Start game loop
    function startGameLoop() {
        if (gameLoop) cancelAnimationFrame(gameLoop);
        gameLoop = requestAnimationFrame(update);
    }
    
    // Update game state
    function update() {
        if (!gameRunning || gamePaused) {
            gameLoop = requestAnimationFrame(update);
            return;
        }
        
        // Move player paddle
        if (playerPaddle.isMovingUp) {
            playerPaddle.y -= playerPaddle.speed;
            if (playerPaddle.y < 0) playerPaddle.y = 0;
        }
        
        if (playerPaddle.isMovingDown) {
            playerPaddle.y += playerPaddle.speed;
            if (playerPaddle.y > canvas.height - playerPaddle.height) {
                playerPaddle.y = canvas.height - playerPaddle.height;
            }
        }
        
        // Move AI paddle
        if (!multiplayer) {
            // Simple AI: follow the ball
            const paddleCenter = aiPaddle.y + aiPaddle.height / 2;
            const ballCenter = ball.y + ball.size / 2;
            
            if (paddleCenter < ballCenter - 10) {
                aiPaddle.y += aiPaddle.speed;
                if (aiPaddle.y > canvas.height - aiPaddle.height) {
                    aiPaddle.y = canvas.height - aiPaddle.height;
                }
            } else if (paddleCenter > ballCenter + 10) {
                aiPaddle.y -= aiPaddle.speed;
                if (aiPaddle.y < 0) aiPaddle.y = 0;
            }
        }
        
        // Move ball
        ball.x += ball.speedX;
        ball.y += ball.speedY;
        
        // Ball collision with top and bottom
        if (ball.y <= 0 || ball.y + ball.size >= canvas.height) {
            ball.speedY = -ball.speedY;
            playSound('wall');
        }
        
        // Ball collision with paddles
        if (
            ball.x <= playerPaddle.x + playerPaddle.width &&
            ball.y + ball.size >= playerPaddle.y &&
            ball.y <= playerPaddle.y + playerPaddle.height &&
            ball.speedX < 0
        ) {
            ball.speedX = -ball.speedX;
            
            // Adjust ball angle based on where it hits the paddle
            const hitPosition = (ball.y + ball.size / 2) - (playerPaddle.y + playerPaddle.height / 2);
            ball.speedY = hitPosition * 0.2;
            
            playSound('paddle');
        }
        
        if (
            ball.x + ball.size >= aiPaddle.x &&
            ball.y + ball.size >= aiPaddle.y &&
            ball.y <= aiPaddle.y + aiPaddle.height &&
            ball.speedX > 0
        ) {
            ball.speedX = -ball.speedX;
            
            // Adjust ball angle based on where it hits the paddle
            const hitPosition = (ball.y + ball.size / 2) - (aiPaddle.y + aiPaddle.height / 2);
            ball.speedY = hitPosition * 0.2;
            
            playSound('paddle');
        }
        
        // Ball out of bounds
        if (ball.x < 0) {
            // AI scores
            aiScore++;
            updateScore();
            resetBall();
            playSound('score');
            
            if (aiScore >= 10) {
                gameOver(false);
                return;
            }
        }
        
        if (ball.x + ball.size > canvas.width) {
            // Player scores
            playerScore++;
            updateScore();
            resetBall();
            playSound('score');
            
            if (playerScore >= 10) {
                gameOver(true);
                return;
            }
        }
        
        // Draw game
        draw();
        
        // Request next frame
        gameLoop = requestAnimationFrame(update);
    }
    
    // Draw game
    function draw() {
        // Clear canvas
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw center line
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw paddles
        ctx.fillStyle = '#fff';
        ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
        ctx.fillRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);
        
        // Draw ball
        ctx.fillRect(ball.x, ball.y, ball.size, ball.size);
        
        // Draw multiplayer indicator if active
        if (multiplayer) {
            ctx.fillStyle = '#00FFFF';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('MULTIPLAYER MODE ACTIVE', canvas.width / 2, 20);
        }
        
        // Draw pause indicator if game is paused
        if (gamePaused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
            ctx.font = '16px Arial';
            ctx.fillText('Press SPACE to resume', canvas.width / 2, canvas.height / 2 + 30);
        }
    }
    
    // Reset ball to center
    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.speedX = ball.speedX > 0 ? -5 : 5;
        ball.speedY = Math.random() * 6 - 3;
    }
    
    // Set up controls
    function setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', function(e) {
            if (e.key === 'F5' || e.keyCode === 116) {
                e.preventDefault();
                resetGame();
                return;
            }
            
            if (e.key === ' ' || e.keyCode === 32) {
                e.preventDefault();
                togglePause();
                return;
            }
            
            if (!gameRunning || gamePaused) return;
            
            // WASD controls for player
            switch (e.key.toLowerCase()) {
                case 'w':
                    playerPaddle.isMovingUp = true;
                    break;
                case 's':
                    playerPaddle.isMovingDown = true;
                    break;
            }
            
            // If multiplayer mode is active, allow second player to control AI paddle
            if (multiplayer) {
                switch (e.key) {
                    case 'ArrowUp':
                        aiPaddle.y -= aiPaddle.speed;
                        if (aiPaddle.y < 0) aiPaddle.y = 0;
                        break;
                    case 'ArrowDown':
                        aiPaddle.y += aiPaddle.speed;
                        if (aiPaddle.y > canvas.height - aiPaddle.height) {
                            aiPaddle.y = canvas.height - aiPaddle.height;
                        }
                        break;
                }
            }
        });
        
        document.addEventListener('keyup', function(e) {
            switch (e.key.toLowerCase()) {
                case 'w':
                    playerPaddle.isMovingUp = false;
                    break;
                case 's':
                    playerPaddle.isMovingDown = false;
                    break;
            }
        });
        
        // Touch controls for mobile
        setupTouchControls();
    }
    
    // Toggle pause
    function togglePause() {
        gamePaused = !gamePaused;
        draw(); // Update display immediately
    }
    
    // Set up touch controls
    function setupTouchControls() {
        // Create touch control elements
        const touchControls = document.createElement('div');
        touchControls.id = 'pong-touch-controls';
        touchControls.style.position = 'relative';
        touchControls.style.margin = '20px auto';
        touchControls.style.width = '300px';
        touchControls.style.height = '100px';
        touchControls.style.display = 'flex';
        touchControls.style.flexDirection = 'row';
        touchControls.style.alignItems = 'center';
        touchControls.style.justifyContent = 'space-between';
        
        // Create buttons
        const upButton = createButton('W');
        const downButton = createButton('S');
        const pauseButton = createButton('⏸️');
        
        // Create button containers
        const moveContainer = document.createElement('div');
        moveContainer.style.display = 'flex';
        moveContainer.style.flexDirection = 'column';
        
        // Add buttons to containers
        moveContainer.appendChild(upButton);
        moveContainer.appendChild(downButton);
        
        // Add containers to controls
        touchControls.appendChild(moveContainer);
        touchControls.appendChild(pauseButton);
        
        // Add controls to document
        gameContainer.appendChild(touchControls);
        
        // Add event listeners
        upButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            playerPaddle.isMovingUp = true;
        });
        
        upButton.addEventListener('touchend', function(e) {
            e.preventDefault();
            playerPaddle.isMovingUp = false;
        });
        
        downButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            playerPaddle.isMovingDown = true;
        });
        
        downButton.addEventListener('touchend', function(e) {
            e.preventDefault();
            playerPaddle.isMovingDown = false;
        });
        
        pauseButton.addEventListener('touchstart', function(e) {
            e.preventDefault();
            togglePause();
        });
    }
    
    // Helper function to create touch buttons
    function createButton(text) {
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
    
    // Update score display
    function updateScore() {
        scoreElement.textContent = `Player: ${playerScore} | AI: ${aiScore}`;
    }
    
    // Game over
    function gameOver(playerWon) {
        gameRunning = false;
        
        if (gameLoop) {
            cancelAnimationFrame(gameLoop);
        }
        
        // Draw game over screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = playerWon ? '#00FF00' : '#FF0000';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(playerWon ? 'YOU WIN!' : 'AI WINS!', canvas.width / 2, canvas.height / 2 - 30);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${playerScore} - ${aiScore}`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('Press F5 to restart', canvas.width / 2, canvas.height / 2 + 40);
        
        // Add Pi Network payment option
        ctx.fillStyle = '#00FFFF';
        ctx.fillText('Or unlock Multiplayer Mode with Pi', canvas.width / 2, canvas.height / 2 + 80);
        
        // Create buy button
        const buyButton = document.createElement('button');
        buyButton.textContent = 'Unlock Multiplayer Mode (π2.00)';
        buyButton.style.display = 'block';
        buyButton.style.margin = '20px auto';
        buyButton.style.padding = '10px 20px';
        buyButton.style.backgroundColor = '#333';
        buyButton.style.color = '#FFF';
        buyButton.style.border = '2px solid #FFF';
        buyButton.style.borderRadius = '5px';
        buyButton.style.fontSize = '16px';
        buyButton.style.cursor = 'pointer';
        
        // Remove existing button if any
        const existingButton = document.getElementById('pong-unlock-multiplayer-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        buyButton.id = 'pong-unlock-multiplayer-button';
        buyButton.onclick = unlockMultiplayerMode;
        
        // Add button to document
        gameContainer.appendChild(buyButton);
        
        // Play game over sound
        playSound('gameover');
    }
    
    // Reset game
    function resetGame() {
        // Remove buy button if exists
        const buyButton = document.getElementById('pong-unlock-multiplayer-button');
        if (buyButton) {
            buyButton.remove();
        }
        
        playerScore = 0;
        aiScore = 0;
        gameRunning = true;
        gamePaused = false;
        
        playerPaddle = {
            x: 50,
            y: canvas.height / 2 - paddleHeight / 2,
            width: paddleWidth,
            height: paddleHeight,
            speed: 8,
            isMovingUp: false,
            isMovingDown: false
        };
        
        aiPaddle = {
            x: canvas.width - 50 - paddleWidth,
            y: canvas.height / 2 - paddleHeight / 2,
            width: paddleWidth,
            height: paddleHeight,
            speed: 5
        };
        
        // Update AI speed based on selected difficulty
        const difficulty = difficultySelect.value;
        switch(difficulty) {
            case 'easy':
                aiPaddle.speed = 3;
                break;
            case 'medium':
                aiPaddle.speed = 5;
                break;
            case 'hard':
                aiPaddle.speed = 7;
                break;
        }
        
        resetBall();
        updateScore();
        startGameLoop();
    }
    
    // Play sound effect
    function playSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            switch(type) {
                case 'paddle':
                    oscillator.frequency.value = 500;
                    gainNode.gain.value = 0.1;
                    oscillator.start();
                    setTimeout(() => oscillator.stop(), 50);
                    break;
                case 'wall':
                    oscillator.frequency.value = 300;
                    gainNode.gain.value = 0.1;
                    oscillator.start();
                    setTimeout(() => oscillator.stop(), 50);
                    break;
                case 'score':
                    oscillator.frequency.value = 700;
                    gainNode.gain.value = 0.1;
                    oscillator.start();
                    setTimeout(() => {
                        oscillator.frequency.value = 900;
                        setTimeout(() => oscillator.stop(), 100);
                    }, 100);
                    break;
                case 'gameover':
                    oscillator.frequency.value = 200;
                    gainNode.gain.value = 0.2;
                    oscillator.start();
                    setTimeout(() => {
                        oscillator.frequency.value = 150;
                        setTimeout(() => {
                            oscillator.frequency.value = 100;
                            setTimeout(() => oscillator.stop(), 300);
                        }, 300);
                    }, 300);
                    break;
            }
        } catch (e) {
            console.log("Audio context not supported or user interaction required");
        }
    }
    
    // Pi Network integration for premium features
    function unlockMultiplayerMode() {
        console.log("Unlock multiplayer mode function called");
        
        if (typeof window.RetroArcade !== 'undefined' && typeof window.RetroArcade.handlePiPayment === 'function') {
            console.log("Initiating Pi payment for multiplayer mode");
            
            window.RetroArcade.handlePiPayment(
                2.0, // amount
                "Multiplayer mode for Pong game", // memo
                "multiplayer_mode", // itemType
                "pong", // gameId
                function(payment) {
                    console.log("Payment successful:", payment);
                    // Enable multiplayer mode
                    multiplayer = true;
                    
                    // Reset and start game
                    resetGame();
                    
                    // Update instructions
                    instructionsDiv.innerHTML = `
                        <h3>How to Play Pong - MULTIPLAYER MODE</h3>
                        <p>Player 1: Use W and S keys to move your paddle</p>
                        <p>Player 2: Use UP and DOWN arrow keys to move your paddle</p>
                        <p>Space: Pause/Resume</p>
                        <p>F5: Restart Game</p>
                        <p>First player to reach 10 points wins!</p>
                    `;
                    
                    alert("Multiplayer Mode unlocked! Player 2 can now use the arrow keys to control the right paddle.");
                },
                function(error) {
                    console.error("Payment error:", error);
                    alert("Payment failed: " + error.message);
                }
            );
        } else {
            console.warn("Pi payment function not available");
            alert("Pi payments are only available in the Pi Browser. For testing, multiplayer mode will be enabled for free!");
            
            // For testing outside Pi Browser, enable multiplayer mode for free
            multiplayer = true;
            
            // Reset and start game
            resetGame();
            
            // Update instructions
            instructionsDiv.innerHTML = `
                <h3>How to Play Pong - MULTIPLAYER MODE</h3>
                <p>Player 1: Use W and S keys to move your paddle</p>
                <p>Player 2: Use UP and DOWN arrow keys to move your paddle</p>
                <p>Space: Pause/Resume</p>
                <p>F5: Restart Game</p>
                <p>First player to reach 10 points wins!</p>
            `;
        }
    }
});

console.log("Updated Pong game script with WASD controls loaded");
