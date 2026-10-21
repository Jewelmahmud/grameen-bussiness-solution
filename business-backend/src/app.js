require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const healthController = require('./controllers/healthController');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const UploadService = require('./services/uploadService');

/**
 * Build and return the Express application (no listen).
 * Used by index.js and by tests (Supertest).
 */
function createApp() {
  const app = express();

  app.use(helmet());

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)
    : ['http://localhost:3000', 'http://localhost:3001'];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }),
  );

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  const METHODS_WITH_BODY = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
  const jsonParser = express.json();
  const urlencodedParser = express.urlencoded({ extended: true });
  app.use((req, res, next) => {
    if (!METHODS_WITH_BODY.has(req.method)) {
      return next();
    }
    const len = req.headers['content-length'];
    const ct = (req.headers['content-type'] || '').toLowerCase();
    if (len === '0' && ct.includes('application/json')) {
      req.body = {};
      return next();
    }
    jsonParser(req, res, (err) => {
      if (err) return next(err);
      urlencodedParser(req, res, next);
    });
  });

  if (UploadService.getDriver() === 'local') {
    try {
      const uploadPath = path.resolve(UploadService.getLocalPath());
      app.use('/uploads', express.static(uploadPath));
    } catch (e) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('Upload: UPLOAD_LOCAL_PATH not set; /uploads will not serve files.');
      }
    }
  }

  app.get('/health', (req, res) => healthController.check(req, res));
  app.use('/api/v1', routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
