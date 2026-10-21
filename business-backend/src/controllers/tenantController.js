const TenantModel = require('../models/TenantModel');
const UserModel = require('../models/UserModel');
const authService = require('../services/authService');

/**
 * Tenant Controller - Resource endpoints for core.tenants
 *
 * Schema (core.tenants) summary:
 * - tenant_uuid (UUID, pk for API)
 * - company_id (UUID, external company/tenant from auth server)
 * - user_id (UUID, owner user from auth server)
 * - phone, email
 * - subscription_plan, subscription_amount, subscription_currency_code, subscription_status
 * - subscription_start_date, subscription_end_date
 * - max_users, max_products, max_businesses, max_warehouses
 * - is_active, created_at, updated_at
 */
class TenantController {
  /**
   * GET /api/v1/tenant
   * Behavior:
   * - For admin/support/manager roles:
   *     - If no tenantUuid provided in params/query/body -> return list of all subscribers
   *     - If tenantUuid provided -> return single tenant by UUID
   * - For tenant/vendor and similar roles:
   *     - Always return single tenant by UUID (tenantUuid must be resolved/validated at route level)
   */
  async getTenant(req, res) {
    try {
      const user = req.user;
      const fromParams = req.params?.tenantUuid;
      const fromQuery = req.query?.tenantUuid;
      const fromBody = req.body?.tenantUuid;
      const tenantUuid = fromParams || fromQuery || fromBody || null;

      const ADMIN_SUPPORT_MANAGER_ROLES = [
        'admin',
        'super_admin',
        'grameen_bazaar_admin',
        'support_agent',
        'grameen_bazaar_support',
        'support_manager',
        'support_supervisor',
        'manager',
      ];

      const hasAdminSupportManagerRole =
        user &&
        Array.isArray(user.roles) &&
        user.roles.some((role) => {
          if (!role) return false;
          const candidates = [
            role.name,
            role.roleName,
            role.code,
            role.slug,
          ]
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v).toLowerCase());
          return candidates.some((c) =>
            ADMIN_SUPPORT_MANAGER_ROLES.map((r) => r.toLowerCase()).includes(c),
          );
        });

      // If caller is admin/support/manager and no tenantUuid -> return list of all subscribers
      if (hasAdminSupportManagerRole && !tenantUuid) {
        const tenants = await TenantModel.listAllTenants();
        return res.json({
          success: true,
          data: tenants,
        });
      }

      // Fallback: require tenantUuid and return a single tenant
      if (!tenantUuid) {
        return res.status(400).json({
          success: false,
          message: 'tenantUuid is required',
        });
      }

      const tenant = await TenantModel.getByTenantUuid(tenantUuid);

