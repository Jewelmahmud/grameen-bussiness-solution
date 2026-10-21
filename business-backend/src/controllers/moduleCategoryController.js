const ModuleCategoryModel = require('../models/ModuleCategoryModel');
const UploadService = require('../services/uploadService');

/**
 * Module Category Controller - Resource endpoints for core.module_categories
 * Admin: full CRUD. Other roles: read-only.
 */
class ModuleCategoryController {
  /**
   * GET /api/v1/module-categories - list all categories
   */
  async getCategories(req, res) {
    try {
      const isActive = req.query.is_active;
      const options = {};
      if (isActive !== undefined) {
        options.is_active = isActive === 'true' || isActive === true;
      }
      const list = await ModuleCategoryModel.getAll(options);
      return res.json({
        success: true,
        data: list,
      });
    } catch (error) {
      console.error('[ModuleCategory] Get categories error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load module categories',
      });
    }
  }

  /**
   * GET /api/v1/module-categories/:categoryUuid - get one category
   */
  async getCategory(req, res) {
    try {
      const { categoryUuid } = req.params;
      const category = await ModuleCategoryModel.getByUuid(categoryUuid);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Module category not found',
        });
      }
      return res.json({
        success: true,
        data: category,
      });
    } catch (error) {
      console.error('[ModuleCategory] Get category error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load module category',
      });
    }
  }

  /**
   * POST /api/v1/module-categories - create category (admin only). Optional: multipart field 'image' for category image.
   */
  async createCategory(req, res) {
    try {
      const payload = req.body || {};
      if (req.file) {
        try {
          payload.image_url = await UploadService.upload(req.file.buffer, {
            subdir: 'categories',
            mimetype: req.file.mimetype,
            originalName: req.file.originalname,
          });
        } catch (uploadErr) {
          return res.status(400).json({
            success: false,
            message: uploadErr.message || 'Image upload failed',
          });
        }
      }
      const created = await ModuleCategoryModel.create(payload);
      return res.status(201).json({
        success: true,
        message: 'Module category created successfully',
        data: created,
      });
    } catch (error) {
      console.error('[ModuleCategory] Create category error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create module category',
      });
    }
  }

  /**
   * PUT /api/v1/module-categories/:categoryUuid - update category (admin only). Optional: multipart field 'image' for category image.
   */
  async updateCategory(req, res) {
    try {
      const { categoryUuid } = req.params;
      const payload = req.body || {};
      if (req.file) {
        try {
          payload.image_url = await UploadService.upload(req.file.buffer, {
            subdir: 'categories',
            mimetype: req.file.mimetype,
            originalName: req.file.originalname,
          });
        } catch (uploadErr) {
          return res.status(400).json({
            success: false,
            message: uploadErr.message || 'Image upload failed',
          });
        }
      }
      const updated = await ModuleCategoryModel.update(categoryUuid, payload);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Module category not found',
        });
      }
      return res.json({
        success: true,
        message: 'Module category updated successfully',
        data: updated,
      });
    } catch (error) {
      console.error('[ModuleCategory] Update category error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update module category',
      });
    }
  }

  /**
   * DELETE /api/v1/module-categories/:categoryUuid - delete category (admin only)
   */
  async deleteCategory(req, res) {
    try {
      const { categoryUuid } = req.params;
      const deleted = await ModuleCategoryModel.delete(categoryUuid);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Module category not found',
        });
      }
      return res.json({
        success: true,
        message: 'Module category deleted successfully',
      });
    } catch (error) {
      console.error('[ModuleCategory] Delete category error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete module category',
      });
    }
  }
}

module.exports = new ModuleCategoryController();
