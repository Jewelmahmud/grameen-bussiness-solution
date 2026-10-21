const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * Business Model - Handles business-related database operations
 */
class BusinessModel {
  /**
   * Get all active business types
   * @returns {Promise<Array>}
   */
  static async getBusinessTypes() {
    const query = `
      SELECT business_type_uuid, name, description, icon, is_active
      FROM business.business_types
      WHERE is_active = true
      ORDER BY name
    `;
    
    const result = await SafeQuery.execute(query);
    return result.rows;
  }

  /**
   * Get business type by UUID
   * @param {string} businessTypeUuid - Business type UUID
   * @returns {Promise<Object|null>}
   */
  static async getBusinessTypeByUuid(businessTypeUuid) {
    // Validate UUID
    if (!SecurityUtils.isValidUUID(businessTypeUuid)) {
      throw new Error('Invalid business type UUID format');
    }

    const query = `
      SELECT business_type_uuid, name, description, icon, is_active
      FROM business.business_types
      WHERE business_type_uuid = $1 AND is_active = true
    `;
    
    const result = await SafeQuery.execute(query, [businessTypeUuid]);
    return result.rows[0] || null;
  }

  /**
   * Create or update business setup
   * @param {Object} setupData - Business setup data
   * @param {string} companyId - Company ID from auth server
   * @param {string} userId - User ID from auth server
   * @returns {Promise<Object>} - Created/updated tenant and business
   */
  static async createOrUpdateBusinessSetup(setupData, companyId, userId) {
    const { tenant, business, settings, location, subscription } = setupData;

    return await SafeQuery.transaction(async (client) => {
      // Validate location UUIDs
      if (location) {
        if (location.country_uuid && !SecurityUtils.isValidUUID(location.country_uuid)) {
          throw new Error('Invalid country UUID format');
        }
        if (location.division_uuid && !SecurityUtils.isValidUUID(location.division_uuid)) {
          throw new Error('Invalid division UUID format');
        }
        if (location.district_uuid && !SecurityUtils.isValidUUID(location.district_uuid)) {
          throw new Error('Invalid district UUID format');
        }
        if (location.upazila_uuid && !SecurityUtils.isValidUUID(location.upazila_uuid)) {
          throw new Error('Invalid upazila UUID format');
        }
      }

      // Check if tenant exists
      let existingTenant = null;
      if (companyId) {
        existingTenant = await client.query(`
          SELECT tenant_uuid FROM core.tenants WHERE company_id = $1 LIMIT 1
        `, [companyId]);
      } else if (userId) {
        existingTenant = await client.query(`
          SELECT tenant_uuid 
          FROM core.tenants
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        `, [userId]);
      }

      let tenantUuid;
      let isNewTenant = false;

      if (existingTenant && existingTenant.rows.length > 0) {
        // Update existing tenant
        tenantUuid = existingTenant.rows[0].tenant_uuid;
        
        const tenantUpdateFields = [];
        const tenantUpdateValues = [];
        let paramIndex = 1;

        if (tenant) {
          if (tenant.name) {
            tenantUpdateFields.push(`name = $${paramIndex++}`);
            tenantUpdateValues.push(SecurityUtils.sanitizeString(tenant.name, { maxLength: 255 }));
          }
          if (tenant.business_name) {
            tenantUpdateFields.push(`business_name = $${paramIndex++}`);
            tenantUpdateValues.push(SecurityUtils.sanitizeString(tenant.business_name, { maxLength: 255 }));
          }
          if (tenant.subdomain) {
            tenantUpdateFields.push(`subdomain = $${paramIndex++}`);
            tenantUpdateValues.push(SecurityUtils.sanitizeString(tenant.subdomain, { maxLength: 100 }));
          }
          if (tenant.logo_url) {
            tenantUpdateFields.push(`logo_url = $${paramIndex++}`);
            tenantUpdateValues.push(SecurityUtils.sanitizeString(tenant.logo_url, { maxLength: 500 }));
          }
          if (tenant.address) {
            tenantUpdateFields.push(`address = $${paramIndex++}`);
            tenantUpdateValues.push(SecurityUtils.sanitizeString(tenant.address, { maxLength: 1000 }));
          }
          if (tenant.tin_number) {
            tenantUpdateFields.push(`tin_number = $${paramIndex++}`);
            tenantUpdateValues.push(SecurityUtils.sanitizeString(tenant.tin_number, { maxLength: 50 }));
          }
          if (tenant.trade_license) {
            tenantUpdateFields.push(`trade_license = $${paramIndex++}`);
            tenantUpdateValues.push(SecurityUtils.sanitizeString(tenant.trade_license, { maxLength: 100 }));
          }
          if (tenant.postal_code) {
            tenantUpdateFields.push(`postal_code = $${paramIndex++}`);
            tenantUpdateValues.push(SecurityUtils.sanitizeString(tenant.postal_code, { maxLength: 20 }));
          }
        }

        if (location && location.upazila_uuid) {
          tenantUpdateFields.push(`upazila_uuid = $${paramIndex++}`);
          tenantUpdateValues.push(location.upazila_uuid);
        }

        tenantUpdateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        tenantUpdateValues.push(tenantUuid);

        if (tenantUpdateFields.length > 1) {
          await client.query(`
            UPDATE core.tenants
            SET ${tenantUpdateFields.join(', ')}
            WHERE tenant_uuid = $${paramIndex}
          `, tenantUpdateValues);
        }
      } else {
        // Create new tenant
        if (!tenant || !tenant.business_name) {
          throw new Error('Business name is required for new tenant');
        }

        const tenantResult = await client.query(`
          INSERT INTO core.tenants (
            tenant_uuid, company_id, name, business_name, subdomain, logo_url,
            address, upazila_uuid, postal_code, tin_number, trade_license,
            subscription_plan, subscription_status
          ) VALUES (
            gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'trial', 'trial'
          ) RETURNING tenant_uuid
        `, [
          companyId || null,
          tenant.name ? SecurityUtils.sanitizeString(tenant.name, { maxLength: 255 }) : null,
          SecurityUtils.sanitizeString(tenant.business_name, { maxLength: 255 }),
          tenant.subdomain ? SecurityUtils.sanitizeString(tenant.subdomain, { maxLength: 100 }) : null,
          tenant.logo_url ? SecurityUtils.sanitizeString(tenant.logo_url, { maxLength: 500 }) : null,
          tenant.address ? SecurityUtils.sanitizeString(tenant.address, { maxLength: 1000 }) : null,
          location && location.upazila_uuid ? location.upazila_uuid : null,
          tenant.postal_code ? SecurityUtils.sanitizeString(tenant.postal_code, { maxLength: 20 }) : null,
          tenant.tin_number ? SecurityUtils.sanitizeString(tenant.tin_number, { maxLength: 50 }) : null,
          tenant.trade_license ? SecurityUtils.sanitizeString(tenant.trade_license, { maxLength: 100 }) : null
        ]);

        tenantUuid = tenantResult.rows[0].tenant_uuid;
        isNewTenant = true;

        // Set trial period dates
        await client.query(`
          UPDATE core.tenants
          SET subscription_start_date = CURRENT_DATE,
              subscription_end_date = CURRENT_DATE + INTERVAL '1 month'
          WHERE tenant_uuid = $1
        `, [tenantUuid]);

        // Update user_cache company_id when user gets a new tenant (row must already exist from login)
        if (userId) {
          await client.query(`
            UPDATE core.user_cache
            SET company_id = $2, last_synced_at = NOW(), updated_at = NOW()
            WHERE user_uuid = $1
          `, [userId, companyId || null]);
        }
      }

      // Handle subscription
      if (subscription && subscription.plan_id) {
        const validPlans = ['trial', 'small_business', 'mid_size_business', 'big_business'];
        const planId = SecurityUtils.sanitizeString(subscription.plan_id, { maxLength: 50 });
        
        if (!validPlans.includes(planId)) {
          throw new Error('Invalid subscription plan');
        }

        const subscriptionStatus = planId === 'trial' ? 'trial' : 'active';
        
        await client.query(`
          UPDATE core.tenants
          SET subscription_plan = $1::core.subscription_plan,
              subscription_status = $2::core.subscription_status,
              subscription_start_date = CURRENT_DATE,
              subscription_end_date = CURRENT_DATE + INTERVAL '1 month',
              updated_at = CURRENT_TIMESTAMP
          WHERE tenant_uuid = $3
        `, [planId, subscriptionStatus, tenantUuid]);
      }

      // Create or update business
      if (business) {
        if (!business.business_type_uuid) {
          throw new Error('Business type UUID is required');
        }

        if (!SecurityUtils.isValidUUID(business.business_type_uuid)) {
          throw new Error('Invalid business type UUID format');
        }

        const existingBusiness = await client.query(`
          SELECT business_uuid FROM business.businesses WHERE tenant_uuid = $1 LIMIT 1
        `, [tenantUuid]);

        let businessUuid;

        if (existingBusiness.rows.length > 0) {
          // Update existing business
          businessUuid = existingBusiness.rows[0].business_uuid;
          
          const businessUpdateFields = [];
          const businessUpdateValues = [];
          let paramIndex = 1;

          businessUpdateFields.push(`business_type_uuid = $${paramIndex++}`);
          businessUpdateValues.push(business.business_type_uuid);

          if (business.name) {
            businessUpdateFields.push(`name = $${paramIndex++}`);
            businessUpdateValues.push(SecurityUtils.sanitizeString(business.name, { maxLength: 255 }));
          }
          if (business.code) {
            businessUpdateFields.push(`code = $${paramIndex++}`);
            businessUpdateValues.push(SecurityUtils.sanitizeString(business.code, { maxLength: 50 }));
          }
          if (business.address) {
            businessUpdateFields.push(`address = $${paramIndex++}`);
            businessUpdateValues.push(SecurityUtils.sanitizeString(business.address, { maxLength: 1000 }));
          }
          if (business.opening_time) {
            businessUpdateFields.push(`opening_time = $${paramIndex++}::TIME`);
            businessUpdateValues.push(business.opening_time);
          }
          if (business.closing_time) {
            businessUpdateFields.push(`closing_time = $${paramIndex++}::TIME`);
            businessUpdateValues.push(business.closing_time);
          }
          if (business.enable_pos !== undefined) {
            businessUpdateFields.push(`enable_pos = $${paramIndex++}`);
            businessUpdateValues.push(business.enable_pos);
          }
          if (business.enable_online_orders !== undefined) {
            businessUpdateFields.push(`enable_online_orders = $${paramIndex++}`);
            businessUpdateValues.push(business.enable_online_orders);
          }

          businessUpdateFields.push(`updated_at = CURRENT_TIMESTAMP`);
          businessUpdateValues.push(businessUuid);

          await client.query(`
            UPDATE business.businesses
            SET ${businessUpdateFields.join(', ')}
            WHERE business_uuid = $${paramIndex}
          `, businessUpdateValues);
        } else {
          // Create new business
          if (!business.name) {
            throw new Error('Business name is required');
          }

          // Generate business code if not provided
          let businessCode = business.code;
          if (!businessCode) {
            const baseCode = SecurityUtils.sanitizeString(business.name, { maxLength: 10 }).toUpperCase().replace(/\s/g, '');
            businessCode = baseCode;
            let counter = 1;
            
            while (true) {
              const existing = await client.query(`
                SELECT 1 FROM business.businesses WHERE tenant_uuid = $1 AND code = $2
              `, [tenantUuid, businessCode]);
              
              if (existing.rows.length === 0) break;
              businessCode = `${baseCode}${counter}`;
              counter++;
            }
          }

          const businessResult = await client.query(`
            INSERT INTO business.businesses (
              business_uuid, tenant_uuid, company_id, business_type_uuid,
              name, code, address, opening_time, closing_time,
              enable_pos, enable_online_orders, is_primary, is_active
            ) VALUES (
              gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7::TIME, $8::TIME, $9, $10, true, true
            ) RETURNING business_uuid
          `, [
            tenantUuid,
            companyId || null,
            business.business_type_uuid,
            SecurityUtils.sanitizeString(business.name, { maxLength: 255 }),
            businessCode,
            business.address ? SecurityUtils.sanitizeString(business.address, { maxLength: 1000 }) : null,
            business.opening_time || null,
            business.closing_time || null,
            business.enable_pos !== undefined ? business.enable_pos : true,
            business.enable_online_orders !== undefined ? business.enable_online_orders : false
          ]);

          businessUuid = businessResult.rows[0].business_uuid;

          // Link user to business
          if (userId) {
            await client.query(`
              INSERT INTO business.user_businesses (user_uuid, business_uuid, company_id)
              VALUES ($1, $2, $3)
              ON CONFLICT (user_uuid, business_uuid) DO NOTHING
            `, [userId, businessUuid, companyId || null]);
          }
        }
      }

      // Create or update tenant settings
      if (settings) {
        await client.query(`
          INSERT INTO core.tenant_settings (
            tenant_uuid, currency_code, currency_symbol, timezone, date_format,
            financial_year_start, enable_vat, vat_percentage, enable_discount,
            enable_barcode, enable_warranty, low_stock_threshold,
            receipt_header, receipt_footer
          ) VALUES (
            $1, $2::core.currency_code, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
          )
          ON CONFLICT (tenant_uuid) DO UPDATE SET
            currency_code = EXCLUDED.currency_code,
            currency_symbol = EXCLUDED.currency_symbol,
            timezone = EXCLUDED.timezone,
            date_format = EXCLUDED.date_format,
            financial_year_start = EXCLUDED.financial_year_start,
            enable_vat = EXCLUDED.enable_vat,
            vat_percentage = EXCLUDED.vat_percentage,
            enable_discount = EXCLUDED.enable_discount,
            enable_barcode = EXCLUDED.enable_barcode,
            enable_warranty = EXCLUDED.enable_warranty,
            low_stock_threshold = EXCLUDED.low_stock_threshold,
            receipt_header = EXCLUDED.receipt_header,
            receipt_footer = EXCLUDED.receipt_footer,
            updated_at = CURRENT_TIMESTAMP
        `, [
          tenantUuid,
          settings.currency_code || 'BDT',
          settings.currency_symbol || '৳',
          settings.timezone || 'Asia/Dhaka',
          settings.date_format || 'DD/MM/YYYY',
          settings.financial_year_start || '01-07',
          settings.enable_vat !== undefined ? settings.enable_vat : true,
          settings.vat_percentage || 15.00,
          settings.enable_discount !== undefined ? settings.enable_discount : true,
          settings.enable_barcode !== undefined ? settings.enable_barcode : true,
          settings.enable_warranty !== undefined ? settings.enable_warranty : true,
          settings.low_stock_threshold || 10,
          settings.receipt_header ? SecurityUtils.sanitizeString(settings.receipt_header, { maxLength: 1000 }) : null,
          settings.receipt_footer ? SecurityUtils.sanitizeString(settings.receipt_footer, { maxLength: 500 }) : null
        ]);
      }

      // Log activity
      if (userId) {
        await client.query(`
          INSERT INTO core.activity_logs (
            tenant_uuid, user_uuid, company_id, module, action, record_type, record_uuid
          ) VALUES (
            $1, $2, $3, 'business', $4, 'business_setup', $5
          )
        `, [
          tenantUuid,
          userId,
          companyId || null,
          isNewTenant ? 'create' : 'update',
          tenantUuid
        ]);
      }

      // Get final tenant and business data
      const finalTenant = await client.query(`
        SELECT tenant_uuid, subscription_plan, subscription_status,
               subscription_start_date, subscription_end_date
        FROM core.tenants
        WHERE tenant_uuid = $1
      `, [tenantUuid]);

      const finalBusiness = business ? await client.query(`
        SELECT business_uuid FROM business.businesses WHERE tenant_uuid = $1 LIMIT 1
      `, [tenantUuid]) : { rows: [] };

      return {
        tenant_uuid: tenantUuid,
        business_uuid: finalBusiness.rows.length > 0 ? finalBusiness.rows[0].business_uuid : null,
        setup_completed: true,
        setup_completed_at: new Date().toISOString()
      };
    });
  }

