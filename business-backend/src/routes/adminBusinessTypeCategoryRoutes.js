const express = require('express');
const router = express.Router();
const businessTypeCategoryController = require('../controllers/businessTypeCategoryController');
const InputValidation = require('../middleware/inputValidation');
const AuthMiddleware = require('../middleware/authMiddleware');

/**
 * Admin Business Type Category Routes
 * Base path: /api/v1/admin/business-type-categories
 *
 * Roles allowed: admin, super_admin, grameen_bazaar_admin
 */

router.use(InputValidation.sanitize());
router.use(AuthMiddleware.requireRoles(['admin', 'super_admin', 'grameen_bazaar_admin']));

// GET /api/v1/admin/business-type-categories
router.get(
  '/',
  InputValidation.validate({
    query: {
      is_active:  { type: 'boolean', required: false },
      search:     { type: 'string',  required: false, maxLength: 100 },
      sort_by:    { type: 'string',  required: false },
      sort_order: { type: 'string',  required: false },
      page:       { type: 'integer', required: false, min: 1 },
      limit:      { type: 'integer', required: false, min: 0, max: 200 },
    },
  }),
  (req, res) => businessTypeCategoryController.getAll(req, res),
);

// POST /api/v1/admin/business-type-categories
router.post(
  '/',
  InputValidation.validate({
    body: {
      code:            { type: 'string', required: true,  minLength: 1, maxLength: 50  },
      name:            { type: 'string', required: true,  minLength: 1, maxLength: 100 },
      name_bn:         { type: 'string', required: false,               maxLength: 100 },
      description:     { type: 'string', required: false },
      description_bn:  { type: 'string', required: false },
      icon:            { type: 'string', required: false, maxLength: 100 },
      display_order:   { type: 'integer', required: false },
      is_active:       { type: 'boolean', required: false },
    },
  }),
  (req, res) => businessTypeCategoryController.create(req, res),
);

// PUT /api/v1/admin/business-type-categories/:categoryUuid
router.put(
  '/:categoryUuid',
  InputValidation.validate({
    params: { categoryUuid: { type: 'uuid', required: true } },
    body: {
      code:            { type: 'string', required: false, minLength: 1, maxLength: 50  },
      name:            { type: 'string', required: false, minLength: 1, maxLength: 100 },
      name_bn:         { type: 'string', required: false,               maxLength: 100 },
      description:     { type: 'string', required: false },
      description_bn:  { type: 'string', required: false },
      icon:            { type: 'string', required: false, maxLength: 100 },
      display_order:   { type: 'integer', required: false },
      is_active:       { type: 'boolean', required: false },
    },
  }),
  (req, res) => businessTypeCategoryController.update(req, res),
);

// DELETE /api/v1/admin/business-type-categories/:categoryUuid
router.delete(
  '/:categoryUuid',
  InputValidation.validate({ params: { categoryUuid: { type: 'uuid', required: true } } }),
  (req, res) => businessTypeCategoryController.delete(req, res),
);

module.exports = router;

