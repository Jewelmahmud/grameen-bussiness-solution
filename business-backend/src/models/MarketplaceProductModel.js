const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * Marketplace Product Model
 * Pulls products eligible for Grameen Bazaar marketplace.
 *
 * Eligibility:
 *   - product.is_marketplace_enabled = true AND product.marketplace_status = 'approved'
 *   - business.is_marketplace_enabled = true
 *
 * Category resolution priority:
 *   1. catalog.category_marketplace_mapping  (direct / auto-mapped category)
 *   2. marketplace.business_type_category_mapping (business-type fallback)
 */
class MarketplaceProductModel {

  /**
   * List marketplace products with optional filters.
   * @param {Object} options - { marketplace_category_uuid?, slug?, search?, page?, limit? }
   */
  static async getProducts(options = {}) {
    const conditions = [
      'p.is_marketplace_enabled = true',
      "p.marketplace_status = 'approved'",
      'b.is_marketplace_enabled = true',
      'p.is_active = true',
    ];
    const params = [];
    let idx = 1;

    // Filter by marketplace category via slug
    if (options.slug) {
      conditions.push(`
        COALESCE(cm.marketplace_category_uuid, btm.marketplace_category_uuid) =
          (SELECT category_uuid FROM marketplace.categories WHERE slug = $${idx} LIMIT 1)
      `);
      params.push(SecurityUtils.sanitizeString(String(options.slug), { maxLength: 255 }));
      idx++;
    } else if (options.marketplace_category_uuid && SecurityUtils.isValidUUID(options.marketplace_category_uuid)) {
      conditions.push(`
        COALESCE(cm.marketplace_category_uuid, btm.marketplace_category_uuid) = $${idx}
      `);
      params.push(options.marketplace_category_uuid);
      idx++;
    }

    // Full-text search on product name / description
    if (options.search) {
      const term = '%' + SecurityUtils.sanitizeString(String(options.search), { maxLength: 100 }) + '%';
      conditions.push(`(p.name ILIKE $${idx} OR p.online_description ILIKE $${idx})`);
      params.push(term);
      idx++;
    }

    const where = 'WHERE ' + conditions.join(' AND ');
    const limit  = Math.min(parseInt(options.limit  ?? 20, 10), 100);
    const offset = (Math.max(parseInt(options.page ?? 1, 10), 1) - 1) * limit;

    const query = `
      SELECT
        p.product_uuid,
        p.name,
        p.sku,
        p.primary_image_url,
        p.online_description,
        p.selling_price,
        p.online_price,
        p.mrp,
        p.is_featured,
        p.marketplace_status,
        p.attributes,
        p.tags,
        b.business_uuid,
        b.business_name,
        b.logo_url AS business_logo,
        COALESCE(cm.marketplace_category_uuid, btm.marketplace_category_uuid) AS marketplace_category_uuid,
        mc.name    AS marketplace_category_name,
        mc.name_en AS marketplace_category_name_en,
        mc.slug    AS marketplace_category_slug,
        cm.confidence,
        cm.mapping_source
      FROM catalog.products p
      JOIN business.businesses b ON b.business_uuid = p.business_uuid
      LEFT JOIN catalog.category_marketplace_mapping cm
        ON cm.category_uuid = p.category_uuid
      LEFT JOIN marketplace.business_type_category_mapping btm
        ON btm.business_type_uuid = b.business_type_uuid
      LEFT JOIN marketplace.categories mc
        ON mc.category_uuid = COALESCE(cm.marketplace_category_uuid, btm.marketplace_category_uuid)
      ${where}
      ORDER BY p.is_featured DESC, p.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM catalog.products p
      JOIN business.businesses b ON b.business_uuid = p.business_uuid
      LEFT JOIN catalog.category_marketplace_mapping cm
        ON cm.category_uuid = p.category_uuid
      LEFT JOIN marketplace.business_type_category_mapping btm
        ON btm.business_type_uuid = b.business_type_uuid
      ${where}
    `;

    const [data, count] = await Promise.all([
      SafeQuery.execute(query, params),
      SafeQuery.execute(countQuery, params.slice(0, params.length - 2)),
    ]);

    return {
      products: data.rows || [],
      total: parseInt(count.rows[0]?.total ?? 0, 10),
      page:  Math.max(parseInt(options.page ?? 1, 10), 1),
      limit,
    };
  }

