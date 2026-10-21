const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * TenantModule Model - core.tenant_modules resource access
 */
class TenantModuleModel {
  /**
   * List modules for a tenant with optional filters.
   * @param {string} tenantUuid
   * @param {Object} options
   * @param {boolean} [options.is_enabled]
   * @param {string} [options.module_uuid]
   * @returns {Promise<Array>}
   */
  static async listForTenant(tenantUuid, options = {}) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }

    const params = [tenantUuid];
    let where = 'WHERE tm.tenant_uuid = $1';
    let idx = params.length + 1;

    if (options.is_enabled !== undefined) {
      where += ` AND tm.is_enabled = $${idx++}`;
      params.push(Boolean(options.is_enabled));
    }

    if (options.module_uuid) {
      if (!SecurityUtils.isValidUUID(options.module_uuid)) {
        throw new Error('Invalid module UUID format');
      }
      where += ` AND tm.module_uuid = $${idx++}`;
      params.push(options.module_uuid);
    }

    const query = `
      SELECT
        tm.tenant_module_uuid,
        tm.tenant_uuid,
        tm.business_type_uuid,
        tm.module_uuid,
        m.code AS module_code,
        m.name AS module_name,
        tm.is_enabled,
        tm.is_required,
        tm.config,
        tm.billing_plan,
        tm.price_per_month,
        tm.trial_ends_at,
        tm.activated_at,
        tm.deactivated_at,
        tm.created_at,
        tm.updated_at
      FROM core.tenant_modules tm
      INNER JOIN core.modules m ON m.module_uuid = tm.module_uuid
      ${where}
      ORDER BY m.name
    `;

    const result = await SafeQuery.execute(query, params);
    return result.rows;
  }

  /**
   * Get a single tenant_module row by UUID, scoped to tenant.
   * @param {string} tenantUuid
   * @param {string} tenantModuleUuid
   * @returns {Promise<Object|null>}
   */
  static async getByUuidForTenant(tenantUuid, tenantModuleUuid) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }
    if (!SecurityUtils.isValidUUID(tenantModuleUuid)) {
      throw new Error('Invalid tenant module UUID format');
    }

    const query = `
      SELECT
        tm.tenant_module_uuid,
        tm.tenant_uuid,
        tm.business_type_uuid,
        tm.module_uuid,
        m.code AS module_code,
        m.name AS module_name,
        tm.is_enabled,
        tm.is_required,
        tm.config,
        tm.billing_plan,
        tm.price_per_month,
        tm.trial_ends_at,
        tm.activated_at,
        tm.deactivated_at,
        tm.created_at,
        tm.updated_at
      FROM core.tenant_modules tm
      INNER JOIN core.modules m ON m.module_uuid = tm.module_uuid
      WHERE tm.tenant_uuid = $1
        AND tm.tenant_module_uuid = $2
      LIMIT 1
    `;

    const result = await SafeQuery.execute(query, [tenantUuid, tenantModuleUuid]);
    return result.rows[0] || null;
  }

  /**
   * Upsert tenant_modules row for a tenant + module.
   * Uses INSERT ... ON CONFLICT (tenant_uuid, module_uuid) DO UPDATE.
   * @param {string} tenantUuid
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  static async upsertForTenant(tenantUuid, data = {}) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }
    const {
      business_type_uuid,
      module_uuid,
      is_enabled,
      is_required,
      config,
      billing_plan,
      price_per_month,
      trial_ends_at,
      activated_at,
      deactivated_at,
    } = data;

    if (!SecurityUtils.isValidUUID(module_uuid)) {
      throw new Error('Invalid module UUID format');
    }

    let businessTypeUuid = null;
    if (business_type_uuid) {
      if (!SecurityUtils.isValidUUID(business_type_uuid)) {
        throw new Error('Invalid business type UUID format');
      }
      businessTypeUuid = business_type_uuid;
    }

    const safeConfig =
      config && typeof config === 'object'
        ? SecurityUtils.sanitizeObject(config)
        : {};

    const safeBillingPlan =
      billing_plan != null
        ? SecurityUtils.sanitizeString(String(billing_plan), { maxLength: 100 })
        : null;

    const safePrice =
      price_per_month != null
        ? SecurityUtils.validateDecimal(price_per_month, {
            min: 0,
            precision: 2,
          })
        : null;

    const query = `
      INSERT INTO core.tenant_modules (
        tenant_uuid,
        business_type_uuid,
        module_uuid,
        is_enabled,
        is_required,
        config,
        billing_plan,
        price_per_month,
        trial_ends_at,
        activated_at,
        deactivated_at
      ) VALUES (
        $1,
        $2,
        $3,
        COALESCE($4, false),
        COALESCE($5, false),
        $6::jsonb,
        $7,
        $8,
        $9,
        $10,
        $11
      )
      ON CONFLICT (tenant_uuid, module_uuid) DO UPDATE SET
        business_type_uuid = EXCLUDED.business_type_uuid,
        is_enabled = EXCLUDED.is_enabled,
        is_required = EXCLUDED.is_required,
        config = EXCLUDED.config,
        billing_plan = COALESCE(EXCLUDED.billing_plan, core.tenant_modules.billing_plan),
        price_per_month = COALESCE(EXCLUDED.price_per_month, core.tenant_modules.price_per_month),
        trial_ends_at = EXCLUDED.trial_ends_at,
        activated_at = EXCLUDED.activated_at,
        deactivated_at = EXCLUDED.deactivated_at,
        updated_at = CURRENT_TIMESTAMP
      RETURNING
        tenant_module_uuid,
        tenant_uuid,
        business_type_uuid,
        module_uuid,
        is_enabled,
        is_required,
        config,
        billing_plan,
        price_per_month,
        trial_ends_at,
        activated_at,
        deactivated_at,
        created_at,
        updated_at
    `;

    const params = [
      tenantUuid,
      businessTypeUuid,
      module_uuid,
      is_enabled !== undefined ? Boolean(is_enabled) : null,
      is_required !== undefined ? Boolean(is_required) : null,
      JSON.stringify(safeConfig || {}),
      safeBillingPlan,
      safePrice,
      trial_ends_at || null,
      activated_at || null,
      deactivated_at || null,
    ];

    const result = await SafeQuery.execute(query, params);
    return result.rows[0];
  }

  /**
   * Update tenant_modules row by UUID, scoped to tenant.
   * @param {string} tenantUuid
   * @param {string} tenantModuleUuid
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  static async updateForTenant(tenantUuid, tenantModuleUuid, data = {}) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }
    if (!SecurityUtils.isValidUUID(tenantModuleUuid)) {
      throw new Error('Invalid tenant module UUID format');
    }

    const fields = [];
    const params = [];
    let idx = 1;

    if (data.business_type_uuid !== undefined) {
      if (data.business_type_uuid && !SecurityUtils.isValidUUID(data.business_type_uuid)) {
        throw new Error('Invalid business type UUID format');
      }
      fields.push(`business_type_uuid = $${idx++}`);
      params.push(data.business_type_uuid || null);
    }

    if (data.is_enabled !== undefined) {
      fields.push(`is_enabled = $${idx++}`);
      params.push(Boolean(data.is_enabled));
    }

    if (data.is_required !== undefined) {
      fields.push(`is_required = $${idx++}`);
      params.push(Boolean(data.is_required));
    }

    if (data.config !== undefined) {
      const safeConfig =
        data.config && typeof data.config === 'object'
          ? SecurityUtils.sanitizeObject(data.config)
          : {};
      fields.push(`config = $${idx++}::jsonb`);
      params.push(JSON.stringify(safeConfig || {}));
    }

    if (data.billing_plan !== undefined) {
      const safeBillingPlan =
        data.billing_plan != null
          ? SecurityUtils.sanitizeString(String(data.billing_plan), { maxLength: 100 })
          : null;
      fields.push(`billing_plan = $${idx++}`);
      params.push(safeBillingPlan);
    }

    if (data.price_per_month !== undefined) {
      const safePrice =
        data.price_per_month != null
          ? SecurityUtils.validateDecimal(data.price_per_month, {
              min: 0,
              precision: 2,
            })
          : null;
      fields.push(`price_per_month = $${idx++}`);
      params.push(safePrice);
    }

    if (data.trial_ends_at !== undefined) {
      fields.push(`trial_ends_at = $${idx++}`);
      params.push(data.trial_ends_at || null);
    }

    if (data.activated_at !== undefined) {
      fields.push(`activated_at = $${idx++}`);
      params.push(data.activated_at || null);
    }

    if (data.deactivated_at !== undefined) {
      fields.push(`deactivated_at = $${idx++}`);
      params.push(data.deactivated_at || null);
    }

    if (fields.length === 0) {
      return this.getByUuidForTenant(tenantUuid, tenantModuleUuid);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    params.push(tenantUuid);
    params.push(tenantModuleUuid);

    const whereTenantIdx = idx++;
    const whereModuleIdx = idx;

    const query = `
      UPDATE core.tenant_modules
      SET ${fields.join(', ')}
      WHERE tenant_uuid = $${whereTenantIdx}
        AND tenant_module_uuid = $${whereModuleIdx}
      RETURNING
        tenant_module_uuid,
        tenant_uuid,
        business_type_uuid,
        module_uuid,
        is_enabled,
        is_required,
        config,
        billing_plan,
        price_per_month,
        trial_ends_at,
        activated_at,
        deactivated_at,
        created_at,
        updated_at
    `;

    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete tenant_modules row by UUID, scoped to tenant.
   * @param {string} tenantUuid
   * @param {string} tenantModuleUuid
   * @returns {Promise<boolean>}
   */
  static async deleteForTenant(tenantUuid, tenantModuleUuid) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }
    if (!SecurityUtils.isValidUUID(tenantModuleUuid)) {
      throw new Error('Invalid tenant module UUID format');
    }

    const query = `
      DELETE FROM core.tenant_modules
      WHERE tenant_uuid = $1
        AND tenant_module_uuid = $2
    `;

    const result = await SafeQuery.execute(query, [tenantUuid, tenantModuleUuid]);
    return result.rowCount > 0;
  }
}

module.exports = TenantModuleModel;

