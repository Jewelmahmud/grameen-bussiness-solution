const express = require('express');
const router = express.Router();
const subscriptionPlanController = require('../controllers/subscriptionPlanController');
const InputValidation = require('../middleware/inputValidation');

/**
 * Public Subscription Plan Routes (read-only, no auth)
 * Base path: /api/v1/subscription-plans
 *
 * GET list and GET one are open to everyone (including non-logged-in users).
 */

router.use(InputValidation.sanitize());

// GET /api/v1/subscription-plans
router.get(
  '/',
  InputValidation.validate({
    query: {
      is_active: { type: 'string', required: false },
    },
  }),
  (req, res) => subscriptionPlanController.getAll(req, res),
);

// GET /api/v1/subscription-plans/:planUuid
router.get(
  '/:planUuid',
  InputValidation.validate({
    params: { planUuid: { type: 'uuid' } },
  }),
  (req, res) => subscriptionPlanController.getOne(req, res),
);

module.exports = router;
