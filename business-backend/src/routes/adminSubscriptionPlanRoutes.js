const express = require('express');
const router = express.Router();
const subscriptionPlanController = require('../controllers/subscriptionPlanController');
const InputValidation = require('../middleware/inputValidation');
const AuthMiddleware = require('../middleware/authMiddleware');

/**
 * Admin Subscription Plan Routes (write-only, admin/super_admin)
 * Base path: /api/v1/admin/subscription-plans
 *
 * POST, PUT, DELETE only. Public read is at /api/v1/subscription-plans.
 */

router.use(InputValidation.sanitize());
router.use(
  AuthMiddleware.requireRoles(['admin', 'super_admin']),
);

// POST /api/v1/admin/subscription-plans
router.post(
  '/',
  InputValidation.validate({
    body: {
      code: { type: 'string', required: true, minLength: 1, maxLength: 50 },
      name: { type: 'string', required: true, minLength: 1, maxLength: 255 },
      name_en: { type: 'string', required: false, maxLength: 255 },
      description: { type: 'string', required: false },
      max_products: { type: 'integer', required: false, min: 0 },
      is_marketplace: { type: 'boolean', required: false },
      display_order: { type: 'integer', required: false },
      is_active: { type: 'boolean', required: false },
    },
  }),
  (req, res) => subscriptionPlanController.create(req, res),
);

// PUT /api/v1/admin/subscription-plans/:planUuid
router.put(
  '/:planUuid',
  InputValidation.validate({
    params: { planUuid: { type: 'uuid' } },
    body: {
      code: { type: 'string', required: false, minLength: 1, maxLength: 50 },
      name: { type: 'string', required: false, minLength: 1, maxLength: 255 },
      name_en: { type: 'string', required: false, maxLength: 255 },
      description: { type: 'string', required: false },
      max_products: { type: 'integer', required: false, min: 0 },
      is_marketplace: { type: 'boolean', required: false },
      display_order: { type: 'integer', required: false },
      is_active: { type: 'boolean', required: false },
    },
  }),
  (req, res) => subscriptionPlanController.update(req, res),
);

// DELETE /api/v1/admin/subscription-plans/:planUuid
router.delete(
  '/:planUuid',
  InputValidation.validate({
    params: { planUuid: { type: 'uuid' } },
  }),
  (req, res) => subscriptionPlanController.delete(req, res),
);

module.exports = router;
