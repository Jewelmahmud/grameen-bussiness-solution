const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * TenantSettings Model - core.tenant_settings resource access
 */
class TenantSettingsModel {
  /**
   * Get tenant settings by tenant UUID
   * @param {string} tenantUuid
   * @returns {Promise<Object|null>}
   */
  static async getByTenantUuid(tenantUuid) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }

    const query = `
      SELECT
        tenant_uuid,
        currency_code,
        currency_symbol,
        timezone,
        date_format,
        financial_year_start,
        enable_vat,
        vat_percentage,
        enable_discount,
        enable_barcode,
        enable_warranty,
        low_stock_threshold,
        receipt_header,
        receipt_footer,
        created_at,
        updated_at
      FROM core.tenant_settings
      WHERE tenant_uuid = $1
      LIMIT 1
    `;

    const result = await SafeQuery.execute(query, [tenantUuid]);
    return result.rows[0] || null;
  }

  /**
   * Upsert tenant settings for a tenant
   * @param {string} tenantUuid
   * @param {Object} settings
   * @returns {Promise<Object>} persisted settings row
   */
  static async upsertForTenant(tenantUuid, settings = {}) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }

    const query = `
      INSERT INTO core.tenant_settings (
        tenant_uuid,
        currency_code,
        currency_symbol,
        timezone,
        date_format,
        financial_year_start,
        enable_vat,
        vat_percentage,
        enable_discount,
        enable_barcode,
        enable_warranty,
        low_stock_threshold,
        receipt_header,
        receipt_footer
      ) VALUES (
        $1,
        $2::core.currency_code,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14
      )
      ON CONFLICT (tenant_uuid) DO UPDATE SET
        currency_code = EXCLUDED.currency_code,
        currency_symbol = EXCLUDED.currency_symbol,
        timezone = EXCLUDED.timezone,
        date_format = EXCLUDED.date_format,
        financial_year_start = EXCLUDED.financial_year_start,
        enable_vat = EXCLUDED.enable_vat,
        vat_percentage = EXCLUDED.vat_percentage,
        enable_discount = EXCLUDED.enable_discount,
        enable_barcode = EXCLUDED.enable_barcode,
        enable_warranty = EXCLUDED.enable_warranty,
        low_stock_threshold = EXCLUDED.low_stock_threshold,
        receipt_header = EXCLUDED.receipt_header,
        receipt_footer = EXCLUDED.receipt_footer,
        updated_at = CURRENT_TIMESTAMP
      RETURNING
        tenant_uuid,
        currency_code,
        currency_symbol,
        timezone,
        date_format,
        financial_year_start,
        enable_vat,
        vat_percentage,
        enable_discount,
        enable_barcode,
        enable_warranty,
        low_stock_threshold,
        receipt_header,
        receipt_footer,
        created_at,
        updated_at;
    `;

    const params = [
      tenantUuid,
      settings.currency_code || 'BDT',
      settings.currency_symbol || '৳',
      settings.timezone || 'Asia/Dhaka',
      settings.date_format || 'DD/MM/YYYY',
      settings.financial_year_start || '01-07',
      settings.enable_vat !== undefined ? settings.enable_vat : true,
      settings.vat_percentage !== undefined ? settings.vat_percentage : 15.0,
      settings.enable_discount !== undefined ? settings.enable_discount : true,
      settings.enable_barcode !== undefined ? settings.enable_barcode : true,
      settings.enable_warranty !== undefined ? settings.enable_warranty : true,
      settings.low_stock_threshold !== undefined ? settings.low_stock_threshold : 10,
      settings.receipt_header
        ? SecurityUtils.sanitizeString(settings.receipt_header, { maxLength: 1000 })
        : null,
      settings.receipt_footer
        ? SecurityUtils.sanitizeString(settings.receipt_footer, { maxLength: 500 })
        : null,
    ];

    const result = await SafeQuery.execute(query, params);
    return result.rows[0];
  }

  /**
   * Delete tenant settings row for a tenant
   * @param {string} tenantUuid
   * @returns {Promise<boolean>} true if a row was deleted
   */
  static async deleteForTenant(tenantUuid) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }

    const query = `
      DELETE FROM core.tenant_settings
      WHERE tenant_uuid = $1
    `;

    const result = await SafeQuery.execute(query, [tenantUuid]);
    return result.rowCount > 0;
  }

  /**
   * Resolve tenant_uuid for a given user UUID (tenant where user is owner).
   * @param {string} userUuid
   * @returns {Promise<string|null>}
   */
  static async getTenantUuidForUser(userUuid) {
    if (!SecurityUtils.isValidUUID(userUuid)) {
      throw new Error('Invalid user UUID format');
    }

    const query = `
      SELECT tenant_uuid
      FROM core.tenants
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await SafeQuery.execute(query, [userUuid]);
    return result.rows[0]?.tenant_uuid || null;
  }
}

module.exports = TenantSettingsModel;

