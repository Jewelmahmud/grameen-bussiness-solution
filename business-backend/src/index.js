require('dotenv').config();
const createApp = require('./app');
const pool = require('./config/database');

const app = createApp();
const PORT = process.env.PORT || 3040;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Dokan Inventory Management Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Server running on: http://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 Health check: http://localhost:${PORT}/health
🔌 API endpoint: http://localhost:${PORT}/api/v1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

const gracefulShutdown = (signal) => {
  console.log(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
