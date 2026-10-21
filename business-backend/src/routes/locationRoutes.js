const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const InputValidation = require('../middleware/inputValidation');

/**
 * Location Routes
 * Base path: /api/v1/locations
 */

// Sanitize all inputs
router.use(InputValidation.sanitize());

// GET /api/v1/locations - Get all locations with optional country filter and pagination
router.get('/',
  InputValidation.validate({
    query: {
      country: { type: 'string', required: false },
      pagination: { type: 'string', required: false },
      page: { type: 'integer', required: false, min: 1 },
      limit: { type: 'integer', required: false, min: 1, max: 100 }
    }
  }),
  (req, res) => locationController.getAllLocations(req, res)
);

module.exports = router;

