const axios = require('axios');
const https = require('https');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');
const BusinessModel = require('../models/BusinessModel');

/**
 * Auth Service - Business logic for authentication
 * Auth server URL is chosen by AUTH_SERVER: STAGING | LOCAL | PROD
 * using AUTH_SERVER_URL_STAGING, AUTH_SERVER_URL_LOCAL, AUTH_SERVER_URL_PROD
 * Set AUTH_SERVER_INSECURE_SSL=true to skip TLS verification (e.g. self-signed cert)
 */
class AuthService {
  constructor() {
    const env = (process.env.AUTH_SERVER || 'LOCAL').toUpperCase();
    const urlMap = {
      STAGING: process.env.AUTH_SERVER_URL_STAGING || 'https://auth.grameenbazaar.com',
      LOCAL: process.env.AUTH_SERVER_URL_LOCAL || 'http://auth_server:5001',
      PROD: process.env.AUTH_SERVER_URL_PROD
    };
    this.authServerUrl = urlMap[env] || urlMap.LOCAL;
    const insecureSSL = process.env.AUTH_SERVER_INSECURE_SSL === 'true' || process.env.AUTH_SERVER_INSECURE_SSL === '1';
    this.axiosConfig = {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
      ...(this.authServerUrl.startsWith('https://') && insecureSSL && {
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      })
    };
    if (insecureSSL) console.warn('[Auth] AUTH_SERVER_INSECURE_SSL is enabled - TLS verification disabled');
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[Auth] Auth server: ${env} -> ${this.authServerUrl}`);
    }
  }

  /** For debugging: which auth server is configured */
  getAuthConfig() {
    const env = (process.env.AUTH_SERVER || 'LOCAL').toUpperCase();
    return {
      authServer: env,
      authServerUrl: this.authServerUrl,
      loginUrl: `${this.authServerUrl}/oauth/login`
    };
  }

  /**
   * Login user via auth server
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User and tokens
   */
  async login(email, password) {
    if (!email || !password) {
      throw new Error('ইমেইল এবং পাসওয়ার্ড প্রয়োজন');
    }

    const loginUrl = `${this.authServerUrl}/oauth/login`;

    console.log(`[Auth] Forwarding login request to: ${loginUrl}`);
    console.log(`[Auth] Login attempt for email: ${email}`);

    try {
      const authResponse = await axios.post(loginUrl, {
        email,
        password
      }, { ...this.axiosConfig, timeout: 10000 });
      
      console.log(`[Auth] Login response status: ${authResponse.status}`);

      if (authResponse.data && authResponse.data.success) {
        const user = authResponse.data.user;
        
        // Cache user info in database (non-blocking)
        if (user && user.id) {
          try {
            await UserModel.upsertUserCache(user);
          } catch (dbError) {
            // Log error but don't fail the login
            console.error('[Auth] Error caching user info:', dbError.message);
          }
        }

        // Fetch tenant_uuid, business_type_uuid and whether user already has a business (non-blocking)
        let tenantUuid = null;
        let businessTypeUuid = null;
        let hasBusiness = false;

        if (user && user.id) {
          try {
            // Extract company_id from user roles
            let companyId = null;
            if (user.roles && user.roles.length > 0) {
              const firstRole = user.roles[0];
              companyId = firstRole.assignment?.companyId || firstRole.company?.id || null;
            }

            const userId = user.id;

            // Get tenant details
            const tenantDetails = await BusinessModel.getTenantDetails(companyId, userId);

            if (tenantDetails) {
              tenantUuid      = tenantDetails.tenant?.tenant_uuid || null;
              businessTypeUuid = tenantDetails.business?.business_type_uuid || null;
              hasBusiness     = !!tenantDetails.business?.business_uuid;

              console.log(`[Auth] Retrieved tenant details for user ${userId}:`, {
                tenant_uuid: tenantUuid,
                business_type_uuid: businessTypeUuid,
                has_business: hasBusiness
              });
            } else {
              console.log(`[Auth] No tenant details found for user ${userId}`);
            }
          } catch (tenantError) {
            // Log error but don't fail the login
            console.error('[Auth] Error fetching tenant details:', tenantError.message);
          }
        }

        // Only expose tenant_uuid to marketplace roles; others see null.
        const roles = Array.isArray(user?.roles) ? user.roles : [];
        const roleNames = roles
          .map((r) => r && (r.name || r.roleName || r.code || r.slug))
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        const hasMarketplaceRole =
          roleNames.includes('grameen_bazaar_vendor') ||
          roleNames.includes('grameen_bazaar_tenant');

        const exposedTenantUuid = hasMarketplaceRole ? tenantUuid : null;
        const exposedHasBusiness = hasMarketplaceRole ? hasBusiness : false;

        return {
          success: true,
          user: authResponse.data.user,
          tokens: authResponse.data.tokens,
          tenant_uuid: exposedTenantUuid,
          business_type_uuid: businessTypeUuid,
          has_business: exposedHasBusiness,
          message: authResponse.data.message || 'লগইন সফল'
        };
      } else {
        throw new Error('ভুল ইমেইল বা পাসওয়ার্ড');
      }
    } catch (error) {
      // Handle axios errors
      if (error.response) {
        // Auth server returned an error response - forward as-is to frontend
        const statusCode = error.response.status || 401;
        const responseData = error.response.data;
        const message = typeof responseData?.message === 'string'
          ? responseData.message
          : (responseData?.error && typeof responseData.error.message === 'string')
            ? responseData.error.message
            : 'লগইন ব্যর্থ হয়েছে';

        // Log detailed error information
        console.error('[Auth] Login error response:', {
          status: statusCode,
          statusText: error.response.statusText,
          data: responseData,
          headers: error.response.headers
        });

        const err = new Error(message);
        err.statusCode = statusCode;
        err.authResponse = responseData; // Full auth server response to forward
        throw err;
      } else if (error.request) {
        // Request was made but no response received (network/DNS/SSL/timeout)
        console.error('[Auth] Login request failed - no response from auth server:', {
          url: loginUrl,
          code: error.code || 'UNKNOWN',
          message: error.message
        });
        const err = new Error('অনুমোদন সার্ভারের সাথে সংযোগ করতে ব্যর্থ');
        err.statusCode = 503;
        throw err;
      } else {
        // Error setting up the request
        console.error('[Auth] Login setup error:', error.message);
        const err = new Error(error.message || 'সার্ভার ত্রুটি');
        err.statusCode = 500;
        throw err;
      }
    }
  }

  /**
   * Refresh access token via auth server
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - New tokens
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('রিফ্রেশ টোকেন প্রয়োজন');
    }

    const refreshUrl = `${this.authServerUrl}/oauth/refresh`;

    console.log(`[Auth] Forwarding refresh token request to: ${refreshUrl}`);

    try {
      const authResponse = await axios.post(refreshUrl, {
        refreshToken
      }, { ...this.axiosConfig, timeout: 10000 });

      if (authResponse.data && authResponse.data.success) {
        return {
          success: true,
          tokens: authResponse.data.tokens,
          message: authResponse.data.message || 'টোকেন রিফ্রেশ সফল'
        };
      } else {
        throw new Error('টোকেন রিফ্রেশ ব্যর্থ হয়েছে');
      }
    } catch (error) {
      // Handle axios errors
      if (error.response) {
        // Auth server returned an error response
        const statusCode = error.response.status || 401;
        const message = error.response.data?.message || 'টোকেন রিফ্রেশ ব্যর্থ হয়েছে';
        const err = new Error(message);
        err.statusCode = statusCode;
        throw err;
      } else if (error.request) {
        // Request was made but no response received
        const err = new Error('অনুমোদন সার্ভারের সাথে সংযোগ করতে ব্যর্থ');
        err.statusCode = 503;
        throw err;
      } else {
        // Error setting up the request
        const err = new Error(error.message || 'সার্ভার ত্রুটি');
        err.statusCode = 500;
        throw err;
      }
    }
  }

  /**
   * Register user via auth server
   * @param {Object} registrationData - Registration data
   * @returns {Promise<Object>} - Registration response
   */
  async register(registrationData) {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      applicationId,
      roleName = 'grameen_bazaar_vendor'
    } = registrationData;

    if (!firstName || !lastName || !email || !phone || !password) {
      throw new Error('সমস্ত প্রয়োজনীয় তথ্য প্রদান করুন');
    }

    const registerUrl = `${this.authServerUrl}/oauth/register`;

    console.log(`[Auth] Forwarding registration request to: ${registerUrl}`);

    try {
      // Build payload expected by auth server
      const payload = {
        phone,
        email,
        password,
        firstName,
        lastName,
        documents: [] // Initially no documents
      };

      // Forward optional fields only if provided
      if (applicationId) {
        payload.applicationId = applicationId;
      }

      if (roleName) {
        payload.roleName = roleName;
      }

      const authResponse = await axios.post(registerUrl, payload, this.axiosConfig);

      if (authResponse.data && authResponse.data.success) {
        const userData = authResponse.data.data;

        // Cache user info in database (non-blocking)
        if (userData && userData.id) {
          try {
            await UserModel.upsertUserCache({
              id: userData.id,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              phone: userData.phone,
              isStaff: userData.isStaff || false,
              status: userData.status || 'ACTIVE',
              roles: userData.roles || []
            });
          } catch (dbError) {
            // Log error but don't fail the registration
            console.error('[Auth] Error caching user info:', dbError.message);
          }
        }

        return {
          success: true,
          data: userData,
          message: authResponse.data.message || 'নিবন্ধন সফল'
        };
      } else {
        throw new Error('নিবন্ধন ব্যর্থ হয়েছে');
      }
    } catch (error) {
      // Handle axios errors
      if (error.response) {
        // Auth server returned an error response
        const statusCode = error.response.status || 400;
        const responseData = error.response.data;

        // Normalise auth server error into a readable message
        let message = 'নিবন্ধন ব্যর্থ হয়েছে';

        if (responseData) {
          if (typeof responseData.message === 'string') {
            message = responseData.message;
          } else if (responseData.error) {
            if (typeof responseData.error === 'string') {
              message = responseData.error;
            } else if (typeof responseData.error.message === 'string') {
              message = responseData.error.message;
            } else {
              // Fallback: stringify error object so user sees something useful
              try {
                message = JSON.stringify(responseData.error);
              } catch {
                message = 'নিবন্ধন ব্যর্থ হয়েছে';
              }
            }
          }
        }

        // Log detailed error information from auth server
        console.error('[Auth] Registration error response:', {
          status: statusCode,
          statusText: error.response.statusText,
          data: responseData,
          headers: error.response.headers
        });

        const err = new Error(message);
        err.statusCode = statusCode;
        throw err;
      } else if (error.request) {
        // Request was made but no response received
        const err = new Error('অনুমোদন সার্ভারের সাথে সংযোগ করতে ব্যর্থ');
        err.statusCode = 503;
        throw err;
      } else {
        // Error setting up the request
        const err = new Error(error.message || 'সার্ভার ত্রুটি');
        err.statusCode = 500;
        throw err;
      }
    }
  }

  /**
   * Forward request to auth server and handle errors consistently
   * @param {string} url - Auth server URL
   * @param {Object} payload - Request payload
   * @param {string} defaultErrorMsg - Default error message
   * @returns {Promise<Object>} - Auth server response
   */
  async _forwardToAuthServer(url, payload, defaultErrorMsg = 'অনুরোধ ব্যর্থ হয়েছে') {
    console.log(`[Auth] Forwarding request to: ${url}`);
    try {
      const authResponse = await axios.post(url, payload, this.axiosConfig);
      if (authResponse.data && authResponse.data.success) {
        return authResponse.data;
      }
      throw new Error(authResponse.data?.message || defaultErrorMsg);
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status || 400;
        const responseData = error.response.data;
        let message = defaultErrorMsg;
        if (responseData) {
          if (typeof responseData.message === 'string') message = responseData.message;
          else if (responseData.error) {
            if (typeof responseData.error === 'string') message = responseData.error;
            else if (typeof responseData.error.message === 'string') message = responseData.error.message;
          }
        }
        console.error('[Auth] Auth server error:', { status: statusCode, data: responseData });
        const err = new Error(message);
        err.statusCode = statusCode;
        throw err;
      }
      if (error.request) {
        console.error('[Auth] Auth server request failed - no response:', {
          url,
          code: error.code || 'UNKNOWN',
          message: error.message
        });
        const err = new Error('অনুমোদন সার্ভারের সাথে সংযোগ করতে ব্যর্থ');
        err.statusCode = 503;
        throw err;
      }
      throw error;
    }
  }

  /**
   * Verify email via auth server
   * @param {string} token - Email verification token
   * @returns {Promise<Object>} - Verification response
   */
  async verifyEmail(token) {
    if (!token) throw new Error('ভেরিফিকেশন টোকেন প্রয়োজন');
    const url = `${this.authServerUrl}/oauth/verify-email`;
    return this._forwardToAuthServer(url, { token }, 'ইমেইল ভেরিফিকেশন ব্যর্থ হয়েছে');
  }

  /**
   * Verify phone via auth server
   * @param {string} phone - Phone number
   * @param {string} code - Verification code
   * @returns {Promise<Object>} - Verification response
   */
  async verifyPhone(phone, code) {
    if (!phone || !code) throw new Error('ফোন নম্বর এবং ভেরিফিকেশন কোড প্রয়োজন');
    const url = `${this.authServerUrl}/oauth/verify-phone`;
    return this._forwardToAuthServer(url, { phone, code }, 'ফোন ভেরিফিকেশন ব্যর্থ হয়েছে');
  }

  /**
   * Resend verification code via auth server
   * @param {Object} data - { type: 'email'|'phone', email?, phone? }
   * @returns {Promise<Object>} - Resend response
   */
  async resendVerification(data) {
    const { type, email, phone } = data;
    if (!type) throw new Error('টাইপ (email বা phone) প্রয়োজন');
    const url = `${this.authServerUrl}/oauth/resend-verification`;
    return this._forwardToAuthServer(url, { type, email, phone }, 'ভেরিফিকেশন কোড পুনরায় পাঠানো ব্যর্থ হয়েছে');
  }

  /**
   * Get users from auth server for a single fixed company (GRAMEEN_BAZAAR_ID).
   * Mirrors auth server GET /api/v1/users but always injects companyId from env.
   *
   * @param {Object} query - { status?, emailVerified?, includeCompanies?, page?, search?, limit? }
   * @param {string} accessToken - Optional bearer token for auth server
   */
  async getUsersForGrameenBazaar(query = {}, accessToken) {
    const companyId = process.env.GRAMEEN_BAZAAR_ID;
    if (!companyId) {
      const err = new Error('GRAMEEN_BAZAAR_ID is not configured on the server');
      err.statusCode = 500;
      throw err;
    }

    const url = `${this.authServerUrl}/api/v1/users`;

    const params = {
      companyId,
      status: query.status,
      emailVerified: query.emailVerified,
      includeCompanies: query.includeCompanies,
      page: query.page,
      search: query.search,
      limit: query.limit,
    };

    try {
      const response = await axios.get(url, {
        ...this.axiosConfig,
        headers: {
          ...this.axiosConfig.headers,
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        params,
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status || 400;
        const responseData = error.response.data;
        const message =
          (responseData && (responseData.message || responseData.error)) ||
          'ব্যবহারকারী তালিকা লোড করতে ব্যর্থ';
        const err = new Error(message);
        err.statusCode = statusCode;
        err.authResponse = responseData;
        throw err;
      }

      if (error.request) {
        const err = new Error('অনুমোদন সার্ভারের সাথে সংযোগ করতে ব্যর্থ');
        err.statusCode = 503;
        throw err;
      }

      throw error;
    }
  }

  /**
   * Get a single user by id from auth server.
   * GET {{authServerUrl}}/api/v1/users/{{userId}}
   *
   * @param {string} userId - User UUID
   * @param {string} accessToken - Bearer token for auth server
   * @returns {Promise<Object>} - User object { id, email, firstName, lastName, phone, isStaff, status, roles }
   */
  async getUserById(userId, accessToken) {
    if (!userId) {
      const err = new Error('User ID is required');
      err.statusCode = 400;
      throw err;
    }
    if (!accessToken) {
      const err = new Error('Authorization token is required to fetch user details');
      err.statusCode = 401;
      throw err;
    }

    const base = this.authServerUrl.replace(/\/$/, '');
    const url = `${base}/api/v1/users/${userId}`;

    try {
      const response = await axios.get(url, {
        ...this.axiosConfig,
        headers: {
          ...this.axiosConfig.headers,
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      });

      const data = response.data;
      if (!data || !data.success || !data.data) {
        const err = new Error(data?.message || 'User not found');
        err.statusCode = 404;
        throw err;
      }

      const user = data.data;
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phone: user.phone ?? null,
        avatar: user.avatar ?? user.avatarUrl ?? null,
        isStaff: user.isStaff ?? false,
        status: user.status || 'ACTIVE',
        roles: user.roles || [],
      };
    } catch (error) {
      if (error.statusCode) throw error;
      if (error.response) {
        const statusCode = error.response.status || 404;
        const responseData = error.response.data;
        const message =
          (responseData && (responseData.message || responseData.error)) ||
          'User not found';
        const err = new Error(message);
        err.statusCode = statusCode;
        err.authResponse = responseData;
        throw err;
      }
      if (error.request) {
        const err = new Error('অনুমোদন সার্ভারের সাথে সংযোগ করতে ব্যর্থ');
        err.statusCode = 503;
        throw err;
      }
      throw error;
    }
  }

  /**
   * Get current user from auth server using access token.
   * Used by middleware to populate req.user for protected routes.
   *
   * Path: AUTH_ME_PATH env (default /oauth/me) → GET {authServerUrl}{AUTH_ME_PATH}
   * Supports auth server response: { success: true, data: { id, email, firstName, lastName, roles, ... } }.
   * Also accepts: { user }, { data: user }, { success, user }.
   *
   * @param {string} accessToken - Access token
   * @returns {Promise<Object>} - User object (with id and roles)
   */
  async getProfile(accessToken) {
    if (!accessToken) {
      const err = new Error('অনুমোদন টোকেন প্রয়োজন');
      err.statusCode = 401;
      throw err;
    }

    const mePath = (process.env.AUTH_ME_PATH || '/oauth/me').replace(/^\//, '');
    const base = this.authServerUrl.replace(/\/$/, '');
    const url = `${base}/${mePath}`;

    try {
      const authResponse = await axios.get(url, {
        ...this.axiosConfig,
        headers: { ...this.axiosConfig.headers, Authorization: `Bearer ${accessToken}` },
        timeout: 10000
      });

      const data = authResponse.data;
      if (!data) {
        const err = new Error('ব্যবহারকারী তথ্য পাওয়া যায়নি');
        err.statusCode = 401;
        throw err;
      }

      // Auth server shape: { success: true, data: { id, email, firstName, lastName, roles, ... } }
      let user = null;
      if (data.success && data.data && typeof data.data === 'object') {
        user = data.data.user != null ? data.data.user : data.data;
      }
      if (!user) {
        user = data.user || (data.data && typeof data.data === 'object' && (data.data.user || data.data)) || data.data;
      }

      if (user && typeof user === 'object' && (user.id != null || user.user_uuid != null)) {
        if (user.user_uuid != null && user.id == null) user.id = user.user_uuid;
        return user;
      }

      const err = new Error('ব্যবহারকারী তথ্য পাওয়া যায়নি');
      err.statusCode = 401;
      throw err;
    } catch (error) {
      if (error.statusCode) throw error;
      if (error.response) {
        const statusCode = error.response.status || 401;
        const message = error.response.data?.message || error.response.data?.error || 'টোকেন অকার্যকর বা মেয়াদ উত্তীর্ণ';
        const err = new Error(message);
        err.statusCode = statusCode;
        throw err;
      }
      if (error.request) {
        const err = new Error('অনুমোদন সার্ভারের সাথে সংযোগ করতে ব্যর্থ');
        err.statusCode = 503;
        throw err;
      }
      throw error;
    }
  }

  /**
   * Logout user via auth server
   * @param {string} accessToken - Access token
   * @returns {Promise<Object>} - Logout response
   */
  async logout(accessToken) {
    if (!accessToken) {
      throw new Error('অনুমোদন টোকেন প্রয়োজন');
    }

    const logoutUrl = `${this.authServerUrl}/oauth/logout`;

    console.log(`[Auth] Forwarding logout request to: ${logoutUrl}`);

    try {
      const authResponse = await axios.post(logoutUrl, {}, {
        ...this.axiosConfig,
        headers: { ...this.axiosConfig.headers, 'Authorization': `Bearer ${accessToken}` },
        timeout: 10000
      });

      if (authResponse.data && authResponse.data.success) {
        return {
          success: true,
          message: authResponse.data.message || 'লগআউট সফল'
        };
      } else {
        throw new Error('লগআউট ব্যর্থ হয়েছে');
      }
    } catch (error) {
      // Handle axios errors
      if (error.response) {
        // Auth server returned an error response
        const statusCode = error.response.status || 401;
        const message = error.response.data?.message || 'লগআউট ব্যর্থ হয়েছে';
        const err = new Error(message);
        err.statusCode = statusCode;
        throw err;
      } else if (error.request) {
        // Request was made but no response received
        const err = new Error('অনুমোদন সার্ভারের সাথে সংযোগ করতে ব্যর্থ');
        err.statusCode = 503;
        throw err;
      } else {
        // Error setting up the request
        const err = new Error(error.message || 'সার্ভার ত্রুটি');
        err.statusCode = 500;
        throw err;
      }
    }
  }
}

module.exports = new AuthService();

