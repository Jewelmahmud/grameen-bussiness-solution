const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');
const TenantSettingsModel = require('../models/TenantSettingsModel');
const InputValidation = require('../middleware/inputValidation');
const AuthMiddleware = require('../middleware/authMiddleware');

/**
 * Tenant Routes (non-admin)
 * Base path: /api/v1/tenant
 *
 * Role matrix:
 * - grameen_bazaar_tenant, grameen_bazaar_vendor:
 *     can only read/write/update/delete their own tenant row
 * - admin, super_admin, grameen_bazaar_admin:
 *     can operate on any tenantUuid
 * - grameen_bazaar_support, support_agent, support_supervisor, support_manager:
 *     read-only access
 */

// Sanitize all inputs
router.use(InputValidation.sanitize());

// All routes require authentication
router.use(AuthMiddleware.requireAuth);

// Role sets
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
 * Resolve tenantUuid and enforce per-tenant access:
 * - tenant/vendor: only their own tenant
 * - admin-like: any tenant
 */
async function resolveTenantUuid(req, res, next) {
  const tenantUuid =
    req.body?.tenantUuid ||
    req.body?.tenant_uuid ||
    req.query?.tenantUuid ||
    req.query?.tenant_uuid;

  const user = req.user;
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'অনুমোদিত নয় - ব্যবহারকারী তথ্য পাওয়া যায়নি',
    });
  }

  const isAdminLike = userHasRole(user, ADMIN_ROLES);
  const isTenantVendor = userHasRole(user, TENANT_VENDOR_ROLES);

  // For GET: admin/support/manager may omit tenantUuid to get full subscriber list.
  // For PUT/DELETE: tenantUuid is always required (which tenant to update/delete).
  if (!tenantUuid) {
    const isPutOrDelete = req.method === 'PUT' || req.method === 'DELETE';
    if (isPutOrDelete) {
      return res.status(400).json({
        success: false,
        message: 'tenantUuid is required for update/delete (send in body or query)',
      });
    }

    const ADMIN_SUPPORT_MANAGER_ROLES = [
      ...ADMIN_ROLES,
      ...READ_ONLY_ROLES,
      'manager',
    ];

    const hasAdminSupportManagerRole = userHasRole(
      user,
      ADMIN_SUPPORT_MANAGER_ROLES,
    );

    if (hasAdminSupportManagerRole) {
      // Do not set req.params.tenantUuid; controller will treat this as a list request
      return next();
    }

    // For non-admin/vendor roles, tenantUuid is mandatory
    return res.status(400).json({
      success: false,
      message: 'tenantUuid is required for tenant operations',
    });
  }

  if (isTenantVendor && !isAdminLike) {
    try {
      const ownTenantUuid = await TenantSettingsModel.getTenantUuidForUser(user.id);

      if (!ownTenantUuid || ownTenantUuid !== tenantUuid) {
        return res.status(403).json({
          success: false,
          message: 'আপনি শুধুমাত্র নিজের টেন্যান্ট তথ্য দেখতে বা পরিবর্তন করতে পারবেন',
        });
      }
    } catch (error) {
      console.error('[Tenant] resolveTenantUuid error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'টেন্যান্ট যাচাই করার সময় ত্রুটি হয়েছে',
      });
    }
  }

  req.params.tenantUuid = tenantUuid;
  next();
}

// READ: GET /api/v1/tenant
router.get(
  '/',
  AuthMiddleware.requireRoles(ANY_ALLOWED_ROLE),
  optionalTenantInBodyValidation,
  resolveTenantUuid,
  (req, res) => tenantController.getTenant(req, res),
);

// CREATE: POST /api/v1/tenant (admin roles only, can create any tenant)
router.post(
  '/',
  AuthMiddleware.requireRoles(FULL_ACCESS_ROLES),
  (req, res) => tenantController.createTenant(req, res),
);

// UPDATE: PUT /api/v1/tenant (full access roles on allowed tenant)
router.put(
  '/',
  AuthMiddleware.requireRoles(FULL_ACCESS_ROLES),
  optionalTenantInBodyValidation,
  resolveTenantUuid,
  (req, res) => tenantController.updateTenant(req, res),
);

// DELETE: DELETE /api/v1/tenant (full access roles on allowed tenant)
router.delete(
  '/',
  AuthMiddleware.requireRoles(FULL_ACCESS_ROLES),
  optionalTenantInBodyValidation,
  resolveTenantUuid,
  (req, res) => tenantController.deleteTenant(req, res),
);

module.exports = router;

