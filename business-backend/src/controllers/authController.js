const authService = require('../services/authService');

/**
 * Auth Controller - Handles HTTP requests/responses for authentication
 */
class AuthController {
  /**
   * Debug: show which auth server URL is configured (no auth required)
   */
  authConfig(req, res) {
    return res.json({
      success: true,
      data: authService.getAuthConfig(),
      hint: 'If authServerUrl is wrong or LOCAL, check .env and restart with: docker compose up -d --force-recreate'
    });
  }

  /**
   * Handle login request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);
      return res.json(result);
    } catch (error) {
      console.error('[Auth] Login error:', error.message);
      // Forward auth server error response as-is when available (e.g. VERIFICATION_REQUIRED)
      if (error.authResponse) {
        return res.status(error.statusCode || 500).json(error.authResponse);
      }
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'লগইন ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Handle refresh token request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'রিফ্রেশ টোকেন প্রয়োজন'
        });
      }

      const result = await authService.refreshToken(refreshToken);
      return res.json(result);
    } catch (error) {
      console.error('[Auth] Refresh token error:', error.message);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'টোকেন রিফ্রেশ ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Handle registration request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      const { firstName, lastName, email, phone, password, applicationId } = req.body;

      if (!firstName || !lastName || !email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: 'সমস্ত প্রয়োজনীয় তথ্য প্রদান করুন'
        });
      }
      
      const result = await authService.register({
        firstName,
        lastName,
        email,
        phone,
        password,
        applicationId
      });

      return res.json(result);
    } catch (error) {
      console.error('[Auth] Registration error:', error.message);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'নিবন্ধন ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Handle verify email request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;
      const result = await authService.verifyEmail(token);
      return res.json(result);
    } catch (error) {
      console.error('[Auth] Verify email error:', error.message);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'ইমেইল ভেরিফিকেশন ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Handle verify phone request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyPhone(req, res) {
    try {
      const { phone, code } = req.body;
      const result = await authService.verifyPhone(phone, code);
      return res.json(result);
    } catch (error) {
      console.error('[Auth] Verify phone error:', error.message);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'ফোন ভেরিফিকেশন ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Handle resend verification request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resendVerification(req, res) {
    try {
      const { type, email, phone } = req.body;
      const result = await authService.resendVerification({ type, email, phone });
      return res.json(result);
    } catch (error) {
      console.error('[Auth] Resend verification error:', error.message);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'ভেরিফিকেশন কোড পুনরায় পাঠানো ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Handle logout request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      // Get the access token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'অনুমোদন টোকেন প্রয়োজন'
        });
      }

      const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

      const result = await authService.logout(accessToken);
      return res.json(result);
    } catch (error) {
      console.error('[Auth] Logout error:', error.message);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'লগআউট ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * GET /api/v1/auth/users
   * Proxy to auth server GET /api/v1/users, but always restrict to GRAMEEN_BAZAAR_ID.
   * Accepted query params: status, emailVerified, includeCompanies, page, search, limit.
   */
  async getUsers(req, res) {
    try {
      const query = {
        status: req.query.status,
        emailVerified: req.query.emailVerified,
        includeCompanies: req.query.includeCompanies,
        page: req.query.page,
        search: req.query.search,
        limit: req.query.limit,
      };

      const authHeader = req.headers.authorization || '';
      const accessToken = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;

      const result = await authService.getUsersForGrameenBazaar(query, accessToken);
      return res.json(result);
    } catch (error) {
      console.error('[Auth] Get users error:', error.message);
      if (error.authResponse) {
        return res.status(error.statusCode || 500).json(error.authResponse);
      }
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'ব্যবহারকারী তালিকা লোড করতে ব্যর্থ',
      });
    }
  }
}

module.exports = new AuthController();

