const express = require('express');
const router = express.Router();
const moduleCategoryController = require('../controllers/moduleCategoryController');
const InputValidation = require('../middleware/inputValidation');
const AuthMiddleware = require('../middleware/authMiddleware');
const { uploadCategoryImage } = require('../middleware/uploadMiddleware');

/**
 * Module Category Routes - core.module_categories resource
 * Base path: /api/v1/module-categories
 *
 * - GET / and GET /:categoryUuid : public (no auth)
 * - POST, PUT, DELETE : auth required, admin roles only
 */

router.use(InputValidation.sanitize());

const ADMIN_ROLES = ['admin', 'super_admin', 'grameen_bazaar_admin'];

// Public: list categories (no auth required)
router.get(
  '/',
  (req, res) => moduleCategoryController.getCategories(req, res),
);

// Public: get one category by UUID (no auth required)
router.get(
  '/:categoryUuid',
  InputValidation.validate({
    params: { categoryUuid: { type: 'uuid', required: true } },
  }),
  (req, res) => moduleCategoryController.getCategory(req, res),
);

// From here on: auth required for write operations
router.use(AuthMiddleware.requireAuth);

// Write: admin only (optional multipart 'image' for category image)
router.post(
  '/',
  AuthMiddleware.requireRoles(ADMIN_ROLES),
  uploadCategoryImage,
  (req, res) => moduleCategoryController.createCategory(req, res),
);

router.put(
  '/:categoryUuid',
  AuthMiddleware.requireRoles(ADMIN_ROLES),
  InputValidation.validate({
    params: { categoryUuid: { type: 'uuid', required: true } },
  }),
  uploadCategoryImage,
  (req, res) => moduleCategoryController.updateCategory(req, res),
);

router.delete(
  '/:categoryUuid',
  AuthMiddleware.requireRoles(ADMIN_ROLES),
  InputValidation.validate({
    params: { categoryUuid: { type: 'uuid', required: true } },
  }),
  (req, res) => moduleCategoryController.deleteCategory(req, res),
);

module.exports = router;
