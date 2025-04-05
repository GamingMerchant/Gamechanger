// Main initialization file for RetroArcade - Pi Network Edition
document.addEventListener('DOMContentLoaded', function() {
  // Hide loading screen
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.style.display = 'none';
  }
  
  // Initialize Pi SDK if available
  if (typeof Pi !== 'undefined') {
    try {
      Pi.init({ version: "2.0", sandbox: true });
      console.log("Pi SDK initialized in sandbox mode");
      
      // Check authentication status
      Pi.authenticate(['username'], (auth) => {
        console.log("Pi authentication result:", auth);
        if (auth.user) {
          console.log("User authenticated:", auth.user.username);
          // You can update UI to show authenticated user
          const piStatusElement = document.getElementById('pi-status');
          if (piStatusElement) {
            piStatusElement.textContent = `Connected as: ${auth.user.username}`;
          }
        }
      }, () => {
        console.log("Pi authentication cancelled");
      });
    } catch (error) {
      console.log("Pi SDK initialization error:", error);
    }
  } else {
    console.log("Pi SDK not available - running in regular browser mode");
    // Handle case when Pi SDK is not available
    const piFeatures = document.querySelectorAll('.pi-feature');
    piFeatures.forEach(feature => {
      feature.style.opacity = '0.5';
      feature.innerHTML += '<div class="pi-overlay">Available in Pi Browser</div>';
    });
  }
  
  // Set up game links
  setupGameLinks();
  
  // Initialize any other components
  console.log("RetroArcade initialized successfully!");
});

// Function to set up game links
function setupGameLinks() {
  const gameLinks = document.querySelectorAll('.game-link');
  gameLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const game = this.getAttribute('data-game');
      if (game) {
        console.log(`Loading game: ${game}`);
        // You can add transition effects here
      }
    });
  });
}

// Function to handle Pi payments
function handlePiPayment(amount, memo, itemType, gameId, onSuccess, onError) {
  if (typeof Pi === 'undefined') {
    console.error("Pi SDK not available");
    if (onError) onError(new Error("Pi SDK not available"));
    return;
  }
  
  const metadata = {
    gameId: gameId,
    item: itemType
  };
  
  // Get authentication first
  Pi.authenticate(['username'], function(auth) {
    if (auth) {
      // Initialize payment
      window.PiPayments.initiatePayment(
        { amount, memo, metadata },
        auth,
        function(payment) {
          console.log("Payment successful:", payment);
          if (onSuccess) onSuccess(payment);
        },
        function(error) {
          console.error("Payment error:", error);
          if (onError) onError(error);
        }
      );
    } else {
      console.error("Authentication failed");
      if (onError) onError(new Error("Authentication failed"));
    }
  });
}

// Expose functions to global scope
window.RetroArcade = {
  handlePiPayment: handlePiPayment
};
