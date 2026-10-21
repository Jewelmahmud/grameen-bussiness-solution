const SubscriptionPlanModel = require('../models/SubscriptionPlanModel');

/**
 * Subscription Plan Controller - Admin/super_admin only resource endpoints for core.subscription_plans
 */
class SubscriptionPlanController {
  /**
   * GET /api/v1/admin/subscription-plans - list all subscription plans
   */
  async getAll(req, res) {
    try {
      const isActive = req.query.is_active;
      const options = {};
      if (isActive !== undefined) {
        options.is_active = isActive === 'true' || isActive === true;
      }
      const list = await SubscriptionPlanModel.getAll(options);
      return res.json({
        success: true,
        data: list,
      });
    } catch (error) {
      console.error('[SubscriptionPlan] GetAll error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load subscription plans',
      });
    }
  }

  /**
   * GET /api/v1/admin/subscription-plans/:planUuid - get one plan
   */
  async getOne(req, res) {
    try {
      const { planUuid } = req.params;
      const plan = await SubscriptionPlanModel.getByUuid(planUuid);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found',
        });
      }
      return res.json({
        success: true,
        data: plan,
      });
    } catch (error) {
      console.error('[SubscriptionPlan] GetOne error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load subscription plan',
      });
    }
  }

  /**
   * POST /api/v1/admin/subscription-plans - create plan (admin only)
   */
  async create(req, res) {
    try {
      const payload = req.body || {};
      const created = await SubscriptionPlanModel.create(payload);
      return res.status(201).json({
        success: true,
        message: 'Subscription plan created',
        data: created,
      });
    } catch (error) {
      console.error('[SubscriptionPlan] Create error:', error.message);
      const status = error.message && (error.message.includes('required') || error.message.includes('duplicate')) ? 400 : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to create subscription plan',
      });
    }
  }

  /**
   * PUT /api/v1/admin/subscription-plans/:planUuid - update plan (admin only)
   */
  async update(req, res) {
    try {
      const { planUuid } = req.params;
      const payload = req.body || {};
      const updated = await SubscriptionPlanModel.update(planUuid, payload);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found',
        });
      }
      return res.json({
        success: true,
        message: 'Subscription plan updated',
        data: updated,
      });
    } catch (error) {
      console.error('[SubscriptionPlan] Update error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update subscription plan',
      });
    }
  }

  /**
   * DELETE /api/v1/admin/subscription-plans/:planUuid - delete plan (admin only)
   */
  async delete(req, res) {
    try {
      const { planUuid } = req.params;
      const deleted = await SubscriptionPlanModel.delete(planUuid);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found',
        });
      }
      return res.json({
        success: true,
        message: 'Subscription plan deleted',
      });
    } catch (error) {
      console.error('[SubscriptionPlan] Delete error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete subscription plan',
      });
    }
  }
}

module.exports = new SubscriptionPlanController();
