const express = require('express');
const router = express.Router();
const businessTypeController = require('../controllers/businessTypeController');
const InputValidation = require('../middleware/inputValidation');

/**
 * Public Business Type Routes (no auth required)
 * Base path: /api/v1/business-types
 */

router.use(InputValidation.sanitize());

// GET /api/v1/business-types
router.get(
  '/',
  InputValidation.validate({
    query: {
      is_active:  { type: 'boolean', required: false },
      search:     { type: 'string',  required: false, maxLength: 100 },
      sort_by:    { type: 'string',  required: false },
      sort_order: { type: 'string',  required: false },
      page:       { type: 'integer', required: false, min: 1 },
      limit:      { type: 'integer', required: false, min: 0, max: 100 },
    },
  }),
  (req, res) => businessTypeController.getAll(req, res),
);

// GET /api/v1/business-types/:businessTypeUuid
router.get(
  '/:businessTypeUuid',
  InputValidation.validate({ params: { businessTypeUuid: { type: 'uuid' } } }),
  (req, res) => businessTypeController.getOne(req, res),
);

module.exports = router;
