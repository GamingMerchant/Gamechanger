// Pi Network Payment Server
// This file simulates a server-side component for Pi Network payment processing

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// In-memory storage for payments (in a real app, use a database)
const payments = {};
const completedPayments = {};

// Secret key for Pi API (in a real app, store securely in environment variables)
const PI_API_KEY = 'demo_api_key_for_simulation';

// Endpoint to approve a payment
app.post('/api/payments/approve', (req, res) => {
  const { paymentId, amount, memo, userId, gameId, itemType } = req.body;
  
  if (!paymentId || !amount || !userId) {
    return res.status(400).json({ success: false, message: 'Missing required parameters' });
  }
  
  console.log(`Approving payment ${paymentId} for user ${userId}: ${amount} Pi for ${itemType} in ${gameId}`);
  
  // In a real implementation, you would:
  // 1. Verify the payment with Pi Network API
  // 2. Check if the user has sufficient balance
  // 3. Approve the payment with Pi Network API
  
  // For this demo, we'll simulate a successful approval
  payments[paymentId] = {
    id: paymentId,
    userId,
    amount,
    memo,
    gameId,
    itemType,
    status: 'approved',
    timestamp: Date.now()
  };
  
  // Generate a transaction ID (this would come from Pi Network in a real implementation)
  const txid = crypto.randomBytes(16).toString('hex');
  
  return res.json({
    success: true,
    message: 'Payment approved',
    txid
  });
});

// Endpoint to complete a payment
app.post('/api/payments/complete', (req, res) => {
  const { paymentId, txid } = req.body;
  
  if (!paymentId || !txid) {
    return res.status(400).json({ success: false, message: 'Missing required parameters' });
  }
  
  const payment = payments[paymentId];
  
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment not found' });
  }
  
  if (payment.status !== 'approved') {
    return res.status(400).json({ success: false, message: 'Payment not in approved state' });
  }
  
  console.log(`Completing payment ${paymentId} with transaction ${txid}`);
  
  // In a real implementation, you would:
  // 1. Verify the transaction with Pi Network API
  // 2. Complete the payment with Pi Network API
  // 3. Update your database
  
  // For this demo, we'll simulate a successful completion
  payment.status = 'completed';
  payment.txid = txid;
  payment.completedAt = Date.now();
  
  completedPayments[paymentId] = payment;
  
  return res.json({
    success: true,
    message: 'Payment completed',
    payment
  });
});

// Endpoint to check payment status
app.get('/api/payments/:paymentId', (req, res) => {
  const { paymentId } = req.params;
  
  const payment = payments[paymentId] || completedPayments[paymentId];
  
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment not found' });
  }
  
  return res.json({
    success: true,
    payment
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Pi payment server running on port ${PORT}`);
});

module.exports = app;
