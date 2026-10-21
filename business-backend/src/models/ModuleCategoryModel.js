const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * Module Category Model - core.module_categories resource access
 */
class ModuleCategoryModel {
  /**
   * Get category by UUID
   * @param {string} categoryUuid
   * @returns {Promise<Object|null>}
   */
  static async getByUuid(categoryUuid) {
    if (!SecurityUtils.isValidUUID(categoryUuid)) {
      throw new Error('Invalid category UUID format');
    }

    const query = `
      SELECT category_uuid,
             code,
             name,
             name_en,
             image_url,
             sort_order,
             is_active,
             created_at,
             updated_at
      FROM core.module_categories
      WHERE category_uuid = $1
      LIMIT 1
    `;
    const result = await SafeQuery.execute(query, [categoryUuid]);
    return result.rows[0] || null;
  }

  /**
   * Get all categories (optional filter by is_active)
   * @param {Object} options - { is_active: boolean | undefined }
   * @returns {Promise<Array>}
   */
  static async getAll(options = {}) {
    let query = `
      SELECT category_uuid,
             code,
             name,
             name_en,
             sort_order,
             is_active,
             created_at,
             updated_at
      FROM core.module_categories
    `;
    const params = [];

    if (options.is_active !== undefined) {
      query += ` WHERE is_active = $1`;
      params.push(options.is_active);
    }

    query += ` ORDER BY sort_order ASC, name ASC`;

    const result = await SafeQuery.execute(query, params);
    return result.rows;
  }

  /**
   * Create a category (admin only)
   * @param {Object} data - { code, name, name_en?, image_url?, sort_order?, is_active? }
   * @returns {Promise<Object>}
   */
  static async create(data = {}) {
    const code = data.code ? SecurityUtils.sanitizeString(data.code, { maxLength: 100 }) : null;
    const name = data.name ? SecurityUtils.sanitizeString(data.name, { maxLength: 255 }) : null;
    if (!code || !name) {
      throw new Error('code and name are required');
    }

    const nameEn = data.name_en
      ? SecurityUtils.sanitizeString(data.name_en, { maxLength: 255 })
      : (data.nameEn ? SecurityUtils.sanitizeString(data.nameEn, { maxLength: 255 }) : null);

    const sortOrder = typeof data.sort_order === 'number' ? data.sort_order : (data.sortOrder ?? 0);
    const isActive = data.is_active !== undefined ? Boolean(data.is_active) : true;

    const query = `
      INSERT INTO core.module_categories (code, name, name_en, sort_order, is_active)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING category_uuid,
                code,
                name,
                name_en,
                sort_order,
                is_active,
                created_at,
                updated_at
    `;
    const result = await SafeQuery.execute(query, [code, name, nameEn, sortOrder, isActive]);
    return result.rows[0];
  }

  /**
   * Update a category (admin only)
   * @param {string} categoryUuid
   * @param {Object} data - partial fields
   * @returns {Promise<Object|null>}
   */
  static async update(categoryUuid, data = {}) {
    if (!SecurityUtils.isValidUUID(categoryUuid)) {
      throw new Error('Invalid category UUID format');
    }

    const fields = [];
    const params = [];
    let idx = 1;

    if (data.code !== undefined) {
      fields.push(`code = $${idx++}`);
      params.push(SecurityUtils.sanitizeString(data.code, { maxLength: 100 }));
    }
    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      params.push(SecurityUtils.sanitizeString(data.name, { maxLength: 255 }));
    }
    if (data.name_en !== undefined || data.nameEn !== undefined) {
      const value = data.name_en !== undefined ? data.name_en : data.nameEn;
      fields.push(`name_en = $${idx++}`);
      params.push(
        value == null ? null : SecurityUtils.sanitizeString(String(value), { maxLength: 255 }),
      );
    }
    if (data.image_url !== undefined || data.imageUrl !== undefined) {
      const value = data.image_url !== undefined ? data.image_url : data.imageUrl;
      fields.push(`image_url = $${idx++}`);
      params.push(
        value == null ? null : SecurityUtils.sanitizeString(String(value), { maxLength: 500 }),
      );
    }
    if (data.sort_order !== undefined || data.sortOrder !== undefined) {
      const value = data.sort_order !== undefined ? data.sort_order : data.sortOrder;
      fields.push(`sort_order = $${idx++}`);
      params.push(typeof value === 'number' ? value : 0);
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      params.push(Boolean(data.is_active));
    }

    if (fields.length === 0) {
      return this.getByUuid(categoryUuid);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(categoryUuid);

    const query = `
      UPDATE core.module_categories
      SET ${fields.join(', ')}
      WHERE category_uuid = $${idx}
      RETURNING category_uuid,
                code,
                name,
                name_en,
                image_url,
                sort_order,
                is_active,
                created_at,
                updated_at
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete a category (admin only). Modules referencing this category will have category_uuid set to NULL (ON DELETE SET NULL).
   * @param {string} categoryUuid
   * @returns {Promise<boolean>}
   */
  static async delete(categoryUuid) {
    if (!SecurityUtils.isValidUUID(categoryUuid)) {
      throw new Error('Invalid category UUID format');
    }

    const query = `DELETE FROM core.module_categories WHERE category_uuid = $1`;
    const result = await SafeQuery.execute(query, [categoryUuid]);
    return result.rowCount > 0;
  }
}

module.exports = ModuleCategoryModel;
