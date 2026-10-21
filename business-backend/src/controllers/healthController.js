const DatabaseModel = require('../models/DatabaseModel');

/**
 * Health Controller - Handles health check requests
 */
class HealthController {
  /**
   * Health check endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async check(req, res) {
    try {
      const healthInfo = await DatabaseModel.getHealthInfo();

      res.json({
        status: 'healthy',
        timestamp: healthInfo.currentTime,
        database: {
          connected: true
        },
        uptime: process.uptime()
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message
      });
    }
  }

  /**
   * API info endpoint
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  info(req, res) {
    res.json({
      message: 'Dokan Inventory Management API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api/v1',
        auth: {
          login: '/api/v1/auth/login',
          register: '/api/v1/auth/register',
          refresh: '/api/v1/auth/refresh',
          logout: '/api/v1/auth/logout'
        },
        registration: {
          business: '/api/v1/registration/business',
          complete: '/api/v1/registration/complete'
        },
        payment: {
          initiate: '/api/v1/payment/initiate',
          success: '/api/v1/payment/success'
        }
      }
    });
  }
}

module.exports = new HealthController();

