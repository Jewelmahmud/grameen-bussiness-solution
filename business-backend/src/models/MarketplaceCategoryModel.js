const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * Marketplace Category Model
 * Covers: marketplace.categories, marketplace.business_type_category_mapping,
 *         marketplace.category_aliases, catalog.category_marketplace_mapping
 */
class MarketplaceCategoryModel {

  // ─── Canonical Marketplace Categories ─────────────────────────────────────

  static async getAll(options = {}) {
    const conditions = [];
    const params = [];

    if (options.is_active !== undefined) {
      conditions.push(`is_active = $${params.length + 1}`);
      params.push(options.is_active);
    }
    if (options.parent_uuid !== undefined) {
      if (options.parent_uuid === null) {
        conditions.push('parent_uuid IS NULL');
      } else if (SecurityUtils.isValidUUID(options.parent_uuid)) {
        conditions.push(`parent_uuid = $${params.length + 1}`);
        params.push(options.parent_uuid);
      }
    }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT category_uuid, parent_uuid, name, name_en, slug, description,
             image_url, display_order, is_active, created_at, updated_at
      FROM marketplace.categories
      ${where}
      ORDER BY display_order ASC, name_en ASC
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows || [];
  }

  static async getByUuid(categoryUuid) {
    if (!SecurityUtils.isValidUUID(categoryUuid)) throw new Error('Invalid category UUID');
    const query = `
      SELECT category_uuid, parent_uuid, name, name_en, slug, description,
             image_url, display_order, is_active, created_at, updated_at
      FROM marketplace.categories
      WHERE category_uuid = $1
      LIMIT 1
    `;
    const result = await SafeQuery.execute(query, [categoryUuid]);
    return result.rows[0] || null;
  }

  static async getBySlug(slug) {
    const safe = SecurityUtils.sanitizeString(slug, { maxLength: 255 });
    if (!safe) return null;
    const query = `
      SELECT category_uuid, parent_uuid, name, name_en, slug, description,
             image_url, display_order, is_active, created_at, updated_at
      FROM marketplace.categories
      WHERE slug = $1
      LIMIT 1
    `;
    const result = await SafeQuery.execute(query, [safe]);
    return result.rows[0] || null;
  }

  static async create(data = {}) {
    const name    = data.name    ? SecurityUtils.sanitizeString(String(data.name),    { maxLength: 255 }) : null;
    const nameEn  = data.name_en ? SecurityUtils.sanitizeString(String(data.name_en), { maxLength: 255 }) : null;
    const slug    = data.slug    ? SecurityUtils.sanitizeString(String(data.slug).toLowerCase().replace(/\s+/g, '-'), { maxLength: 255 }) : null;
    if (!name || !nameEn || !slug) throw new Error('name, name_en, and slug are required');

    const parentUuid  = (data.parent_uuid && SecurityUtils.isValidUUID(data.parent_uuid)) ? data.parent_uuid : null;
    const description = data.description ? SecurityUtils.sanitizeString(String(data.description), { maxLength: 2000 }) : null;
    const imageUrl    = data.image_url    ? SecurityUtils.sanitizeString(String(data.image_url),   { maxLength: 500  }) : null;
    const displayOrder = parseInt(data.display_order ?? data.displayOrder ?? 0, 10) || 0;
    const isActive    = data.is_active !== undefined ? Boolean(data.is_active) : true;

    const query = `
      INSERT INTO marketplace.categories (parent_uuid, name, name_en, slug, description, image_url, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING category_uuid, parent_uuid, name, name_en, slug, description, image_url, display_order, is_active, created_at, updated_at
    `;
    const result = await SafeQuery.execute(query, [parentUuid, name, nameEn, slug, description, imageUrl, displayOrder, isActive]);
    return result.rows[0];
  }

