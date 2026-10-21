const express = require('express');
const router = express.Router();
const masterUnitController = require('../controllers/masterUnitController');
const InputValidation = require('../middleware/inputValidation');

/**
 * Public Master Unit Routes (no auth)
 * Base path: /api/v1/master-units
 */

router.use(InputValidation.sanitize());

// GET /api/v1/master-units
router.get(
  '/',
  InputValidation.validate({
    query: {
      business_type_uuid: { type: 'uuid',    required: false },
      is_active:          { type: 'boolean', required: false },
      search:             { type: 'string',  required: false, maxLength: 100 },
      page:               { type: 'integer', required: false, min: 1 },
      limit:              { type: 'integer', required: false, min: 0, max: 200 },
    },
  }),
  (req, res) => masterUnitController.getMasterUnits(req, res),
);

// GET /api/v1/master-units/:unitUuid
router.get(
  '/:unitUuid',
  InputValidation.validate({ params: { unitUuid: { type: 'uuid' } } }),
  (req, res) => masterUnitController.getMasterUnit(req, res),
);

module.exports = router;

