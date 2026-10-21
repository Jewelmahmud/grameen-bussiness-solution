const express = require('express');
const router = express.Router();
const businessesController = require('../controllers/businessesController');
const InputValidation = require('../middleware/inputValidation');
const AuthMiddleware = require('../middleware/authMiddleware');

/**
 * Admin / Owner Businesses Routes
 * Base path: /api/v1/admin/businesses
 *
 * Access matrix:
 *   admin | super_admin | grameen_bazaar_admin  → full access to all businesses
 *   grameen_bazaar_vendor                       → manage own businesses only
 *       GET   : list/one scoped to their company_id
 *       POST  : company_id forced to their own
 *       PUT   : only if business.company_id == their company_id
 *       DELETE: only if business.company_id == their company_id
 */

const ADMIN_ROLES  = ['admin', 'super_admin', 'grameen_bazaar_admin'];
const OWNER_ROLES  = ['grameen_bazaar_vendor'];  // manage own businesses only
const ALL_ALLOWED  = [...ADMIN_ROLES, ...OWNER_ROLES];

/** Extract company_id from the first role assignment on req.user */
function extractUserCompanyId(user) {
  if (!user || !Array.isArray(user.roles)) return null;
  for (const role of user.roles) {
    const cid = role?.assignment?.companyId
      || role?.assignment?.company_id
      || role?.company?.id
      || role?.companyId
      || null;
    if (cid) return cid;
  }
  return null;
}

/** Returns true if the user holds at least one of the given role names */
function hasRole(user, roleNames) {
  if (!user || !Array.isArray(user.roles)) return false;
  const allowed = roleNames.map((r) => r.toLowerCase());
  return user.roles.some((r) => {
    const candidates = [r?.name, r?.roleName, r?.code, r?.slug]
      .filter(Boolean)
      .map((v) => String(v).toLowerCase());
    return candidates.some((c) => allowed.includes(c));
  });
}

/**
 * Attach role-context flags so the controller can enforce ownership:
 *   req.isAdmin        true for admin/super_admin/grameen_bazaar_admin
 *   req.isOwnerOnly    true for grameen_bazaar_vendor (manage own businesses only)
 *   req.userCompanyId  company_id extracted from the token
 */
function attachRoleContext(req, res, next) {
  const user = req.user;
  if (hasRole(user, ADMIN_ROLES)) {
    req.isAdmin       = true;
    req.isOwnerOnly   = false;
  } else {
    req.isAdmin       = false;
    req.isOwnerOnly   = true;
    req.userCompanyId = extractUserCompanyId(user);
  }
  next();
}

router.use(InputValidation.sanitize());
router.use(AuthMiddleware.requireRoles(ALL_ALLOWED));
router.use(attachRoleContext);