  static async update(categoryUuid, data = {}) {
    if (!SecurityUtils.isValidUUID(categoryUuid)) throw new Error('Invalid category UUID');

    const fields = [];
    const params = [];
    let idx = 1;

    const addField = (col, val) => { fields.push(`${col} = $${idx++}`); params.push(val); };

    if (data.name    !== undefined) addField('name',    SecurityUtils.sanitizeString(String(data.name),    { maxLength: 255 }));
    if (data.name_en !== undefined) addField('name_en', SecurityUtils.sanitizeString(String(data.name_en), { maxLength: 255 }));
    if (data.slug    !== undefined) addField('slug',    SecurityUtils.sanitizeString(String(data.slug).toLowerCase().replace(/\s+/g, '-'), { maxLength: 255 }));
    if (data.description  !== undefined) addField('description',  data.description == null  ? null : SecurityUtils.sanitizeString(String(data.description),  { maxLength: 2000 }));
    if (data.image_url    !== undefined) addField('image_url',    data.image_url   == null  ? null : SecurityUtils.sanitizeString(String(data.image_url),    { maxLength: 500  }));
    if (data.display_order !== undefined || data.displayOrder !== undefined) {
      addField('display_order', parseInt(data.display_order ?? data.displayOrder, 10) || 0);
    }
    if (data.is_active !== undefined) addField('is_active', Boolean(data.is_active));
    if (data.parent_uuid !== undefined) {
      addField('parent_uuid', (data.parent_uuid && SecurityUtils.isValidUUID(data.parent_uuid)) ? data.parent_uuid : null);
    }

    if (fields.length === 0) return this.getByUuid(categoryUuid);
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(categoryUuid);

    const query = `
      UPDATE marketplace.categories SET ${fields.join(', ')}
      WHERE category_uuid = $${idx}
      RETURNING category_uuid, parent_uuid, name, name_en, slug, description, image_url, display_order, is_active, created_at, updated_at
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  static async delete(categoryUuid) {
    if (!SecurityUtils.isValidUUID(categoryUuid)) throw new Error('Invalid category UUID');
    const result = await SafeQuery.execute('DELETE FROM marketplace.categories WHERE category_uuid = $1', [categoryUuid]);
    return result.rowCount > 0;
  }

  // ─── Business Type → Category Mapping (Phase 1) ───────────────────────────

  static async getBusinessTypeMappings() {
    const query = `
      SELECT m.business_type_uuid, m.marketplace_category_uuid, m.mapped_by, m.mapped_at,
             c.name AS category_name, c.name_en AS category_name_en, c.slug
      FROM marketplace.business_type_category_mapping m
      JOIN marketplace.categories c ON c.category_uuid = m.marketplace_category_uuid
      ORDER BY m.mapped_at DESC
    `;
    const result = await SafeQuery.execute(query, []);
    return result.rows || [];
  }

  static async upsertBusinessTypeMapping(businessTypeUuid, marketplaceCategoryUuid, mappedBy = null) {
    if (!SecurityUtils.isValidUUID(businessTypeUuid))      throw new Error('Invalid business type UUID');
    if (!SecurityUtils.isValidUUID(marketplaceCategoryUuid)) throw new Error('Invalid marketplace category UUID');
    const query = `
      INSERT INTO marketplace.business_type_category_mapping
        (business_type_uuid, marketplace_category_uuid, mapped_by, mapped_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (business_type_uuid) DO UPDATE SET
        marketplace_category_uuid = EXCLUDED.marketplace_category_uuid,
        mapped_by = EXCLUDED.mapped_by,
        mapped_at = NOW()
      RETURNING *
    `;
    const result = await SafeQuery.execute(query, [businessTypeUuid, marketplaceCategoryUuid, mappedBy]);
    return result.rows[0];
  }

  static async deleteBusinessTypeMapping(businessTypeUuid) {
    if (!SecurityUtils.isValidUUID(businessTypeUuid)) throw new Error('Invalid business type UUID');
    const result = await SafeQuery.execute(
      'DELETE FROM marketplace.business_type_category_mapping WHERE business_type_uuid = $1',
      [businessTypeUuid],
    );
    return result.rowCount > 0;
  }

  // ─── Alias Dictionary (Phase 3) ───────────────────────────────────────────

  static async getAliases(marketplaceCategoryUuid = null) {
    const conditions = [];
    const params = [];
    if (marketplaceCategoryUuid && SecurityUtils.isValidUUID(marketplaceCategoryUuid)) {
      conditions.push(`a.marketplace_category_uuid = $${params.length + 1}`);
      params.push(marketplaceCategoryUuid);
    }
    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT a.id, a.alias, a.marketplace_category_uuid, a.created_by, a.created_at,
             c.name AS category_name, c.name_en AS category_name_en
      FROM marketplace.category_aliases a
      JOIN marketplace.categories c ON c.category_uuid = a.marketplace_category_uuid
      ${where}
      ORDER BY a.alias ASC
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows || [];
  }

  static async addAlias(alias, marketplaceCategoryUuid, createdBy = null) {
    if (!alias || !SecurityUtils.isValidUUID(marketplaceCategoryUuid)) {
      throw new Error('alias and marketplace_category_uuid are required');
    }
    const safe = SecurityUtils.sanitizeString(String(alias).trim(), { maxLength: 255 });
    if (!safe) throw new Error('Invalid alias');
    const query = `
      INSERT INTO marketplace.category_aliases (alias, marketplace_category_uuid, created_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (alias) DO UPDATE SET
        marketplace_category_uuid = EXCLUDED.marketplace_category_uuid,
        created_by = EXCLUDED.created_by
      RETURNING *
    `;
    const result = await SafeQuery.execute(query, [safe, marketplaceCategoryUuid, createdBy]);
    return result.rows[0];
  }

  static async deleteAlias(aliasId) {
    const result = await SafeQuery.execute(
      'DELETE FROM marketplace.category_aliases WHERE id = $1',
      [parseInt(aliasId, 10)],
    );
    return result.rowCount > 0;
  }

  // ─── Category Mapping Review Queue (Phase 2) ──────────────────────────────

  static async getMappingReviewQueue(options = {}) {
    const conditions = [];
    const params = [];
    if (options.needs_review !== undefined) {
      conditions.push(`m.needs_review = $${params.length + 1}`);
      params.push(options.needs_review);
    }
    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT m.id, m.category_uuid, m.marketplace_category_uuid,
             m.auto_mapped, m.confidence, m.mapping_source, m.needs_review,
             m.mapped_by, m.created_at, m.updated_at,
             tc.name AS tenant_category_name, tc.tenant_uuid, tc.business_uuid,
             mc.name AS marketplace_category_name, mc.name_en AS marketplace_category_name_en, mc.slug
      FROM catalog.category_marketplace_mapping m
      JOIN catalog.categories tc ON tc.category_uuid = m.category_uuid
      JOIN marketplace.categories mc ON mc.category_uuid = m.marketplace_category_uuid
      ${where}
      ORDER BY m.confidence ASC NULLS LAST, m.created_at DESC
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows || [];
  }

  static async confirmMapping(categoryUuid, marketplaceCategoryUuid, mappedBy) {
    if (!SecurityUtils.isValidUUID(categoryUuid) || !SecurityUtils.isValidUUID(marketplaceCategoryUuid)) {
      throw new Error('Invalid UUID');
    }
    const query = `
      INSERT INTO catalog.category_marketplace_mapping
        (category_uuid, marketplace_category_uuid, auto_mapped, confidence, mapping_source, needs_review, mapped_by)
      VALUES ($1, $2, false, 1.0, 'manual', false, $3)
      ON CONFLICT (category_uuid) DO UPDATE SET
        marketplace_category_uuid = EXCLUDED.marketplace_category_uuid,
        auto_mapped   = false,
        confidence    = 1.0,
        mapping_source = 'manual',
        needs_review  = false,
        mapped_by     = EXCLUDED.mapped_by,
        updated_at    = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await SafeQuery.execute(query, [categoryUuid, marketplaceCategoryUuid, mappedBy || null]);
    return result.rows[0];
  }

  static async removeMapping(categoryUuid) {
    if (!SecurityUtils.isValidUUID(categoryUuid)) throw new Error('Invalid category UUID');
    const result = await SafeQuery.execute(
      'DELETE FROM catalog.category_marketplace_mapping WHERE category_uuid = $1',
      [categoryUuid],
    );
    return result.rowCount > 0;
  }
}

module.exports = MarketplaceCategoryModel;
