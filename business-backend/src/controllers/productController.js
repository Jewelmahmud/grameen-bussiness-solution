const ProductModel = require('../models/ProductModel');

/**
 * Product Controller - Handles catalog/product-related requests
 * Base path: /api/v1/catalog
 */
class ProductController {
  /**
   * GET /api/v1/catalog/products
   * Query params: tenant_uuid (required), business_uuid (optional), search, page, limit
   */
  async listProducts(req, res) {
    try {
      const {
        tenant_uuid: tenantUuid,
        business_uuid: businessUuid,
        search = '',
        page = 1,
        limit = 50
      } = req.query;

      if (!tenantUuid) {
        return res.status(400).json({
          success: false,
          message: 'টেন্যান্ট UUID প্রয়োজন'
        });
      }

      const pageNumber = parseInt(page, 10) || 1;
      const pageSize = Math.min(parseInt(limit, 10) || 50, 100);
      const offset = (pageNumber - 1) * pageSize;

      const products = await ProductModel.getProducts({
        tenantUuid,
        businessUuid: businessUuid || null,
        search,
        limit: pageSize,
        offset
      });

      return res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('[Catalog] List products error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'পণ্য তালিকা লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * GET /api/v1/catalog/products/:productUuid
   */
  async getProduct(req, res) {
    try {
      const { productUuid } = req.params;

      const product = await ProductModel.getProductByUuid(productUuid);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'পণ্য পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('[Catalog] Get product error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'পণ্য তথ্য লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * POST /api/v1/catalog/products
   */
  async createProduct(req, res) {
    try {
      const productData = req.body;

      const created = await ProductModel.createProduct(productData);

      return res.status(201).json({
        success: true,
        message: 'পণ্য সফলভাবে তৈরি হয়েছে',
        data: created
      });
    } catch (error) {
      console.error('[Catalog] Create product error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'পণ্য তৈরি করতে ব্যর্থ হয়েছে',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * PUT /api/v1/catalog/products/:productUuid
   */
  async updateProduct(req, res) {
    try {
      const { productUuid } = req.params;
      const productData = req.body;

      const updated = await ProductModel.updateProduct(productUuid, productData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'পণ্য পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        message: 'পণ্য সফলভাবে আপডেট হয়েছে',
        data: updated
      });
    } catch (error) {
      console.error('[Catalog] Update product error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'পণ্য আপডেট করতে ব্যর্থ হয়েছে',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * DELETE /api/v1/catalog/products/:productUuid
   */
  async deleteProduct(req, res) {
    try {
      const { productUuid } = req.params;

      const deleted = await ProductModel.deleteProduct(productUuid);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'পণ্য পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        message: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে'
      });
    } catch (error) {
      console.error('[Catalog] Delete product error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'পণ্য মুছতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * GET /api/v1/catalog/brands
   * Query: tenant_uuid (required)
   */
  async getBrands(req, res) {
    try {
      const { tenant_uuid: tenantUuid } = req.query;

      if (!tenantUuid) {
        return res.status(400).json({
          success: false,
          message: 'টেন্যান্ট UUID প্রয়োজন'
        });
      }

      const brands = await ProductModel.getBrands(tenantUuid);

      return res.json({
        success: true,
        data: brands
      });
    } catch (error) {
      console.error('[Catalog] Get brands error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ব্র্যান্ড লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * POST /api/v1/catalog/brands
   */
  async createBrand(req, res) {
    try {
      const data = req.body;
      const created = await ProductModel.createBrand(data);

      return res.status(201).json({
        success: true,
        message: 'ব্র্যান্ড সফলভাবে তৈরি হয়েছে',
        data: created
      });
    } catch (error) {
      console.error('[Catalog] Create brand error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ব্র্যান্ড তৈরি করতে ব্যর্থ হয়েছে',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * PUT /api/v1/catalog/brands/:brandUuid
   */
  async updateBrand(req, res) {
    try {
      const { brandUuid } = req.params;
      const data = req.body;

      const updated = await ProductModel.updateBrand(brandUuid, data);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'ব্র্যান্ড পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        message: 'ব্র্যান্ড সফলভাবে আপডেট হয়েছে',
        data: updated
      });
    } catch (error) {
      console.error('[Catalog] Update brand error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ব্র্যান্ড আপডেট করতে ব্যর্থ হয়েছে',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * DELETE /api/v1/catalog/brands/:brandUuid
   */
  async deleteBrand(req, res) {
    try {
      const { brandUuid } = req.params;

      const deleted = await ProductModel.deleteBrand(brandUuid);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'ব্র্যান্ড পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        message: 'ব্র্যান্ড সফলভাবে মুছে ফেলা হয়েছে'
      });
    } catch (error) {
      console.error('[Catalog] Delete brand error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ব্র্যান্ড মুছতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * GET /api/v1/catalog/categories
   * Query: tenant_uuid (required)
   */
  async getCategories(req, res) {
    try {
      const { tenant_uuid: tenantUuid } = req.query;

      if (!tenantUuid) {
        return res.status(400).json({
          success: false,
          message: 'টেন্যান্ট UUID প্রয়োজন'
        });
      }

      const categories = await ProductModel.getCategories(tenantUuid);

      return res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('[Catalog] Get categories error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ক্যাটাগরি লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * POST /api/v1/catalog/categories
   */
  async createCategory(req, res) {
    try {
      const data = req.body;
      const created = await ProductModel.createCategory(data);

      return res.status(201).json({
        success: true,
        message: 'ক্যাটাগরি সফলভাবে তৈরি হয়েছে',
        data: created
      });
    } catch (error) {
      console.error('[Catalog] Create category error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ক্যাটাগরি তৈরি করতে ব্যর্থ হয়েছে',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * PUT /api/v1/catalog/categories/:categoryUuid
   */
  async updateCategory(req, res) {
    try {
      const { categoryUuid } = req.params;
      const data = req.body;

      const updated = await ProductModel.updateCategory(categoryUuid, data);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'ক্যাটাগরি পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        message: 'ক্যাটাগরি সফলভাবে আপডেট হয়েছে',
        data: updated
      });
    } catch (error) {
      console.error('[Catalog] Update category error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ক্যাটাগরি আপডেট করতে ব্যর্থ হয়েছে',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * DELETE /api/v1/catalog/categories/:categoryUuid
   */
  async deleteCategory(req, res) {
    try {
      const { categoryUuid } = req.params;

      const deleted = await ProductModel.deleteCategory(categoryUuid);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'ক্যাটাগরি পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        message: 'ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে'
      });
    } catch (error) {
      console.error('[Catalog] Delete category error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ক্যাটাগরি মুছতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * GET /api/v1/catalog/units
   * Query: tenant_uuid (required), business_type_uuid (required)
   */
  async getUnits(req, res) {
    try {
      const { tenant_uuid: tenantUuid, business_type_uuid: businessTypeUuid } = req.query;

      console.log('[Catalog] Get units request:', { tenantUuid, businessTypeUuid });

      if (!tenantUuid || !businessTypeUuid) {
        return res.status(400).json({
          success: false,
          message: 'টেন্যান্ট UUID এবং ব্যবসার ধরন UUID প্রয়োজন'
        });
      }

      const units = await ProductModel.getUnits(tenantUuid, businessTypeUuid);

      console.log('[Catalog] Get units result:', { count: units.length, units });

      return res.json({
        success: true,
        data: units
      });
    } catch (error) {
      console.error('[Catalog] Get units error:', error.message);
      console.error('[Catalog] Get units error stack:', error.stack);
      return res.status(500).json({
        success: false,
        message: 'ইউনিট লোড করতে ব্যর্থ হয়েছে',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * POST /api/v1/catalog/units
   */
  async createUnit(req, res) {
    try {
      const data = req.body;
      const created = await ProductModel.createUnit(data);

      return res.status(201).json({
        success: true,
        message: 'ইউনিট সফলভাবে তৈরি হয়েছে',
        data: created
      });
    } catch (error) {
      console.error('[Catalog] Create unit error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ইউনিট তৈরি করতে ব্যর্থ হয়েছে',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * PUT /api/v1/catalog/units/:unitUuid
   */
  async updateUnit(req, res) {
    try {
      const { unitUuid } = req.params;
      const data = req.body;

      const updated = await ProductModel.updateUnit(unitUuid, data);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'ইউনিট পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        message: 'ইউনিট সফলভাবে আপডেট হয়েছে',
        data: updated
      });
    } catch (error) {
      console.error('[Catalog] Update unit error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ইউনিট আপডেট করতে ব্যর্থ হয়েছে',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * DELETE /api/v1/catalog/units/:unitUuid
   */
  async deleteUnit(req, res) {
    try {
      const { unitUuid } = req.params;

      const deleted = await ProductModel.deleteUnit(unitUuid);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'ইউনিট পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        message: 'ইউনিট সফলভাবে মুছে ফেলা হয়েছে'
      });
    } catch (error) {
      console.error('[Catalog] Delete unit error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ইউনিট মুছতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * GET /api/v1/catalog/units/:unitUuid/conversions
   */
  async getUnitConversions(req, res) {
    try {
      const { unitUuid } = req.params;
      const { tenant_uuid: tenantUuid } = req.query;

      if (!tenantUuid) {
        return res.status(400).json({
          success: false,
          message: 'টেন্যান্ট UUID প্রয়োজন'
        });
      }

      const conversions = await ProductModel.getUnitConversions(tenantUuid, unitUuid);

      return res.json({
        success: true,
        data: conversions
      });
    } catch (error) {
      console.error('[Catalog] Get unit conversions error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ইউনিট রূপান্তর লোড করতে ব্যর্থ হয়েছে',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * POST /api/v1/catalog/unit-conversions
   */
  async createUnitConversion(req, res) {
    try {
      const data = req.body;
      const created = await ProductModel.createUnitConversion(data);

      return res.status(201).json({
        success: true,
        message: 'ইউনিট রূপান্তর সফলভাবে তৈরি হয়েছে',
        data: created
      });
    } catch (error) {
      console.error('[Catalog] Create unit conversion error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ইউনিট রূপান্তর তৈরি করতে ব্যর্থ হয়েছে',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * PUT /api/v1/catalog/unit-conversions/:conversionId
   */
  async updateUnitConversion(req, res) {
    try {
      const { conversionId } = req.params;
      const data = req.body;

      const updated = await ProductModel.updateUnitConversion(conversionId, data);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'ইউনিট রূপান্তর পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        message: 'ইউনিট রূপান্তর সফলভাবে আপডেট হয়েছে',
        data: updated
      });
    } catch (error) {
      console.error('[Catalog] Update unit conversion error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ইউনিট রূপান্তর আপডেট করতে ব্যর্থ হয়েছে',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * DELETE /api/v1/catalog/unit-conversions/:conversionId
   */
  async deleteUnitConversion(req, res) {
    try {
      const { conversionId } = req.params;

      const deleted = await ProductModel.deleteUnitConversion(conversionId);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'ইউনিট রূপান্তর পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        message: 'ইউনিট রূপান্তর সফলভাবে মুছে ফেলা হয়েছে'
      });
    } catch (error) {
      console.error('[Catalog] Delete unit conversion error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'ইউনিট রূপান্তর মুছতে ব্যর্থ হয়েছে',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new ProductController();


