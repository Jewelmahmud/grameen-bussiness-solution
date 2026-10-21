const TenantSettingsModel = require('../models/TenantSettingsModel');

/**
 * TenantSettings Controller - Resource endpoints for core.tenant_settings
 *
 * Admin-only endpoints are mounted under:
 *   /api/v1/admin/tenants/:tenantUuid/settings
 */
class TenantSettingsController {
  /**
   * GET /api/v1/admin/tenants/:tenantUuid/settings
   */
  async getTenantSettings(req, res) {
    try {
      const { tenantUuid } = req.params;
      const settings = await TenantSettingsModel.getByTenantUuid(tenantUuid);

      if (!settings) {
        return res.status(404).json({
          success: false,
          message: 'Tenant settings not found',
        });
      }

      return res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error('[TenantSettings] Get tenant settings error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load tenant settings',
      });
    }
  }

  /**
   * PUT /api/v1/admin/tenants/:tenantUuid/settings
   */
  async upsertTenantSettings(req, res) {
    try {
      const { tenantUuid } = req.params;
      const payload = req.body || {};

      const saved = await TenantSettingsModel.upsertForTenant(tenantUuid, payload);

      return res.json({
        success: true,
        message: 'Tenant settings saved successfully',
        data: saved,
      });
    } catch (error) {
      console.error('[TenantSettings] Upsert tenant settings error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to save tenant settings',
      });
    }
  }

  /**
   * POST /api/v1/admin/tenants/:tenantUuid/settings
   * Semantically same as upsert (create if missing, update if exists)
   */
  async createTenantSettings(req, res) {
    return this.upsertTenantSettings(req, res);
  }

  /**
   * DELETE /api/v1/admin/tenants/:tenantUuid/settings
   */
  async deleteTenantSettings(req, res) {
    try {
      const { tenantUuid } = req.params;
      const deleted = await TenantSettingsModel.deleteForTenant(tenantUuid);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Tenant settings not found',
        });
      }

      return res.json({
        success: true,
        message: 'Tenant settings deleted successfully',
      });
    } catch (error) {
      console.error('[TenantSettings] Delete tenant settings error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete tenant settings',
      });
    }
  }
}

module.exports = new TenantSettingsController();

