const express = require('express');
const router = express.Router();
const masterUnitController = require('../controllers/masterUnitController');
const InputValidation = require('../middleware/inputValidation');
const AuthMiddleware = require('../middleware/authMiddleware');

/**
 * Admin Master Unit Routes
 * Base path: /api/v1/admin/master-units
 *
 * Global (shared) master units/conversions: omit business_type_uuid or send null.
 * Scoped (per business type): send business_type_uuid.
 *
 * Roles allowed:
 *   admin, super_admin, grameen_bazaar_admin, manager, support
 */

const ADMIN_ROLES = ['admin', 'super_admin', 'grameen_bazaar_admin', 'manager', 'support'];

router.use(InputValidation.sanitize());
router.use(AuthMiddleware.requireRoles(ADMIN_ROLES));

// Master units CRUD ----------------------------------------------------------

// GET /api/v1/admin/master-units  (same as public list but behind auth)
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

// POST /api/v1/admin/master-units
router.post(
  '/',
  InputValidation.validate({
    body: {
      business_type_uuid: { type: 'uuid',    required: false },
      name:               { type: 'string',  required: true,  maxLength: 50 },
      short_name:         { type: 'string',  required: false },  // JSON string or omitted
      unit_type:          { type: 'string',  required: false, maxLength: 50 },
      is_base_unit:       { type: 'boolean', required: false },
      is_active:          { type: 'boolean', required: false },
    },
  }),
  (req, res) => masterUnitController.createMasterUnit(req, res),
);

// PUT /api/v1/admin/master-units/:unitUuid
router.put(
  '/:unitUuid',
  InputValidation.validate({
    params: { unitUuid: { type: 'uuid' } },
    body: {
      business_type_uuid: { type: 'uuid',    required: false },
      name:               { type: 'string',  required: false, maxLength: 50 },
      short_name:         { type: 'string',  required: false },
      unit_type:          { type: 'string',  required: false, maxLength: 50 },
      is_base_unit:       { type: 'boolean', required: false },
      is_active:          { type: 'boolean', required: false },
    },
  }),
  (req, res) => masterUnitController.updateMasterUnit(req, res),
);

// DELETE /api/v1/admin/master-units/:unitUuid
router.delete(
  '/:unitUuid',
  InputValidation.validate({ params: { unitUuid: { type: 'uuid' } } }),
  (req, res) => masterUnitController.deleteMasterUnit(req, res),
);

// Master unit conversions CRUD ----------------------------------------------

// GET /api/v1/admin/master-units/conversions
// Query: business_type_uuid, is_active, search (formula / unit names / short_name en+bn / factor text), page, limit
router.get(
  '/conversions',
  InputValidation.validate({
    query: {
      business_type_uuid: { type: 'uuid',    required: false },
      is_active:          { type: 'boolean', required: false },
      search:             { type: 'string',  required: false, maxLength: 100 },
      page:               { type: 'integer', required: false, min: 1 },
      limit:              { type: 'integer', required: false, min: 0, max: 200 },
    },
  }),
  (req, res) => masterUnitController.getMasterConversions(req, res),
);

// POST /api/v1/admin/master-units/conversions
router.post(
  '/conversions',
  InputValidation.validate({
    body: {
      business_type_uuid: { type: 'uuid',    required: false },
      from_unit_uuid:     { type: 'uuid',    required: true  },
      to_unit_uuid:       { type: 'uuid',    required: true  },
      conversion_factor:  { type: 'decimal', required: true  },
      formula:            { type: 'string',  required: false, maxLength: 255 },
      is_active:          { type: 'boolean', required: false },
    },
  }),
  (req, res) => masterUnitController.createMasterConversion(req, res),
);

// PUT /api/v1/admin/master-units/conversions/:id
router.put(
  '/conversions/:id',
  InputValidation.validate({
    params: { id: { type: 'integer', required: true, min: 1 } },
    body: {
      business_type_uuid: { type: 'uuid',    required: false },
      from_unit_uuid:     { type: 'uuid',    required: false },
      to_unit_uuid:       { type: 'uuid',    required: false },
      conversion_factor:  { type: 'decimal', required: false },
      formula:            { type: 'string',  required: false, maxLength: 255 },
      is_active:          { type: 'boolean', required: false },
    },
  }),
  (req, res) => masterUnitController.updateMasterConversion(req, res),
);

// DELETE /api/v1/admin/master-units/conversions/:id
router.delete(
  '/conversions/:id',
  InputValidation.validate({ params: { id: { type: 'integer', required: true, min: 1 } } }),
  (req, res) => masterUnitController.deleteMasterConversion(req, res),
);

module.exports = router;

