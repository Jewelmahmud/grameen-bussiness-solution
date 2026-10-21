const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * Marketplace Brand Model
 * Covers: marketplace.brands, marketplace.brand_aliases,
 *         catalog.brand_marketplace_mapping
 */
class MarketplaceBrandModel {

  // ─── Canonical Marketplace Brands ─────────────────────────────────────────

  static async getAll(options = {}) {
    const conditions = [];
    const params = [];

    if (options.is_active !== undefined) {
      conditions.push(`is_active = $${params.length + 1}`);
      params.push(options.is_active);
    }

    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT brand_uuid, name, name_en, slug, description,
             logo_url, website_url, display_order, is_active, created_at, updated_at
      FROM marketplace.brands
      ${where}
      ORDER BY display_order ASC, name_en ASC
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows || [];
  }

  static async getByUuid(brandUuid) {
    if (!SecurityUtils.isValidUUID(brandUuid)) throw new Error('Invalid brand UUID');
    const query = `
      SELECT brand_uuid, name, name_en, slug, description,
             logo_url, website_url, display_order, is_active, created_at, updated_at
      FROM marketplace.brands
      WHERE brand_uuid = $1
      LIMIT 1
    `;
    const result = await SafeQuery.execute(query, [brandUuid]);
    return result.rows[0] || null;
  }

