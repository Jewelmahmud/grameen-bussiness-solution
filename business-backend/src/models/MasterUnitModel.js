const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

class MasterUnitModel {
  // Master units
  static async getMasterUnits(options = {}) {
    const conditions = [];
    const params = [];
    const p = (v) => {
      params.push(v);
      return `$${params.length}`;
    };

    if (options.business_type_uuid) {
      if (!SecurityUtils.isValidUUID(options.business_type_uuid)) {
        throw new Error('Invalid business_type_uuid format');
      }
      conditions.push(
        `(business_type_uuid IS NULL OR business_type_uuid = ${p(options.business_type_uuid)})`,
      );
    }

    if (options.is_active !== undefined) {
      conditions.push(`is_active = ${p(options.is_active)}`);
    }

    if (options.search) {
      const term = `%${options.search.toLowerCase()}%`;
      conditions.push(
        `(LOWER(name) LIKE ${p(term)} OR LOWER(COALESCE(short_name->>'en', '')) LIKE ${p(
          term,
        )} OR LOWER(COALESCE(short_name->>'bn', '')) LIKE ${p(term)})`,
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const limit = options.limit === 0 ? null : Math.min(Math.max(parseInt(options.limit) || 50, 1), 200);
    const page = Math.max(parseInt(options.page) || 1, 1);
    const offset = limit ? (page - 1) * limit : 0;

    const countResult = await SafeQuery.execute(
      `SELECT COUNT(*) AS total FROM catalog.master_units ${where}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.total || 0, 10);

    if (limit) params.push(limit);
    if (offset) params.push(offset);

    const dataResult = await SafeQuery.execute(
      `
      SELECT id, unit_uuid, business_type_uuid, name, short_name, unit_type,
             is_base_unit, is_active, created_at, updated_at
      FROM catalog.master_units
      ${where}
      ORDER BY business_type_uuid NULLS FIRST, name
      ${limit ? `LIMIT $${params.length - (offset ? 1 : 0)}` : ''}
      ${offset ? `OFFSET $${params.length}` : ''}
      `,
      params,
    );

    const pageSize = limit || total;
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;

    return {
      data: dataResult.rows || [],
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

  static async getMasterUnitByUuid(unitUuid) {
    if (!SecurityUtils.isValidUUID(unitUuid)) {
      throw new Error('Invalid unit UUID format');
    }
    const result = await SafeQuery.execute(
      `
      SELECT id, unit_uuid, business_type_uuid, name, short_name, unit_type,
             is_base_unit, is_active, created_at, updated_at
      FROM catalog.master_units
      WHERE unit_uuid = $1
      LIMIT 1
      `,
      [unitUuid],
    );
    return result.rows[0] || null;
  }

  static async createMasterUnit(payload) {
    const name = SecurityUtils.sanitizeString(payload.name, { maxLength: 50 });
    if (!name) throw new Error('name is required');

    const rawBt = payload.business_type_uuid;
    const businessTypeUuid =
      rawBt === undefined || rawBt === null || rawBt === ''
        ? null
        : String(rawBt).trim();
    if (businessTypeUuid !== null && !SecurityUtils.isValidUUID(businessTypeUuid)) {
      throw new Error('Invalid business_type_uuid format');
    }

    const unitType = payload.unit_type || null;
    const isBaseUnit = payload.is_base_unit !== undefined ? !!payload.is_base_unit : false;
    const isActive = payload.is_active !== undefined ? !!payload.is_active : true;

    const shortName =
      payload.short_name && typeof payload.short_name === 'object'
        ? JSON.stringify(payload.short_name)
        : payload.short_name || '{"en": "", "bn": ""}';

    const result = await SafeQuery.execute(
      `
      INSERT INTO catalog.master_units
        (business_type_uuid, name, short_name, unit_type, is_base_unit, is_active)
      VALUES ($1, $2, $3::jsonb, $4, $5, $6)
      RETURNING id, unit_uuid, business_type_uuid, name, short_name, unit_type,
                is_base_unit, is_active, created_at, updated_at
      `,
      [businessTypeUuid, name, shortName, unitType, isBaseUnit, isActive],
    );
    return result.rows[0];
  }

  static async updateMasterUnit(unitUuid, payload) {
    if (!SecurityUtils.isValidUUID(unitUuid)) {
      throw new Error('Invalid unit UUID format');
    }

    const fields = [];
    const params = [];
    const add = (col, val) => {
      params.push(val);
      fields.push(`${col} = $${params.length}`);
    };

    if (payload.name !== undefined)
      add('name', SecurityUtils.sanitizeString(payload.name, { maxLength: 50 }));
    if (payload.business_type_uuid !== undefined) {
      const v = payload.business_type_uuid;
      if (v === null || v === '') {
        add('business_type_uuid', null);
      } else if (!SecurityUtils.isValidUUID(v)) {
        throw new Error('Invalid business_type_uuid format');
      } else {
        add('business_type_uuid', v);
      }
    }
    if (payload.short_name !== undefined) {
      const shortName =
        typeof payload.short_name === 'object'
          ? JSON.stringify(payload.short_name)
          : payload.short_name;
      add('short_name', shortName);
    }
    if (payload.unit_type !== undefined) add('unit_type', payload.unit_type);
    if (payload.is_base_unit !== undefined) add('is_base_unit', !!payload.is_base_unit);
    if (payload.is_active !== undefined) add('is_active', !!payload.is_active);

    if (!fields.length) throw new Error('No fields provided for update');

    add('updated_at', new Date());
    params.push(unitUuid);

    const result = await SafeQuery.execute(
      `
      UPDATE catalog.master_units
      SET ${fields.join(', ')}
      WHERE unit_uuid = $${params.length}
      RETURNING id, unit_uuid, business_type_uuid, name, short_name, unit_type,
                is_base_unit, is_active, created_at, updated_at
      `,
      params,
    );
    return result.rows[0] || null;
  }

  static async deleteMasterUnit(unitUuid) {
    if (!SecurityUtils.isValidUUID(unitUuid)) {
      throw new Error('Invalid unit UUID format');
    }
    const result = await SafeQuery.execute(
      `DELETE FROM catalog.master_units WHERE unit_uuid = $1 RETURNING unit_uuid`,
      [unitUuid],
    );
    return result.rows[0] || null;
  }

  // Master unit conversions
  static async getMasterConversions(options = {}) {
    const conditions = [];
    const params = [];
    const p = (v) => {
      params.push(v);
      return `$${params.length}`;
    };

    if (options.business_type_uuid) {
      if (!SecurityUtils.isValidUUID(options.business_type_uuid)) {
        throw new Error('Invalid business_type_uuid format');
      }
      conditions.push(
        `(c.business_type_uuid IS NULL OR c.business_type_uuid = ${p(options.business_type_uuid)})`,
      );
    }

    if (options.is_active !== undefined) {
      conditions.push(`c.is_active = ${p(options.is_active)}`);
    }

    if (options.search) {
      const raw = SecurityUtils.sanitizeString(options.search, { maxLength: 100 });
      if (raw) {
        const term = `%${raw.toLowerCase()}%`;
        params.push(term);
        const ti = params.length;
        conditions.push(`(
          LOWER(COALESCE(c.formula, '')) LIKE $${ti}
          OR LOWER(fu.name) LIKE $${ti}
          OR LOWER(tu.name) LIKE $${ti}
          OR LOWER(COALESCE(fu.short_name->>'en', '')) LIKE $${ti}
          OR LOWER(COALESCE(fu.short_name->>'bn', '')) LIKE $${ti}
          OR LOWER(COALESCE(tu.short_name->>'en', '')) LIKE $${ti}
          OR LOWER(COALESCE(tu.short_name->>'bn', '')) LIKE $${ti}
          OR CAST(c.conversion_factor AS TEXT) LIKE $${ti}
        )`);
      }
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const fromJoin = `
      FROM catalog.master_unit_conversions c
      JOIN catalog.master_units fu ON fu.unit_uuid = c.from_unit_uuid
      JOIN catalog.master_units tu ON tu.unit_uuid = c.to_unit_uuid
    `;

    const limit = options.limit === 0 ? null : Math.min(Math.max(parseInt(options.limit) || 50, 1), 200);
    const page = Math.max(parseInt(options.page) || 1, 1);
    const offset = limit ? (page - 1) * limit : 0;

    const countResult = await SafeQuery.execute(
      `SELECT COUNT(*) AS total ${fromJoin} ${where}`,
      params,
    );
    const total = parseInt(countResult.rows[0]?.total || 0, 10);

    if (limit) params.push(limit);
    if (offset) params.push(offset);

    const dataResult = await SafeQuery.execute(
      `
      SELECT
        c.id,
        c.business_type_uuid,
        c.from_unit_uuid,
        fu.name  AS from_unit_name,
        fu.short_name AS from_short_name,
        c.to_unit_uuid,
        tu.name  AS to_unit_name,
        tu.short_name AS to_short_name,
        c.conversion_factor,
        c.formula,
        c.is_active,
        c.created_at,
        c.updated_at
      ${fromJoin}
      ${where}
      ORDER BY c.business_type_uuid NULLS FIRST, fu.name, tu.name
      ${limit ? `LIMIT $${params.length - (offset ? 1 : 0)}` : ''}
      ${offset ? `OFFSET $${params.length}` : ''}
      `,
      params,
    );

    const pageSize = limit || total;
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;

    return {
      data: dataResult.rows || [],
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

  static async createMasterConversion(payload) {
    const rawBt = payload.business_type_uuid;
    const businessTypeUuid =
      rawBt === undefined || rawBt === null || rawBt === ''
        ? null
        : String(rawBt).trim();
    if (businessTypeUuid !== null && !SecurityUtils.isValidUUID(businessTypeUuid)) {
      throw new Error('Invalid business_type_uuid format');
    }
    if (!SecurityUtils.isValidUUID(payload.from_unit_uuid)) {
      throw new Error('Invalid from_unit_uuid format');
    }
    if (!SecurityUtils.isValidUUID(payload.to_unit_uuid)) {
      throw new Error('Invalid to_unit_uuid format');
    }

    const factor = parseFloat(payload.conversion_factor);
    if (!Number.isFinite(factor) || factor <= 0) {
      throw new Error('conversion_factor must be a positive number');
    }

    const isActive = payload.is_active !== undefined ? !!payload.is_active : true;

    const result = await SafeQuery.execute(
      `
      INSERT INTO catalog.master_unit_conversions
        (business_type_uuid, from_unit_uuid, to_unit_uuid, conversion_factor, formula, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, business_type_uuid, from_unit_uuid, to_unit_uuid,
                conversion_factor, formula, is_active, created_at, updated_at
      `,
      [
        businessTypeUuid,
        payload.from_unit_uuid,
        payload.to_unit_uuid,
        factor,
        payload.formula || null,
        isActive,
      ],
    );

    return result.rows[0];
  }

  static async updateMasterConversion(id, payload) {
    const numericId = parseInt(id, 10);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new Error('Invalid conversion id');
    }

    const fields = [];
    const params = [];
    const add = (col, val) => {
      params.push(val);
      fields.push(`${col} = $${params.length}`);
    };

    if (payload.business_type_uuid !== undefined) {
      const v = payload.business_type_uuid;
      if (v === null || v === '') {
        add('business_type_uuid', null);
      } else if (!SecurityUtils.isValidUUID(v)) {
        throw new Error('Invalid business_type_uuid format');
      } else {
        add('business_type_uuid', v);
      }
    }
    if (payload.from_unit_uuid !== undefined) {
      if (!SecurityUtils.isValidUUID(payload.from_unit_uuid)) {
        throw new Error('Invalid from_unit_uuid format');
      }
      add('from_unit_uuid', payload.from_unit_uuid);
    }
    if (payload.to_unit_uuid !== undefined) {
      if (!SecurityUtils.isValidUUID(payload.to_unit_uuid)) {
        throw new Error('Invalid to_unit_uuid format');
      }
      add('to_unit_uuid', payload.to_unit_uuid);
    }
    if (payload.conversion_factor !== undefined) {
      const factor = parseFloat(payload.conversion_factor);
      if (!Number.isFinite(factor) || factor <= 0) {
        throw new Error('conversion_factor must be a positive number');
      }
      add('conversion_factor', factor);
    }
    if (payload.formula !== undefined) {
      add('formula', payload.formula || null);
    }
    if (payload.is_active !== undefined) {
      add('is_active', !!payload.is_active);
    }

    if (!fields.length) throw new Error('No fields provided for update');

    add('updated_at', new Date());
    params.push(numericId);

    const result = await SafeQuery.execute(
      `
      UPDATE catalog.master_unit_conversions
      SET ${fields.join(', ')}
      WHERE id = $${params.length}
      RETURNING id, business_type_uuid, from_unit_uuid, to_unit_uuid,
                conversion_factor, formula, is_active, created_at, updated_at
      `,
      params,
    );
    return result.rows[0] || null;
  }

  static async deleteMasterConversion(id) {
    const numericId = parseInt(id, 10);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      throw new Error('Invalid conversion id');
    }
    const result = await SafeQuery.execute(
      `DELETE FROM catalog.master_unit_conversions WHERE id = $1 RETURNING id`,
      [numericId],
    );
    return result.rows[0] || null;
  }
}

module.exports = MasterUnitModel;

