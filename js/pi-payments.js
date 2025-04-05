// Client-side payment integration for Pi Network
// This file provides functions to connect the frontend with the payment server

// Base URL for the payment server API
const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Handles the server approval step of Pi payment
 * @param {string} paymentId - The payment ID from Pi SDK
 * @param {number} amount - The amount of Pi being paid
 * @param {string} memo - The payment memo
 * @param {string} userId - The Pi user ID
 * @param {string} gameId - The game identifier
 * @param {string} itemType - The type of item being purchased
 * @returns {Promise} - Promise resolving to the server response
 */
async function handleServerApproval(paymentId, amount, memo, userId, gameId, itemType) {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentId,
        amount,
        memo,
        userId,
        gameId,
        itemType
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to approve payment');
    }
    
    console.log('Payment approved by server:', data);
    return data;
  } catch (error) {
    console.error('Error in server approval:', error);
    throw error;
  }
}

/**
 * Handles the server completion step of Pi payment
 * @param {string} paymentId - The payment ID from Pi SDK
 * @param {string} txid - The transaction ID from Pi blockchain
 * @returns {Promise} - Promise resolving to the server response
 */
async function handleServerCompletion(paymentId, txid) {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        paymentId,
        txid
      })
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to complete payment');
    }
    
    console.log('Payment completed by server:', data);
    return data;
  } catch (error) {
    console.error('Error in server completion:', error);
    throw error;
  }
}

/**
 * Checks the status of a payment
 * @param {string} paymentId - The payment ID to check
 * @returns {Promise} - Promise resolving to the payment status
 */
async function checkPaymentStatus(paymentId) {
  try {
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to get payment status');
    }
    
    console.log('Payment status:', data.payment);
    return data.payment;
  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
}

/**
 * Initiates a Pi payment with proper server-side flow
 * @param {Object} paymentData - Payment details (amount, memo, metadata)
 * @param {Object} auth - Pi authentication data
 * @param {Function} onSuccess - Callback for successful payment
 * @param {Function} onError - Callback for payment error
 */
function initiatePayment(paymentData, auth, onSuccess, onError) {
  // Extract payment details
  const { amount, memo, metadata } = paymentData;
  const { user } = auth;
  
  // Create payment using Pi SDK
  Pi.createPayment({
    amount: amount,
    memo: memo,
    metadata: metadata
  }, {
    onReadyForServerApproval: function(paymentId) {
      console.log('Ready for server approval with payment ID:', paymentId);
      
      // Call server to approve payment
      handleServerApproval(
        paymentId, 
        amount, 
        memo, 
        user.uid, 
        metadata.gameId, 
        metadata.item
      )
      .then(data => {
        console.log('Server approved payment, txid:', data.txid);
      })
      .catch(error => {
        console.error('Server approval failed:', error);
        if (onError) onError(error);
      });
    },
    onReadyForServerCompletion: function(paymentId, txid) {
      console.log('Ready for server completion with payment ID:', paymentId, 'and transaction ID:', txid);
      
      // Call server to complete payment
      handleServerCompletion(paymentId, txid)
      .then(data => {
        console.log('Payment completed successfully:', data);
        if (onSuccess) onSuccess(data.payment);
      })
      .catch(error => {
        console.error('Payment completion failed:', error);
        if (onError) onError(error);
      });
    },
    onCancel: function(paymentId) {
      console.log('Payment cancelled with payment ID:', paymentId);
      if (onError) onError(new Error('Payment was cancelled'));
    },
    onError: function(error, payment) {
      console.error('Payment error:', error);
      if (onError) onError(error);
    }
  });
}

// Export functions for use in game files
window.PiPayments = {
  initiatePayment,
  checkPaymentStatus
};