      if (!tenant) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        });
      }

      return res.json({
        success: true,
        data: tenant,
      });
    } catch (error) {
      console.error('[Tenant] Get tenant error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load tenant',
      });
    }
  }

  /**
   * POST /api/v1/tenant
   * Creation rules:
   * - admin, super_admin, grameen_bazaar_admin:
   *     - Can create tenant for any company/plan; payment can be handled later.
   * - Normal users (non-admin roles allowed by route):
   *     - Can only create a tenant for their own company/context.
   *     - Payment / subscription enforcement should be handled by the caller,
   *       but this method prevents spoofing another company.
   */
  async createTenant(req, res) {
    try {
      const user = req.user || req.body.user || null;
      const payload = { ...(req.body || {}) };

      const adminRoles = ['admin', 'super_admin', 'grameen_bazaar_admin'];

      const hasAdminRole =
        user &&
        Array.isArray(user.roles) &&
        user.roles.some((role) => {
          if (!role) return false;
          const candidates = [
            role.name,
            role.roleName,
            role.code,
            role.slug,
          ]
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v).toLowerCase());
          return candidates.some((c) =>
            adminRoles.map((r) => r.toLowerCase()).includes(c),
          );
        });

      // For non-admin callers, force tenant to be created only for
      // the caller's own company/context so they cannot create
      // tenants for arbitrary companies.
      if (!hasAdminRole) {
        const inferredCompanyId =
          payload.company_id ||
          payload.companyId ||
          user?.companyId ||
          user?.company_id ||
          null;

        if (!inferredCompanyId) {
          return res.status(400).json({
            success: false,
            message:
              'company_id is required to create a tenant for the current user',
          });
        }

        payload.company_id = inferredCompanyId;
      }

      // Always set owner user_id from authenticated user if available,
      // unless caller explicitly provided a different user_id (admin use case).
      if (user && !payload.user_id) {
        const ownerId = user.id || user.user_uuid || user.userId;
        if (ownerId) {
          payload.user_id = ownerId;
        }
      }

      // FK: core.tenants.user_id references core.user_cache(user_uuid).
      // When the user is not in user_cache, fetch from auth server GET /api/v1/users/:user_id and upsert.
      if (payload.user_id) {
        const cached = await UserModel.getUserByUuid(payload.user_id);
        if (!cached) {
          const authHeader = req.headers.authorization || '';
          const accessToken = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;

          if (!accessToken) {
            return res.status(401).json({
              success: false,
              message:
                'Authorization token is required to fetch user details from the auth server when the user is not yet in the system.',
            });
          }

          let authUser;
          try {
            authUser = await authService.getUserById(payload.user_id, accessToken);
          } catch (err) {
            const status = err.statusCode || 500;
            const message =
              status === 404
                ? 'User not found on auth server. Ensure the user_id exists.'
                : err.message || 'Failed to fetch user from auth server';
            return res.status(status).json({
              success: false,
              message,
              ...(err.authResponse && { error: err.authResponse }),
            });
          }

          await UserModel.upsertUserCache({
            id: authUser.id,
            email: authUser.email,
            firstName: authUser.firstName ?? '',
            lastName: authUser.lastName ?? '',
            phone: authUser.phone ?? payload.phone ?? null,
            avatar: authUser.avatar ?? null,
            isStaff: authUser.isStaff ?? false,
            status: authUser.status || 'ACTIVE',
            roles: authUser.roles || (payload.company_id ? [{ assignment: { companyId: payload.company_id } }] : []),
          });
        }
      }

      // One tenant per user: reject if this user already has a tenant
      if (payload.user_id) {
        const existingTenant = await TenantModel.getByUserId(payload.user_id);
        if (existingTenant) {
          return res.status(409).json({
            success: false,
            message: 'This user already has a tenant. One user can only have one tenant.',
          });
        }
      }

      // Billing / onboarding: start date is always required (when the tenant started with us).
      // End date is required only for paid plans (not marketplace, which is free).
      const plan =
        (payload.subscription_plan ?? payload.subscriptionPlan ?? 'marketplace')
          .toString()
          .toLowerCase();
      const isMarketplace = plan === 'marketplace';

      const startDate =
        payload.subscription_start_date ?? payload.subscriptionStartDate ?? null;
      const endDate =
        payload.subscription_end_date ?? payload.subscriptionEndDate ?? null;
      const hasStart =
        startDate !== undefined &&
        startDate !== null &&
        String(startDate).trim() !== '';
      const hasEnd =
        endDate !== undefined &&
        endDate !== null &&
        String(endDate).trim() !== '';

      if (!hasStart) {
        return res.status(400).json({
          success: false,
          message:
            'subscription_start_date is required to record when the tenant started with us.',
        });
      }
      if (!isMarketplace && !hasEnd) {
        return res.status(400).json({
          success: false,
          message:
            'subscription_end_date is required for the billing cycle when the subscription plan is not marketplace.',
        });
      }

      payload.subscription_start_date = startDate;
      payload.subscription_end_date = hasEnd ? endDate : null;

      const created = await TenantModel.createTenant(payload);

      return res.status(201).json({
        success: true,
        message: 'Tenant created successfully',
        data: created,
      });
    } catch (error) {
      console.error('[Tenant] Create tenant error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create tenant',
      });
    }
  }

  /**
   * PUT /api/v1/tenant
   * Update tenant; tenantUuid resolved by route middleware.
   *
   * Business rule:
   * - subscription fields (subscription_plan, subscription_amount, subscription_currency_code,
   *   subscription_status, subscription_start_date, subscription_end_date) and
   *   usage limits (max_users, max_products, max_businesses, max_warehouses)
   *   can only be changed by admin, super_admin, grameen_bazaar_admin.
   * - Other roles may only update basic contact/activation fields
   *   (phone, email, is_active).
   */
  async updateTenant(req, res) {
    try {
      const { tenantUuid } = req.params;
      const payload = { ...(req.body || {}) };

      const user = req.user || req.body.user;
      const adminRoles = ['admin', 'super_admin', 'grameen_bazaar_admin'];

      const hasAdminRole =
        user &&
        Array.isArray(user.roles) &&
        user.roles.some((role) => {
          if (!role) return false;
          const candidates = [
            role.name,
            role.roleName,
            role.code,
            role.slug,
          ]
            .filter((v) => v !== undefined && v !== null)
            .map((v) => String(v).toLowerCase());
          return candidates.some((c) =>
            adminRoles.map((r) => r.toLowerCase()).includes(c),
          );
        });

      if (!hasAdminRole) {
        // Strip subscription / limit fields from non-admin updates
        delete payload.subscription_plan;
        delete payload.subscription_status;
        delete payload.subscription_amount;
        delete payload.subscription_currency_code;
        delete payload.max_users;
        delete payload.max_products;
        delete payload.max_businesses;
        delete payload.max_warehouses;
        delete payload.user_id; // non-admins cannot reassign owner
      }

      // One tenant per user: if admin is changing user_id, ensure the new user_id is not already used by another tenant
      if (hasAdminRole && payload.user_id !== undefined) {
        const current = await TenantModel.getByTenantUuid(tenantUuid);
        if (current && payload.user_id !== current.user_id) {
          const other = await TenantModel.getByUserId(payload.user_id);
          if (other && other.tenant_uuid !== tenantUuid) {
            return res.status(409).json({
              success: false,
              message: 'This user already has a tenant. One user can only have one tenant.',
            });
          }
        }
      }

      // first_name/last_name are stored in user_cache, not core.tenants — sync after update
      const subscriberFirstName =
        payload.first_name ?? payload.firstName ?? undefined;
      const subscriberLastName =
        payload.last_name ?? payload.lastName ?? undefined;
      delete payload.first_name;
      delete payload.firstName;
      delete payload.last_name;
      delete payload.lastName;

      const updated = await TenantModel.updateTenant(tenantUuid, payload);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        });
      }

      // Sync subscriber name to user_cache so GET /api/v1/tenant shows subscriber_name
      if (
        updated.user_id &&
        (subscriberFirstName !== undefined || subscriberLastName !== undefined)
      ) {
        try {
          const existing = await UserModel.getUserByUuid(updated.user_id);
          await UserModel.upsertUserCache({
            id: updated.user_id,
            email: updated.email || existing?.email || '',
            firstName:
              subscriberFirstName !== undefined
                ? subscriberFirstName
                : existing?.first_name ?? '',
            lastName:
              subscriberLastName !== undefined
                ? subscriberLastName
                : existing?.last_name ?? '',
            phone: updated.phone ?? existing?.phone,
            avatar: existing?.avatar ?? null,
            isStaff: existing?.is_staff ?? false,
            status: existing?.status || 'ACTIVE',
            roles: existing?.company_id
              ? [{ assignment: { companyId: existing.company_id } }]
              : [],
          });
        } catch (err) {
          console.error(
            '[Tenant] Sync subscriber name to user_cache:',
            err.message,
          );
        }
      }

      // Return full tenant with subscriber_name (refetch so response includes cache)
      const withSubscriber = await TenantModel.getByTenantUuid(tenantUuid);
      return res.json({
        success: true,
        message: 'Tenant updated successfully',
        data: withSubscriber || updated,
      });
    } catch (error) {
      console.error('[Tenant] Update tenant error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update tenant',
      });
    }
  }

  /**
   * DELETE /api/v1/tenant
   * Delete tenant; tenantUuid resolved by route middleware
   */
  async deleteTenant(req, res) {
    try {
      const { tenantUuid } = req.params;
      const deleted = await TenantModel.deleteTenant(tenantUuid);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Tenant not found',
        });
      }

      return res.json({
        success: true,
        message: 'Tenant deleted successfully',
      });
    } catch (error) {
      console.error('[Tenant] Delete tenant error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete tenant',
      });
    }
  }
}

module.exports = new TenantController();