// GET /api/v1/admin/businesses  (same filters as public + sensitive columns)
router.get(
  '/',
  InputValidation.validate({
    query: {
      is_active:              { type: 'boolean', required: false },
      is_marketplace_enabled: { type: 'boolean', required: false },
      is_primary:             { type: 'boolean', required: false },
      tenant_uuid:            { type: 'uuid',    required: false },
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

// GET /api/v1/admin/businesses/:businessUuid
router.get(
  '/:businessUuid',
  InputValidation.validate({ params: { businessUuid: { type: 'uuid' } } }),
  (req, res) => businessesController.getOne(req, res),
);

// POST /api/v1/admin/businesses
router.post(
  '/',
  InputValidation.validate({
    body: {
      tenant_uuid:                  { type: 'uuid',    required: true  },
      business_type_uuid:           { type: 'uuid',    required: true  },
      business_name:                { type: 'string',  required: true,  maxLength: 255 },
      name:                         { type: 'string',  required: true,  maxLength: 255 },
      code:                         { type: 'string',  required: false, maxLength: 50  },
      logo_url:                     { type: 'string',  required: false, maxLength: 500 },
      domain:                       { type: 'string',  required: false, maxLength: 100 },
      company_id:                   { type: 'uuid',    required: false },
      address:                      { type: 'string',  required: false },
      country_code:                 { type: 'string',  required: false, maxLength: 2   },
      location_level_1_id:          { type: 'integer', required: false },
      location_level_2_id:          { type: 'integer', required: false },
      location_level_3_id:          { type: 'integer', required: false },
      location_level_4_id:          { type: 'integer', required: false },
      location_level_5_id:          { type: 'integer', required: false },
      location_level_6_id:          { type: 'integer', required: false },
      location_level_7_id:          { type: 'integer', required: false },
      location_rank:                { type: 'integer', required: false },
      postal_code:                  { type: 'string',  required: false, maxLength: 20  },
      phone:                        { type: 'string',  required: false, maxLength: 20  },
      email:                        { type: 'string',  required: false, maxLength: 255 },
      manager_uuid:                 { type: 'uuid',    required: false },
      tin_number:                   { type: 'string',  required: false, maxLength: 50  },
      trade_license:                { type: 'string',  required: false, maxLength: 100 },
      opening_time:                 { type: 'string',  required: false },
      closing_time:                 { type: 'string',  required: false },
      enable_pos:                   { type: 'boolean', required: false },
      is_active:                    { type: 'boolean', required: false },
      is_primary:                   { type: 'boolean', required: false },
      is_personal_website_enabled:  { type: 'boolean', required: false },
      is_marketplace_enabled:       { type: 'boolean', required: false },
    },
  }),
  (req, res) => businessesController.create(req, res),
);

// PUT /api/v1/admin/businesses/:businessUuid  (all fields optional)
router.put(
  '/:businessUuid',
  InputValidation.validate({
    params: { businessUuid: { type: 'uuid' } },
    body: {
      tenant_uuid:                  { type: 'uuid',    required: false },
      business_type_uuid:           { type: 'uuid',    required: false },
      business_name:                { type: 'string',  required: false, maxLength: 255 },
      name:                         { type: 'string',  required: false, maxLength: 255 },
      code:                         { type: 'string',  required: false, maxLength: 50  },
      logo_url:                     { type: 'string',  required: false, maxLength: 500 },
      domain:                       { type: 'string',  required: false, maxLength: 100 },
      company_id:                   { type: 'uuid',    required: false },
      address:                      { type: 'string',  required: false },
      country_code:                 { type: 'string',  required: false, maxLength: 2   },
      location_level_1_id:          { type: 'integer', required: false },
      location_level_2_id:          { type: 'integer', required: false },
      location_level_3_id:          { type: 'integer', required: false },
      location_level_4_id:          { type: 'integer', required: false },
      location_level_5_id:          { type: 'integer', required: false },
      location_level_6_id:          { type: 'integer', required: false },
      location_level_7_id:          { type: 'integer', required: false },
      location_rank:                { type: 'integer', required: false },
      postal_code:                  { type: 'string',  required: false, maxLength: 20  },
      phone:                        { type: 'string',  required: false, maxLength: 20  },
      email:                        { type: 'string',  required: false, maxLength: 255 },
      manager_uuid:                 { type: 'uuid',    required: false },
      tin_number:                   { type: 'string',  required: false, maxLength: 50  },
      trade_license:                { type: 'string',  required: false, maxLength: 100 },
      opening_time:                 { type: 'string',  required: false },
      closing_time:                 { type: 'string',  required: false },
      enable_pos:                   { type: 'boolean', required: false },
      is_active:                    { type: 'boolean', required: false },
      is_primary:                   { type: 'boolean', required: false },
      is_personal_website_enabled:  { type: 'boolean', required: false },
      is_marketplace_enabled:       { type: 'boolean', required: false },
    },
  }),
  (req, res) => businessesController.update(req, res),
);

// DELETE /api/v1/admin/businesses/:businessUuid
router.delete(
  '/:businessUuid',
  InputValidation.validate({ params: { businessUuid: { type: 'uuid' } } }),
  (req, res) => businessesController.delete(req, res),
);

module.exports = router;
