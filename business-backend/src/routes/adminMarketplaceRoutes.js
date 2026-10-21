const express = require('express');
const router = express.Router();
const marketplaceCategoryController = require('../controllers/marketplaceCategoryController');
const marketplaceBrandController    = require('../controllers/marketplaceBrandController');
const InputValidation = require('../middleware/inputValidation');
const AuthMiddleware  = require('../middleware/authMiddleware');

/**
 * Admin Marketplace Routes (admin / super_admin only)
 * Base path: /api/v1/admin/marketplace
 *
 * ── Canonical categories ─────────────────────────────────────────────────
 * GET    /categories
 * POST   /categories
 * PUT    /categories/:categoryUuid
 * DELETE /categories/:categoryUuid
 *
 * ── Phase 1: Business type → category mappings ───────────────────────────
 * GET    /business-type-mappings
 * POST   /business-type-mappings          { business_type_uuid, marketplace_category_uuid }
 * DELETE /business-type-mappings/:businessTypeUuid
 *
 * ── Phase 2: Category mapping review queue ───────────────────────────────
 * GET    /category-mappings?needs_review=true
 * POST   /category-mappings/confirm       { category_uuid, marketplace_category_uuid }
 * DELETE /category-mappings/:categoryUuid
 *
 * ── Phase 3: Category alias dictionary ──────────────────────────────────
 * GET    /aliases?marketplace_category_uuid=...
 * POST   /aliases                          { alias, marketplace_category_uuid }
 * DELETE /aliases/:aliasId
 *
 * ── Canonical brands ─────────────────────────────────────────────────────
 * GET    /brands
 * POST   /brands
 * PUT    /brands/:brandUuid
 * DELETE /brands/:brandUuid
 *
 * ── Phase 2: Brand mapping review queue ──────────────────────────────────
 * GET    /brand-mappings?needs_review=true
 * POST   /brand-mappings/confirm            { brand_uuid, marketplace_brand_uuid }
 * DELETE /brand-mappings/:brandUuid
 *
 * ── Phase 3: Brand alias dictionary ──────────────────────────────────────
 * GET    /brand-aliases?marketplace_brand_uuid=...
 * POST   /brand-aliases                     { alias, marketplace_brand_uuid }
 * DELETE /brand-aliases/:aliasId
 */

router.use(InputValidation.sanitize());
router.use(AuthMiddleware.requireRoles(['admin', 'super_admin']));

// ── Canonical categories ─────────────────────────────────────────────────────

router.get('/categories', (req, res) => marketplaceCategoryController.getCategories(req, res));

router.post(
  '/categories',
  InputValidation.validate({
    body: {
      name:    { type: 'string', required: true,  maxLength: 255 },
      name_en: { type: 'string', required: true,  maxLength: 255 },
      slug:    { type: 'string', required: true,  maxLength: 255 },
      description:   { type: 'string',  required: false },
      parent_uuid:   { type: 'uuid',    required: false },
      display_order: { type: 'integer', required: false },
      is_active:     { type: 'boolean', required: false },
    },
  }),
  (req, res) => marketplaceCategoryController.createCategory(req, res),
);

router.put(
  '/categories/:categoryUuid',
  InputValidation.validate({
    params: { categoryUuid: { type: 'uuid' } },
    body: {
      name:          { type: 'string',  required: false, maxLength: 255 },
      name_en:       { type: 'string',  required: false, maxLength: 255 },
      slug:          { type: 'string',  required: false, maxLength: 255 },
      description:   { type: 'string',  required: false },
      parent_uuid:   { type: 'uuid',    required: false },
      display_order: { type: 'integer', required: false },
      is_active:     { type: 'boolean', required: false },
    },
  }),
  (req, res) => marketplaceCategoryController.updateCategory(req, res),
);

router.delete(
  '/categories/:categoryUuid',
  InputValidation.validate({ params: { categoryUuid: { type: 'uuid' } } }),
  (req, res) => marketplaceCategoryController.deleteCategory(req, res),
);

// ── Phase 1: Business type → category mappings ───────────────────────────────

router.get('/business-type-mappings', (req, res) => marketplaceCategoryController.getBusinessTypeMappings(req, res));

router.post(
  '/business-type-mappings',
  InputValidation.validate({
    body: {
      business_type_uuid:         { type: 'uuid', required: true },
      marketplace_category_uuid:  { type: 'uuid', required: true },
    },
  }),
  (req, res) => marketplaceCategoryController.upsertBusinessTypeMapping(req, res),
);

