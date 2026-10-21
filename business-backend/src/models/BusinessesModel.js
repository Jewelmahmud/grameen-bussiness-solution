const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * BusinessesModel - CRUD access for business.businesses table.
 *
 * Deliberately separate from BusinessModel.js which handles
 * the tenant onboarding / setup workflow.
 */
class BusinessesModel {
  // Columns safe to return on public GET requests
  static #PUBLIC_COLS = `
    b.business_uuid,
    b.tenant_uuid,
    b.business_name,
    b.business_name_en,
    b.logo_url,
    b.domain,
    b.business_type_uuid,
    bt.name        AS business_type_name,
    bt.name_bn     AS business_type_name_bn,
    b.code,
    b.address,
    b.country_code,
    b.location_level_1_id,
    b.location_level_2_id,
    b.location_level_3_id,
    b.location_level_4_id,
    b.location_level_5_id,
    b.location_rank,
    b.postal_code,
    b.phone,
    b.email,
    b.opening_time,
    b.closing_time,
    b.enable_pos,
    b.is_personal_website_enabled,
    b.is_marketplace_enabled,
    b.is_active,
    b.is_primary,
    b.created_at,
    b.updated_at
  `;

  // Extra columns exposed only to admin queries
  static #ADMIN_COLS = `
    ${BusinessesModel.#PUBLIC_COLS},
    b.company_id,
    b.manager_uuid,
    b.tin_number,
    b.trade_license,
    b.location_level_6_id,
    b.location_level_7_id
  `;

  static #FROM = `
    FROM business.businesses b
    LEFT JOIN business.business_types bt
      ON b.business_type_uuid = bt.business_type_uuid
  `;

  // ── List ────────────────────────────────────────────────────────────────────

  /**
   * Get all businesses with filtering, search and pagination.
   *
   * @param {Object}  options
   * @param {boolean} [options.is_active]
   * @param {boolean} [options.is_marketplace_enabled]
   * @param {boolean} [options.is_primary]
   * @param {string}  [options.tenant_uuid]       - filter by tenant
   * @param {string}  [options.business_uuid]     - filter by specific business UUID
   * @param {string}  [options.business_type_uuid]
   * @param {string}  [options.company_id]        - scope results to a specific company (owner filter)
   * @param {string}  [options.search]            - searches name, business_name
   * @param {string}  [options.sort_by]           - name|business_name|created_at|updated_at
   * @param {string}  [options.sort_order]        - asc|desc
   * @param {number}  [options.page]              - 1-based (default 1)
   * @param {number}  [options.limit]             - max 100 (default 20, 0 = no limit)
   * @param {boolean} [options.admin]             - include sensitive columns
   */
  static async getAll(options = {}) {
    const conditions = [];
    const params = [];

    const p = (val) => { params.push(val); return `$${params.length}`; };

    if (options.is_active !== undefined)
      conditions.push(`b.is_active = ${p(options.is_active)}`);

    if (options.is_marketplace_enabled !== undefined)
      conditions.push(`b.is_marketplace_enabled = ${p(options.is_marketplace_enabled)}`);

    if (options.is_primary !== undefined)
      conditions.push(`b.is_primary = ${p(options.is_primary)}`);

    if (options.tenant_uuid) {
      if (!SecurityUtils.isValidUUID(options.tenant_uuid))
        throw new Error('Invalid tenant_uuid format');
      conditions.push(`b.tenant_uuid = ${p(options.tenant_uuid)}`);
    }

    if (options.business_uuid) {
      if (!SecurityUtils.isValidUUID(options.business_uuid))
        throw new Error('Invalid business_uuid format');
      conditions.push(`b.business_uuid = ${p(options.business_uuid)}`);
    }

    if (options.business_type_uuid) {
      if (!SecurityUtils.isValidUUID(options.business_type_uuid))
        throw new Error('Invalid business_type_uuid format');
      conditions.push(`b.business_type_uuid = ${p(options.business_type_uuid)}`);
    }

    if (options.company_id) {
      if (!SecurityUtils.isValidUUID(options.company_id))
        throw new Error('Invalid company_id format');
      conditions.push(`b.company_id = ${p(options.company_id)}`);
    }

    if (options.search) {
      const term = `%${options.search.toLowerCase()}%`;
      conditions.push(
        `(LOWER(b.business_name) LIKE ${p(term)} OR LOWER(COALESCE(b.business_name_en, '')) LIKE ${p(term)})`
      );
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

    // Sorting
    const ALLOWED_SORT = new Set(['business_name', 'business_name_en', 'created_at', 'updated_at']);
    const sortCol   = ALLOWED_SORT.has(options.sort_by) ? `b.${options.sort_by}` : 'b.business_name';
    const sortOrder = options.sort_order === 'desc' ? 'DESC' : 'ASC';

    // Pagination
    const limit  = options.limit === 0 ? null : Math.min(Math.max(parseInt(options.limit) || 20, 1), 100);
    const page   = Math.max(parseInt(options.page) || 1, 1);
    const offset = limit ? (page - 1) * limit : 0;

    // Total count
    const countResult = await SafeQuery.execute(
      `SELECT COUNT(*) AS total ${BusinessesModel.#FROM} ${where}`,
      params
    );
    const total = parseInt(countResult.rows[0]?.total || 0);

    // Data
    const limitClause  = limit  ? `LIMIT  ${p(limit)}`  : '';
    const offsetClause = offset ? `OFFSET ${p(offset)}` : '';

    const cols = options.admin ? BusinessesModel.#ADMIN_COLS : BusinessesModel.#PUBLIC_COLS;

    const rows = await SafeQuery.execute(
      `SELECT ${cols} ${BusinessesModel.#FROM} ${where}
       ORDER BY ${sortCol} ${sortOrder}
       ${limitClause} ${offsetClause}`,
      params
    );

    const pageSize   = limit || total;
    const totalPages = pageSize > 0 ? Math.ceil(total / (limit || total)) : 1;

    return {
      data: rows.rows || [],
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

  // ── Ownership ────────────────────────────────────────────────────────────────

  /**
   * Return only the company_id of a business (used for ownership checks).
   * @param {string} businessUuid
   * @returns {Promise<string|null>}
   */
  static async getCompanyId(businessUuid) {
    if (!SecurityUtils.isValidUUID(businessUuid))
      throw new Error('Invalid business UUID format');

    const result = await SafeQuery.execute(
      `SELECT company_id FROM business.businesses WHERE business_uuid = $1 LIMIT 1`,
      [businessUuid]
    );
    return result.rows[0]?.company_id ?? null;
  }

  // ── Single ──────────────────────────────────────────────────────────────────

  /**
   * Get one business by UUID.
   * @param {string}  businessUuid
   * @param {boolean} admin  - include sensitive columns
   */
  static async getByUuid(businessUuid, admin = false) {
    if (!SecurityUtils.isValidUUID(businessUuid))
      throw new Error('Invalid business UUID format');

    const cols = admin ? BusinessesModel.#ADMIN_COLS : BusinessesModel.#PUBLIC_COLS;

    const result = await SafeQuery.execute(
      `SELECT ${cols} ${BusinessesModel.#FROM} WHERE b.business_uuid = $1 LIMIT 1`,
      [businessUuid]
    );
    return result.rows[0] || null;
  }

  // ── Create ──────────────────────────────────────────────────────────────────

  /**
   * Create a new business record.
   * @param {Object} data
   */
  static async create(data) {
    const s   = (v, opts) => v != null ? SecurityUtils.sanitizeString(v, opts) : null;
    const uuid = (v, label) => {
      if (v && !SecurityUtils.isValidUUID(v)) throw new Error(`Invalid ${label} format`);
      return v || null;
    };

    const business_name = s(data.business_name, { maxLength: 255 });
    if (!business_name) throw new Error('business_name is required');

    const name = s(data.name, { maxLength: 255 });
    if (!name) throw new Error('name is required');

    const business_type_uuid = uuid(data.business_type_uuid, 'business_type_uuid');
    if (!business_type_uuid) throw new Error('business_type_uuid is required');

    const tenant_uuid = uuid(data.tenant_uuid, 'tenant_uuid');
    if (!tenant_uuid) throw new Error('tenant_uuid is required');

    // Auto-generate code if not supplied
    let code = data.code ? s(data.code, { maxLength: 50 }) : null;
    if (!code) {
      code = name.toUpperCase().replace(/\s+/g, '').substring(0, 10);
    }

    const result = await SafeQuery.execute(`
      INSERT INTO business.businesses (
        tenant_uuid, business_name, logo_url, domain, company_id,
        business_type_uuid, name, code, address,
        country_code, location_level_1_id, location_level_2_id,
        location_level_3_id, location_level_4_id, location_level_5_id,
        location_rank, postal_code, phone, email, manager_uuid,
        tin_number, trade_license, is_active, is_primary,
        opening_time, closing_time, enable_pos,
        is_personal_website_enabled, is_marketplace_enabled
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,
        $17,$18,$19,$20,$21,$22,$23,$24,$25::TIME,$26::TIME,$27,$28,$29
      )
      RETURNING business_uuid, tenant_uuid, business_name, logo_url, domain,
                company_id, business_type_uuid, name, code, address,
                country_code, location_level_1_id, location_level_2_id,
                location_level_3_id, location_level_4_id, location_level_5_id,
                location_rank, postal_code, phone, email, manager_uuid,
                tin_number, trade_license, is_active, is_primary,
                opening_time, closing_time, enable_pos,
                is_personal_website_enabled, is_marketplace_enabled,
                created_at, updated_at
    `, [
      tenant_uuid,
      business_name,
      s(data.logo_url,   { maxLength: 500 }),
      s(data.domain,     { maxLength: 100 }),
      uuid(data.company_id, 'company_id'),
      business_type_uuid,
      name,
      code,
      s(data.address,    { maxLength: 1000 }),
      s(data.country_code, { maxLength: 2 }) || 'BD',
      data.location_level_1_id ? parseInt(data.location_level_1_id) : null,
      data.location_level_2_id ? parseInt(data.location_level_2_id) : null,
      data.location_level_3_id ? parseInt(data.location_level_3_id) : null,
      data.location_level_4_id ? parseInt(data.location_level_4_id) : null,
      data.location_level_5_id ? parseInt(data.location_level_5_id) : null,
      data.location_rank       ? parseInt(data.location_rank)       : null,
      s(data.postal_code, { maxLength: 20 }),
      s(data.phone,       { maxLength: 20 }),
      s(data.email,       { maxLength: 255 }),
      uuid(data.manager_uuid, 'manager_uuid'),
      s(data.tin_number,    { maxLength: 50 }),
      s(data.trade_license, { maxLength: 100 }),
      data.is_active   !== undefined ? Boolean(data.is_active)   : true,
      data.is_primary  !== undefined ? Boolean(data.is_primary)  : false,
      data.opening_time  || null,
      data.closing_time  || null,
      data.enable_pos    !== undefined ? Boolean(data.enable_pos) : true,
      data.is_personal_website_enabled !== undefined ? Boolean(data.is_personal_website_enabled) : false,
      data.is_marketplace_enabled      !== undefined ? Boolean(data.is_marketplace_enabled)      : false,
    ]);

    return result.rows[0];
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  /**
   * Partially update a business.
   * @param {string} businessUuid
   * @param {Object} data
   */
  static async update(businessUuid, data) {
    if (!SecurityUtils.isValidUUID(businessUuid))
      throw new Error('Invalid business UUID format');

    const fields = [];
    const params = [];

    const add = (col, val) => {
      params.push(val);
      fields.push(`${col} = $${params.length}`);
    };
    const s   = (v, opts) => v != null ? SecurityUtils.sanitizeString(v, opts) : null;
    const uuid = (v, label) => {
      if (v && !SecurityUtils.isValidUUID(v)) throw new Error(`Invalid ${label} format`);
      return v;
    };

    if (data.business_name        !== undefined) add('business_name',       s(data.business_name,      { maxLength: 255 }));
    if (data.name                 !== undefined) add('name',                s(data.name,               { maxLength: 255 }));
    if (data.code                 !== undefined) add('code',                s(data.code,               { maxLength: 50  }));
    if (data.logo_url             !== undefined) add('logo_url',            s(data.logo_url,           { maxLength: 500 }));
    if (data.domain               !== undefined) add('domain',              s(data.domain,             { maxLength: 100 }));
    if (data.business_type_uuid   !== undefined) add('business_type_uuid',  uuid(data.business_type_uuid, 'business_type_uuid'));
    if (data.address              !== undefined) add('address',             s(data.address,            { maxLength: 1000 }));
    if (data.country_code         !== undefined) add('country_code',        s(data.country_code,       { maxLength: 2   }));
    if (data.location_level_1_id  !== undefined) add('location_level_1_id', parseInt(data.location_level_1_id));
    if (data.location_level_2_id  !== undefined) add('location_level_2_id', parseInt(data.location_level_2_id));
    if (data.location_level_3_id  !== undefined) add('location_level_3_id', parseInt(data.location_level_3_id));
    if (data.location_level_4_id  !== undefined) add('location_level_4_id', parseInt(data.location_level_4_id));
    if (data.location_level_5_id  !== undefined) add('location_level_5_id', parseInt(data.location_level_5_id));
    if (data.location_level_6_id  !== undefined) add('location_level_6_id', parseInt(data.location_level_6_id));
    if (data.location_level_7_id  !== undefined) add('location_level_7_id', parseInt(data.location_level_7_id));
    if (data.location_rank        !== undefined) add('location_rank',       parseInt(data.location_rank));
    if (data.postal_code          !== undefined) add('postal_code',         s(data.postal_code,        { maxLength: 20  }));
    if (data.phone                !== undefined) add('phone',               s(data.phone,              { maxLength: 20  }));
    if (data.email                !== undefined) add('email',               s(data.email,              { maxLength: 255 }));
    if (data.manager_uuid         !== undefined) add('manager_uuid',        uuid(data.manager_uuid, 'manager_uuid'));
    if (data.tin_number           !== undefined) add('tin_number',          s(data.tin_number,         { maxLength: 50  }));
    if (data.trade_license        !== undefined) add('trade_license',       s(data.trade_license,      { maxLength: 100 }));
    if (data.is_active            !== undefined) add('is_active',           Boolean(data.is_active));
    if (data.is_primary           !== undefined) add('is_primary',          Boolean(data.is_primary));
    if (data.opening_time         !== undefined) add('opening_time',        data.opening_time || null);
    if (data.closing_time         !== undefined) add('closing_time',        data.closing_time || null);
    if (data.enable_pos           !== undefined) add('enable_pos',          Boolean(data.enable_pos));
    if (data.is_personal_website_enabled !== undefined) add('is_personal_website_enabled', Boolean(data.is_personal_website_enabled));
    if (data.is_marketplace_enabled      !== undefined) add('is_marketplace_enabled',      Boolean(data.is_marketplace_enabled));

    if (fields.length === 0) throw new Error('No fields provided for update');

    add('updated_at', new Date());
    params.push(businessUuid);

    const result = await SafeQuery.execute(`
      UPDATE business.businesses
      SET ${fields.join(', ')}
      WHERE business_uuid = $${params.length}
      RETURNING business_uuid, tenant_uuid, business_name, logo_url, domain,
                company_id, business_type_uuid, name, code, address,
                country_code, postal_code, phone, email, manager_uuid,
                tin_number, trade_license, is_active, is_primary,
                opening_time, closing_time, enable_pos,
                is_personal_website_enabled, is_marketplace_enabled,
                created_at, updated_at
    `, params);

    return result.rows[0] || null;
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  /**
   * Delete a business by UUID.
   * @param {string} businessUuid
   */
  static async delete(businessUuid) {
    if (!SecurityUtils.isValidUUID(businessUuid))
      throw new Error('Invalid business UUID format');

    const result = await SafeQuery.execute(
      `DELETE FROM business.businesses WHERE business_uuid = $1 RETURNING business_uuid`,
      [businessUuid]
    );
    return result.rows[0] || null;
  }
}

module.exports = BusinessesModel;
