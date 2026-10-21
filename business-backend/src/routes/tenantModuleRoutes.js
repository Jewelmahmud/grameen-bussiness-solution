const express = require('express');
const router = express.Router();
const tenantModuleController = require('../controllers/tenantModuleController');
const TenantSettingsModel = require('../models/TenantSettingsModel');
const InputValidation = require('../middleware/inputValidation');
const AuthMiddleware = require('../middleware/authMiddleware');

/**
 * Tenant Module Routes (non-admin)
 * Base path: /api/v1/tenant/modules
 *
 * Role matrix (same pattern as tenant/settings):
 * - Full read/write/edit/delete:
 *   grameen_bazaar_tenant, grameen_bazaar_vendor,
 *   admin, super_admin, grameen_bazaar_admin
 *
 * - Read-only:
 *   grameen_bazaar_support, support_agent,
 *   support_supervisor, support_manager
 */

// Sanitize all inputs
router.use(InputValidation.sanitize());

// All routes require authentication
router.use(AuthMiddleware.requireAuth);

// Allowed roles
const TENANT_VENDOR_ROLES = [
  'grameen_bazaar_tenant',
  'grameen_bazaar_vendor',
];

const ADMIN_ROLES = [
  'admin',
  'super_admin',
  'grameen_bazaar_admin',
];

const FULL_ACCESS_ROLES = [
  ...TENANT_VENDOR_ROLES,
  ...ADMIN_ROLES,
];

const READ_ONLY_ROLES = [
  'grameen_bazaar_support',
  'support_agent',
  'support_supervisor',
  'support_manager',
];

const ANY_ALLOWED_ROLE = [...FULL_ACCESS_ROLES, ...READ_ONLY_ROLES];

// Validation: body can optionally include tenantUuid; if not, derive from user/company
const optionalTenantInBodyValidation = InputValidation.validate({
  body: {
    tenantUuid: { type: 'uuid', required: false },
  },
});

/**
 * Utility: check if user has at least one of the given roles.
 * Matches name, roleName, code, slug (case-insensitive).
 */
function userHasRole(user, roleNames = []) {
  if (!user || !Array.isArray(user.roles)) return false;
  const normalized = roleNames.map((r) => String(r).toLowerCase());

  return user.roles.some((role) => {
    if (!role) return false;
    const candidates = [
      role.name,
      role.roleName,
      role.code,
      role.slug,
    ]
      .filter((v) => v !== undefined && v !== null)
      .map((v) => String(v).toLowerCase());

    return candidates.some((c) => normalized.includes(c));
  });
}

/**
 * Helper middleware to resolve tenantUuid for the current user and
 * enforce per-tenant access rules:
 *
 * - grameen_bazaar_tenant, grameen_bazaar_vendor:
 *     can only read/write their own tenant's modules
 * - admin, super_admin, grameen_bazaar_admin:
 *     can operate on any tenantUuid
 * - support roles (read-only) are checked at route level and do not
 *   have write/delete access.
 */
async function resolveTenantUuid(req, res, next) {
  const tenantUuid = req.body?.tenantUuid || req.query?.tenantUuid;

  if (!tenantUuid) {
    return res.status(400).json({
      success: false,
      message: 'tenantUuid is required for tenant module operations',
    });
  }

  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'অনুমোদিত নয় - ব্যবহারকারী তথ্য পাওয়া যায়নি',
    });
  }

  // Admin-like roles can manage any tenant
  const isAdminLike = userHasRole(user, ADMIN_ROLES);

  // Tenant/vendor roles: must match their own tenant
  const isTenantVendor = userHasRole(user, TENANT_VENDOR_ROLES);

  if (isTenantVendor && !isAdminLike) {
    try {
      const ownTenantUuid = await TenantSettingsModel.getTenantUuidForUser(
        user.id,
      );

      if (!ownTenantUuid || ownTenantUuid !== tenantUuid) {
        return res.status(403).json({
          success: false,
          message:
            'আপনি শুধুমাত্র নিজের টেন্যান্ট এর মডিউল কনফিগারেশন দেখতে বা পরিবর্তন করতে পারবেন',
        });
      }
    } catch (error) {
      console.error(
        '[TenantModules] resolveTenantUuid error:',
        error.message,
      );
      return res.status(500).json({
        success: false,
        message: error.message || 'টেন্যান্ট যাচাই করার সময় ত্রুটি হয়েছে',
      });
    }
  }

  // Normalize into params so controller can reuse logic easily
  req.params.tenantUuid = tenantUuid;
  next();
}

// READ: GET /api/v1/tenant/modules
// Roles: FULL_ACCESS_ROLES + READ_ONLY_ROLES
router.get(
  '/',
  AuthMiddleware.requireRoles(ANY_ALLOWED_ROLE),
  optionalTenantInBodyValidation,
  resolveTenantUuid,
  (req, res) => tenantModuleController.getTenantModules(req, res),
);

// READ single: GET /api/v1/tenant/modules/:tenantModuleUuid
router.get(
  '/:tenantModuleUuid',
  AuthMiddleware.requireRoles(ANY_ALLOWED_ROLE),
  optionalTenantInBodyValidation,
  resolveTenantUuid,
  InputValidation.validate({
    params: { tenantModuleUuid: { type: 'uuid', required: true } },
  }),
  (req, res) => tenantModuleController.getTenantModule(req, res),
);

// CREATE/UPSERT: POST /api/v1/tenant/modules
// Roles: FULL_ACCESS_ROLES only (support is read-only)
router.post(
  '/',
  AuthMiddleware.requireRoles(FULL_ACCESS_ROLES),
  optionalTenantInBodyValidation,
  resolveTenantUuid,
  (req, res) => tenantModuleController.upsertTenantModule(req, res),
);

// UPDATE: PUT /api/v1/tenant/modules/:tenantModuleUuid
// Roles: FULL_ACCESS_ROLES only
router.put(
  '/:tenantModuleUuid',
  AuthMiddleware.requireRoles(FULL_ACCESS_ROLES),
  optionalTenantInBodyValidation,
  resolveTenantUuid,
  InputValidation.validate({
    params: { tenantModuleUuid: { type: 'uuid', required: true } },
  }),
  (req, res) => tenantModuleController.updateTenantModule(req, res),
);

// DELETE: DELETE /api/v1/tenant/modules/:tenantModuleUuid
// Roles: FULL_ACCESS_ROLES only
router.delete(
  '/:tenantModuleUuid',
  AuthMiddleware.requireRoles(FULL_ACCESS_ROLES),
  optionalTenantInBodyValidation,
  resolveTenantUuid,
  InputValidation.validate({
    params: { tenantModuleUuid: { type: 'uuid', required: true } },
  }),
  (req, res) => tenantModuleController.deleteTenantModule(req, res),
);

module.exports = router;

