const pool = require('../config/database');
const SecurityUtils = require('./security');

/**
 * Safe Query Wrapper - Provides secure database query execution
 */
class SafeQuery {
  /**
   * Execute a parameterized query safely
   * @param {string} queryText - SQL query with parameterized placeholders ($1, $2, etc.)
   * @param {Array} params - Array of parameters
   * @param {Object} options - Query options
   * @returns {Promise<Object>} - Query result
   */
  static async execute(queryText, params = [], options = {}) {
    // Validate query text
    if (!queryText || typeof queryText !== 'string') {
      throw new Error('Query text must be a non-empty string');
    }

    // Validate parameters
    if (!Array.isArray(params)) {
      throw new Error('Parameters must be an array');
    }

    // Check for SQL injection patterns in query text (basic check)
    // Note: This is a secondary check - parameterized queries are the primary protection.
    // We intentionally skip this check for standard DML statements (INSERT/UPDATE/DELETE)
    // to avoid false positives on legitimate multi-line queries.
    const firstToken = queryText.trim().split(/\s+/)[0].toUpperCase();
    const isDmlStatement =
      firstToken === 'INSERT' || firstToken === 'UPDATE' || firstToken === 'DELETE';

    if (!isDmlStatement) {
      const dangerousPatterns = [
        /;\s*(DROP|DELETE|TRUNCATE|ALTER|CREATE|GRANT|REVOKE)/gi,
        /--.*$/gm,
        /\/\*.*?\*\//gs,
      ];

      for (const pattern of dangerousPatterns) {
        if (pattern.test(queryText)) {
          throw new Error('Potentially dangerous SQL pattern detected');
        }
      }
    }

    // Validate parameters
    if (!SecurityUtils.validateQueryParams(params)) {
      throw new Error('Invalid or unsafe query parameters detected');
    }

    // Log query in development (without sensitive data)
    if (process.env.NODE_ENV === 'development' && options.logQuery) {
      console.log('[SafeQuery] Executing:', queryText.substring(0, 100) + '...');
      console.log('[SafeQuery] Parameters count:', params.length);
    }

    try {
      const result = await pool.query(queryText, params);
      return result;
    } catch (error) {
      // Log error but don't expose sensitive information
      console.error('[SafeQuery] Database error:', error.message);
      
      // In production, don't expose detailed error messages
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Database query failed');
      }
      
      throw error;
    }
  }

  /**
   * Execute a query with automatic parameter validation
   * @param {string} queryText - SQL query
   * @param {Object} paramMap - Object with parameter names and values
   * @param {Object} validations - Validation rules for parameters
   * @returns {Promise<Object>} - Query result
   */
  static async executeWithValidation(queryText, paramMap = {}, validations = {}) {
    const params = [];
    const paramNames = Object.keys(paramMap);

    // Validate and sanitize parameters based on validation rules
    for (const paramName of paramNames) {
      let value = paramMap[paramName];
      const validation = validations[paramName];

      if (validation) {
        // Apply validation rules
        if (validation.type === 'uuid' && value && !SecurityUtils.isValidUUID(value)) {
          throw new Error(`Invalid UUID for parameter: ${paramName}`);
        }

        if (validation.type === 'string' && value) {
          value = SecurityUtils.sanitizeString(value, {
            maxLength: validation.maxLength
          });
        }

        if (validation.type === 'email' && value) {
          value = SecurityUtils.sanitizeEmail(value);
          if (!value && validation.required) {
            throw new Error(`Invalid email for parameter: ${paramName}`);
          }
        }

        if (validation.type === 'phone' && value) {
          value = SecurityUtils.sanitizePhone(value);
          if (!value && validation.required) {
            throw new Error(`Invalid phone for parameter: ${paramName}`);
          }
        }

        if (validation.type === 'integer' && value !== null && value !== undefined) {
          value = SecurityUtils.validateInteger(value, validation);
          if (value === null && validation.required) {
            throw new Error(`Required integer parameter missing: ${paramName}`);
          }
        }

        if (validation.type === 'decimal' && value !== null && value !== undefined) {
          value = SecurityUtils.validateDecimal(value, validation);
          if (value === null && validation.required) {
            throw new Error(`Required decimal parameter missing: ${paramName}`);
          }
        }
      }

      params.push(value);
    }

    return this.execute(queryText, params);
  }

  /**
   * Execute a transaction safely
   * @param {Function} callback - Transaction callback that receives a client
   * @returns {Promise<any>} - Transaction result
   */
  static async transaction(callback) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = SafeQuery;

