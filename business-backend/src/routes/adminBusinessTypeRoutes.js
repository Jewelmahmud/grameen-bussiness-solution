const express = require('express');
const router = express.Router();
const businessTypeController = require('../controllers/businessTypeController');
const InputValidation = require('../middleware/inputValidation');
const AuthMiddleware = require('../middleware/authMiddleware');
const SecurityUtils = require('../utils/security');

const categoryUuidsRule = {
  required: false,
  custom: (value) => {
    if (value === undefined || value === null) return true;
    if (!Array.isArray(value)) return 'category_uuids must be an array';
    if (value.length > 50) return 'category_uuids cannot exceed 50 entries';
    for (const v of value) {
      if (v === undefined || v === null || v === '') continue;
      const s = typeof v === 'string' ? v.trim() : String(v);
      if (!SecurityUtils.isValidUUID(s)) return 'each category_uuids entry must be a valid UUID';
    }
    return true;
  },
};

/**
 * Admin Business Type Routes (admin, super_admin, grameen_bazaar_admin only)
 * Base path: /api/v1/admin/business-types
 */

router.use(InputValidation.sanitize());
router.use(AuthMiddleware.requireRoles(['admin', 'super_admin', 'grameen_bazaar_admin']));

// POST /api/v1/admin/business-types
router.post(
  '/',
  InputValidation.validate({
    body: {
      name:           { type: 'string', required: true,  minLength: 1, maxLength: 100 },
      name_bn:        { type: 'string', required: false, maxLength: 100 },
      description:    { type: 'string', required: false },
      description_bn: { type: 'string', required: false },
      icon:           { type: 'string', required: false, maxLength: 100 },
      is_active:      { type: 'boolean', required: false },
      category_uuids: categoryUuidsRule,
    },
  }),
  (req, res) => businessTypeController.create(req, res),
);

// PUT /api/v1/admin/business-types/:businessTypeUuid
router.put(
  '/:businessTypeUuid',
  InputValidation.validate({
    params: { businessTypeUuid: { type: 'uuid' } },
    body: {
      name:           { type: 'string', required: false, minLength: 1, maxLength: 100 },
      name_bn:        { type: 'string', required: false, maxLength: 100 },
      description:    { type: 'string', required: false },
      description_bn: { type: 'string', required: false },
      icon:           { type: 'string', required: false, maxLength: 100 },
      is_active:      { type: 'boolean', required: false },
      category_uuids: categoryUuidsRule,
    },
  }),
  (req, res) => businessTypeController.update(req, res),
);

// DELETE /api/v1/admin/business-types/:businessTypeUuid
router.delete(
  '/:businessTypeUuid',
  InputValidation.validate({ params: { businessTypeUuid: { type: 'uuid' } } }),
  (req, res) => businessTypeController.delete(req, res),
);

module.exports = router;
