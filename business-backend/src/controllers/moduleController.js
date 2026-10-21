const ModuleModel = require('../models/ModuleModel');
const SafeQuery = require('../utils/safeQuery');

/**
 * Module Controller - Resource endpoints for core.modules
 * Admin: full CRUD. Other roles: read-only.
 */
class ModuleController {
  /**
   * GET /api/v1/modules - list all modules
   */
  async getModules(req, res) {
    try {
      const isActive = req.query.is_active;
      const categoryUuid = req.query.category_uuid || req.query.categoryUuid;
      const options = {};
      if (isActive !== undefined) {
        options.is_active = isActive === 'true' || isActive === true;
      }
      if (categoryUuid) {
        options.category_uuid = categoryUuid;
      }
      const list = await ModuleModel.getAll(options);
      return res.json({
        success: true,
        data: list,
      });
    } catch (error) {
      console.error('[Module] Get modules error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load modules',
      });
    }
  }

  /**
   * GET /api/v1/modules/:moduleUuid - get one module
   */
  async getModule(req, res) {
    try {
      const { moduleUuid } = req.params;
      const module = await ModuleModel.getByUuid(moduleUuid);
      if (!module) {
        return res.status(404).json({
          success: false,
          message: 'Module not found',
        });
      }
      return res.json({
        success: true,
        data: module,
      });
    } catch (error) {
      console.error('[Module] Get module error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load module',
      });
    }
  }

  /**
   * POST /api/v1/modules - create module (admin only)
   */
  async createModule(req, res) {
    try {
      const payload = req.body || {};

      // Optional: parent module UUID this module depends on
      const parentModuleUuid = payload.parent_module_uuid || payload.parentModuleUuid || null;

      const created = await ModuleModel.create(payload);

      // If parent module specified, persist in core.module_dependencies
      if (parentModuleUuid) {
        // Prevent self-dependency
        if (created.module_uuid === parentModuleUuid) {
          return res.status(400).json({
            success: false,
            message: 'A module cannot be its own parent. Remove parent_module_uuid.',
          });
        }

        // Ensure parent module exists
        const parentResult = await SafeQuery.execute(
          `
            SELECT module_uuid
            FROM core.modules
            WHERE module_uuid = $1
            LIMIT 1
          `,
          [parentModuleUuid],
        );

        if (parentResult.rowCount === 0) {
          return res.status(400).json({
            success: false,
            message: 'Parent module not found for the given parent_module_uuid.',
          });
        }

        await SafeQuery.execute(
          `
            INSERT INTO core.module_dependencies (module_uuid, depends_on_uuid)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `,
          [created.module_uuid, parentModuleUuid],
        );
      }

      // Return full module with category and parent info (same shape as GET one)
      const full = await ModuleModel.getByUuid(created.module_uuid);
      return res.status(201).json({
        success: true,
        message: 'Module created successfully',
        data: full || created,
      });
    } catch (error) {
      console.error('[Module] Create module error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create module',
      });
    }
  }

  /**
   * PUT /api/v1/modules/:moduleUuid - update module (admin only)
   */
  async updateModule(req, res) {
    try {
      const { moduleUuid } = req.params;
      const payload = req.body || {};

      // Optional: parent module UUID this module depends on
      const parentModuleUuid = payload.parent_module_uuid || payload.parentModuleUuid || null;

      const updated = await ModuleModel.update(moduleUuid, payload);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Module not found',
        });
      }

      if (parentModuleUuid !== null) {
        // Prevent self-dependency
        if (moduleUuid === parentModuleUuid) {
          return res.status(400).json({
            success: false,
            message: 'A module cannot be its own parent. Remove parent_module_uuid.',
          });
        }

        // If parent was explicitly set to null, clear any existing parent row
        if (parentModuleUuid === '' || parentModuleUuid === undefined) {
          await SafeQuery.execute(
            `DELETE FROM core.module_dependencies WHERE module_uuid = $1`,
            [moduleUuid],
          );
        } else {
          // Ensure parent module exists
          const parentResult = await SafeQuery.execute(
            `
              SELECT module_uuid
              FROM core.modules
              WHERE module_uuid = $1
              LIMIT 1
            `,
            [parentModuleUuid],
          );

          if (parentResult.rowCount === 0) {
            return res.status(400).json({
              success: false,
              message: 'Parent module not found for the given parent_module_uuid.',
            });
          }

          // Clear existing parent rows (treat as single parent relationship)
          await SafeQuery.execute(
            `DELETE FROM core.module_dependencies WHERE module_uuid = $1`,
            [moduleUuid],
          );

          await SafeQuery.execute(
            `
              INSERT INTO core.module_dependencies (module_uuid, depends_on_uuid)
              VALUES ($1, $2)
              ON CONFLICT DO NOTHING
            `,
            [moduleUuid, parentModuleUuid],
          );
        }
      }

      // Return full module with category and parent info (same shape as GET one)
      const full = await ModuleModel.getByUuid(moduleUuid);
      return res.json({
        success: true,
        message: 'Module updated successfully',
        data: full || updated,
      });
    } catch (error) {
      console.error('[Module] Update module error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update module',
      });
    }
  }

  /**
   * DELETE /api/v1/modules/:moduleUuid - delete module (admin only)
   */
  async deleteModule(req, res) {
    try {
      const { moduleUuid } = req.params;
      const deleted = await ModuleModel.delete(moduleUuid);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Module not found',
        });
      }
      return res.json({
        success: true,
        message: 'Module deleted successfully',
      });
    } catch (error) {
      console.error('[Module] Delete module error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete module',
      });
    }
  }
}

module.exports = new ModuleController();
