const BusinessModel = require('../models/BusinessModel');
const SafeQuery = require('../utils/safeQuery');
const businessCatalog = require('../../json/bussiness_types_and_units.json');

/**
 * Business Controller - Handles business-related requests
 */
class BusinessController {
  /**
   * Get all business types
   */
  async getBusinessTypes(req, res) {
    try {
      const businessTypes = await BusinessModel.getBusinessTypes();

      return res.json({
        success: true,
        data: businessTypes
      });
    } catch (error) {
      console.error('[Business] Get business types error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ব্যবসার ধরন লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Get hierarchical business catalog from JSON
   * GET /api/v1/business/catalog
   */
  async getBusinessCatalog(req, res) {
    try {
      const categories = businessCatalog.business_categories || [];

      return res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('[Business] Get business catalog error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ব্যবসার ধরন ক্যাটালগ লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Create or update business setup
   * POST /api/v1/business/setup
   */
  async businessSetup(req, res) {
    try {
      // Get user info from request (should be set by auth middleware)
      const user = req.user || req.body.user;
      
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          message: 'অনুমোদিত নয় - ব্যবহারকারী তথ্য পাওয়া যায়নি'
        });
      }

      // Extract company_id from user roles
      let companyId = null;
      if (user.roles && user.roles.length > 0) {
        const firstRole = user.roles[0];
        companyId = firstRole.assignment?.companyId || firstRole.company?.id || null;
      }

      const userId = user.id;
      const setupData = req.body;

      // Validate required fields
      const errors = {};
      
      if (setupData.tenant && !setupData.tenant.business_name) {
        errors['tenant.business_name'] = ['Business name is required'];
      }
      
      if (setupData.business && !setupData.business.business_type_uuid) {
        errors['business.business_type_uuid'] = ['Business type is required'];
      }
      
      if (setupData.location) {
        if (!setupData.location.country_uuid) {
          errors['location.country_uuid'] = ['Country is required'];
        }
        if (!setupData.location.division_uuid) {
          errors['location.division_uuid'] = ['Division is required'];
        }
        if (!setupData.location.district_uuid) {
          errors['location.district_uuid'] = ['District is required'];
        }
        if (!setupData.location.upazila_uuid) {
          errors['location.upazila_uuid'] = ['Upazila is required'];
        }
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      const result = await BusinessModel.createOrUpdateBusinessSetup(setupData, companyId, userId);

      return res.status(201).json({
        success: true,
        message: 'Business setup completed successfully',
        data: result
      });
    } catch (error) {
      console.error('[Business] Business setup error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'ব্যবসা সেটআপ সম্পন্ন করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Get business setup status
   * GET /api/v1/business/setup/status
   */
  async getBusinessSetupStatus(req, res) {
    try {
      // Get user info from request
      const user = req.user || req.body.user;
      
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          message: 'অনুমোদিত নয় - ব্যবহারকারী তথ্য পাওয়া যায়নি'
        });
      }

      // Extract company_id from user roles
      let companyId = null;
      if (user.roles && user.roles.length > 0) {
        const firstRole = user.roles[0];
        companyId = firstRole.assignment?.companyId || firstRole.company?.id || null;
      }

      const userId = user.id;
      const status = await BusinessModel.getBusinessSetupStatus(companyId, userId);

      return res.json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('[Business] Get setup status error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'ব্যবসা সেটআপ অবস্থা খোঁজার সময় ত্রুটি হয়েছে'
      });
    }
  }

  /**
   * Get current business setup
   * GET /api/v1/business/setup
   */
  async getBusinessSetup(req, res) {
    try {
      // Get user info from request
      const user = req.user || req.body.user;
      
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          message: 'অনুমোদিত নয় - ব্যবহারকারী তথ্য পাওয়া যায়নি'
        });
      }

      // Extract company_id from user roles
      let companyId = null;
      if (user.roles && user.roles.length > 0) {
        const firstRole = user.roles[0];
        companyId = firstRole.assignment?.companyId || firstRole.company?.id || null;
      }

      const userId = user.id;

      // Get tenant UUID
      let tenantResult = null;

      if (companyId) {
        tenantResult = await SafeQuery.execute(`
          SELECT tenant_uuid FROM core.tenants WHERE company_id = $1 LIMIT 1
        `, [companyId]);
      }

      if ((!tenantResult || tenantResult.rows.length === 0) && userId) {
        tenantResult = await SafeQuery.execute(`
          SELECT tenant_uuid
          FROM core.tenants
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 1
        `, [userId]);
      }

      if (!tenantResult || tenantResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'ব্যবসা সেটআপ পাওয়া যায়নি'
        });
      }

      const tenantUuid = tenantResult.rows[0].tenant_uuid;
      const setup = await BusinessModel.getBusinessSetup(tenantUuid);

      if (!setup) {
        return res.status(404).json({
          success: false,
          message: 'ব্যবসা সেটআপ পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        data: setup
      });
    } catch (error) {
      console.error('[Business] Get business setup error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'ব্যবসা সেটআপ লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Update business setup
   * PUT /api/v1/business/setup
   */
  async updateBusinessSetup(req, res) {
    try {
      // Get user info from request
      const user = req.user || req.body.user;
      
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          message: 'অনুমোদিত নয় - ব্যবহারকারী তথ্য পাওয়া যায়নি'
        });
      }

      // Extract company_id from user roles
      let companyId = null;
      if (user.roles && user.roles.length > 0) {
        const firstRole = user.roles[0];
        companyId = firstRole.assignment?.companyId || firstRole.company?.id || null;
      }

      const userId = user.id;
      const setupData = req.body;

      const result = await BusinessModel.createOrUpdateBusinessSetup(setupData, companyId, userId);

      return res.json({
        success: true,
        message: 'Business setup updated successfully',
        data: {
          tenant_uuid: result.tenant_uuid,
          business_uuid: result.business_uuid,
          updated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('[Business] Update business setup error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'ব্যবসা সেটআপ আপডেট করতে ব্যর্থ হয়েছে'
      });
    }
  }
}

module.exports = new BusinessController();

