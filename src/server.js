/**
 * Server entry point
 * Uses MongoDB only (orders, contacts, analyses)
 */
const app = require('./app');
const config = require('./config');
const orderService = require('./services/orderService');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory');
}

const PORT = config.server.port;

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT} (${config.server.env})`);

  const mongo = await orderService.checkConnection();
  if (mongo.status !== 'connected') {
    console.warn('Warning: MongoDB not connected.', mongo.message || '');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