  /**
   * Get business setup status
   * @param {string} companyId - Company ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Setup status
   */
  static async getBusinessSetupStatus(companyId, userId) {
    let tenantResult = null;

    if (companyId && SecurityUtils.isValidUUID(companyId)) {
      tenantResult = await SafeQuery.execute(`
        SELECT tenant_uuid, subscription_plan, subscription_status,
               subscription_start_date, subscription_end_date
        FROM core.tenants
        WHERE company_id = $1
        LIMIT 1
      `, [companyId]);
    }

    if ((!tenantResult || tenantResult.rows.length === 0) && userId && SecurityUtils.isValidUUID(userId)) {
      tenantResult = await SafeQuery.execute(`
        SELECT tenant_uuid, subscription_plan, subscription_status,
               subscription_start_date, subscription_end_date
        FROM core.tenants
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1
      `, [userId]);
    }

    if (!tenantResult || tenantResult.rows.length === 0) {
      return {
        setup_completed: false,
        setup_completed_at: null,
        tenant_uuid: null,
        business_uuid: null,
        missing_fields: ['business_info', 'business_settings', 'location_info', 'subscription']
      };
    }

    const tenant = tenantResult.rows[0];
    const tenantUuid = tenant.tenant_uuid;

    const businessResult = await SafeQuery.execute(`
      SELECT business_uuid FROM business.businesses WHERE tenant_uuid = $1 LIMIT 1
    `, [tenantUuid]);

    const settingsResult = await SafeQuery.execute(`
      SELECT tenant_uuid FROM core.tenant_settings WHERE tenant_uuid = $1 LIMIT 1
    `, [tenantUuid]);

    const missingFields = [];
    if (businessResult.rows.length === 0) missingFields.push('business_info');
    if (settingsResult.rows.length === 0) missingFields.push('business_settings');
    if (!tenant.subscription_start_date || !tenant.subscription_end_date) missingFields.push('subscription');

    return {
      setup_completed: missingFields.length === 0,
      setup_completed_at: missingFields.length === 0 ? new Date().toISOString() : null,
      tenant_uuid: tenantUuid,
      business_uuid: businessResult.rows.length > 0 ? businessResult.rows[0].business_uuid : null,
      missing_fields: missingFields
    };
  }