  /**
   * Get a single marketplace product by product_uuid.
   */
  static async getProduct(productUuid) {
    if (!SecurityUtils.isValidUUID(productUuid)) throw new Error('Invalid product UUID');

    const query = `
      SELECT
        p.product_uuid, p.name, p.sku, p.barcode, p.description,
        p.online_description, p.primary_image_url,
        p.selling_price, p.online_price, p.mrp,
        p.tax_type, p.tax_percentage,
        p.has_warranty, p.warranty_period, p.warranty_type,
        p.is_featured, p.marketplace_status, p.attributes, p.tags,
        p.manufacturer_name, p.country_of_origin,
        b.business_uuid, b.business_name, b.logo_url AS business_logo,
        b.phone AS business_phone, b.email AS business_email,
        COALESCE(cm.marketplace_category_uuid, btm.marketplace_category_uuid) AS marketplace_category_uuid,
        mc.name    AS marketplace_category_name,
        mc.name_en AS marketplace_category_name_en,
        mc.slug    AS marketplace_category_slug
      FROM catalog.products p
      JOIN business.businesses b ON b.business_uuid = p.business_uuid
      LEFT JOIN catalog.category_marketplace_mapping cm ON cm.category_uuid = p.category_uuid
      LEFT JOIN marketplace.business_type_category_mapping btm ON btm.business_type_uuid = b.business_type_uuid
      LEFT JOIN marketplace.categories mc
        ON mc.category_uuid = COALESCE(cm.marketplace_category_uuid, btm.marketplace_category_uuid)
      WHERE p.product_uuid = $1
        AND p.is_marketplace_enabled = true
        AND p.marketplace_status = 'approved'
        AND b.is_marketplace_enabled = true
        AND p.is_active = true
      LIMIT 1
    `;
    const result = await SafeQuery.execute(query, [productUuid]);
    return result.rows[0] || null;
  }

  /**
   * List all marketplace products for a specific business (admin/owner use).
   */
  static async getProductsByBusiness(businessUuid, options = {}) {
    if (!SecurityUtils.isValidUUID(businessUuid)) throw new Error('Invalid business UUID');

    const conditions = ['p.business_uuid = $1'];
    const params = [businessUuid];
    let idx = 2;

    if (options.marketplace_status) {
      conditions.push(`p.marketplace_status = $${idx++}`);
      params.push(SecurityUtils.sanitizeString(String(options.marketplace_status), { maxLength: 50 }));
    }

    const limit  = Math.min(parseInt(options.limit ?? 20, 10), 100);
    const offset = (Math.max(parseInt(options.page ?? 1, 10), 1) - 1) * limit;

    const query = `
      SELECT p.product_uuid, p.name, p.sku, p.primary_image_url,
             p.selling_price, p.online_price, p.is_marketplace_enabled,
             p.marketplace_status, p.is_active, p.created_at,
             COALESCE(cm.marketplace_category_uuid, btm.marketplace_category_uuid) AS marketplace_category_uuid,
             mc.name_en AS marketplace_category_name_en,
             cm.confidence, cm.mapping_source, cm.needs_review
      FROM catalog.products p
      JOIN business.businesses b ON b.business_uuid = p.business_uuid
      LEFT JOIN catalog.category_marketplace_mapping cm ON cm.category_uuid = p.category_uuid
      LEFT JOIN marketplace.business_type_category_mapping btm ON btm.business_type_uuid = b.business_type_uuid
      LEFT JOIN marketplace.categories mc
        ON mc.category_uuid = COALESCE(cm.marketplace_category_uuid, btm.marketplace_category_uuid)
      WHERE ${conditions.join(' AND ')}
      ORDER BY p.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(limit, offset);

    const result = await SafeQuery.execute(query, params);
    return result.rows || [];
  }
}

module.exports = MarketplaceProductModel;
