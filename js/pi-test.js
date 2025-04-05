// Pi Network integration test script
// This file helps test the Pi Network integration in sandbox mode

// Initialize Pi SDK in sandbox mode
document.addEventListener('DOMContentLoaded', function() {
  // Check if Pi SDK is available
  if (typeof Pi === 'undefined') {
    console.error('Pi SDK not loaded. Make sure you have included the Pi SDK script.');
    document.getElementById('status').textContent = 'Error: Pi SDK not loaded';
    return;
  }

  // Initialize Pi SDK in sandbox mode
  Pi.init({ version: "2.0", sandbox: true });
  console.log("Pi SDK initialized in sandbox mode");
  updateStatus('Pi SDK initialized in sandbox mode');
});

// Test authentication
function testAuthentication() {
  updateStatus('Testing authentication...');
  
  const scopes = ['payments'];
  
  function onIncompletePaymentFound(payment) {
    console.log('Incomplete payment found:', payment);
    updateStatus('Incomplete payment found: ' + JSON.stringify(payment));
  }
  
  Pi.authenticate(scopes, onIncompletePaymentFound)
    .then(function(auth) {
      console.log('Authentication successful:', auth);
      updateStatus('Authentication successful. User: ' + auth.user.username);
      
      // Store auth data for payment tests
      window.piAuth = auth;
      
      // Enable payment test button
      document.getElementById('test-payment-btn').disabled = false;
    })
    .catch(function(error) {
      console.error('Authentication error:', error);
      updateStatus('Authentication error: ' + error.message);
    });
}

// Test payment
function testPayment() {
  if (!window.piAuth) {
    updateStatus('Error: Please authenticate first');
    return;
  }
  
  updateStatus('Testing payment...');
  
  const paymentData = {
    amount: 1.0,
    memo: "Test payment for RetroArcade",
    metadata: { gameId: "test", item: "test_item", quantity: 1 }
  };
  
  // Use the payment integration module
  window.PiPayments.initiatePayment(
    paymentData,
    window.piAuth,
    function onSuccess(payment) {
      updateStatus('Payment successful: ' + JSON.stringify(payment));
    },
    function onError(error) {
      updateStatus('Payment error: ' + error.message);
    }
  );
}

// Update status display
function updateStatus(message) {
  const statusElement = document.getElementById('status');
  const timestamp = new Date().toLocaleTimeString();
  
  statusElement.innerHTML += `<div>[${timestamp}] ${message}</div>`;
  statusElement.scrollTop = statusElement.scrollHeight;
}

// Attach event listeners
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('test-auth-btn').addEventListener('click', testAuthentication);
  document.getElementById('test-payment-btn').addEventListener('click', testPayment);
});
