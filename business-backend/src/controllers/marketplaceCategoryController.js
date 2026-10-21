const MarketplaceCategoryModel = require('../models/MarketplaceCategoryModel');

/**
 * Marketplace Category Controller
 * Public: list categories, get one by UUID/slug.
 * Admin: full CRUD + business type mappings + aliases + review queue.
 */
class MarketplaceCategoryController {

  // ─── Public ───────────────────────────────────────────────────────────────

  async getCategories(req, res) {
    try {
      const options = {};
      if (req.query.is_active !== undefined) options.is_active = req.query.is_active === 'true';
      if (req.query.parent_uuid !== undefined) {
        options.parent_uuid = req.query.parent_uuid === 'null' ? null : req.query.parent_uuid;
      }
      const list = await MarketplaceCategoryModel.getAll(options);
      return res.json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getCategory(req, res) {
    try {
      const { identifier } = req.params;
      const cat = identifier.includes('-') && !identifier.match(/^[0-9a-f-]{36}$/i)
        ? await MarketplaceCategoryModel.getBySlug(identifier)
        : await MarketplaceCategoryModel.getByUuid(identifier).catch(() => MarketplaceCategoryModel.getBySlug(identifier));
      if (!cat) return res.status(404).json({ success: false, message: 'Marketplace category not found' });
      return res.json({ success: true, data: cat });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── Admin CRUD ───────────────────────────────────────────────────────────

  async createCategory(req, res) {
    try {
      const created = await MarketplaceCategoryModel.create(req.body || {});
      return res.status(201).json({ success: true, message: 'Marketplace category created', data: created });
    } catch (err) {
      const status = err.message.includes('required') ? 400 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  async updateCategory(req, res) {
    try {
      const updated = await MarketplaceCategoryModel.update(req.params.categoryUuid, req.body || {});
      if (!updated) return res.status(404).json({ success: false, message: 'Marketplace category not found' });
      return res.json({ success: true, message: 'Marketplace category updated', data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async deleteCategory(req, res) {
    try {
      const deleted = await MarketplaceCategoryModel.delete(req.params.categoryUuid);
      if (!deleted) return res.status(404).json({ success: false, message: 'Marketplace category not found' });
      return res.json({ success: true, message: 'Marketplace category deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── Admin: Business Type Mappings (Phase 1) ──────────────────────────────

  async getBusinessTypeMappings(req, res) {
    try {
      const list = await MarketplaceCategoryModel.getBusinessTypeMappings();
      return res.json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async upsertBusinessTypeMapping(req, res) {
    try {
      const { business_type_uuid, marketplace_category_uuid } = req.body || {};
      const user = req.user;
      const mapped = await MarketplaceCategoryModel.upsertBusinessTypeMapping(
        business_type_uuid,
        marketplace_category_uuid,
        user?.id || null,
      );
      return res.json({ success: true, message: 'Business type mapped to marketplace category', data: mapped });
    } catch (err) {
      const status = err.message.includes('Invalid') ? 400 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  async deleteBusinessTypeMapping(req, res) {
    try {
      const deleted = await MarketplaceCategoryModel.deleteBusinessTypeMapping(req.params.businessTypeUuid);
      if (!deleted) return res.status(404).json({ success: false, message: 'Mapping not found' });
      return res.json({ success: true, message: 'Business type mapping removed' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── Admin: Aliases (Phase 3) ─────────────────────────────────────────────

  async getAliases(req, res) {
    try {
      const { marketplace_category_uuid } = req.query;
      const list = await MarketplaceCategoryModel.getAliases(marketplace_category_uuid || null);
      return res.json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async addAlias(req, res) {
    try {
      const { alias, marketplace_category_uuid } = req.body || {};
      const user = req.user;
      const added = await MarketplaceCategoryModel.addAlias(alias, marketplace_category_uuid, user?.id || null);
      return res.status(201).json({ success: true, message: 'Alias added', data: added });
    } catch (err) {
      const status = err.message.includes('required') || err.message.includes('Invalid') ? 400 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  async deleteAlias(req, res) {
    try {
      const deleted = await MarketplaceCategoryModel.deleteAlias(req.params.aliasId);
      if (!deleted) return res.status(404).json({ success: false, message: 'Alias not found' });
      return res.json({ success: true, message: 'Alias deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── Admin: Category Mapping Review Queue (Phase 2) ───────────────────────

  async getMappingQueue(req, res) {
    try {
      const needsReview = req.query.needs_review;
      const options = {};
      if (needsReview !== undefined) options.needs_review = needsReview === 'true';
      const list = await MarketplaceCategoryModel.getMappingReviewQueue(options);
      return res.json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async confirmMapping(req, res) {
    try {
      const { category_uuid, marketplace_category_uuid } = req.body || {};
      const user = req.user;
      const confirmed = await MarketplaceCategoryModel.confirmMapping(
        category_uuid, marketplace_category_uuid, user?.id || null,
      );
      return res.json({ success: true, message: 'Category mapping confirmed', data: confirmed });
    } catch (err) {
      const status = err.message.includes('Invalid') ? 400 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  async removeMapping(req, res) {
    try {
      const deleted = await MarketplaceCategoryModel.removeMapping(req.params.categoryUuid);
      if (!deleted) return res.status(404).json({ success: false, message: 'Mapping not found' });
      return res.json({ success: true, message: 'Category mapping removed' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new MarketplaceCategoryController();
