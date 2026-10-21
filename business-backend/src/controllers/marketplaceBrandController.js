const MarketplaceBrandModel = require('../models/MarketplaceBrandModel');

/**
 * Marketplace Brand Controller
 * Public: list brands, get one.
 * Admin: full CRUD + aliases + mapping review queue.
 */
class MarketplaceBrandController {

  // ─── Public ───────────────────────────────────────────────────────────────

  async getBrands(req, res) {
    try {
      const options = {};
      if (req.query.is_active !== undefined) options.is_active = req.query.is_active === 'true';
      const list = await MarketplaceBrandModel.getAll(options);
      return res.json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getBrand(req, res) {
    try {
      const { identifier } = req.params;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
      const brand = isUuid
        ? await MarketplaceBrandModel.getByUuid(identifier).catch(() => null)
        : await MarketplaceBrandModel.getBySlug(identifier);
      if (!brand) return res.status(404).json({ success: false, message: 'Marketplace brand not found' });
      return res.json({ success: true, data: brand });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── Admin CRUD ───────────────────────────────────────────────────────────

  async createBrand(req, res) {
    try {
      const created = await MarketplaceBrandModel.create(req.body || {});
      return res.status(201).json({ success: true, message: 'Marketplace brand created', data: created });
    } catch (err) {
      const status = err.message.includes('required') ? 400 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  async updateBrand(req, res) {
    try {
      const updated = await MarketplaceBrandModel.update(req.params.brandUuid, req.body || {});
      if (!updated) return res.status(404).json({ success: false, message: 'Marketplace brand not found' });
      return res.json({ success: true, message: 'Marketplace brand updated', data: updated });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async deleteBrand(req, res) {
    try {
      const deleted = await MarketplaceBrandModel.delete(req.params.brandUuid);
      if (!deleted) return res.status(404).json({ success: false, message: 'Marketplace brand not found' });
      return res.json({ success: true, message: 'Marketplace brand deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── Admin: Aliases (Phase 3) ─────────────────────────────────────────────

  async getAliases(req, res) {
    try {
      const list = await MarketplaceBrandModel.getAliases(req.query.marketplace_brand_uuid || null);
      return res.json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async addAlias(req, res) {
    try {
      const { alias, marketplace_brand_uuid } = req.body || {};
      const added = await MarketplaceBrandModel.addAlias(alias, marketplace_brand_uuid, req.user?.id || null);
      return res.status(201).json({ success: true, message: 'Brand alias added', data: added });
    } catch (err) {
      const status = err.message.includes('required') || err.message.includes('Invalid') ? 400 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  async deleteAlias(req, res) {
    try {
      const deleted = await MarketplaceBrandModel.deleteAlias(req.params.aliasId);
      if (!deleted) return res.status(404).json({ success: false, message: 'Alias not found' });
      return res.json({ success: true, message: 'Brand alias deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // ─── Admin: Mapping Review Queue (Phase 2) ────────────────────────────────

  async getMappingQueue(req, res) {
    try {
      const options = {};
      if (req.query.needs_review !== undefined) options.needs_review = req.query.needs_review === 'true';
      const list = await MarketplaceBrandModel.getMappingReviewQueue(options);
      return res.json({ success: true, data: list });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async confirmMapping(req, res) {
    try {
      const { brand_uuid, marketplace_brand_uuid } = req.body || {};
      const confirmed = await MarketplaceBrandModel.confirmMapping(brand_uuid, marketplace_brand_uuid, req.user?.id || null);
      return res.json({ success: true, message: 'Brand mapping confirmed', data: confirmed });
    } catch (err) {
      const status = err.message.includes('Invalid') ? 400 : 500;
      return res.status(status).json({ success: false, message: err.message });
    }
  }

  async removeMapping(req, res) {
    try {
      const deleted = await MarketplaceBrandModel.removeMapping(req.params.brandUuid);
      if (!deleted) return res.status(404).json({ success: false, message: 'Mapping not found' });
      return res.json({ success: true, message: 'Brand mapping removed' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new MarketplaceBrandController();