router.delete(
  '/business-type-mappings/:businessTypeUuid',
  InputValidation.validate({ params: { businessTypeUuid: { type: 'uuid' } } }),
  (req, res) => marketplaceCategoryController.deleteBusinessTypeMapping(req, res),
);

// ── Phase 2: Category mapping review queue ───────────────────────────────────

router.get('/category-mappings', (req, res) => marketplaceCategoryController.getMappingQueue(req, res));

router.post(
  '/category-mappings/confirm',
  InputValidation.validate({
    body: {
      category_uuid:             { type: 'uuid', required: true },
      marketplace_category_uuid: { type: 'uuid', required: true },
    },
  }),
  (req, res) => marketplaceCategoryController.confirmMapping(req, res),
);

router.delete(
  '/category-mappings/:categoryUuid',
  InputValidation.validate({ params: { categoryUuid: { type: 'uuid' } } }),
  (req, res) => marketplaceCategoryController.removeMapping(req, res),
);

// ── Phase 3: Alias dictionary ─────────────────────────────────────────────────

router.get('/aliases', (req, res) => marketplaceCategoryController.getAliases(req, res));

router.post(
  '/aliases',
  InputValidation.validate({
    body: {
      alias:                     { type: 'string', required: true, maxLength: 255 },
      marketplace_category_uuid: { type: 'uuid',   required: true },
    },
  }),
  (req, res) => marketplaceCategoryController.addAlias(req, res),
);

router.delete(
  '/aliases/:aliasId',
  (req, res) => marketplaceCategoryController.deleteAlias(req, res),
);

// ── Canonical brands ─────────────────────────────────────────────────────────

router.get('/brands', (req, res) => marketplaceBrandController.getBrands(req, res));

router.post(
  '/brands',
  InputValidation.validate({
    body: {
      name:          { type: 'string', required: true,  maxLength: 255 },
      name_en:       { type: 'string', required: true,  maxLength: 255 },
      slug:          { type: 'string', required: true,  maxLength: 255 },
      description:   { type: 'string', required: false },
      display_order: { type: 'integer', required: false },
      is_active:     { type: 'boolean', required: false },
    },
  }),
  (req, res) => marketplaceBrandController.createBrand(req, res),
);

router.put(
  '/brands/:brandUuid',
  InputValidation.validate({
    params: { brandUuid: { type: 'uuid' } },
    body: {
      name:          { type: 'string',  required: false, maxLength: 255 },
      name_en:       { type: 'string',  required: false, maxLength: 255 },
      slug:          { type: 'string',  required: false, maxLength: 255 },
      description:   { type: 'string',  required: false },
      display_order: { type: 'integer', required: false },
      is_active:     { type: 'boolean', required: false },
    },
  }),
  (req, res) => marketplaceBrandController.updateBrand(req, res),
);

router.delete(
  '/brands/:brandUuid',
  InputValidation.validate({ params: { brandUuid: { type: 'uuid' } } }),
  (req, res) => marketplaceBrandController.deleteBrand(req, res),
);

// ── Phase 2: Brand mapping review queue ──────────────────────────────────────

router.get('/brand-mappings', (req, res) => marketplaceBrandController.getMappingQueue(req, res));

router.post(
  '/brand-mappings/confirm',
  InputValidation.validate({
    body: {
      brand_uuid:              { type: 'uuid', required: true },
      marketplace_brand_uuid:  { type: 'uuid', required: true },
    },
  }),
  (req, res) => marketplaceBrandController.confirmMapping(req, res),
);

router.delete(
  '/brand-mappings/:brandUuid',
  InputValidation.validate({ params: { brandUuid: { type: 'uuid' } } }),
  (req, res) => marketplaceBrandController.removeMapping(req, res),
);

// ── Phase 3: Brand alias dictionary ──────────────────────────────────────────

router.get('/brand-aliases', (req, res) => marketplaceBrandController.getAliases(req, res));

router.post(
  '/brand-aliases',
  InputValidation.validate({
    body: {
      alias:                  { type: 'string', required: true, maxLength: 255 },
      marketplace_brand_uuid: { type: 'uuid',   required: true },
    },
  }),
  (req, res) => marketplaceBrandController.addAlias(req, res),
);

router.delete(
  '/brand-aliases/:aliasId',
  (req, res) => marketplaceBrandController.deleteAlias(req, res),
);

module.exports = router;
