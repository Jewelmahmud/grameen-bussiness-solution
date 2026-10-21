const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/** Max categories mappable to one business type (guardrail) */
const MAX_CATEGORY_MAP = 50;

/**
 * BusinessTypeModel - business.business_types resource access
 */
class BusinessTypeModel {
  static #SELECT = `
    SELECT business_type_uuid, name, name_bn, description, description_bn,
           icon, is_active, created_at, updated_at
    FROM business.business_types
  `;

  /**
   * Get all business types with filtering, search and pagination.
   *
   * @param {Object} options
   * @param {boolean}  [options.is_active]   - filter by active status
   * @param {string}   [options.search]      - full-text search on name / name_bn
   * @param {string}   [options.sort_by]     - column to sort: 'name'|'name_bn'|'created_at'|'updated_at' (default: 'name')
   * @param {string}   [options.sort_order]  - 'asc'|'desc' (default: 'asc')
   * @param {number}   [options.page]        - page number, 1-based (default: 1)
   * @param {number}   [options.limit]       - records per page, max 100 (default: 20, 0 = no limit)
   * @returns {Promise<{ data: Object[], pagination: Object }>}
   */
  static async getAll(options = {}) {
    const conditions = [];
    const params = [];

    // ── Filters ──────────────────────────────────────────────────────────────
    if (options.is_active !== undefined) {
      conditions.push(`is_active = $${params.length + 1}`);
      params.push(options.is_active);
    }

    if (options.search) {
      const term = `%${options.search.toLowerCase()}%`;
      conditions.push(
        `(LOWER(name) LIKE $${params.length + 1} OR LOWER(COALESCE(name_bn, '')) LIKE $${params.length + 2})`
      );
      params.push(term, term);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    // ── Sorting ───────────────────────────────────────────────────────────────
    const ALLOWED_SORT = new Set(['name', 'name_bn', 'created_at', 'updated_at']);
    const sortCol   = ALLOWED_SORT.has(options.sort_by) ? options.sort_by : 'name';
    const sortOrder = options.sort_order === 'desc' ? 'DESC' : 'ASC';

    // ── Pagination ────────────────────────────────────────────────────────────
    const limit  = options.limit === 0 ? null : Math.min(Math.max(parseInt(options.limit) || 20, 1), 100);
    const page   = Math.max(parseInt(options.page) || 1, 1);
    const offset = limit ? (page - 1) * limit : 0;

    // Count total matching rows
    const countQuery  = `SELECT COUNT(*) AS total FROM business.business_types ${where}`;
    const countResult = await SafeQuery.execute(countQuery, params);
    const total       = parseInt(countResult.rows[0]?.total || 0);

    // Data query
    const limitClause  = limit  ? `LIMIT $${params.length + 1}`  : '';
    const offsetClause = offset ? `OFFSET $${params.length + (limit ? 2 : 1)}` : '';
    if (limit)  params.push(limit);
    if (offset) params.push(offset);

    const query = `
      ${BusinessTypeModel.#SELECT}
      ${where}
      ORDER BY ${sortCol} ${sortOrder}
      ${limitClause} ${offsetClause}
    `;
    const result = await SafeQuery.execute(query, params);

    const pageSize   = limit || total;
    const totalPages = pageSize > 0 ? Math.ceil(total / (limit || total)) : 1;

    return {
      data: result.rows || [],
      pagination: {
        total,
        page:        limit ? page : 1,
        limit:       limit || total,
        total_pages: totalPages,
        has_next:    limit ? page < totalPages : false,
        has_prev:    limit ? page > 1 : false,
      },
    };
  }

  /**
   * Get one business type by UUID
   * @param {string} businessTypeUuid
   */
  static async getByUuid(businessTypeUuid) {
    if (!SecurityUtils.isValidUUID(businessTypeUuid)) {
      throw new Error('Invalid business type UUID format');
    }
    const query = `${BusinessTypeModel.#SELECT} WHERE business_type_uuid = $1 LIMIT 1`;
    const result = await SafeQuery.execute(query, [businessTypeUuid]);
    const row = result.rows[0] || null;
    if (!row) return null;
    return BusinessTypeModel.enrichWithCategoryUuids(row);
  }

  /**
   * Dedupe + validate category UUIDs from optional body field.
   * @returns {{ apply: boolean, uuids: string[] }}
   */
  static parseCategoryUuidsFromBody(data) {
    if (!data || !Object.prototype.hasOwnProperty.call(data, 'category_uuids')) {
      return { apply: false, uuids: [] };
    }
    const raw = data.category_uuids;
    if (raw === undefined) {
      return { apply: false, uuids: [] };
    }
    if (!Array.isArray(raw)) {
      throw new Error('category_uuids must be an array');
    }
    const seen = new Set();
    const uuids = [];
    for (const item of raw) {
      if (item === null || item === undefined || item === '') continue;
      const s = typeof item === 'string' ? item.trim() : String(item);
      if (!SecurityUtils.isValidUUID(s)) {
        throw new Error('category_uuids must contain only valid UUIDs');
      }
      if (!seen.has(s)) {
        seen.add(s);
        uuids.push(s);
      }
    }
    if (uuids.length > MAX_CATEGORY_MAP) {
      throw new Error(`category_uuids cannot exceed ${MAX_CATEGORY_MAP} entries`);
    }
    return { apply: true, uuids };
  }

  /**
   * @param {string} businessTypeUuid
   * @returns {Promise<string[]>}
   */
  static async getCategoryUuidsForType(businessTypeUuid) {
    const r = await SafeQuery.execute(
      `SELECT category_uuid FROM business.business_type_category_map
       WHERE business_type_uuid = $1
       ORDER BY category_uuid`,
      [businessTypeUuid],
    );
    return (r.rows || []).map((row) => row.category_uuid);
  }

  /**
   * @param {string[]} uuids
   * @param {import('pg').PoolClient} [client]
   */
  static async assertCategoriesExist(uuids, client) {
    if (!uuids.length) return;
    const run = client ? (q, p) => client.query(q, p) : (q, p) => SafeQuery.execute(q, p);
    const r = await run(
      `SELECT COUNT(*)::int AS c FROM business.business_type_categories
       WHERE category_uuid = ANY($1::uuid[])`,
      [uuids],
    );
    const count = parseInt(r.rows[0]?.c ?? 0, 10);
    if (count !== uuids.length) {
      throw new Error('One or more category_uuids do not exist');
    }
  }

  /**
   * Replace all category mappings for a business type.
   * @param {string} businessTypeUuid
   * @param {string[]} categoryUuids deduped
   * @param {import('pg').PoolClient} [client]
   */
  static async replaceCategoryMap(businessTypeUuid, categoryUuids, client) {
    const run = client ? (q, p) => client.query(q, p) : (q, p) => SafeQuery.execute(q, p);
    await run(
      `DELETE FROM business.business_type_category_map WHERE business_type_uuid = $1`,
      [businessTypeUuid],
    );
    if (!categoryUuids.length) return;
    await BusinessTypeModel.assertCategoriesExist(categoryUuids, client);
    await run(
      `INSERT INTO business.business_type_category_map (business_type_uuid, category_uuid)
       SELECT $1, x FROM unnest($2::uuid[]) AS x`,
      [businessTypeUuid, categoryUuids],
    );
  }

  static async enrichWithCategoryUuids(row) {
    if (!row) return null;
    const category_uuids = await BusinessTypeModel.getCategoryUuidsForType(row.business_type_uuid);
    return { ...row, category_uuids };
  }

  /**
   * Create a new business type
   * @param {Object} data
   */
  static async create(data) {
    const name = SecurityUtils.sanitizeString(data.name);
    if (!name) throw new Error('name is required');

    const name_bn       = data.name_bn        ? SecurityUtils.sanitizeString(data.name_bn)        : null;
    const description   = data.description    ? SecurityUtils.sanitizeString(data.description)    : null;
    const description_bn= data.description_bn ? SecurityUtils.sanitizeString(data.description_bn) : null;
    const icon          = data.icon           ? SecurityUtils.sanitizeString(data.icon)           : null;
    const is_active     = data.is_active !== undefined ? Boolean(data.is_active) : true;

    const { apply: mapApply, uuids: mapUuids } = BusinessTypeModel.parseCategoryUuidsFromBody(data);

    const query = `
      INSERT INTO business.business_types
        (name, name_bn, description, description_bn, icon, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING business_type_uuid, name, name_bn, description, description_bn,
                icon, is_active, created_at, updated_at
    `;

    let row;
    if (mapApply && mapUuids.length > 0) {
      row = await SafeQuery.transaction(async (client) => {
        const ins = await client.query(query, [
          name, name_bn, description, description_bn, icon, is_active,
        ]);
        const created = ins.rows[0];
        await BusinessTypeModel.replaceCategoryMap(created.business_type_uuid, mapUuids, client);
        return created;
      });
    } else {
      const result = await SafeQuery.execute(query, [
        name, name_bn, description, description_bn, icon, is_active,
      ]);
      row = result.rows[0];
    }

    return BusinessTypeModel.enrichWithCategoryUuids(row);
  }

  /**
   * Update an existing business type
   * @param {string} businessTypeUuid
   * @param {Object} data
   */
  static async update(businessTypeUuid, data) {
    if (!SecurityUtils.isValidUUID(businessTypeUuid)) {
      throw new Error('Invalid business type UUID format');
    }

    const { apply: mapApply, uuids: mapUuids } = BusinessTypeModel.parseCategoryUuidsFromBody(data);

    const fields = [];
    const params = [];

    const add = (col, val) => {
      params.push(val);
      fields.push(`${col} = $${params.length}`);
    };

    if (data.name        !== undefined) add('name',         SecurityUtils.sanitizeString(data.name));
    if (data.name_bn     !== undefined) add('name_bn',      SecurityUtils.sanitizeString(data.name_bn));
    if (data.description !== undefined) add('description',  SecurityUtils.sanitizeString(data.description));
    if (data.description_bn !== undefined) add('description_bn', SecurityUtils.sanitizeString(data.description_bn));
    if (data.icon        !== undefined) add('icon',         SecurityUtils.sanitizeString(data.icon));
    if (data.is_active   !== undefined) add('is_active',    Boolean(data.is_active));

    const hasTypeFields = fields.length > 0;

    if (!hasTypeFields && !mapApply) {
      throw new Error('No fields provided for update');
    }

    if (!hasTypeFields && mapApply) {
      const exists = await BusinessTypeModel.getByUuid(businessTypeUuid);
      if (!exists) return null;
      await BusinessTypeModel.replaceCategoryMap(businessTypeUuid, mapUuids);
      return BusinessTypeModel.enrichWithCategoryUuids(exists);
    }

    add('updated_at', new Date());
    params.push(businessTypeUuid);

    const query = `
      UPDATE business.business_types
      SET ${fields.join(', ')}
      WHERE business_type_uuid = $${params.length}
      RETURNING business_type_uuid, name, name_bn, description, description_bn,
                icon, is_active, created_at, updated_at
    `;

    if (mapApply) {
      return SafeQuery.transaction(async (client) => {
        const result = await client.query(query, params);
        const updated = result.rows[0] || null;
        if (!updated) return null;
        await BusinessTypeModel.replaceCategoryMap(businessTypeUuid, mapUuids, client);
        return BusinessTypeModel.enrichWithCategoryUuids(updated);
      });
    }

    const result = await SafeQuery.execute(query, params);
    const updated = result.rows[0] || null;
    if (!updated) return null;
    return BusinessTypeModel.enrichWithCategoryUuids(updated);
  }

  /**
   * Delete a business type
   * @param {string} businessTypeUuid
   */
  static async delete(businessTypeUuid) {
    if (!SecurityUtils.isValidUUID(businessTypeUuid)) {
      throw new Error('Invalid business type UUID format');
    }
    return SafeQuery.transaction(async (client) => {
      await client.query(
        `DELETE FROM business.business_type_category_map WHERE business_type_uuid = $1`,
        [businessTypeUuid],
      );
      const result = await client.query(
        `
      DELETE FROM business.business_types
      WHERE business_type_uuid = $1
      RETURNING business_type_uuid
    `,
        [businessTypeUuid],
      );
      return result.rows[0] || null;
    });
  }
}

module.exports = BusinessTypeModel;
