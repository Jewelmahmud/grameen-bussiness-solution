/**
 * Security Utilities - SQL Injection Protection, Input Sanitization, and Security Helpers
 */

/**
 * SQL Injection Protection Utilities
 */
class SecurityUtils {
  /**
   * Validate and sanitize UUID format
   * @param {string} uuid - UUID string to validate
   * @returns {boolean} - True if valid UUID
   */
  static isValidUUID(uuid) {
    if (!uuid || typeof uuid !== 'string') {
      return false;
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Sanitize string input - Remove SQL injection patterns
   * @param {string} input - Input string to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} - Sanitized string
   */
  static sanitizeString(input, options = {}) {
    if (input === null || input === undefined) {
      return null;
    }

    if (typeof input !== 'string') {
      throw new Error('Input must be a string');
    }

    let sanitized = input.trim();

    // Remove SQL injection patterns
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
      /(--|#|\/\*|\*\/|;)/g,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi,
      /(\bOR\b|\bAND\b)\s+['"]\w+['"]\s*=\s*['"]\w+['"]/gi,
      /(\bUNION\b.*\bSELECT\b)/gi,
      /(\bEXEC\b|\bEXECUTE\b)/gi,
      /(\bSCRIPT\b)/gi,
      /(<script|<\/script>)/gi,
      /(javascript:)/gi,
      /(on\w+\s*=)/gi
    ];

    sqlPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '');
    });

    // Limit length if specified
    if (options.maxLength && sanitized.length > options.maxLength) {
      sanitized = sanitized.substring(0, options.maxLength);
    }

    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');

