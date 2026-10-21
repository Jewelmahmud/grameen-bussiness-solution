const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * User Model - Handles user cache database operations
 */
class UserModel {
  /**
   * Upsert user cache from auth server response
   * @param {Object} user - User object from auth server
   * @returns {Promise<void>}
   */
  static async upsertUserCache(user) {
    if (!user || !user.id) {
      throw new Error('User ID is required');
    }

    // Validate UUID
    if (!SecurityUtils.isValidUUID(user.id)) {
      throw new Error('Invalid user UUID format');
    }

    const userUuid = user.id;
    console.log(`[UserModel] Upserting user cache for user_uuid: ${userUuid}, email: ${user.email}`);

    // Check if user already exists
    const existingUser = await this.getUserByUuid(userUuid);
    if (existingUser) {
      console.log(`[UserModel] User ${userUuid} already exists in cache, will update`);
    } else {
      console.log(`[UserModel] User ${userUuid} not found in cache, will insert`);
    }

    // Extract company_id from roles if available
    const companyId = user.roles && user.roles.length > 0 
      ? (user.roles[0].assignment?.companyId || user.roles[0].company?.id || null)
      : null;

    // Validate company ID if provided
    if (companyId && !SecurityUtils.isValidUUID(companyId)) {
      console.warn(`[UserModel] Invalid company ID format: ${companyId}, ignoring`);
      // Don't throw, just log and continue without company_id
    }

    // Sanitize email
    const sanitizedEmail = SecurityUtils.sanitizeEmail(user.email);
    if (!sanitizedEmail) {
      throw new Error('Invalid email format');
    }

    // Sanitize other string fields
    const sanitizedFirstName = SecurityUtils.sanitizeString(user.firstName || '', { maxLength: 100 });
    const sanitizedLastName = SecurityUtils.sanitizeString(user.lastName || '', { maxLength: 100 });
    const sanitizedPhone = SecurityUtils.sanitizePhone(user.phone);
    const sanitizedStatus = SecurityUtils.sanitizeString(user.status || 'ACTIVE', { maxLength: 50 });
    const avatarRaw = user.avatar ?? user.avatarUrl ?? null;
    const sanitizedAvatar =
      avatarRaw != null && String(avatarRaw).trim() !== ''
        ? (SecurityUtils.sanitizeURL(avatarRaw) || SecurityUtils.sanitizeString(String(avatarRaw), { maxLength: 512 }))
        : null;

    const query = `
      INSERT INTO core.user_cache (
        user_uuid, email, first_name, last_name, phone, avatar,
        is_staff, status, company_id, last_synced_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (user_uuid) 
      DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        avatar = EXCLUDED.avatar,
        is_staff = EXCLUDED.is_staff,
        status = EXCLUDED.status,
        company_id = EXCLUDED.company_id,
        last_synced_at = NOW(),
        updated_at = NOW()
    `;

    const values = [
      userUuid,
      sanitizedEmail,
      sanitizedFirstName,
      sanitizedLastName,
      sanitizedPhone,
      sanitizedAvatar,
      user.isStaff || false,
      sanitizedStatus,
      companyId
    ];

    try {
      const result = await SafeQuery.execute(query, values);
      console.log(`[UserModel] Successfully upserted user cache for ${userUuid}`);
      
      // Verify the upsert worked by checking row count
      if (result.rowCount === 0) {
        console.warn(`[UserModel] Warning: Upsert returned 0 rows affected for ${userUuid}`);
      } else if (result.rowCount === 1) {
        console.log(`[UserModel] Upsert affected 1 row for ${userUuid} (${existingUser ? 'updated' : 'inserted'})`);
      }
      
      return result;
    } catch (error) {
      console.error(`[UserModel] Error upserting user cache for ${userUuid}:`, error.message);
      console.error(`[UserModel] Error details:`, {
        user_uuid: userUuid,
        email: sanitizedEmail,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Get user from cache by UUID
   * @param {string} userUuid - User UUID
   * @returns {Promise<Object|null>}
   */
  static async getUserByUuid(userUuid) {
    // Validate UUID
    if (!SecurityUtils.isValidUUID(userUuid)) {
      throw new Error('Invalid UUID format');
    }

    const query = `
      SELECT * FROM core.user_cache 
      WHERE user_uuid = $1
    `;
    
    const result = await SafeQuery.execute(query, [userUuid]);
    return result.rows[0] || null;
  }

  /**
   * Get user from cache by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>}
   */
  static async getUserByEmail(email) {
    // Sanitize email
    const sanitizedEmail = SecurityUtils.sanitizeEmail(email);
    if (!sanitizedEmail) {
      throw new Error('Invalid email format');
    }

    const query = `
      SELECT * FROM core.user_cache 
      WHERE email = $1
    `;
    
    const result = await SafeQuery.execute(query, [sanitizedEmail]);
    return result.rows[0] || null;
  }
}

module.exports = UserModel;

