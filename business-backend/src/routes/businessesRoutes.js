const express = require('express');
const router = express.Router();
const businessesController = require('../controllers/businessesController');
const InputValidation = require('../middleware/inputValidation');

/**
 * Public Businesses Routes (no auth required)
 * Base path: /api/v1/businesses
 */

router.use(InputValidation.sanitize());

// GET /api/v1/businesses
router.get(
  '/',
  InputValidation.validate({
    query: {
      is_active:              { type: 'boolean', required: false },
      is_marketplace_enabled: { type: 'boolean', required: false },
      is_primary:             { type: 'boolean', required: false },
      tenant_uuid:            { type: 'uuid',    required: false },
      business_uuid:          { type: 'uuid',    required: false },
      business_type_uuid:     { type: 'uuid',    required: false },
      search:                 { type: 'string',  required: false, maxLength: 100 },
      sort_by:                { type: 'string',  required: false },
      sort_order:             { type: 'string',  required: false },
      page:                   { type: 'integer', required: false, min: 1 },
      limit:                  { type: 'integer', required: false, min: 0, max: 100 },
    },
  }),
  (req, res) => businessesController.getAll(req, res),
);

// GET /api/v1/businesses/:businessUuid
router.get(
  '/:businessUuid',
  InputValidation.validate({ params: { businessUuid: { type: 'uuid' } } }),
  (req, res) => businessesController.getOne(req, res),
);

module.exports = router;
