const MarketplaceProductModel = require('../models/MarketplaceProductModel');
const SecurityUtils = require('../utils/security');

/**
 * Marketplace Product Controller
 * Public: browse products by category, search, get one.
 */
class MarketplaceProductController {

  async getProducts(req, res) {
    try {
      const options = {
        slug:                       req.query.category || req.query.slug || null,
        marketplace_category_uuid:  req.query.marketplace_category_uuid || null,
        search:                     req.query.search || null,
        page:                       parseInt(req.query.page  ?? 1,  10),
        limit:                      parseInt(req.query.limit ?? 20, 10),
      };
      const result = await MarketplaceProductModel.getProducts(options);
      return res.json({
        success: true,
        data: result.products,
        pagination: { total: result.total, page: result.page, limit: result.limit },
      });
    } catch (err) {
      console.error('[Marketplace] GetProducts error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getProduct(req, res) {
    try {
      const { productUuid } = req.params;
      const product = await MarketplaceProductModel.getProduct(productUuid);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found in marketplace' });
      return res.json({ success: true, data: product });
    } catch (err) {
      console.error('[Marketplace] GetProduct error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async getProductsByBusiness(req, res) {
    try {
      const { businessUuid } = req.params;
      if (!SecurityUtils.isValidUUID(businessUuid)) {
        return res.status(400).json({ success: false, message: 'Invalid business UUID' });
      }
      const options = {
        marketplace_status: req.query.marketplace_status || null,
        page:  parseInt(req.query.page  ?? 1,  10),
        limit: parseInt(req.query.limit ?? 20, 10),
      };
      const products = await MarketplaceProductModel.getProductsByBusiness(businessUuid, options);
      return res.json({ success: true, data: products });
    } catch (err) {
      console.error('[Marketplace] GetProductsByBusiness error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new MarketplaceProductController();
