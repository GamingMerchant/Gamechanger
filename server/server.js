const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

// Add trust proxy setting
app.set('trust proxy', true);

// Add logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log(`Client IP: ${req.ip}`);
  console.log(`Headers: ${JSON.stringify(req.headers)}`);
  next();
});

app.get('/', (req, res) => {
  console.log('Root endpoint accessed');
  res.send('Hello World!');
});

app.get('/test', (req, res) => {
  console.log('Test endpoint accessed');
  res.send('Test endpoint works!');
});

// API endpoints with both GET and POST handlers
app.get('/api/payments/webhook', (req, res) => {
  console.log('GET webhook endpoint accessed');
  res.status(200).json({ 
    message: 'Webhook endpoint is working (GET)', 
    note: 'Pi Network will use POST requests to this endpoint, not GET' 
  });
});

app.post('/api/payments/webhook', (req, res) => {
  console.log('POST webhook endpoint accessed');
  console.log('Request body:', req.body);
  res.status(200).json({ received: true });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  console.log('Debug endpoint accessed');
  
  // Collect debug information
  const debugInfo = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    headers: req.headers,
    ip: req.ip,
    routes: app._router.stack
      .filter(r => r.route)
      .map(r => ({
        path: r.route.path,
        methods: Object.keys(r.route.methods)
      }))
  };
  
  res.status(200).json(debugInfo);
});

// Catch-all route for debugging
app.use('*', (req, res) => {
  console.log(`Unhandled route: ${req.method} ${req.originalUrl}`);
  res.status(404).send(`Route not found: ${req.originalUrl}`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /');
  console.log('- GET /test');
  console.log('- GET /api/payments/webhook');
  console.log('- POST /api/payments/webhook');
  console.log('- GET /debug');
  console.log('- * (catch-all route)');
});
