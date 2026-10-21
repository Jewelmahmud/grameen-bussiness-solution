const DatabaseModel = require('../models/DatabaseModel');

/**
 * Database Controller - Handles database info requests
 */
class DbController {
  /**
   * Get database information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getInfo(req, res) {
    try {
      const dbInfo = await DatabaseModel.getDatabaseInfo();

      res.json({
        schemas: dbInfo.schemas,
        tables: dbInfo.tables,
        extensions: dbInfo.extensions,
        total_tables: dbInfo.totalTables,
        total_schemas: dbInfo.totalSchemas
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  }
}

module.exports = new DbController();

