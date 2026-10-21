const BusinessTypeModel = require('../models/BusinessTypeModel');

/**
 * BusinessTypeController - CRUD handlers for business.business_types
 */
class BusinessTypeController {
  /**
   * GET /api/v1/business-types
   * GET /api/v1/admin/business-types
   *
   * Query params:
   *   is_active   boolean        filter by active status
   *   search      string         search in name / name_bn
   *   sort_by     string         name | name_bn | created_at | updated_at
   *   sort_order  asc | desc
   *   page        integer ≥ 1    (default 1)
   *   limit       integer 1-100  (default 20, use 0 for no limit)
   */
  async getAll(req, res) {
    try {
      const q = req.query;
      const options = {};

      if (q.is_active !== undefined) options.is_active = q.is_active === 'true';
      if (q.search)                  options.search     = q.search;
      if (q.sort_by)                 options.sort_by    = q.sort_by;
      if (q.sort_order)              options.sort_order = q.sort_order;
      if (q.page)                    options.page       = parseInt(q.page);
      if (q.limit !== undefined)     options.limit      = parseInt(q.limit);

      const result = await BusinessTypeModel.getAll(options);
      return res.json({ success: true, ...result });
    } catch (error) {
      console.error('[BusinessType] GetAll error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load business types',
      });
    }
  }

  /**
   * GET /api/v1/business-types/:businessTypeUuid
   */
  async getOne(req, res) {
    try {
      const { businessTypeUuid } = req.params;
      const record = await BusinessTypeModel.getByUuid(businessTypeUuid);
      if (!record) {
        return res.status(404).json({ success: false, message: 'Business type not found' });
      }
      return res.json({ success: true, data: record });
    } catch (error) {
      console.error('[BusinessType] GetOne error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load business type',
      });
    }
  }

  /**
   * POST /api/v1/admin/business-types
   */
  async create(req, res) {
    try {
      const created = await BusinessTypeModel.create(req.body || {});
      return res.status(201).json({
        success: true,
        message: 'Business type created',
        data: created,
      });
    } catch (error) {
      console.error('[BusinessType] Create error:', error.message);
      const msg = error.message || '';
      const status =
        msg.includes('required') ||
        msg.includes('duplicate') ||
        msg.includes('category_uuids') ||
        msg.includes('do not exist')
          ? 400
          : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to create business type',
      });
    }
  }

  /**
   * PUT /api/v1/admin/business-types/:businessTypeUuid
   */
  async update(req, res) {
    try {
      const { businessTypeUuid } = req.params;
      const updated = await BusinessTypeModel.update(businessTypeUuid, req.body || {});
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Business type not found' });
      }
      return res.json({
        success: true,
        message: 'Business type updated',
        data: updated,
      });
    } catch (error) {
      console.error('[BusinessType] Update error:', error.message);
      const msg = error.message || '';
      const status =
        msg.includes('No fields provided') ||
        msg.includes('category_uuids') ||
        msg.includes('do not exist')
          ? 400
          : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to update business type',
      });
    }
  }

  /**
   * DELETE /api/v1/admin/business-types/:businessTypeUuid
   */
  async delete(req, res) {
    try {
      const { businessTypeUuid } = req.params;
      const deleted = await BusinessTypeModel.delete(businessTypeUuid);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Business type not found' });
      }
      return res.json({ success: true, message: 'Business type deleted' });
    } catch (error) {
      console.error('[BusinessType] Delete error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete business type',
      });
    }
  }
}

module.exports = new BusinessTypeController();
