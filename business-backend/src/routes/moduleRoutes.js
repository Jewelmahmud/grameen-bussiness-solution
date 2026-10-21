const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const InputValidation = require('../middleware/inputValidation');
const AuthMiddleware = require('../middleware/authMiddleware');

/**
 * Module Routes - core.modules resource
 * Base path: /api/v1/modules
 *
 * - GET / and GET /:moduleUuid : public (no auth)
 * - POST, PUT, DELETE : auth required, admin roles only
 */

router.use(InputValidation.sanitize());

const ADMIN_ROLES = ['admin', 'super_admin', 'grameen_bazaar_admin'];

// Public: list modules (no auth required)
router.get(
  '/',
  (req, res) => moduleController.getModules(req, res),
);

// Public: get one module by UUID (no auth required)
router.get(
  '/:moduleUuid',
  InputValidation.validate({
    params: { moduleUuid: { type: 'uuid', required: true } },
  }),
  (req, res) => moduleController.getModule(req, res),
);

// From here on: auth required for write operations
router.use(AuthMiddleware.requireAuth);

// Write: admin only
router.post(
  '/',
  AuthMiddleware.requireRoles(ADMIN_ROLES),
  (req, res) => moduleController.createModule(req, res),
);

router.put(
  '/:moduleUuid',
  AuthMiddleware.requireRoles(ADMIN_ROLES),
  InputValidation.validate({
    params: { moduleUuid: { type: 'uuid', required: true } },
  }),
  (req, res) => moduleController.updateModule(req, res),
);

router.delete(
  '/:moduleUuid',
  AuthMiddleware.requireRoles(ADMIN_ROLES),
  InputValidation.validate({
    params: { moduleUuid: { type: 'uuid', required: true } },
  }),
  (req, res) => moduleController.deleteModule(req, res),
);

module.exports = router;
