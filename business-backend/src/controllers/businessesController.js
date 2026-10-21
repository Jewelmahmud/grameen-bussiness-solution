const BusinessesModel = require('../models/BusinessesModel');

/**
 * BusinessesController - CRUD handlers for business.businesses
 *
 * req.isAdmin       = true   → admin/super_admin/grameen_bazaar_admin: unrestricted
 * req.isOwnerOnly   = true   → grameen_bazaar_vendor: manage own businesses only
 * req.userCompanyId          → company_id extracted from the token for owner checks
 */
class BusinessesController {
  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Verify the caller owns a business. Returns 403 response if not. */
  async #assertOwnership(req, res, businessUuid) {
    if (req.isAdmin) return true;

    if (!req.userCompanyId) {
      res.status(403).json({
        success: false,
        message: 'আপনার company_id নির্ধারণ করা যায়নি',
      });
      return false;
    }

    const businessCompanyId = await BusinessesModel.getCompanyId(businessUuid);
    if (businessCompanyId !== req.userCompanyId) {
      res.status(403).json({
        success: false,
        message: 'আপনি শুধুমাত্র আপনার নিজের ব্যবসা পরিবর্তন করতে পারবেন',
      });
      return false;
    }
    return true;
  }

  // ── Read ───────────────────────────────────────────────────────────────────

  /**
   * GET /api/v1/businesses
   * GET /api/v1/admin/businesses
   *
   * Query params:
   *   is_active                boolean
   *   is_marketplace_enabled   boolean
   *   is_primary               boolean
   *   tenant_uuid              uuid   (filter by tenant)
   *   business_uuid            uuid   (filter by specific business)
   *   business_type_uuid       uuid
   *   search                   string  - searches name & business_name
   *   sort_by                  name | business_name | created_at | updated_at
   *   sort_order               asc | desc
   *   page                     integer ≥ 1  (default 1)
   *   limit                    integer 1-100 (default 20, 0 = no limit)
   */
  async getAll(req, res) {
    try {
      const q = req.query;
      const isAdmin = req.isAdmin === true;

      const options = { admin: isAdmin };

      if (q.is_active                !== undefined) options.is_active                = q.is_active === 'true';
      if (q.is_marketplace_enabled   !== undefined) options.is_marketplace_enabled   = q.is_marketplace_enabled === 'true';
      if (q.is_primary               !== undefined) options.is_primary               = q.is_primary === 'true';
      if (q.tenant_uuid)                            options.tenant_uuid              = q.tenant_uuid;
      if (q.business_uuid)                          options.business_uuid            = q.business_uuid;
      if (q.business_type_uuid)                     options.business_type_uuid       = q.business_type_uuid;
      if (q.search)                                 options.search                   = q.search;
      if (q.sort_by)                                options.sort_by                  = q.sort_by;
      if (q.sort_order)                             options.sort_order               = q.sort_order;
      if (q.page     !== undefined)                 options.page                     = parseInt(q.page);
      if (q.limit    !== undefined)                 options.limit                    = parseInt(q.limit);

      // Owner-only: automatically scope to their company
      if (req.isOwnerOnly && req.userCompanyId) {
        options.company_id = req.userCompanyId;
      }

      const result = await BusinessesModel.getAll(options);
      return res.json({ success: true, ...result });
    } catch (error) {
      console.error('[Businesses] GetAll error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load businesses',
      });
    }
  }

  /**
   * GET /api/v1/businesses/:businessUuid
   * GET /api/v1/admin/businesses/:businessUuid
   */
  async getOne(req, res) {
    try {
      const { businessUuid } = req.params;
      const isAdmin = req.isAdmin === true;
      const record = await BusinessesModel.getByUuid(businessUuid, isAdmin);
      if (!record) {
        return res.status(404).json({ success: false, message: 'Business not found' });
      }
      return res.json({ success: true, data: record });
    } catch (error) {
      console.error('[Businesses] GetOne error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load business',
      });
    }
  }

  // ── Write ──────────────────────────────────────────────────────────────────

  /**
   * POST /api/v1/admin/businesses
   * Vendors/tenants: company_id is forced to their own regardless of payload.
   */
  async create(req, res) {
    try {
      const body = { ...(req.body || {}) };

      if (req.isOwnerOnly) {
        if (!req.userCompanyId) {
          return res.status(403).json({
            success: false,
            message: 'আপনার company_id নির্ধারণ করা যায়নি',
          });
        }
        // Force company_id to the caller's own
        body.company_id = req.userCompanyId;
      }

      const created = await BusinessesModel.create(body);
      return res.status(201).json({
        success: true,
        message: 'Business created',
        data: created,
      });
    } catch (error) {
      console.error('[Businesses] Create error:', error.message);
      const status = error.message?.match(/required|Invalid|duplicate/) ? 400 : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to create business',
      });
    }
  }

  /**
   * PUT /api/v1/admin/businesses/:businessUuid
   * Vendors/tenants: only allowed if the business belongs to them.
   */
  async update(req, res) {
    try {
      const { businessUuid } = req.params;

      if (req.isOwnerOnly) {
        const allowed = await this.#assertOwnership(req, res, businessUuid);
        if (!allowed) return;
      }

      const body = { ...(req.body || {}) };

      // Vendors/tenants cannot reassign company_id
      if (req.isOwnerOnly) {
        delete body.company_id;
      }

      const updated = await BusinessesModel.update(businessUuid, body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Business not found' });
      }
      return res.json({
        success: true,
        message: 'Business updated',
        data: updated,
      });
    } catch (error) {
      console.error('[Businesses] Update error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update business',
      });
    }
  }

  /**
   * DELETE /api/v1/admin/businesses/:businessUuid
   * Vendors/tenants: only allowed if the business belongs to them.
   */
  async delete(req, res) {
    try {
      const { businessUuid } = req.params;

      if (req.isOwnerOnly) {
        const allowed = await this.#assertOwnership(req, res, businessUuid);
        if (!allowed) return;
      }

      const deleted = await BusinessesModel.delete(businessUuid);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Business not found' });
      }
      return res.json({ success: true, message: 'Business deleted' });
    } catch (error) {
      console.error('[Businesses] Delete error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete business',
      });
    }
  }
}

module.exports = new BusinessesController();