    return sanitized;
  }

  /**
   * Sanitize object recursively
   * @param {Object} obj - Object to sanitize
   * @param {Object} options - Sanitization options
   * @param {string[]} options.sensitiveKeys - Keys to exclude from SQL pattern sanitization (e.g. password)
   * @returns {Object} - Sanitized object
   */
  static sanitizeObject(obj, options = {}, currentKey = null) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, options, currentKey));
    }

    if (typeof obj === 'string') {
      const sensitiveKeys = options.sensitiveKeys || ['password', 'confirmPassword', 'refreshToken', 'token', 'code', 'phone'];
      const isSensitive = currentKey && sensitiveKeys.some(
        sk => typeof sk === 'string' && currentKey.toLowerCase() === sk.toLowerCase()
      );
      if (isSensitive) {
        // Only remove null bytes - do not strip #, --, ; etc. (passwords can contain these)
        return obj.replace(/\0/g, '');
      }
      return this.sanitizeString(obj, options);
    }

    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = this.sanitizeString(key, options);
        sanitized[sanitizedKey] = this.sanitizeObject(value, options, key);
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Validate and sanitize email
   * @param {string} email - Email to validate
   * @returns {string|null} - Sanitized email or null if invalid
   */
  static sanitizeEmail(email) {
    if (!email || typeof email !== 'string') {
      return null;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = email.trim().toLowerCase();

    if (!emailRegex.test(sanitized)) {
      return null;
    }

    // Additional security: remove potentially dangerous characters
    return sanitized.replace(/[<>\"'%;()&+]/g, '');
  }

  /**
   * Validate and sanitize phone number
   * @param {string} phone - Phone number to validate
   * @returns {string|null} - Sanitized phone or null if invalid
   */
  static sanitizePhone(phone) {
    if (!phone || typeof phone !== 'string') {
      return null;
    }

    // Remove all non-digit characters except + at the start
    let sanitized = phone.trim();
    if (sanitized.startsWith('+')) {
      sanitized = '+' + sanitized.substring(1).replace(/\D/g, '');
    } else {
      sanitized = sanitized.replace(/\D/g, '');
    }

    // Validate length (typically 10-15 digits)
    if (sanitized.length < 10 || sanitized.length > 15) {
      return null;
    }

    return sanitized;
  }

  /**
   * Validate integer input
   * @param {any} value - Value to validate
   * @param {Object} options - Validation options
   * @returns {number|null} - Validated integer or null
   */
  static validateInteger(value, options = {}) {
    if (value === null || value === undefined) {
      return options.default || null;
    }

    const num = parseInt(value, 10);
    if (isNaN(num)) {
      return options.default || null;
    }

    if (options.min !== undefined && num < options.min) {
      return options.default || null;
    }

    if (options.max !== undefined && num > options.max) {
      return options.default || null;
    }

    return num;
  }

  /**
   * Validate decimal/number input
   * @param {any} value - Value to validate
   * @param {Object} options - Validation options
   * @returns {number|null} - Validated number or null
   */
  static validateDecimal(value, options = {}) {
    if (value === null || value === undefined) {
      return options.default || null;
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      return options.default || null;
    }

    if (options.min !== undefined && num < options.min) {
      return options.default || null;
    }

    if (options.max !== undefined && num > options.max) {
      return options.default || null;
    }

    if (options.precision !== undefined) {
      return parseFloat(num.toFixed(options.precision));
    }

    return num;
  }

  /**
   * Validate date input
   * @param {any} value - Value to validate
   * @returns {Date|null} - Validated date or null
   */
  static validateDate(value) {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }

    return date;
  }

  /**
   * Validate SQL identifier (table name, column name, schema name)
   * Prevents SQL injection through identifier injection
   * @param {string} identifier - Identifier to validate
   * @returns {boolean} - True if valid identifier
   */
  static isValidSQLIdentifier(identifier) {
    if (!identifier || typeof identifier !== 'string') {
      return false;
    }

    // PostgreSQL identifier rules: alphanumeric, underscore, and dots (for schema.table)
    // Must start with letter or underscore
    const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_.]*$/;
    
    if (!identifierRegex.test(identifier)) {
      return false;
    }

    // Additional check: prevent SQL keywords
    const sqlKeywords = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
      'EXEC', 'EXECUTE', 'UNION', 'SCRIPT', 'TRUNCATE', 'GRANT', 'REVOKE'
    ];

    const upperIdentifier = identifier.toUpperCase();
    if (sqlKeywords.includes(upperIdentifier)) {
      return false;
    }

    return true;
  }

  /**
   * Escape SQL identifier (for dynamic table/column names)
   * WARNING: Only use when absolutely necessary, prefer parameterized queries
   * @param {string} identifier - Identifier to escape
   * @returns {string} - Escaped identifier
   */
  static escapeSQLIdentifier(identifier) {
    if (!this.isValidSQLIdentifier(identifier)) {
      throw new Error(`Invalid SQL identifier: ${identifier}`);
    }

    // PostgreSQL uses double quotes for identifiers
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  /**
   * Validate query parameters array
   * Ensures all parameters are safe for parameterized queries
   * @param {Array} params - Parameters array
   * @returns {boolean} - True if all parameters are safe
   */
  static validateQueryParams(params) {
    if (!Array.isArray(params)) {
      return false;
    }

    for (const param of params) {
      // Check for null bytes
      if (typeof param === 'string' && param.includes('\0')) {
        return false;
      }

      // Check for suspicious patterns in strings
      if (typeof param === 'string') {
        const suspiciousPatterns = [
          /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION)\b)/gi,
          /(--|#|\/\*|\*\/)/g,
          /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi
        ];

        for (const pattern of suspiciousPatterns) {
          if (pattern.test(param)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Sanitize file name to prevent path traversal
   * @param {string} filename - File name to sanitize
   * @returns {string} - Sanitized file name
   */
  static sanitizeFileName(filename) {
    if (!filename || typeof filename !== 'string') {
      return '';
    }

    // Remove path traversal patterns
    let sanitized = filename.replace(/\.\./g, '');
    sanitized = sanitized.replace(/[\/\\]/g, '');
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // Remove dangerous characters
    sanitized = sanitized.replace(/[<>:"|?*\x00-\x1f]/g, '');

    return sanitized.trim();
  }

  /**
   * Validate and sanitize URL
   * @param {string} url - URL to validate
   * @returns {string|null} - Sanitized URL or null if invalid
   */
  static sanitizeURL(url) {
    if (!url || typeof url !== 'string') {
      return null;
    }

    try {
      const urlObj = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return null;
      }

      return urlObj.toString();
    } catch (e) {
      return null;
    }
  }

  /**
   * Check for XSS patterns in input
   * @param {string} input - Input to check
   * @returns {boolean} - True if XSS pattern detected
   */
  static hasXSSPattern(input) {
    if (!input || typeof input !== 'string') {
      return false;
    }

    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<img[^>]*src[^>]*=.*javascript:/gi,
      /<svg[^>]*onload/gi,
      /<body[^>]*onload/gi
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Sanitize HTML to prevent XSS
   * @param {string} html - HTML string to sanitize
   * @returns {string} - Sanitized HTML
   */
  static sanitizeHTML(html) {
    if (!html || typeof html !== 'string') {
      return '';
    }

    // Remove script tags and event handlers
    let sanitized = html
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/on\w+\s*=\s*[^\s>]*/gi, '');

    return sanitized;
  }

  /**
   * Validate request rate limit key
   * @param {string} key - Rate limit key (usually IP or user ID)
   * @returns {boolean} - True if valid
   */
  static isValidRateLimitKey(key) {
    if (!key || typeof key !== 'string') {
      return false;
    }

    // Allow UUIDs, IPs, and alphanumeric strings
    const keyRegex = /^[a-zA-Z0-9.:\-_]+$/;
    return keyRegex.test(key) && key.length <= 100;
  }
}

module.exports = SecurityUtils;

