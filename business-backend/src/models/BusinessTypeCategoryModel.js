const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * BusinessTypeCategoryModel - business.business_type_categories resource access
 */
class BusinessTypeCategoryModel {
  static #SELECT = `
    SELECT category_uuid, code, name, name_bn, description, description_bn,
           icon, display_order, is_active, created_at, updated_at
    FROM business.business_type_categories
  `;

  /**
   * Get all business type categories with filtering, search and pagination.
   *
   * @param {Object} options
   * @param {boolean} [options.is_active]
   * @param {string}  [options.search]
   * @param {string}  [options.sort_by]     - code|name|name_bn|display_order|created_at|updated_at
   * @param {string}  [options.sort_order]  - asc|desc
   * @param {number}  [options.page]
   * @param {number}  [options.limit]
   */
  static async getAll(options = {}) {
    const conditions = [];
    const params = [];

    if (options.is_active !== undefined) {
      conditions.push(`is_active = $${params.length + 1}`);
      params.push(options.is_active);
    }

    if (options.search) {
      const term = `%${options.search.toLowerCase()}%`;
      conditions.push(
        `(
          LOWER(code) LIKE $${params.length + 1}
          OR LOWER(name) LIKE $${params.length + 2}
          OR LOWER(COALESCE(name_bn, '')) LIKE $${params.length + 3}
        )`,
      );
      params.push(term, term, term);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    const ALLOWED_SORT = new Set(['code', 'name', 'name_bn', 'display_order', 'created_at', 'updated_at']);
    const sortCol = ALLOWED_SORT.has(options.sort_by) ? options.sort_by : 'display_order';
    const sortOrder = options.sort_order === 'desc' ? 'DESC' : 'ASC';

    const limit =
      options.limit === 0 ? null : Math.min(Math.max(parseInt(options.limit) || 50, 1), 200);
    const page = Math.max(parseInt(options.page) || 1, 1);
    const offset = limit ? (page - 1) * limit : 0;

    const countQuery = `SELECT COUNT(*) AS total FROM business.business_type_categories ${where}`;
    const countResult = await SafeQuery.execute(countQuery, params);
    const total = parseInt(countResult.rows[0]?.total || 0, 10);

    const limitClause = limit ? `LIMIT $${params.length + 1}` : '';
    const offsetClause = offset ? `OFFSET $${params.length + (limit ? 2 : 1)}` : '';
    if (limit) params.push(limit);
    if (offset) params.push(offset);

    const query = `
      ${BusinessTypeCategoryModel.#SELECT}
      ${where}
      ORDER BY ${sortCol} ${sortOrder}
      ${limitClause} ${offsetClause}
    `;
    const result = await SafeQuery.execute(query, params);

    const pageSize = limit || total;
    const totalPages = pageSize > 0 ? Math.ceil(total / (limit || total)) : 1;

    return {
      data: result.rows || [],
      pagination: {
        total,
        page: limit ? page : 1,
        limit: limit || total,
        total_pages: totalPages,
        has_next: limit ? page < totalPages : false,
        has_prev: limit ? page > 1 : false,
      },
    };
  }

  static async getByUuid(categoryUuid) {
    if (!SecurityUtils.isValidUUID(categoryUuid)) {
      throw new Error('Invalid business type category UUID format');
    }
    const query = `${BusinessTypeCategoryModel.#SELECT} WHERE category_uuid = $1 LIMIT 1`;
    const result = await SafeQuery.execute(query, [categoryUuid]);
    return result.rows[0] || null;
  }

  static async create(data) {
    const code = SecurityUtils.sanitizeString(data.code, { maxLength: 50 });
    if (!code) throw new Error('code is required');

    const name = SecurityUtils.sanitizeString(data.name, { maxLength: 100 });
    if (!name) throw new Error('name is required');

    const name_bn =
      data.name_bn !== undefined
        ? SecurityUtils.sanitizeString(data.name_bn, { maxLength: 100 })
        : null;
    const description =
      data.description !== undefined
        ? SecurityUtils.sanitizeString(data.description)
        : null;
    const description_bn =
      data.description_bn !== undefined
        ? SecurityUtils.sanitizeString(data.description_bn)
        : null;
    const icon =
      data.icon !== undefined
        ? SecurityUtils.sanitizeString(data.icon, { maxLength: 100 })
        : null;
    const display_order =
      data.display_order !== undefined ? parseInt(data.display_order, 10) : 0;
    const is_active = data.is_active !== undefined ? !!data.is_active : true;

    const query = `
      INSERT INTO business.business_type_categories
        (code, name, name_bn, description, description_bn, icon, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING category_uuid, code, name, name_bn, description, description_bn,
                icon, display_order, is_active, created_at, updated_at
    `;
    const result = await SafeQuery.execute(query, [
      code,
      name,
      name_bn,
      description,
      description_bn,
      icon,
      display_order,
      is_active,
    ]);
    return result.rows[0];
  }

  static async update(categoryUuid, data) {
    if (!SecurityUtils.isValidUUID(categoryUuid)) {
      throw new Error('Invalid business type category UUID format');
    }

    const fields = [];
    const params = [];

    const add = (col, val) => {
      params.push(val);
      fields.push(`${col} = $${params.length}`);
    };

    if (data.code !== undefined)
      add('code', SecurityUtils.sanitizeString(data.code, { maxLength: 50 }));
    if (data.name !== undefined)
      add('name', SecurityUtils.sanitizeString(data.name, { maxLength: 100 }));
    if (data.name_bn !== undefined)
      add('name_bn', SecurityUtils.sanitizeString(data.name_bn, { maxLength: 100 }));
    if (data.description !== undefined)
      add('description', SecurityUtils.sanitizeString(data.description));
    if (data.description_bn !== undefined)
      add('description_bn', SecurityUtils.sanitizeString(data.description_bn));
    if (data.icon !== undefined)
      add('icon', SecurityUtils.sanitizeString(data.icon, { maxLength: 100 }));
    if (data.display_order !== undefined)
      add('display_order', parseInt(data.display_order, 10));
    if (data.is_active !== undefined)
      add('is_active', !!data.is_active);

    if (!fields.length) throw new Error('No fields provided for update');

    add('updated_at', new Date());
    params.push(categoryUuid);

    const query = `
      UPDATE business.business_type_categories
      SET ${fields.join(', ')}
      WHERE category_uuid = $${params.length}
      RETURNING category_uuid, code, name, name_bn, description, description_bn,
                icon, display_order, is_active, created_at, updated_at
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  static async delete(categoryUuid) {
    if (!SecurityUtils.isValidUUID(categoryUuid)) {
      throw new Error('Invalid business type category UUID format');
    }
    const result = await SafeQuery.execute(
      `DELETE FROM business.business_type_categories WHERE category_uuid = $1 RETURNING category_uuid`,
      [categoryUuid],
    );
    return result.rows[0] || null;
  }
}

module.exports = BusinessTypeCategoryModel;

