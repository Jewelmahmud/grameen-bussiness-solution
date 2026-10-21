const TenantModuleModel = require('../models/TenantModuleModel');

/**
 * TenantModule Controller - Resource endpoints for core.tenant_modules
 *
 * Role pattern (enforced at route level):
 * - grameen_bazaar_tenant, grameen_bazaar_vendor:
 *     can only manage their own tenant's modules
 * - admin, super_admin, grameen_bazaar_admin:
 *     can manage any tenant's modules
 * - support roles:
 *     read-only
 */
class TenantModuleController {
  /**
   * GET /api/v1/tenant/modules
   * List tenant_modules rows for a tenant.
   * tenantUuid is resolved by route middleware into req.params.tenantUuid
   */
  async getTenantModules(req, res) {
    try {
      const { tenantUuid } = req.params;
      const { is_enabled, module_uuid } = req.query || {};

      const options = {};
      if (is_enabled !== undefined) {
        options.is_enabled = is_enabled === 'true' || is_enabled === true;
      }
      if (module_uuid) {
        options.module_uuid = module_uuid;
      }

      const list = await TenantModuleModel.listForTenant(tenantUuid, options);
      return res.json({
        success: true,
        data: list,
      });
    } catch (error) {
      console.error('[TenantModules] Get list error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load tenant modules',
      });
    }
  }

  /**
   * GET /api/v1/tenant/modules/:tenantModuleUuid
   * Get single tenant_module row for this tenant.
   */
  async getTenantModule(req, res) {
    try {
      const { tenantUuid } = req.params;
      const { tenantModuleUuid } = req.params;

      const row = await TenantModuleModel.getByUuidForTenant(
        tenantUuid,
        tenantModuleUuid,
      );

      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Tenant module not found',
        });
      }

      return res.json({
        success: true,
        data: row,
      });
    } catch (error) {
      console.error('[TenantModules] Get one error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load tenant module',
      });
    }
  }

  /**
   * POST /api/v1/tenant/modules
   * Upsert tenant_modules row for a tenant + module.
   * tenantUuid is resolved by middleware.
   *
   * Business rule:
   * - billing_plan, price_per_month, trial_ends_at are admin-only fields.
   *   Non-admin users cannot change them.
   */
  async upsertTenantModule(req, res) {
    try {
      const { tenantUuid } = req.params;
      const payload = { ...(req.body || {}) };

      // Strip admin-only billing fields for non-admin users
      const user = req.user || req.body.user;
      const adminRoles = ['admin', 'super_admin', 'grameen_bazaar_admin'];

      const hasAdminRole =
        user &&
        Array.isArray(user.roles) &&
        user.roles.some((role) => {
          if (!role) return false;
          const candidates = [
            role.name,
            role.roleName,
            role.code,
            role.slug,
          ]
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v).toLowerCase());
          return candidates.some((c) =>
            adminRoles.map((r) => r.toLowerCase()).includes(c),
          );
        });

      if (!hasAdminRole) {
        delete payload.billing_plan;
        delete payload.price_per_month;
        delete payload.trial_ends_at;
      }

      const saved = await TenantModuleModel.upsertForTenant(tenantUuid, payload);

      return res.status(201).json({
        success: true,
        message: 'Tenant module configuration saved successfully',
        data: saved,
      });
    } catch (error) {
      console.error('[TenantModules] Upsert error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to save tenant module configuration',
      });
    }
  }

  /**
   * PUT /api/v1/tenant/modules/:tenantModuleUuid
   * Update existing tenant_modules row.
   * tenantUuid and tenantModuleUuid are resolved by middleware/route.
   *
   * Same billing field restrictions as POST.
   */
  async updateTenantModule(req, res) {
    try {
      const { tenantUuid, tenantModuleUuid } = req.params;
      const payload = { ...(req.body || {}) };

      const user = req.user || req.body.user;
      const adminRoles = ['admin', 'super_admin', 'grameen_bazaar_admin'];

      const hasAdminRole =
        user &&
        Array.isArray(user.roles) &&
        user.roles.some((role) => {
          if (!role) return false;
          const candidates = [
            role.name,
            role.roleName,
            role.code,
            role.slug,
          ]
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v).toLowerCase());
          return candidates.some((c) =>
            adminRoles.map((r) => r.toLowerCase()).includes(c),
          );
        });

      if (!hasAdminRole) {
        delete payload.billing_plan;
        delete payload.price_per_month;
        delete payload.trial_ends_at;
      }

      const updated = await TenantModuleModel.updateForTenant(
        tenantUuid,
        tenantModuleUuid,
        payload,
      );

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Tenant module not found',
        });
      }

      return res.json({
        success: true,
        message: 'Tenant module updated successfully',
        data: updated,
      });
    } catch (error) {
      console.error('[TenantModules] Update error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update tenant module',
      });
    }
  }

  /**
   * DELETE /api/v1/tenant/modules/:tenantModuleUuid
   * Delete tenant_modules row for this tenant.
   */
  async deleteTenantModule(req, res) {
    try {
      const { tenantUuid, tenantModuleUuid } = req.params;

      const deleted = await TenantModuleModel.deleteForTenant(
        tenantUuid,
        tenantModuleUuid,
      );

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Tenant module not found',
        });
      }

      return res.json({
        success: true,
        message: 'Tenant module deleted successfully',
      });
    } catch (error) {
      console.error('[TenantModules] Delete error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete tenant module',
      });
    }
  }
}

module.exports = new TenantModuleController();

