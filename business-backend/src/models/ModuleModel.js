const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * Module Model - core.modules resource access
 */
class ModuleModel {
  /**
   * Get module by UUID
   * @param {string} moduleUuid
   * @returns {Promise<Object|null>}
   */
  static async getByUuid(moduleUuid) {
    if (!SecurityUtils.isValidUUID(moduleUuid)) {
      throw new Error('Invalid module UUID format');
    }

    const query = `
      SELECT m.module_uuid,
             m.category_uuid,
             m.code,
             m.name,
             m.name_en,
             m.description,
             m.description_en,
             m.is_active,
             m.created_at,
             m.updated_at,
             c.name       AS category_name,
             c.name_en    AS category_name_en,
             pm.module_uuid AS parent_module_uuid,
             pm.name       AS parent_name,
             pm.name_en    AS parent_name_en
      FROM core.modules AS m
      LEFT JOIN core.module_categories AS c ON c.category_uuid = m.category_uuid
      LEFT JOIN core.module_dependencies AS d ON d.module_uuid = m.module_uuid
      LEFT JOIN core.modules AS pm ON pm.module_uuid = d.depends_on_uuid
      WHERE m.module_uuid = $1
      LIMIT 1
    `;
    const result = await SafeQuery.execute(query, [moduleUuid]);
    return result.rows[0] || null;
  }

  /**
   * Get all modules (optional filters: is_active, category_uuid)
   * @param {Object} options - { is_active?: boolean, category_uuid?: string }
   * @returns {Promise<Array>}
   */
  static async getAll(options = {}) {
    const conditions = [];
    const params = [];

    if (options.is_active !== undefined) {
      conditions.push(`m.is_active = $${params.length + 1}`);
      params.push(options.is_active);
    }
    if (options.category_uuid && SecurityUtils.isValidUUID(options.category_uuid)) {
      conditions.push(`m.category_uuid = $${params.length + 1}`);
      params.push(options.category_uuid);
    }

    const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

    const query = `
      SELECT
        m.module_uuid,
        m.category_uuid,
        m.code,
        m.name,
        m.name_en,
        m.description,
        m.description_en,
        m.is_active,
        m.created_at,
        m.updated_at,
        c.name       AS category_name,
        c.name_en    AS category_name_en,
        pm.module_uuid AS parent_module_uuid,
        pm.name       AS parent_name,
        pm.name_en    AS parent_name_en
      FROM core.modules AS m
      LEFT JOIN core.module_categories AS c ON c.category_uuid = m.category_uuid
      LEFT JOIN core.module_dependencies AS d
        ON d.module_uuid = m.module_uuid
      LEFT JOIN core.modules AS pm
        ON pm.module_uuid = d.depends_on_uuid
      ${whereClause}
      ORDER BY m.name
    `;

    const result = await SafeQuery.execute(query, params);
    return result.rows;
  }

  /**
   * Create a module (admin only). Matches core.modules columns.
   * @param {Object} data - { code, name, name_en?, description?, description_en?, category_uuid?, is_active? }
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

    const description = data.description != null
      ? SecurityUtils.sanitizeString(String(data.description), { maxLength: 2000 })
      : null;
    const descriptionEn = data.description_en != null
      ? SecurityUtils.sanitizeString(String(data.description_en), { maxLength: 2000 })
      : (data.descriptionEn != null
        ? SecurityUtils.sanitizeString(String(data.descriptionEn), { maxLength: 2000 })
        : null);
    const isActive = data.is_active !== undefined ? Boolean(data.is_active) : true;
    const categoryUuid = (data.category_uuid || data.categoryUuid) && SecurityUtils.isValidUUID(data.category_uuid || data.categoryUuid)
      ? (data.category_uuid || data.categoryUuid)
      : null;

    const query = `
      INSERT INTO core.modules (category_uuid, code, name, name_en, description, description_en, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING module_uuid,
                category_uuid,
                code,
                name,
                name_en,
                description,
                description_en,
                is_active,
                created_at,
                updated_at
    `;
    const result = await SafeQuery.execute(query, [categoryUuid, code, name, nameEn, description, descriptionEn, isActive]);
    return result.rows[0];
  }

  /**
   * Update a module (admin only)
   * @param {string} moduleUuid
   * @param {Object} data - partial fields
   * @returns {Promise<Object|null>}
   */
  static async update(moduleUuid, data = {}) {
    if (!SecurityUtils.isValidUUID(moduleUuid)) {
      throw new Error('Invalid module UUID format');
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
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      params.push(
        data.description == null
          ? null
          : SecurityUtils.sanitizeString(String(data.description), { maxLength: 2000 }),
      );
    }
    if (data.description_en !== undefined || data.descriptionEn !== undefined) {
      const value = data.description_en !== undefined ? data.description_en : data.descriptionEn;
      fields.push(`description_en = $${idx++}`);
      params.push(
        value == null
          ? null
          : SecurityUtils.sanitizeString(String(value), { maxLength: 2000 }),
      );
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      params.push(Boolean(data.is_active));
    }
    if (data.category_uuid !== undefined || data.categoryUuid !== undefined) {
      const raw = data.category_uuid !== undefined ? data.category_uuid : data.categoryUuid;
      const categoryUuid = (raw === null || raw === '' || raw === undefined)
        ? null
        : (SecurityUtils.isValidUUID(raw) ? raw : null);
      fields.push(`category_uuid = $${idx++}`);
      params.push(categoryUuid);
    }

    if (fields.length === 0) {
      return this.getByUuid(moduleUuid);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(moduleUuid);

    const query = `
      UPDATE core.modules
      SET ${fields.join(', ')}
      WHERE module_uuid = $${idx}
      RETURNING module_uuid,
                category_uuid,
                code,
                name,
                name_en,
                description,
                description_en,
                is_active,
                created_at,
                updated_at
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete a module (admin only). May fail if referenced by tenant_modules or module_dependencies.
   * @param {string} moduleUuid
   * @returns {Promise<boolean>}
   */
  static async delete(moduleUuid) {
    if (!SecurityUtils.isValidUUID(moduleUuid)) {
      throw new Error('Invalid module UUID format');
    }

    const query = `DELETE FROM core.modules WHERE module_uuid = $1`;
    const result = await SafeQuery.execute(query, [moduleUuid]);
    return result.rowCount > 0;
  }
}

module.exports = ModuleModel;
