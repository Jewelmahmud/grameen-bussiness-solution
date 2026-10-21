const BusinessTypeCategoryModel = require('../models/BusinessTypeCategoryModel');

/**
 * BusinessTypeCategoryController - CRUD handlers for business.business_type_categories
 */
class BusinessTypeCategoryController {
  /**
   * GET /api/v1/business-type-categories
   * GET /api/v1/admin/business-type-categories
   *
   * Query params:
   *   is_active   boolean        filter by active status
   *   search      string         search in code / name / name_bn
   *   sort_by     string         code | name | name_bn | display_order | created_at | updated_at
   *   sort_order  asc | desc
   *   page        integer ≥ 1    (default 1)
   *   limit       integer 1-200  (default 50, use 0 for no limit)
   */
  async getAll(req, res) {
    try {
      const q = req.query;
      const options = {};

      if (q.is_active !== undefined) options.is_active = q.is_active === 'true';
      if (q.search)                  options.search     = q.search;
      if (q.sort_by)                 options.sort_by    = q.sort_by;
      if (q.sort_order)              options.sort_order = q.sort_order;
      if (q.page)                    options.page       = parseInt(q.page, 10);
      if (q.limit !== undefined)     options.limit      = parseInt(q.limit, 10);

      const result = await BusinessTypeCategoryModel.getAll(options);
      return res.json({ success: true, ...result });
    } catch (error) {
      console.error('[BusinessTypeCategory] GetAll error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load business type categories',
      });
    }
  }

  /**
   * GET /api/v1/business-type-categories/:categoryUuid
   */
  async getOne(req, res) {
    try {
      const { categoryUuid } = req.params;
      const record = await BusinessTypeCategoryModel.getByUuid(categoryUuid);
      if (!record) {
        return res.status(404).json({ success: false, message: 'Business type category not found' });
      }
      return res.json({ success: true, data: record });
    } catch (error) {
      console.error('[BusinessTypeCategory] GetOne error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load business type category',
      });
    }
  }

  /**
   * POST /api/v1/admin/business-type-categories
   */
  async create(req, res) {
    try {
      const created = await BusinessTypeCategoryModel.create(req.body || {});
      return res.status(201).json({
        success: true,
        message: 'Business type category created',
        data: created,
      });
    } catch (error) {
      console.error('[BusinessTypeCategory] Create error:', error.message);
      const status =
        error.message?.includes('required') || error.message?.includes('duplicate')
          ? 400
          : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to create business type category',
      });
    }
  }

  /**
   * PUT /api/v1/admin/business-type-categories/:categoryUuid
   */
  async update(req, res) {
    try {
      const { categoryUuid } = req.params;
      const updated = await BusinessTypeCategoryModel.update(categoryUuid, req.body || {});
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Business type category not found',
        });
      }
      return res.json({
        success: true,
        message: 'Business type category updated',
        data: updated,
      });
    } catch (error) {
      console.error('[BusinessTypeCategory] Update error:', error.message);
      const status = error.message?.includes('Invalid') ? 400 : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to update business type category',
      });
    }
  }

  /**
   * DELETE /api/v1/admin/business-type-categories/:categoryUuid
   */
  async delete(req, res) {
    try {
      const { categoryUuid } = req.params;
      const deleted = await BusinessTypeCategoryModel.delete(categoryUuid);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Business type category not found',
        });
      }
      return res.json({
        success: true,
        message: 'Business type category deleted',
      });
    } catch (error) {
      console.error('[BusinessTypeCategory] Delete error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete business type category',
      });
    }
  }
}

module.exports = new BusinessTypeCategoryController();

