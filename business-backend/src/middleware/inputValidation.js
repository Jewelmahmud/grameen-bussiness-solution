const SecurityUtils = require('../utils/security');

/**
 * Input Validation Middleware
 */
class InputValidation {
  /**
   * Validate request body
   * @param {Object} schema - Validation schema
   * @returns {Function} - Express middleware
   */
  static validate(schema) {
    return (req, res, next) => {
      const errors = [];

      // Validate body
      if (schema.body) {
        const bodyErrors = this.validateObject(req.body, schema.body, 'body');
        errors.push(...bodyErrors);
      }

      // Validate query parameters
      if (schema.query) {
        const queryErrors = this.validateObject(req.query, schema.query, 'query');
        errors.push(...queryErrors);
      }

      // Validate URL parameters
      if (schema.params) {
        const paramsErrors = this.validateObject(req.params, schema.params, 'params');
        errors.push(...paramsErrors);
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }

      next();
    };
  }

  /**
   * Validate object against schema
   * @param {Object} obj - Object to validate
   * @param {Object} schema - Validation schema
   * @param {string} prefix - Error message prefix
   * @returns {Array} - Array of error messages
   */
  static validateObject(obj, schema, prefix = '') {
    const errors = [];

    for (const [key, rules] of Object.entries(schema)) {
      const value = obj[key];
      const fieldPath = prefix ? `${prefix}.${key}` : key;

      // Check required
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${fieldPath} is required`);
        continue;
      }

      // Skip validation if value is optional and not provided
      if (!rules.required && (value === undefined || value === null || value === '')) {
        continue;
      }

      // Type validation
      if (rules.type) {
        if (rules.type === 'uuid' && value && !SecurityUtils.isValidUUID(value)) {
          errors.push(`${fieldPath} must be a valid UUID`);
        }

        if (rules.type === 'email' && value) {
          const sanitized = SecurityUtils.sanitizeEmail(value);
          if (!sanitized) {
            errors.push(`${fieldPath} must be a valid email`);
          }
        }

        if (rules.type === 'phone' && value) {
          const sanitized = SecurityUtils.sanitizePhone(value);
          if (!sanitized) {
            errors.push(`${fieldPath} must be a valid phone number`);
          }
        }

        if (rules.type === 'integer' && value !== null && value !== undefined) {
          const validated = SecurityUtils.validateInteger(value, rules);
          if (validated === null) {
            errors.push(`${fieldPath} must be a valid integer`);
          }
        }

        if (rules.type === 'decimal' && value !== null && value !== undefined) {
          const validated = SecurityUtils.validateDecimal(value, rules);
          if (validated === null) {
            errors.push(`${fieldPath} must be a valid decimal`);
          }
        }

        if (rules.type === 'string' && value !== null && value !== undefined) {
          if (typeof value !== 'string') {
            errors.push(`${fieldPath} must be a string`);
          } else {
            // Check XSS
            if (SecurityUtils.hasXSSPattern(value)) {
              errors.push(`${fieldPath} contains potentially dangerous content`);
            }

            // Check length
            if (rules.minLength && value.length < rules.minLength) {
              errors.push(`${fieldPath} must be at least ${rules.minLength} characters`);
            }

            if (rules.maxLength && value.length > rules.maxLength) {
              errors.push(`${fieldPath} must be at most ${rules.maxLength} characters`);
            }
          }
        }
      }

      // Custom validation
      if (rules.custom && typeof rules.custom === 'function') {
        try {
          const customResult = rules.custom(value);
          if (customResult !== true) {
            errors.push(customResult || `${fieldPath} validation failed`);
          }
        } catch (error) {
          errors.push(`${fieldPath} validation error: ${error.message}`);
        }
      }
    }

    return errors;
  }

  /**
   * Sanitize request body
   * @returns {Function} - Express middleware
   */
  static sanitize() {
    return (req, res, next) => {
      if (req.body) {
        req.body = SecurityUtils.sanitizeObject(req.body, {
          maxLength: 10000 // Default max length
        });
      }

      if (req.query) {
        req.query = SecurityUtils.sanitizeObject(req.query);
      }

      next();
    };
  }
}

module.exports = InputValidation;

