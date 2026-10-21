const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const InputValidation = require('../middleware/inputValidation');
const AuthMiddleware = require('../middleware/authMiddleware');

/**
 * Admin Location Routes
 * Base path: /api/v1/admin/locations
 *
 * These endpoints expose the same location resources as the public
 * location routes, but are restricted to users with the admin or
 * super_admin role.
 */

// Sanitize all inputs
router.use(InputValidation.sanitize());

// Require authenticated admin/super_admin
router.use(
  AuthMiddleware.requireRoles([
    'admin',
    'super_admin',
  ]),
);

// GET /api/v1/admin/locations - hierarchical locations (optional country filter)
router.get(
  '/',
  InputValidation.validate({
    query: {
      country: { type: 'string', required: false },
      pagination: { type: 'string', required: false },
      page: { type: 'integer', required: false, min: 1 },
      limit: { type: 'integer', required: false, min: 1, max: 100 },
    },
  }),
  (req, res) => locationController.getAllLocations(req, res),
);

module.exports = router;

