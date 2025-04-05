const BACKEND_URL = 'https://your-backend-url.onrender.com'; // Replace with your actual backend URL

// Function to handle Pi Network payments
function makePiPayment(amount, memo, metadata) {
  return new Promise((resolve, reject) => {
    Pi.authenticate(['payments'])
      .then(function(auth) {
        return Pi.createPayment({
          amount: amount,
          memo: memo,
          metadata: metadata
        }, {
          onReadyForServerApproval: function(paymentId) {
            // Call your backend server to approve payment
            fetch(`${BACKEND_URL}/api/payments/approve`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ paymentId: paymentId })
            })
            .then(response => response.json())
            .then(data => console.log('Payment approved:', data))
            .catch(error => {
              console.error('Error approving payment:', error);
              reject(error);
            });
          },
          onReadyForServerCompletion: function(paymentId, txid) {
            // Call your backend server to complete payment
            fetch(`${BACKEND_URL}/api/payments/complete`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                paymentId: paymentId,
                txid: txid
              })
            })
            .then(response => response.json())
            .then(data => {
              console.log('Payment completed:', data);
              // Resolve the promise with payment data
              resolve(data);
            })
            .catch(error => {
              console.error('Error completing payment:', error);
              reject(error);
            });
          },
          onCancel: function(paymentId) {
            console.log('Payment cancelled:', paymentId);
            reject(new Error('Payment was cancelled'));
          },
          onError: function(error, payment) {
            console.error('Payment error:', error);
            reject(error);
          }
        });
      })
      .catch(function(error) {
        console.error('Authentication error:', error);
        reject(error);
      });
  });
}

// Function to authenticate with Pi Network
function authenticateWithPi() {
  return new Promise((resolve, reject) => {
    const scopes = ['payments'];
    
    function onIncompletePaymentFound(payment) {
      console.log('Incomplete payment found!', payment);
      // Handle incomplete payment
    }
    
    Pi.authenticate(scopes, onIncompletePaymentFound)
      .then(function(auth) {
        console.log('Authentication successful', auth);
        resolve(auth);
      })
      .catch(function(error) {
        console.error('Authentication error:', error);
        reject(error);
      });
  });
}

// Function to unlock premium features after successful payment
function unlockPremiumFeatures(gameId) {
  // Update UI to show unlocked features
  switch(gameId) {
    case 'snake':
      // Enable Snake game premium features
      if (typeof addExtraLives === 'function') {
        addExtraLives(3);
      }
      break;
    case 'pong':
      // Enable Pong game premium features
      if (typeof enableMultiplayerMode === 'function') {
        enableMultiplayerMode();
      }
      break;
    case 'tetris':
      // Enable Tetris game premium features
      if (typeof enableChallengeMode === 'function') {
        enableChallengeMode();
      }
      break;
    case 'space-invaders':
      // Enable Space Invaders game premium features
      if (typeof enableSpecialWeapons === 'function') {
        enableSpecialWeapons();
      }
      break;
    default:
      console.log('Unknown game ID:', gameId);
  }
  
  // Save premium status to localStorage
  localStorage.setItem(`${gameId}_premium`, 'true');
  
  // Update UI elements
  const premiumElements = document.querySelectorAll('.premium-feature');
  premiumElements.forEach(element => {
    element.classList.add('unlocked');
  });
  
  // Show success message
  alert('Premium features unlocked! Enjoy your enhanced gameplay experience.');
}

// Example usage:
// Buy extra lives in Snake game
function buyExtraLives() {
  makePiPayment(1.0, "3 Extra Lives in Snake Game", { gameId: "snake", item: "extra_lives", quantity: 3 })
    .then(data => {
      unlockPremiumFeatures('snake');
    })
    .catch(error => {
      alert('There was an error processing your payment. Please try again.');
    });
}

// Unlock multiplayer mode in Pong
function unlockMultiplayer() {
  makePiPayment(2.0, "Unlock Multiplayer Mode in Pong", { gameId: "pong", item: "multiplayer_mode", quantity: 1 })
    .then(data => {
      unlockPremiumFeatures('pong');
    })
    .catch(error => {
      alert('There was an error processing your payment. Please try again.');
    });
}

// Check if premium features are already unlocked
function checkPremiumStatus(gameId) {
  return localStorage.getItem(`${gameId}_premium`) === 'true';
}

// Initialize Pi SDK
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Pi SDK
  Pi.init({ 
    version: "2.0", 
    apiKey: "YOUR_API_KEY", // Replace with your actual API key
    sandbox: true // Set to false for production
  });
  
  console.log("Pi SDK initialized");
  
  // Check if any premium features are already unlocked
  const currentGame = document.body.dataset.game;
  if (currentGame && checkPremiumStatus(currentGame)) {
    console.log(`Premium features for ${currentGame} are already unlocked`);
    unlockPremiumFeatures(currentGame);
  }
});