  /**
   * Get current business setup
   * @param {string} tenantUuid - Tenant UUID
   * @returns {Promise<Object>} - Complete business setup
   */
  static async getBusinessSetup(tenantUuid) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }

    const tenantResult = await SafeQuery.execute(`
      SELECT t.*, u.name AS upazila_name, u.name_bn AS upazila_name_bn,
             d.district_uuid, d.name AS district_name, d.name_bn AS district_name_bn,
             div.division_uuid, div.name AS division_name, div.name_bn AS division_name_bn,
             c.country_uuid, c.name AS country_name, c.name_bn AS country_name_bn
      FROM core.tenants t
      LEFT JOIN core.upazilas u ON t.upazila_uuid = u.upazila_uuid
      LEFT JOIN core.districts d ON u.district_uuid = d.district_uuid
      LEFT JOIN core.divisions div ON d.division_uuid = div.division_uuid
      LEFT JOIN core.countries c ON div.country_uuid = c.country_uuid
      WHERE t.tenant_uuid = $1
    `, [tenantUuid]);

    if (tenantResult.rows.length === 0) {
      return null;
    }

    const tenant = tenantResult.rows[0];

      const businessResult = await SafeQuery.execute(`
      SELECT b.*, bt.name AS business_type_name, bt.name_bn AS business_type_name_bn
      FROM business.businesses b
      LEFT JOIN business.business_types bt ON b.business_type_uuid = bt.business_type_uuid
      WHERE b.tenant_uuid = $1
      ORDER BY b.created_at DESC
      LIMIT 1
    `, [tenantUuid]);

    const settingsResult = await SafeQuery.execute(`
      SELECT * FROM core.tenant_settings WHERE tenant_uuid = $1
    `, [tenantUuid]);

    return {
      tenant: {
        tenant_uuid: tenant.tenant_uuid,
        name: tenant.name,
        business_name: tenant.business_name,
        address: tenant.address,
        subdomain: tenant.subdomain,
        logo_url: tenant.logo_url,
        tin_number: tenant.tin_number,
        trade_license: tenant.trade_license,
        country_uuid: tenant.country_uuid,
        division_uuid: tenant.division_uuid,
        district_uuid: tenant.district_uuid,
        upazila_uuid: tenant.upazila_uuid,
        postal_code: tenant.postal_code
      },
      business: businessResult.rows.length > 0 ? {
        business_uuid: businessResult.rows[0].business_uuid,
        business_type_uuid: businessResult.rows[0].business_type_uuid,
        business_name: businessResult.rows[0].business_name,
        business_name_en: businessResult.rows[0].business_name_en,
        code: businessResult.rows[0].code,
        address: businessResult.rows[0].address,
        opening_time: businessResult.rows[0].opening_time,
        closing_time: businessResult.rows[0].closing_time,
        enable_pos: businessResult.rows[0].enable_pos,
        enable_online_orders: businessResult.rows[0].enable_online_orders
      } : null,
      settings: settingsResult.rows.length > 0 ? settingsResult.rows[0] : null,
      location: {
        country_uuid: tenant.country_uuid || null,
        division_uuid: tenant.division_uuid || null,
        district_uuid: tenant.district_uuid || null,
        upazila_uuid: tenant.upazila_uuid || null,
        postal_code: tenant.postal_code || null
      },
      subscription: {
        plan_id: tenant.subscription_plan,
        plan_uuid: null, // Can be added if subscription packages table exists
        billing_period: 'monthly', // Default, can be enhanced
        subscription_start_date: tenant.subscription_start_date,
        subscription_end_date: tenant.subscription_end_date
      }
    };
  }

  /**
   * Get tenant details including business information
   * @param {string} companyId - Company ID from auth server (optional)
   * @param {string} userId - User ID from auth server
   * @returns {Promise<Object|null>} - Tenant and business details
   */
  static async getTenantDetails(companyId, userId) {
    if (!userId) {
      return null;
    }

    if (!SecurityUtils.isValidUUID(userId)) {
      throw new Error('Invalid user ID UUID format');
    }

    // First: tenant row linked directly to this user_id (ignore company_id filter here)
    let query = `
      SELECT t.tenant_uuid, t.subscription_plan, t.subscription_status, 
             t.subscription_start_date, t.subscription_end_date, t.company_id
      FROM core.tenants t
      WHERE t.user_id = $1
    `;
    query += ` ORDER BY t.created_at DESC LIMIT 1`;

    let tenantResult = await SafeQuery.execute(query, [userId]);

    // Fallback: tenant only linked by company_id (older tenants may not have user_id set)
    if ((!tenantResult || tenantResult.rows.length === 0) && companyId) {
      if (!SecurityUtils.isValidUUID(companyId)) {
        throw new Error('Invalid company ID UUID format');
      }
      tenantResult = await SafeQuery.execute(
        `
        SELECT t.tenant_uuid, t.subscription_plan, t.subscription_status, 
               t.subscription_start_date, t.subscription_end_date, t.company_id
        FROM core.tenants t
        WHERE t.company_id = $1
        ORDER BY t.created_at DESC
        LIMIT 1
        `,
        [companyId],
      );
    }

    if (!tenantResult || tenantResult.rows.length === 0) {
      return null;
    }

    const tenant = tenantResult.rows[0];
    const tenantUuid = tenant.tenant_uuid;

    const businessResult = await SafeQuery.execute(`
      SELECT business_uuid, business_type_uuid, business_name, business_name_en
      FROM business.businesses
      WHERE tenant_uuid = $1
      ORDER BY created_at DESC
      LIMIT 1
    `, [tenantUuid]);

    const business = businessResult.rows.length > 0 ? businessResult.rows[0] : null;

    return {
      tenant: {
        tenant_uuid: tenant.tenant_uuid,
        subscription_plan: tenant.subscription_plan,
        subscription_status: tenant.subscription_status
      },
      business: business ? {
        business_uuid: business.business_uuid,
        business_type_uuid: business.business_type_uuid,
        business_name: business.business_name,
        business_name_en: business.business_name_en
      } : null
    };
  }

  /**
   * Update tenant subscription plan
   * @param {string} tenantUuid - Tenant UUID
   * @param {string} subscriptionPlan - Subscription plan
   * @returns {Promise<Object>} - Updated tenant
   */
  static async updateSubscriptionPlan(tenantUuid, subscriptionPlan) {
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }

    const validPlans = ['trial', 'small_business', 'mid_size_business', 'big_business'];
    const sanitizedPlan = SecurityUtils.sanitizeString(subscriptionPlan, { maxLength: 50 });
    if (!validPlans.includes(sanitizedPlan)) {
      throw new Error('Invalid subscription plan');
    }

    const subscriptionStatus = sanitizedPlan === 'trial' ? 'trial' : 'active';
    
    const result = await SafeQuery.execute(`
      UPDATE core.tenants
      SET subscription_plan = $1::core.subscription_plan,
          subscription_status = $2::core.subscription_status,
          subscription_start_date = CURRENT_DATE,
          subscription_end_date = CURRENT_DATE + INTERVAL '1 month',
          updated_at = CURRENT_TIMESTAMP
      WHERE tenant_uuid = $3
      RETURNING *
    `, [sanitizedPlan, subscriptionStatus, tenantUuid]);

    if (result.rows.length === 0) {
      throw new Error('Tenant not found');
    }

    return result.rows[0];
  }
}

module.exports = BusinessModel;

