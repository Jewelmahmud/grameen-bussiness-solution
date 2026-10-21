const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');
const InputValidation = require('../middleware/inputValidation');

/**
 * Business Routes
 * Base path: /api/v1/business
 */

// Sanitize all inputs
router.use(InputValidation.sanitize());

// GET /api/v1/business/types
router.get('/types', (req, res) => businessController.getBusinessTypes(req, res));

// GET /api/v1/business/catalog - hierarchical list from JSON catalog
router.get('/catalog', (req, res) => businessController.getBusinessCatalog(req, res));

// POST /api/v1/business/setup - Create or update business setup
router.post('/setup', (req, res) => businessController.businessSetup(req, res));

// GET /api/v1/business/setup/status - Get business setup status
router.get('/setup/status', (req, res) => businessController.getBusinessSetupStatus(req, res));

// GET /api/v1/business/setup - Get current business setup
router.get('/setup', (req, res) => businessController.getBusinessSetup(req, res));

// PUT /api/v1/business/setup - Update business setup
router.put('/setup', (req, res) => businessController.updateBusinessSetup(req, res));

module.exports = router;

