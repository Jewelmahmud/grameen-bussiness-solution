const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * Tenant Model - core.tenants resource access
 */
class TenantModel {
  /**
   * List all tenant subscribers with their details.
   * Intended for admin/support dashboards.
   * @returns {Promise<Object[]>}
   */
  static async listAllTenants() {
    const query = `
      SELECT
        t.tenant_uuid,
        t.company_id,
        t.user_id,
        COALESCE(
          NULLIF(TRIM(concat_ws(' ', uc.first_name, uc.last_name)), ''),
          t.email
        ) AS subscriber_name,
        uc.avatar AS subscriber_avatar,
        t.phone,
        t.email,
        t.subscription_plan,
        t.subscription_amount,
        t.subscription_currency_code,
        t.subscription_status,
        t.subscription_start_date,
        t.subscription_end_date,
        t.max_users,
        t.max_products,
        t.max_businesses,
        t.max_warehouses,
        t.is_active,
        t.created_at,
        t.updated_at
      FROM core.tenants t
      LEFT JOIN core.user_cache uc
        ON uc.user_uuid = t.user_id
      ORDER BY t.created_at DESC
    `;

    const result = await SafeQuery.execute(query, []);
    return result.rows || [];
  }

  /**
   * Get tenant by tenant UUID
   * @param {string} tenantUuid
   * @returns {Promise<Object|null>}
   */
  static async getByTenantUuid(tenantUuid) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }

    const query = `
      SELECT
        t.tenant_uuid,
        t.company_id,
        t.user_id,
        COALESCE(
          NULLIF(TRIM(concat_ws(' ', uc.first_name, uc.last_name)), ''),
          t.email
        ) AS subscriber_name,
        uc.avatar AS subscriber_avatar,
        t.phone,
        t.email,
        t.subscription_plan,
        t.subscription_amount,
        t.subscription_currency_code,
        t.subscription_status,
        t.subscription_start_date,
        t.subscription_end_date,
        t.max_users,
        t.max_products,
        t.max_businesses,
        t.max_warehouses,
        t.is_active,
        t.created_at,
        t.updated_at
      FROM core.tenants t
      LEFT JOIN core.user_cache uc ON uc.user_uuid = t.user_id
      WHERE t.tenant_uuid = $1
      LIMIT 1
    `;

    const result = await SafeQuery.execute(query, [tenantUuid]);
    return result.rows[0] || null;
  }

  /**
   * Get tenant by user ID (at most one tenant per user).
   * @param {string} userId - External user UUID from auth server
   * @returns {Promise<Object|null>}
   */
  static async getByUserId(userId) {
    if (!userId || !SecurityUtils.isValidUUID(userId)) {
      return null;
    }
    const query = `
      SELECT tenant_uuid, company_id, user_id, phone, email,
             subscription_plan, subscription_status, subscription_amount,
             subscription_currency_code, subscription_start_date, subscription_end_date,
             max_users, max_products, max_businesses, max_warehouses,
             is_active, created_at, updated_at
      FROM core.tenants
      WHERE user_id = $1
      LIMIT 1
    `;
    const result = await SafeQuery.execute(query, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Get tenant by company ID (at most one tenant per company)
   * @param {string} companyId
   * @returns {Promise<Object|null>}
   */
  static async getByCompanyId(companyId) {
    if (!companyId || !SecurityUtils.isValidUUID(companyId)) {
      return null;
    }
    const query = `
      SELECT tenant_uuid, company_id, user_id, phone, email,
             subscription_plan, subscription_status, subscription_amount,
             subscription_currency_code, subscription_start_date, subscription_end_date,
             max_users, max_products, max_businesses, max_warehouses,
             is_active, created_at, updated_at
      FROM core.tenants
      WHERE company_id = $1
      LIMIT 1
    `;
    const result = await SafeQuery.execute(query, [companyId]);
    return result.rows[0] || null;
  }

  /**
   * Create a new tenant (admin-only use case)
   * @param {Object} data
   * @returns {Promise<Object>} created tenant
   */
  static async createTenant(data = {}) {
    const phone = data.phone ? SecurityUtils.sanitizePhone(data.phone) : null;
    const email = data.email ? SecurityUtils.sanitizeEmail(data.email) : null;

    const query = `
      INSERT INTO core.tenants (
        tenant_uuid,
        company_id,
        user_id,
        phone,
        email,
        subscription_plan,
        subscription_status,
        subscription_amount,
        subscription_currency_code,
        subscription_start_date,
        subscription_end_date,
        max_users,
        max_products,
        max_businesses,
        max_warehouses,
        is_active
      ) VALUES (
        gen_random_uuid(),
        $1,  -- company_id
        $2,  -- user_id
        $3,  -- phone
        $4,  -- email
        COALESCE($5::core.subscription_plan, 'marketplace'::core.subscription_plan),
        COALESCE($6::core.subscription_status, 'active'::core.subscription_status),
        COALESCE($7, 0),                                      -- subscription_amount
        COALESCE($8::core.currency_code, 'BDT'::core.currency_code),
        $9,                                                   -- subscription_start_date
        $10,                                                  -- subscription_end_date
        COALESCE($11, 5),                                     -- max_users
        $12,                                                  -- max_products
        COALESCE($13, 1),                                     -- max_businesses
        COALESCE($14, 1),                                     -- max_warehouses
        COALESCE($15, true)                                   -- is_active
      )
      RETURNING
        tenant_uuid,
        company_id,
        user_id,
        phone,
        email,
        subscription_plan,
        subscription_status,
        subscription_amount,
        subscription_currency_code,
        subscription_start_date,
        subscription_end_date,
        max_users,
        max_products,
        max_businesses,
        max_warehouses,
        is_active,
        created_at,
        updated_at;
    `;

    const params = [
      data.company_id || null,
      data.user_id || null,
      phone,
      email,
      data.subscription_plan || null,
      data.subscription_status || null,
      data.subscription_amount || null,
      data.subscription_currency_code || null,
      data.subscription_start_date || null,
      data.subscription_end_date || null,
      data.max_users || null,
      data.max_products || null,
      data.max_businesses || null,
      data.max_warehouses || null,
      data.is_active !== undefined ? data.is_active : null,
    ];

    const result = await SafeQuery.execute(query, params);
    return result.rows[0];
  }

  /**
   * Update tenant (non-null fields only)
   * @param {string} tenantUuid
   * @param {Object} data
   * @returns {Promise<Object|null>} updated tenant
   */
  static async updateTenant(tenantUuid, data = {}) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }

    const fields = [];
    const params = [];
    let idx = 1;

    const pushField = (column, value, sanitizer) => {
      if (value === undefined) return;
      let v = value;
      if (sanitizer) v = sanitizer(value);
      fields.push(`${column} = $${idx++}`);
      params.push(v);
    };

    pushField('user_id', data.user_id);
    pushField('phone', data.phone, (v) => SecurityUtils.sanitizePhone(v));
    pushField('email', data.email, (v) => SecurityUtils.sanitizeEmail(v));
    pushField('subscription_plan', data.subscription_plan);
    pushField('subscription_status', data.subscription_status);
    pushField('subscription_amount', data.subscription_amount);
    pushField('subscription_currency_code', data.subscription_currency_code);
    pushField('subscription_start_date', data.subscription_start_date);
    pushField('subscription_end_date', data.subscription_end_date);
    pushField('max_users', data.max_users);
    pushField('max_products', data.max_products);
    pushField('max_businesses', data.max_businesses);
    pushField('max_warehouses', data.max_warehouses);
    pushField('is_active', data.is_active);

    if (fields.length === 0) {
      return this.getByTenantUuid(tenantUuid);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');

    params.push(tenantUuid);
    const whereIdx = idx;

    const query = `
      UPDATE core.tenants
      SET ${fields.join(', ')}
      WHERE tenant_uuid = $${whereIdx}
      RETURNING
        tenant_uuid,
        company_id,
        user_id,
        phone,
        email,
        subscription_plan,
        subscription_status,
        subscription_amount,
        subscription_currency_code,
        subscription_start_date,
        subscription_end_date,
        max_users,
        max_products,
        max_businesses,
        max_warehouses,
        is_active,
        created_at,
        updated_at;
    `;

    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete tenant by UUID
   * @param {string} tenantUuid
   * @returns {Promise<boolean>}
   */
  static async deleteTenant(tenantUuid) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }

    const query = `
      DELETE FROM core.tenants
      WHERE tenant_uuid = $1
    `;

    const result = await SafeQuery.execute(query, [tenantUuid]);
    return result.rowCount > 0;
  }
}

module.exports = TenantModel;

