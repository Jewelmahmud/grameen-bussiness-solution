const SafeQuery = require('../utils/safeQuery');

/**
 * Database Model - Handles database-related operations
 */
class DatabaseModel {
  /**
   * Get database health check information
   * @returns {Promise<Object>}
   */
  static async getHealthInfo() {
    const query = 'SELECT NOW() as current_time';
    const result = await SafeQuery.execute(query);

    return {
      currentTime: result.rows[0].current_time
    };
  }

  /**
   * Get all tables in the database
   * @returns {Promise<Array>}
   */
  static async getTables() {
    const query = `
      SELECT 
        schemaname,
        tablename,
        tableowner
      FROM pg_tables 
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, tablename
    `;
    
    const result = await SafeQuery.execute(query);
    return result.rows;
  }

  /**
   * Get all schemas in the database
   * @returns {Promise<Array>}
   */
  static async getSchemas() {
    const query = `
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `;
    
    const result = await SafeQuery.execute(query);
    return result.rows;
  }

  /**
   * Get all extensions in the database
   * @returns {Promise<Array>}
   */
  static async getExtensions() {
    const query = `
      SELECT extname, extversion 
      FROM pg_extension
      ORDER BY extname
    `;
    
    const result = await SafeQuery.execute(query);
    return result.rows;
  }

  /**
   * Get complete database information
   * @returns {Promise<Object>}
   */
  static async getDatabaseInfo() {
    const [tables, schemas, extensions] = await Promise.all([
      this.getTables(),
      this.getSchemas(),
      this.getExtensions()
    ]);

    return {
      schemas,
      tables,
      extensions,
      totalTables: tables.length,
      totalSchemas: schemas.length
    };
  }
}

module.exports = DatabaseModel;

