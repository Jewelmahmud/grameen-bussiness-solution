const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * Subscription Plan Model - core.subscription_plans resource access
 */
class SubscriptionPlanModel {
  /**
   * Get all subscription plans (optional filter: is_active)
   * @param {Object} options - { is_active?: boolean }
   * @returns {Promise<Object[]>}
   */
  static async getAll(options = {}) {
    const conditions = [];
    const params = [];

    if (options.is_active !== undefined) {
      conditions.push('is_active = $' + (params.length + 1));
      params.push(options.is_active);
    }

    const whereClause = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';

    const query = `
      SELECT id, plan_uuid, code, name, name_en, description, features, max_products,
             max_users, max_businesses, max_warehouses, subscription_amount, subscription_currency_code,
             is_marketplace, display_order, is_active, created_at, updated_at
      FROM core.subscription_plans
      ${whereClause}
      ORDER BY display_order ASC, code ASC
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows || [];
  }

  /**
   * Get plan by UUID
   * @param {string} planUuid
   * @returns {Promise<Object|null>}
   */
  static async getByUuid(planUuid) {
    if (!SecurityUtils.isValidUUID(planUuid)) {
      throw new Error('Invalid plan UUID format');
    }
    const query = `
      SELECT id, plan_uuid, code, name, name_en, description, features, max_products,
             max_users, max_businesses, max_warehouses, subscription_amount, subscription_currency_code,
             is_marketplace, display_order, is_active, created_at, updated_at
      FROM core.subscription_plans
      WHERE plan_uuid = $1
      LIMIT 1
    `;
    const result = await SafeQuery.execute(query, [planUuid]);
    return result.rows[0] || null;
  }

  /**
   * Get plan by code
   * @param {string} code
   * @returns {Promise<Object|null>}
   */
  static async getByCode(code) {
    if (!code || typeof code !== 'string') return null;
    const sanitized = SecurityUtils.sanitizeString(code.trim(), { maxLength: 50 });
    if (!sanitized) return null;
    const query = `
      SELECT id, plan_uuid, code, name, name_en, description, features, max_products,
             max_users, max_businesses, max_warehouses, subscription_amount, subscription_currency_code,
             is_marketplace, display_order, is_active, created_at, updated_at
      FROM core.subscription_plans
      WHERE code = $1
      LIMIT 1
    `;
    const result = await SafeQuery.execute(query, [sanitized]);
    return result.rows[0] || null;
  }

  /**
   * Create a subscription plan (admin only)
   * @param {Object} data - { code, name, description?, max_products?, is_marketplace?, display_order?, is_active? }
   * @returns {Promise<Object>}
   */
  static async create(data = {}) {
    const code = data.code ? SecurityUtils.sanitizeString(String(data.code).trim(), { maxLength: 50 }) : null;
    const name = data.name ? SecurityUtils.sanitizeString(String(data.name), { maxLength: 255 }) : null;
    if (!code || !name) {
      throw new Error('code and name are required');
    }

    const nameEn = data.name_en != null || data.nameEn != null
      ? SecurityUtils.sanitizeString(String(data.name_en ?? data.nameEn), { maxLength: 255 })
      : null;
    const description = data.description != null
      ? SecurityUtils.sanitizeString(String(data.description), { maxLength: 2000 })
      : null;
    const maxProducts = data.max_products !== undefined || data.maxProducts !== undefined
      ? (data.max_products != null ? parseInt(data.max_products, 10) : (data.maxProducts != null ? parseInt(data.maxProducts, 10) : null))
      : null;
    const isMarketplace = data.is_marketplace !== undefined ? Boolean(data.is_marketplace) : (data.isMarketplace !== undefined ? Boolean(data.isMarketplace) : false);
    const displayOrder = data.display_order !== undefined ? parseInt(data.display_order, 10) : (data.displayOrder !== undefined ? parseInt(data.displayOrder, 10) : 0);
    const isActive = data.is_active !== undefined ? Boolean(data.is_active) : (data.isActive !== undefined ? Boolean(data.isActive) : true);
    const maxUsers = data.max_users !== undefined || data.maxUsers !== undefined
      ? (data.max_users != null ? parseInt(data.max_users, 10) : (data.maxUsers != null ? parseInt(data.maxUsers, 10) : null))
      : 5;
    const maxBusinesses = data.max_businesses !== undefined || data.maxBusinesses !== undefined
      ? (data.max_businesses != null ? parseInt(data.max_businesses, 10) : (data.maxBusinesses != null ? parseInt(data.maxBusinesses, 10) : null))
      : 1;
    const maxWarehouses = data.max_warehouses !== undefined || data.maxWarehouses !== undefined
      ? (data.max_warehouses != null ? parseInt(data.max_warehouses, 10) : (data.maxWarehouses != null ? parseInt(data.maxWarehouses, 10) : null))
      : 1;
    const subscriptionAmount = data.subscription_amount !== undefined || data.subscriptionAmount !== undefined
      ? parseFloat(data.subscription_amount ?? data.subscriptionAmount ?? 0)
      : 0;
    const subscriptionCurrencyCode = (data.subscription_currency_code ?? data.subscriptionCurrencyCode ?? 'BDT').toString().trim().toUpperCase().slice(0, 10) || 'BDT';
    const features = data.features !== undefined || data.feature_list !== undefined
      ? (data.features ?? data.feature_list)
      : null;
    const featuresJson = features == null
      ? null
      : (typeof features === 'string' ? features : JSON.stringify(features));

    if (maxProducts !== null && (isNaN(maxProducts) || maxProducts < 0)) {
      throw new Error('max_products must be a non-negative integer or null');
    }
    if (maxUsers != null && (isNaN(maxUsers) || maxUsers < 0)) {
      throw new Error('max_users must be a non-negative integer');
    }
    if (maxBusinesses != null && (isNaN(maxBusinesses) || maxBusinesses < 0)) {
      throw new Error('max_businesses must be a non-negative integer');
    }
    if (maxWarehouses != null && (isNaN(maxWarehouses) || maxWarehouses < 0)) {
      throw new Error('max_warehouses must be a non-negative integer');
    }

    const query = `
      INSERT INTO core.subscription_plans (code, name, name_en, description, features, max_products, max_users, max_businesses, max_warehouses, subscription_amount, subscription_currency_code, is_marketplace, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, plan_uuid, code, name, name_en, description, features, max_products, max_users, max_businesses, max_warehouses, subscription_amount, subscription_currency_code, is_marketplace, display_order, is_active, created_at, updated_at
    `;
    const result = await SafeQuery.execute(query, [
      code, name, nameEn, description, featuresJson, maxProducts, maxUsers, maxBusinesses, maxWarehouses, subscriptionAmount, subscriptionCurrencyCode, isMarketplace, displayOrder, isActive,
    ]);
    return result.rows[0];
  }

  /**
   * Update a subscription plan (admin only)
   * @param {string} planUuid
   * @param {Object} data - partial fields
   * @returns {Promise<Object|null>}
   */
  static async update(planUuid, data = {}) {
    if (!SecurityUtils.isValidUUID(planUuid)) {
      throw new Error('Invalid plan UUID format');
    }

    const fields = [];
    const params = [];
    let idx = 1;

    if (data.code !== undefined) {
      fields.push(`code = $${idx++}`);
      params.push(SecurityUtils.sanitizeString(String(data.code).trim(), { maxLength: 50 }));
    }
    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      params.push(SecurityUtils.sanitizeString(String(data.name), { maxLength: 255 }));
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      params.push(
        data.description == null ? null : SecurityUtils.sanitizeString(String(data.description), { maxLength: 2000 }),
      );
    }
    if (data.features !== undefined || data.feature_list !== undefined) {
      const raw = data.features !== undefined ? data.features : data.feature_list;
      const val = raw == null ? null : (typeof raw === 'string' ? raw : JSON.stringify(raw));
      fields.push(`features = $${idx++}::jsonb`);
      params.push(val);
    }
    if (data.max_products !== undefined || data.maxProducts !== undefined) {
      const v = data.max_products !== undefined ? data.max_products : data.maxProducts;
      fields.push(`max_products = $${idx++}`);
      params.push(v == null ? null : (isNaN(parseInt(v, 10)) ? null : parseInt(v, 10)));
    }
    if (data.max_users !== undefined || data.maxUsers !== undefined) {
      const v = data.max_users !== undefined ? data.max_users : data.maxUsers;
      fields.push(`max_users = $${idx++}`);
      params.push(v == null ? null : (isNaN(parseInt(v, 10)) ? null : parseInt(v, 10)));
    }
    if (data.max_businesses !== undefined || data.maxBusinesses !== undefined) {
      const v = data.max_businesses !== undefined ? data.max_businesses : data.maxBusinesses;
      fields.push(`max_businesses = $${idx++}`);
      params.push(v == null ? null : (isNaN(parseInt(v, 10)) ? null : parseInt(v, 10)));
    }
    if (data.max_warehouses !== undefined || data.maxWarehouses !== undefined) {
      const v = data.max_warehouses !== undefined ? data.max_warehouses : data.maxWarehouses;
      fields.push(`max_warehouses = $${idx++}`);
      params.push(v == null ? null : (isNaN(parseInt(v, 10)) ? null : parseInt(v, 10)));
    }
    if (data.subscription_amount !== undefined || data.subscriptionAmount !== undefined) {
      const v = data.subscription_amount !== undefined ? data.subscription_amount : data.subscriptionAmount;
      fields.push(`subscription_amount = $${idx++}`);
      params.push(v == null ? 0 : (isNaN(parseFloat(v)) ? 0 : parseFloat(v)));
    }
    if (data.subscription_currency_code !== undefined || data.subscriptionCurrencyCode !== undefined) {
      const v = (data.subscription_currency_code ?? data.subscriptionCurrencyCode ?? '').toString().trim().toUpperCase().slice(0, 10) || 'BDT';
      fields.push(`subscription_currency_code = $${idx++}`);
      params.push(v);
    }
    if (data.is_marketplace !== undefined || data.isMarketplace !== undefined) {
      const v = data.is_marketplace !== undefined ? data.is_marketplace : data.isMarketplace;
      fields.push(`is_marketplace = $${idx++}`);
      params.push(Boolean(v));
    }
    if (data.display_order !== undefined || data.displayOrder !== undefined) {
      const v = data.display_order !== undefined ? data.display_order : data.displayOrder;
      fields.push(`display_order = $${idx++}`);
      params.push(parseInt(v, 10) || 0);
    }
    if (data.is_active !== undefined || data.isActive !== undefined) {
      const v = data.is_active !== undefined ? data.is_active : data.isActive;
      fields.push(`is_active = $${idx++}`);
      params.push(Boolean(v));
    }

    if (fields.length === 0) {
      return this.getByUuid(planUuid);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(planUuid);

    const query = `
      UPDATE core.subscription_plans
      SET ${fields.join(', ')}
      WHERE plan_uuid = $${idx}
      RETURNING id, plan_uuid, code, name, name_en, description, features, max_products, max_users, max_businesses, max_warehouses, subscription_amount, subscription_currency_code, is_marketplace, display_order, is_active, created_at, updated_at
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete a subscription plan (admin only). No FK from tenants yet; safe to delete.
   * @param {string} planUuid
   * @returns {Promise<boolean>}
   */
  static async delete(planUuid) {
    if (!SecurityUtils.isValidUUID(planUuid)) {
      throw new Error('Invalid plan UUID format');
    }
    const query = `DELETE FROM core.subscription_plans WHERE plan_uuid = $1`;
    const result = await SafeQuery.execute(query, [planUuid]);
    return result.rowCount > 0;
  }
}

module.exports = SubscriptionPlanModel;
