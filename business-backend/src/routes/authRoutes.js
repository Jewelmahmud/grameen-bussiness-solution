const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const InputValidation = require('../middleware/inputValidation');

/**
 * Auth Routes
 * Base path: /api/v1/auth
 */

// Log raw password for register (before any modification) - DEBUG
router.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/register' && req.body?.password !== undefined) {
    console.log('[Auth] Register - raw password received:', req.body.password);
  }
  next();
});

// Sanitize all inputs
router.use(InputValidation.sanitize());

// GET /api/v1/auth/config — debug: which auth server URL is in use
router.get('/config', (req, res) => authController.authConfig(req, res));

// GET /api/v1/auth/users — list users from auth server for GRAMEEN_BAZAAR_ID
// Query params forwarded: status, emailVerified, includeCompanies, page, search, limit
router.get(
  '/users',
  InputValidation.validate({
    query: {
      status: { type: 'string', required: false },
      emailVerified: { type: 'boolean', required: false },
      includeCompanies: { type: 'boolean', required: false },
      page: { type: 'int', required: false },
      limit: { type: 'int', required: false },
      search: { type: 'string', required: false, maxLength: 255 },
    },
  }),
  (req, res) => authController.getUsers(req, res),
);

// POST /api/v1/auth/login
router.post('/login', 
  InputValidation.validate({
    body: {
      email: { type: 'email', required: true },
      password: { type: 'string', required: true, minLength: 6 }
    }
  }),
  (req, res) => authController.login(req, res)
);

// POST /api/v1/auth/register
router.post('/register',
  InputValidation.validate({
    body: {
      firstName: { type: 'string', required: true, maxLength: 100 },
      lastName: { type: 'string', required: true, maxLength: 100 },
      email: { type: 'email', required: true },
      phone: { type: 'phone', required: true },
      password: { type: 'string', required: true, minLength: 8 },
      // Optional, forwarded to auth server
      applicationId: { type: 'uuid', required: false }
    }
  }),
  (req, res) => authController.register(req, res)
);

// POST /api/v1/auth/refresh
router.post('/refresh',
  InputValidation.validate({
    body: {
      refreshToken: { type: 'string', required: true }
    }
  }),
  (req, res) => authController.refreshToken(req, res)
);

// POST /api/v1/auth/logout
router.post('/logout', (req, res) => authController.logout(req, res));

// POST /api/v1/auth/verify-email
router.post('/verify-email',
  InputValidation.validate({
    body: {
      token: { type: 'string', required: true }
    }
  }),
  (req, res) => authController.verifyEmail(req, res)
);

// POST /api/v1/auth/verify-phone
router.post('/verify-phone',
  InputValidation.validate({
    body: {
      phone: { type: 'string', required: true, minLength: 10 },
      code: { type: 'string', required: true }
    }
  }),
  (req, res) => authController.verifyPhone(req, res)
);

// POST /api/v1/auth/resend-verification
router.post('/resend-verification',
  InputValidation.validate({
    body: {
      type: {
        type: 'string',
        required: true,
        custom: (v) => {
          if (!['email', 'phone'].includes(v)) return 'type must be "email" or "phone"';
          return true;
        }
      },
      email: { type: 'email', required: false },
      phone: { type: 'phone', required: false }
    }
  }),
  (req, res) => authController.resendVerification(req, res)
);

module.exports = router;

