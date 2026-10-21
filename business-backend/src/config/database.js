require('dotenv').config();
const { Pool } = require('pg');

// Database connection pool with security settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  
  // Security settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  
  // Statement timeout (prevent long-running queries)
  statement_timeout: 30000, // 30 seconds
  
  // Query timeout
  query_timeout: 30000, // 30 seconds
});

// Test database connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Don't exit in production, let the app handle it
  if (process.env.NODE_ENV !== 'production') {
    process.exit(-1);
  }
});

// Enhanced query method with security logging
const originalQuery = pool.query.bind(pool);
pool.query = function(text, params) {
  // Log suspicious queries in development
  if (process.env.NODE_ENV === 'development') {
    const suspiciousPatterns = [
      /;\s*(DROP|DELETE|TRUNCATE|ALTER|CREATE)/gi,
      /--/g,
      /\/\*/g
    ];
    
    const hasSuspiciousPattern = suspiciousPatterns.some(pattern => pattern.test(text));
    if (hasSuspiciousPattern) {
      console.warn('⚠️  Suspicious query pattern detected:', text.substring(0, 100));
    }
  }
  
  return originalQuery(text, params);
};

module.exports = pool;

