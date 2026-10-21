const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * Product Model - Handles catalog-related database operations
 * Tables used:
 * - catalog.products
 * - catalog.brands
 * - catalog.categories
 * - catalog.units
 */
class ProductModel {
  /**
   * List products for a tenant (and optional business) with basic search & pagination
   * @param {Object} options
   * @param {string} options.tenantUuid
   * @param {string} [options.businessUuid]
   * @param {string} [options.search]
   * @param {number} [options.limit]
   * @param {number} [options.offset]
   */
  static async getProducts({ tenantUuid, businessUuid, search, limit = 50, offset = 0 }) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID');
    }

    const params = [tenantUuid];
    let paramIndex = params.length;

    let whereClause = 'WHERE p.tenant_uuid = $1';

    if (businessUuid) {
      if (!SecurityUtils.isValidUUID(businessUuid)) {
        throw new Error('Invalid business UUID');
      }
      params.push(businessUuid);
      paramIndex = params.length;
      whereClause += ` AND p.business_uuid = $${paramIndex}`;
    }

    if (search) {
      const sanitizedSearch = SecurityUtils.sanitizeString(search, { maxLength: 255 });
      if (sanitizedSearch) {
        params.push(`%${sanitizedSearch.toLowerCase()}%`);
        paramIndex = params.length;
        whereClause += ` AND (LOWER(p.name) LIKE $${paramIndex} OR LOWER(p.sku) LIKE $${paramIndex} OR p.barcode LIKE $${paramIndex})`;
      }
    }

    params.push(limit, offset);

    const query = `
      SELECT 
        p.product_uuid,
        p.tenant_uuid,
        p.business_uuid,
        p.name,
        p.sku,
        p.barcode,
        p.category_uuid,
        p.brand_uuid,
        p.unit_uuid,
        p.product_type,
        p.cost_price,
        p.selling_price,
        p.mrp,
        p.wholesale_price,
        p.track_inventory,
        p.alert_quantity,
        p.is_active,
        p.is_featured,
        p.primary_image_url,
        p.created_at,
        p.updated_at
      FROM catalog.products p
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const result = await SafeQuery.execute(query, params);
    return result.rows;
  }

  /**
   * Get a single product by UUID
   * @param {string} productUuid
   */
  static async getProductByUuid(productUuid) {
    if (!SecurityUtils.isValidUUID(productUuid)) {
      throw new Error('Invalid product UUID');
    }

    const query = `
      SELECT 
        p.* 
      FROM catalog.products p
      WHERE p.product_uuid = $1
    `;

    const result = await SafeQuery.execute(query, [productUuid]);
    return result.rows[0] || null;
  }

  /**
   * Create a new product
   * @param {Object} data
   */
  static async createProduct(data) {
    const {
      tenant_uuid,
      business_uuid,
      name,
      sku,
      barcode,
      category_uuid,
      brand_uuid,
      unit_uuid,
      description,
      product_type = 'standard',
      cost_price = 0,
      selling_price,
      mrp = null,
      wholesale_price = null,
      tax_type = 'inclusive',
      tax_percentage = 0,
      track_inventory = true,
      alert_quantity = 10,
      has_warranty = false,
      warranty_period = null,
      warranty_type = null,
      primary_image_url = null,
      is_active = true,
      is_featured = false,
      expiry_date = null,
      batch_number = null,
      manufacture_date = null,
      serial_number = null,
      model_number = null,
      length = null,
      width = null,
      height = null,
      weight = null,
      manufacturer_name = null,
      manufacturer_code = null,
      country_of_origin = null,
      attributes = {},
      tags = null,
      notes = null,
      created_by_uuid = null
    } = data;

    if (!SecurityUtils.isValidUUID(tenant_uuid)) {
      throw new Error('Invalid tenant UUID');
    }
    if (!SecurityUtils.isValidUUID(business_uuid)) {
      throw new Error('Invalid business UUID');
    }
    if (category_uuid && !SecurityUtils.isValidUUID(category_uuid)) {
      throw new Error('Invalid category UUID');
    }
    if (brand_uuid && !SecurityUtils.isValidUUID(brand_uuid)) {
      throw new Error('Invalid brand UUID');
    }
    if (unit_uuid && !SecurityUtils.isValidUUID(unit_uuid)) {
      throw new Error('Invalid unit UUID');
    }
    if (created_by_uuid && !SecurityUtils.isValidUUID(created_by_uuid)) {
      throw new Error('Invalid created_by UUID');
    }

    const sanitizedAttributes = attributes ? SecurityUtils.sanitizeObject(attributes) : {};

    const query = `
      INSERT INTO catalog.products (
        tenant_uuid,
        business_uuid,
        name,
        sku,
        barcode,
        category_uuid,
        brand_uuid,
        unit_uuid,
        description,
        product_type,
        cost_price,
        selling_price,
        mrp,
        wholesale_price,
        tax_type,
        tax_percentage,
        track_inventory,
        alert_quantity,
        has_warranty,
        warranty_period,
        warranty_type,
        primary_image_url,
        is_active,
        is_featured,
        expiry_date,
        batch_number,
        manufacture_date,
        serial_number,
        model_number,
        length,
        width,
        height,
        weight,
        manufacturer_name,
        manufacturer_code,
        country_of_origin,
        attributes,
        tags,
        notes,
        created_by_uuid
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25,
        $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35,
        $36, $37, $38, $39, $40,
        $41
      )
      RETURNING 
        product_uuid,
        tenant_uuid,
        business_uuid,
        name,
        sku,
        barcode,
        category_uuid,
        brand_uuid,
        unit_uuid,
        product_type,
        selling_price,
        is_active,
        created_at,
        updated_at
    `;

    const params = [
      tenant_uuid,
      business_uuid,
      name,
      sku,
      barcode || null,
      category_uuid || null,
      brand_uuid || null,
      unit_uuid || null,
      description || null,
      product_type,
      cost_price,
      selling_price,
      mrp,
      wholesale_price,
      tax_type,
      tax_percentage,
      track_inventory,
      alert_quantity,
      has_warranty,
      warranty_period,
      warranty_type,
      primary_image_url,
      is_active,
      is_featured,
      expiry_date,
      batch_number,
      manufacture_date,
      serial_number,
      model_number,
      length,
      width,
      height,
      weight,
      manufacturer_name,
      manufacturer_code,
      country_of_origin,
      JSON.stringify(sanitizedAttributes || {}),
      tags || null,
      notes || null,
      created_by_uuid || null
    ];

    const result = await SafeQuery.execute(query, params);
    return result.rows[0];
  }

  /**
   * Update an existing product
   * Only a subset of fields is updatable via this API
   * @param {string} productUuid
   * @param {Object} data
   */
  static async updateProduct(productUuid, data) {
    if (!SecurityUtils.isValidUUID(productUuid)) {
      throw new Error('Invalid product UUID');
    }

    const {
      name,
      sku,
      barcode,
      category_uuid,
      brand_uuid,
      unit_uuid,
      description,
      product_type,
      cost_price,
      selling_price,
      mrp,
      wholesale_price,
      tax_type,
      tax_percentage,
      track_inventory,
      alert_quantity,
      has_warranty,
      warranty_period,
      warranty_type,
      primary_image_url,
      is_active,
      is_featured,
      expiry_date,
      batch_number,
      manufacture_date,
      serial_number,
      model_number,
      length,
      width,
      height,
      weight,
      manufacturer_name,
      manufacturer_code,
      country_of_origin,
      attributes,
      tags,
      notes
    } = data;

    if (category_uuid && !SecurityUtils.isValidUUID(category_uuid)) {
      throw new Error('Invalid category UUID');
    }
    if (brand_uuid && !SecurityUtils.isValidUUID(brand_uuid)) {
      throw new Error('Invalid brand UUID');
    }
    if (unit_uuid && !SecurityUtils.isValidUUID(unit_uuid)) {
      throw new Error('Invalid unit UUID');
    }

    const sanitizedAttributes = attributes ? SecurityUtils.sanitizeObject(attributes) : null;

    const query = `
      UPDATE catalog.products
      SET
        name = COALESCE($2, name),
        sku = COALESCE($3, sku),
        barcode = COALESCE($4, barcode),
        category_uuid = COALESCE($5, category_uuid),
        brand_uuid = COALESCE($6, brand_uuid),
        unit_uuid = COALESCE($7, unit_uuid),
        description = COALESCE($8, description),
        product_type = COALESCE($9, product_type),
        cost_price = COALESCE($10, cost_price),
        selling_price = COALESCE($11, selling_price),
        mrp = COALESCE($12, mrp),
        wholesale_price = COALESCE($13, wholesale_price),
        tax_type = COALESCE($14, tax_type),
        tax_percentage = COALESCE($15, tax_percentage),
        track_inventory = COALESCE($16, track_inventory),
        alert_quantity = COALESCE($17, alert_quantity),
        has_warranty = COALESCE($18, has_warranty),
        warranty_period = COALESCE($19, warranty_period),
        warranty_type = COALESCE($20, warranty_type),
        primary_image_url = COALESCE($21, primary_image_url),
        is_active = COALESCE($22, is_active),
        is_featured = COALESCE($23, is_featured),
        expiry_date = COALESCE($24, expiry_date),
        batch_number = COALESCE($25, batch_number),
        manufacture_date = COALESCE($26, manufacture_date),
        serial_number = COALESCE($27, serial_number),
        model_number = COALESCE($28, model_number),
        length = COALESCE($29, length),
        width = COALESCE($30, width),
        height = COALESCE($31, height),
        weight = COALESCE($32, weight),
        manufacturer_name = COALESCE($33, manufacturer_name),
        manufacturer_code = COALESCE($34, manufacturer_code),
        country_of_origin = COALESCE($35, country_of_origin),
        attributes = COALESCE($36, attributes),
        tags = COALESCE($37, tags),
        notes = COALESCE($38, notes),
        updated_at = NOW()
      WHERE product_uuid = $1
      RETURNING 
        product_uuid,
        tenant_uuid,
        business_uuid,
        name,
        sku,
        barcode,
        category_uuid,
        brand_uuid,
        unit_uuid,
        product_type,
        selling_price,
        is_active,
        created_at,
        updated_at
    `;

    const params = [
      productUuid,
      name || null,
      sku || null,
      barcode || null,
      category_uuid || null,
      brand_uuid || null,
      unit_uuid || null,
      description || null,
      product_type || null,
      cost_price !== undefined ? cost_price : null,
      selling_price !== undefined ? selling_price : null,
      mrp !== undefined ? mrp : null,
      wholesale_price !== undefined ? wholesale_price : null,
      tax_type || null,
      tax_percentage !== undefined ? tax_percentage : null,
      track_inventory !== undefined ? track_inventory : null,
      alert_quantity !== undefined ? alert_quantity : null,
      has_warranty !== undefined ? has_warranty : null,
      warranty_period !== undefined ? warranty_period : null,
      warranty_type || null,
      primary_image_url || null,
      is_active !== undefined ? is_active : null,
      is_featured !== undefined ? is_featured : null,
      expiry_date || null,
      batch_number || null,
      manufacture_date || null,
      serial_number || null,
      model_number || null,
      length !== undefined ? length : null,
      width !== undefined ? width : null,
      height !== undefined ? height : null,
      weight !== undefined ? weight : null,
      manufacturer_name || null,
      manufacturer_code || null,
      country_of_origin || null,
      sanitizedAttributes ? JSON.stringify(sanitizedAttributes) : null,
      tags || null,
      notes || null
    ];

    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete product by UUID
   * @param {string} productUuid
   */
  static async deleteProduct(productUuid) {
    if (!SecurityUtils.isValidUUID(productUuid)) {
      throw new Error('Invalid product UUID');
    }

    const query = `
      DELETE FROM catalog.products
      WHERE product_uuid = $1
      RETURNING product_uuid
    `;

    const result = await SafeQuery.execute(query, [productUuid]);
    return result.rows[0] || null;
  }

  /**
   * Get brands for a tenant
   * @param {string} tenantUuid
   */
  static async getBrands(tenantUuid) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID');
    }

    const query = `
      SELECT 
        brand_uuid,
        tenant_uuid,
        name,
        description,
        logo_url,
        is_active
      FROM catalog.brands
      WHERE tenant_uuid = $1 AND is_active = true
      ORDER BY name
    `;

    const result = await SafeQuery.execute(query, [tenantUuid]);
    return result.rows;
  }

  /**
   * Create a new brand
   * @param {Object} data
   */
  static async createBrand(data) {
    const { tenant_uuid, name, description = null, logo_url = null, is_active = true } = data;

    if (!SecurityUtils.isValidUUID(tenant_uuid)) {
      throw new Error('Invalid tenant UUID');
    }

    const query = `
      INSERT INTO catalog.brands (
        tenant_uuid,
        name,
        description,
        logo_url,
        is_active
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        brand_uuid,
        tenant_uuid,
        name,
        description,
        logo_url,
        is_active,
        created_at,
        updated_at
    `;

    const params = [
      tenant_uuid,
      name,
      description || null,
      logo_url || null,
      is_active
    ];

    const result = await SafeQuery.execute(query, params);
    return result.rows[0];
  }

  /**
   * Update brand
   * @param {string} brandUuid
   * @param {Object} data
   */
  static async updateBrand(brandUuid, data) {
    if (!SecurityUtils.isValidUUID(brandUuid)) {
      throw new Error('Invalid brand UUID');
    }

    const {
      name,
      description,
      logo_url,
      is_active
    } = data;

    const query = `
      UPDATE catalog.brands
      SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        logo_url = COALESCE($4, logo_url),
        is_active = COALESCE($5, is_active),
        updated_at = NOW()
      WHERE brand_uuid = $1
      RETURNING 
        brand_uuid,
        tenant_uuid,
        name,
        description,
        logo_url,
        is_active,
        created_at,
        updated_at
    `;

    const params = [
      brandUuid,
      name || null,
      description || null,
      logo_url || null,
      is_active !== undefined ? is_active : null
    ];

    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete brand
   * @param {string} brandUuid
   */
  static async deleteBrand(brandUuid) {
    if (!SecurityUtils.isValidUUID(brandUuid)) {
      throw new Error('Invalid brand UUID');
    }

    const query = `
      DELETE FROM catalog.brands
      WHERE brand_uuid = $1
      RETURNING brand_uuid
    `;

    const result = await SafeQuery.execute(query, [brandUuid]);
    return result.rows[0] || null;
  }

  /**
   * Get categories for a tenant
   * @param {string} tenantUuid
   */
  static async getCategories(tenantUuid) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID');
    }

    const query = `
      SELECT 
        c.category_uuid,
        c.tenant_uuid,
        c.name,
        c.description,
        c.parent_uuid,
        c.image_url,
        c.is_active,
        c.display_order,
        c.created_at,
        c.updated_at,
        p.name AS parent_name
      FROM catalog.categories c
      LEFT JOIN catalog.categories p ON c.parent_uuid = p.category_uuid
      WHERE c.tenant_uuid = $1
      ORDER BY c.display_order, c.name
    `;

    const result = await SafeQuery.execute(query, [tenantUuid]);
    return result.rows;
  }

  /**
   * Create a new category
   * @param {Object} data
   */
  static async createCategory(data) {
    const {
      tenant_uuid,
      name,
      description = null,
      parent_uuid = null,
      image_url = null,
      is_active = true,
      display_order = 0
    } = data;

    if (!SecurityUtils.isValidUUID(tenant_uuid)) {
      throw new Error('Invalid tenant UUID');
    }
    if (parent_uuid && !SecurityUtils.isValidUUID(parent_uuid)) {
      throw new Error('Invalid parent UUID');
    }

    const query = `
      INSERT INTO catalog.categories (
        tenant_uuid,
        name,
        description,
        parent_uuid,
        image_url,
        is_active,
        display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING 
        category_uuid,
        tenant_uuid,
        name,
        description,
        parent_uuid,
        image_url,
        is_active,
        display_order,
        created_at,
        updated_at
    `;

    const params = [
      tenant_uuid,
      name,
      description || null,
      parent_uuid || null,
      image_url || null,
      is_active,
      display_order
    ];

    const result = await SafeQuery.execute(query, params);
    return result.rows[0];
  }

  /**
   * Update category
   * @param {string} categoryUuid
   * @param {Object} data
   */
  static async updateCategory(categoryUuid, data) {
    if (!SecurityUtils.isValidUUID(categoryUuid)) {
      throw new Error('Invalid category UUID');
    }

    const {
      name,
      description,
      parent_uuid,
      image_url,
      is_active,
      display_order
    } = data;

    if (parent_uuid && !SecurityUtils.isValidUUID(parent_uuid)) {
      throw new Error('Invalid parent UUID');
    }

    const query = `
      UPDATE catalog.categories
      SET
        name = COALESCE($2, name),
        description = COALESCE($3, description),
        parent_uuid = COALESCE($4, parent_uuid),
        image_url = COALESCE($5, image_url),
        is_active = COALESCE($6, is_active),
        display_order = COALESCE($7, display_order),
        updated_at = NOW()
      WHERE category_uuid = $1
      RETURNING 
        category_uuid,
        tenant_uuid,
        name,
        description,
        parent_uuid,
        image_url,
        is_active,
        display_order,
        created_at,
        updated_at
    `;

    const params = [
      categoryUuid,
      name || null,
      description || null,
      parent_uuid || null,
      image_url || null,
      is_active !== undefined ? is_active : null,
      display_order !== undefined ? display_order : null
    ];

    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete category
   * @param {string} categoryUuid
   */
  static async deleteCategory(categoryUuid) {
    if (!SecurityUtils.isValidUUID(categoryUuid)) {
      throw new Error('Invalid category UUID');
    }

    const query = `
      DELETE FROM catalog.categories
      WHERE category_uuid = $1
      RETURNING category_uuid
    `;

    const result = await SafeQuery.execute(query, [categoryUuid]);
    return result.rows[0] || null;
  }

  /**
   * Get units for a tenant and business type
   * @param {string} tenantUuid
   * @param {string} businessTypeUuid
   */
  static async getUnits(tenantUuid, businessTypeUuid) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID');
    }
    if (!SecurityUtils.isValidUUID(businessTypeUuid)) {
      throw new Error('Invalid business type UUID');
    }

    // Use LEFT JOIN instead of subquery for better reliability
    const query = `
      SELECT 
        u.unit_uuid,
        u.tenant_uuid,
        u.business_type_uuid,
        u.name,
        u.short_name,
        u.unit_type,
        u.is_base_unit,
        u.is_active,
        CASE 
          WHEN uc.id IS NOT NULL THEN
            jsonb_build_object(
              'base_unit_uuid', base_unit.unit_uuid,
              'base_unit_name', base_unit.name,
              'base_unit_short_name', base_unit.short_name,
              'conversion_factor', uc.conversion_factor,
              'formula', uc.formula
            )
          ELSE NULL
        END AS conversion_to_base
      FROM catalog.units u
      LEFT JOIN catalog.unit_conversions uc ON uc.from_unit_uuid = u.unit_uuid 
        AND uc.tenant_uuid = u.tenant_uuid
        AND uc.is_active = true
      LEFT JOIN catalog.units base_unit ON uc.to_unit_uuid = base_unit.unit_uuid
        AND base_unit.is_base_unit = true
      WHERE u.tenant_uuid = $1 
        AND u.business_type_uuid = $2
      ORDER BY u.is_active DESC, u.name
    `;

    try {
      console.log(`[ProductModel] getUnits: Querying for tenant ${tenantUuid}, business_type ${businessTypeUuid}`);
      const result = await SafeQuery.execute(query, [tenantUuid, businessTypeUuid]);
      console.log(`[ProductModel] getUnits: Found ${result.rows.length} units`);
      
      // Remove duplicates if any (from LEFT JOIN) and keep only first conversion per unit
      const uniqueUnits = new Map();
      for (const row of result.rows) {
        if (!uniqueUnits.has(row.unit_uuid)) {
          uniqueUnits.set(row.unit_uuid, {
            unit_uuid: row.unit_uuid,
            tenant_uuid: row.tenant_uuid,
            business_type_uuid: row.business_type_uuid,
            name: row.name,
            short_name: row.short_name,
            unit_type: row.unit_type,
            is_base_unit: row.is_base_unit,
            is_active: row.is_active,
            conversion_to_base: row.conversion_to_base
          });
        }
      }
      
      return Array.from(uniqueUnits.values());
    } catch (error) {
      console.error('[ProductModel] getUnits query error:', error.message);
      console.error('[ProductModel] getUnits error stack:', error.stack);
      console.error('[ProductModel] Query parameters:', { tenantUuid, businessTypeUuid });
      throw error;
    }
  }

  /**
   * Create unit
   * @param {Object} data
   */
  static async createUnit(data) {
    const {
      tenant_uuid,
      business_type_uuid,
      name,
      short_name,
      unit_type,
      is_base_unit = false,
      is_active = true
    } = data;

    if (!SecurityUtils.isValidUUID(tenant_uuid)) {
      throw new Error('Invalid tenant UUID');
    }
    if (!SecurityUtils.isValidUUID(business_type_uuid)) {
      throw new Error('Invalid business type UUID');
    }

    // Handle short_name: convert to JSONB format if needed
    // Accepts: string (legacy), object {en: "...", bn: "..."}, or already JSONB
    let shortNameJsonb;
    if (typeof short_name === 'string') {
      // Legacy format: convert string to JSONB with English value
      shortNameJsonb = JSON.stringify({ en: short_name, bn: '' });
    } else if (typeof short_name === 'object' && short_name !== null) {
      // Already an object, stringify it
      shortNameJsonb = JSON.stringify(short_name);
    } else {
      // Default empty JSONB
      shortNameJsonb = JSON.stringify({ en: '', bn: '' });
    }

    const query = `
      INSERT INTO catalog.units (
        tenant_uuid,
        business_type_uuid,
        store_type_uuid,
        name,
        short_name,
        unit_type,
        is_base_unit,
        is_active
      ) VALUES ($1, $2, $2, $3, $4::jsonb, $5, $6, $7)
      RETURNING 
        unit_uuid,
        tenant_uuid,
        business_type_uuid,
        name,
        short_name,
        unit_type,
        is_base_unit,
        is_active,
        created_at,
        updated_at
    `;

    const params = [
      tenant_uuid,
      business_type_uuid,
      name,
      shortNameJsonb,
      unit_type,
      is_base_unit,
      is_active
    ];

    const result = await SafeQuery.execute(query, params);
    return result.rows[0];
  }

  /**
   * Update unit
   * @param {string} unitUuid
   * @param {Object} data
   */
  static async updateUnit(unitUuid, data) {
    if (!SecurityUtils.isValidUUID(unitUuid)) {
      throw new Error('Invalid unit UUID');
    }

    const {
      name,
      short_name,
      unit_type,
      is_base_unit,
      is_active
    } = data;

    // Handle short_name: convert to JSONB format if needed
    let shortNameJsonb = null;
    if (short_name !== undefined && short_name !== null) {
      if (typeof short_name === 'string') {
        // Legacy format: convert string to JSONB with English value
        shortNameJsonb = JSON.stringify({ en: short_name, bn: '' });
      } else if (typeof short_name === 'object') {
        // Already an object, stringify it
        shortNameJsonb = JSON.stringify(short_name);
      }
    }

    const query = `
      UPDATE catalog.units
      SET
        name = COALESCE($2, name),
        short_name = COALESCE($3::jsonb, short_name),
        unit_type = COALESCE($4, unit_type),
        is_base_unit = COALESCE($5, is_base_unit),
        is_active = COALESCE($6, is_active),
        updated_at = NOW()
      WHERE unit_uuid = $1
      RETURNING 
        unit_uuid,
        tenant_uuid,
        business_type_uuid,
        name,
        short_name,
        unit_type,
        is_base_unit,
        is_active,
        created_at,
        updated_at
    `;

    const params = [
      unitUuid,
      name || null,
      shortNameJsonb,
      unit_type || null,
      is_base_unit !== undefined ? is_base_unit : null,
      is_active !== undefined ? is_active : null
    ];

    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete unit
   * @param {string} unitUuid
   */
  static async deleteUnit(unitUuid) {
    if (!SecurityUtils.isValidUUID(unitUuid)) {
      throw new Error('Invalid unit UUID');
    }

    const query = `
      DELETE FROM catalog.units
      WHERE unit_uuid = $1
      RETURNING unit_uuid
    `;

    const result = await SafeQuery.execute(query, [unitUuid]);
    return result.rows[0] || null;
  }

  /**
   * Get unit conversions for a unit
   * @param {string} tenantUuid
   * @param {string} unitUuid
   */
  static async getUnitConversions(tenantUuid, unitUuid) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID');
    }
    if (!SecurityUtils.isValidUUID(unitUuid)) {
      throw new Error('Invalid unit UUID');
    }

    const query = `
      SELECT 
        uc.id,
        uc.from_unit_uuid,
        uc.to_unit_uuid,
        uc.conversion_factor,
        uc.formula,
        uc.is_active,
        from_unit.name AS from_unit_name,
        from_unit.short_name AS from_unit_short_name,
        to_unit.name AS to_unit_name,
        to_unit.short_name AS to_unit_short_name
      FROM catalog.unit_conversions uc
      INNER JOIN catalog.units from_unit ON uc.from_unit_uuid = from_unit.unit_uuid
      INNER JOIN catalog.units to_unit ON uc.to_unit_uuid = to_unit.unit_uuid
      WHERE uc.tenant_uuid = $1 
        AND (uc.from_unit_uuid = $2 OR uc.to_unit_uuid = $2)
        AND uc.is_active = true
      ORDER BY uc.created_at
    `;

    const result = await SafeQuery.execute(query, [tenantUuid, unitUuid]);
    return result.rows;
  }

  /**
   * Create unit conversion
   * @param {Object} data
   */
  static async createUnitConversion(data) {
    const {
      tenant_uuid,
      from_unit_uuid,
      to_unit_uuid,
      conversion_factor,
      formula = null,
      is_active = true
    } = data;

    if (!SecurityUtils.isValidUUID(tenant_uuid)) {
      throw new Error('Invalid tenant UUID');
    }
    if (!SecurityUtils.isValidUUID(from_unit_uuid)) {
      throw new Error('Invalid from unit UUID');
    }
    if (!SecurityUtils.isValidUUID(to_unit_uuid)) {
      throw new Error('Invalid to unit UUID');
    }
    if (from_unit_uuid === to_unit_uuid) {
      throw new Error('From unit and to unit cannot be the same');
    }
    if (!conversion_factor || conversion_factor <= 0) {
      throw new Error('Conversion factor must be greater than 0');
    }

    const query = `
      INSERT INTO catalog.unit_conversions (
        tenant_uuid,
        from_unit_uuid,
        to_unit_uuid,
        conversion_factor,
        formula,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (tenant_uuid, from_unit_uuid, to_unit_uuid) 
      DO UPDATE SET
        conversion_factor = EXCLUDED.conversion_factor,
        formula = EXCLUDED.formula,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP
      RETURNING 
        id,
        tenant_uuid,
        from_unit_uuid,
        to_unit_uuid,
        conversion_factor,
        formula,
        is_active,
        created_at,
        updated_at
    `;

    const params = [
      tenant_uuid,
      from_unit_uuid,
      to_unit_uuid,
      conversion_factor,
      formula,
      is_active
    ];

    const result = await SafeQuery.execute(query, params);
    return result.rows[0];
  }

  /**
   * Update unit conversion
   * @param {string} conversionId
   * @param {Object} data
   */
  static async updateUnitConversion(conversionId, data) {
    if (!SecurityUtils.isValidInteger(conversionId)) {
      throw new Error('Invalid conversion ID');
    }

    const {
      conversion_factor,
      formula,
      is_active
    } = data;

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (conversion_factor !== undefined) {
      if (conversion_factor <= 0) {
        throw new Error('Conversion factor must be greater than 0');
      }
      updates.push(`conversion_factor = $${paramIndex++}`);
      params.push(conversion_factor);
    }

    if (formula !== undefined) {
      updates.push(`formula = $${paramIndex++}`);
      params.push(formula);
    }

    if (is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      params.push(is_active);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(conversionId);

    const query = `
      UPDATE catalog.unit_conversions
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING 
        id,
        tenant_uuid,
        from_unit_uuid,
        to_unit_uuid,
        conversion_factor,
        formula,
        is_active,
        created_at,
        updated_at
    `;

    const result = await SafeQuery.execute(query, params);
    return result.rows[0] || null;
  }

  /**
   * Delete unit conversion
   * @param {string} conversionId
   */
  static async deleteUnitConversion(conversionId) {
    if (!SecurityUtils.isValidInteger(conversionId)) {
      throw new Error('Invalid conversion ID');
    }

    const query = `
      DELETE FROM catalog.unit_conversions
      WHERE id = $1
      RETURNING id
    `;

    const result = await SafeQuery.execute(query, [conversionId]);
    return result.rows[0] || null;
  }
}

module.exports = ProductModel;


