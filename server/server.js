require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000; // Updated to work with Render's default port

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(bodyParser.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Pi Payments Backend Server is running!');
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ message: 'Test endpoint is working' });
});

// Payment approval endpoint
app.post('/api/payments/approve', async (req, res) => {
  try {
    const { paymentId } = req.body;
    console.log(`Approving payment: ${paymentId}`);
    
    // Determine API URL based on sandbox mode
    const apiUrl = process.env.SANDBOX_MODE === 'true' 
      ? 'https://api.sandbox.minepi.com/v2/payments'
      : 'https://api.minepi.com/v2/payments';
    
    // Call Pi Platform API to approve payment
    const response = await axios.post(
      `${apiUrl}/${paymentId}/approve`,
      {},
      {
        headers: {
          'Authorization': `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Payment approved:', response.data);
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error approving payment:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to approve payment', details: error.message });
  }
});

// Payment completion endpoint
app.post('/api/payments/complete', async (req, res) => {
  try {
    const { paymentId, txid } = req.body;
    console.log(`Completing payment: ${paymentId} with txid: ${txid}`);
    
    // Determine API URL based on sandbox mode
    const apiUrl = process.env.SANDBOX_MODE === 'true' 
      ? 'https://api.sandbox.minepi.com/v2/payments'
      : 'https://api.minepi.com/v2/payments';
    
    // Call Pi Platform API to complete payment
    const response = await axios.post(
      `${apiUrl}/${paymentId}/complete`,
      { txid },
      {
        headers: {
          'Authorization': `Key ${process.env.PI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Payment completed:', response.data);
    
    // In a real app, you would update your database here
    // to mark features as unlocked for the user
    
    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error completing payment:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to complete payment', details: error.message });
  }
});

// Webhook endpoint for Pi Network callbacks (POST)
app.post('/api/payments/webhook', (req, res) => {
  const paymentData = req.body;
  console.log('Received webhook from Pi Network:', paymentData);
  
  // Process the webhook data
  // Update your database based on payment status
  
  res.status(200).json({ received: true });
});

// Added GET handler for webhook testing
app.get('/api/payments/webhook', (req, res) => {
  console.log('GET request received on webhook endpoint');
  res.status(200).json({ 
    message: 'Webhook endpoint is working (GET)', 
    note: 'Pi Network will use POST requests to this endpoint, not GET' 
  });
});

// Debug endpoint to show all routes
app.get('/debug/routes', (req, res) => {
  const routes = [];
  
  app._router.stack.forEach(middleware => {
    if(middleware.route) { // routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        method: Object.keys(middleware.route.methods)[0].toUpperCase()
      });
    } else if(middleware.name === 'router') { // router middleware
      middleware.handle.stack.forEach(handler => {
        if(handler.route) {
          routes.push({
            path: handler.route.path,
            method: Object.keys(handler.route.methods)[0].toUpperCase()
          });
        }
      });
    }
  });
  
  res.status(200).json({ routes });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Sandbox mode: ${process.env.SANDBOX_MODE}`);
  console.log('Available endpoints:');
  console.log('- GET /');
  console.log('- GET /test');
  console.log('- POST /api/payments/approve');
  console.log('- POST /api/payments/complete');
  console.log('- POST /api/payments/webhook');
  console.log('- GET /api/payments/webhook');
  console.log('- GET /debug/routes');
});