  static async getBySlug(slug) {
    const safe = SecurityUtils.sanitizeString(slug, { maxLength: 255 });
    if (!safe) return null;
    const query = `
      SELECT brand_uuid, name, name_en, slug, description,
             logo_url, website_url, display_order, is_active, created_at, updated_at
      FROM marketplace.brands
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

    const description  = data.description  ? SecurityUtils.sanitizeString(String(data.description),  { maxLength: 2000 }) : null;
    const logoUrl      = data.logo_url     ? SecurityUtils.sanitizeString(String(data.logo_url),     { maxLength: 500  }) : null;
    const websiteUrl   = data.website_url  ? SecurityUtils.sanitizeString(String(data.website_url),  { maxLength: 500  }) : null;
    const displayOrder = parseInt(data.display_order ?? data.displayOrder ?? 0, 10) || 0;
    const isActive     = data.is_active !== undefined ? Boolean(data.is_active) : true;

    const query = `
      INSERT INTO marketplace.brands (name, name_en, slug, description, logo_url, website_url, display_order, is_active)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING brand_uuid, name, name_en, slug, description, logo_url, website_url, display_order, is_active, created_at, updated_at
    `;
    const result = await SafeQuery.execute(query, [name, nameEn, slug, description, logoUrl, websiteUrl, displayOrder, isActive]);
    return result.rows[0];
  }

  static async update(brandUuid, data = {}) {
    if (!SecurityUtils.isValidUUID(brandUuid)) throw new Error('Invalid brand UUID');

    const fields = [];
    const params = [];
    let idx = 1;

    const addField = (col, val) => { fields.push(`${col} = $${idx++}`); params.push(val); };

    if (data.name         !== undefined) addField('name',         SecurityUtils.sanitizeString(String(data.name),    { maxLength: 255 }));
    if (data.name_en      !== undefined) addField('name_en',      SecurityUtils.sanitizeString(String(data.name_en), { maxLength: 255 }));
    if (data.slug         !== undefined) addField('slug',         SecurityUtils.sanitizeString(String(data.slug).toLowerCase().replace(/\s+/g, '-'), { maxLength: 255 }));
    if (data.description  !== undefined) addField('description',  data.description == null ? null : SecurityUtils.sanitizeString(String(data.description),  { maxLength: 2000 }));
    if (data.logo_url     !== undefined) addField('logo_url',     data.logo_url    == null ? null : SecurityUtils.sanitizeString(String(data.logo_url),    { maxLength: 500  }));
    if (data.website_url  !== undefined) addField('website_url',  data.website_url == null ? null : SecurityUtils.sanitizeString(String(data.website_url), { maxLength: 500  }));
    if (data.display_order !== undefined || data.displayOrder !== undefined) {
      addField('display_order', parseInt(data.display_order ?? data.displayOrder, 10) || 0);
    }
    if (data.is_active !== undefined) addField('is_active', Boolean(data.is_active));

    if (fields.length === 0) return this.getByUuid(brandUuid);
    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(brandUuid);

    const query = `
      UPDATE marketplace.brands SET ${fields.join(', ')}
      WHERE brand_uuid = $${idx}
      RETURNING brand_uuid, name, name_en, slug, description, logo_url, website_url, display_order, is_active, created_at, updated_at
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  static async delete(brandUuid) {
    if (!SecurityUtils.isValidUUID(brandUuid)) throw new Error('Invalid brand UUID');
    const result = await SafeQuery.execute('DELETE FROM marketplace.brands WHERE brand_uuid = $1', [brandUuid]);
    return result.rowCount > 0;
  }

  // ─── Alias Dictionary (Phase 3) ───────────────────────────────────────────

  static async getAliases(marketplaceBrandUuid = null) {
    const conditions = [];
    const params = [];
    if (marketplaceBrandUuid && SecurityUtils.isValidUUID(marketplaceBrandUuid)) {
      conditions.push(`a.marketplace_brand_uuid = $${params.length + 1}`);
      params.push(marketplaceBrandUuid);
    }
    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT a.id, a.alias, a.marketplace_brand_uuid, a.created_by, a.created_at,
             b.name AS brand_name, b.name_en AS brand_name_en
      FROM marketplace.brand_aliases a
      JOIN marketplace.brands b ON b.brand_uuid = a.marketplace_brand_uuid
      ${where}
      ORDER BY a.alias ASC
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows || [];
  }

  static async addAlias(alias, marketplaceBrandUuid, createdBy = null) {
    if (!alias || !SecurityUtils.isValidUUID(marketplaceBrandUuid)) {
      throw new Error('alias and marketplace_brand_uuid are required');
    }
    const safe = SecurityUtils.sanitizeString(String(alias).trim(), { maxLength: 255 });
    if (!safe) throw new Error('Invalid alias');
    const query = `
      INSERT INTO marketplace.brand_aliases (alias, marketplace_brand_uuid, created_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (alias) DO UPDATE SET
        marketplace_brand_uuid = EXCLUDED.marketplace_brand_uuid,
        created_by = EXCLUDED.created_by
      RETURNING *
    `;
    const result = await SafeQuery.execute(query, [safe, marketplaceBrandUuid, createdBy]);
    return result.rows[0];
  }

  static async deleteAlias(aliasId) {
    const result = await SafeQuery.execute(
      'DELETE FROM marketplace.brand_aliases WHERE id = $1',
      [parseInt(aliasId, 10)],
    );
    return result.rowCount > 0;
  }

  // ─── Brand Mapping Review Queue (Phase 2) ─────────────────────────────────

  static async getMappingReviewQueue(options = {}) {
    const conditions = [];
    const params = [];
    if (options.needs_review !== undefined) {
      conditions.push(`m.needs_review = $${params.length + 1}`);
      params.push(options.needs_review);
    }
    const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
    const query = `
      SELECT m.id, m.brand_uuid, m.marketplace_brand_uuid,
             m.auto_mapped, m.confidence, m.mapping_source, m.needs_review,
             m.mapped_by, m.created_at, m.updated_at,
             tb.name AS tenant_brand_name, tb.tenant_uuid, tb.business_uuid,
             mb.name AS marketplace_brand_name, mb.name_en AS marketplace_brand_name_en, mb.slug
      FROM catalog.brand_marketplace_mapping m
      JOIN catalog.brands tb ON tb.brand_uuid = m.brand_uuid
      JOIN marketplace.brands mb ON mb.brand_uuid = m.marketplace_brand_uuid
      ${where}
      ORDER BY m.confidence ASC NULLS LAST, m.created_at DESC
    `;
    const result = await SafeQuery.execute(query, params);
    return result.rows || [];
  }

  static async confirmMapping(brandUuid, marketplaceBrandUuid, mappedBy) {
    if (!SecurityUtils.isValidUUID(brandUuid) || !SecurityUtils.isValidUUID(marketplaceBrandUuid)) {
      throw new Error('Invalid UUID');
    }
    const query = `
      INSERT INTO catalog.brand_marketplace_mapping
        (brand_uuid, marketplace_brand_uuid, auto_mapped, confidence, mapping_source, needs_review, mapped_by)
      VALUES ($1, $2, false, 1.0, 'manual', false, $3)
      ON CONFLICT (brand_uuid) DO UPDATE SET
        marketplace_brand_uuid = EXCLUDED.marketplace_brand_uuid,
        auto_mapped    = false,
        confidence     = 1.0,
        mapping_source = 'manual',
        needs_review   = false,
        mapped_by      = EXCLUDED.mapped_by,
        updated_at     = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const result = await SafeQuery.execute(query, [brandUuid, marketplaceBrandUuid, mappedBy || null]);
    return result.rows[0];
  }

  static async removeMapping(brandUuid) {
    if (!SecurityUtils.isValidUUID(brandUuid)) throw new Error('Invalid brand UUID');
    const result = await SafeQuery.execute(
      'DELETE FROM catalog.brand_marketplace_mapping WHERE brand_uuid = $1',
      [brandUuid],
    );
    return result.rowCount > 0;
  }
}

module.exports = MarketplaceBrandModel;
