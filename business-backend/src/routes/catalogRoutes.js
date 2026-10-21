const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const InputValidation = require('../middleware/inputValidation');

/**
 * Catalog Routes
 * Base path: /api/v1/catalog
 */

// Sanitize all inputs
router.use(InputValidation.sanitize());

// Products
router.get(
  '/products',
  InputValidation.validate({
    query: {
      tenant_uuid: { type: 'uuid', required: true },
      business_uuid: { type: 'uuid', required: false },
      search: { type: 'string', required: false, maxLength: 255 },
      page: { type: 'integer', required: false, min: 1 },
      limit: { type: 'integer', required: false, min: 1, max: 100 }
    }
  }),
  (req, res) => productController.listProducts(req, res)
);

router.get(
  '/products/:productUuid',
  InputValidation.validate({
    params: {
      productUuid: { type: 'uuid', required: true }
    }
  }),
  (req, res) => productController.getProduct(req, res)
);

router.post(
  '/products',
  InputValidation.validate({
    body: {
      tenant_uuid: { type: 'uuid', required: true },
      business_uuid: { type: 'uuid', required: true },
      name: { type: 'string', required: true, minLength: 1, maxLength: 255 },
      sku: { type: 'string', required: true, minLength: 1, maxLength: 100 },
      barcode: { type: 'string', required: false, maxLength: 100 },
      category_uuid: { type: 'uuid', required: false },
      brand_uuid: { type: 'uuid', required: false },
      unit_uuid: { type: 'uuid', required: false },
      description: { type: 'string', required: false, maxLength: 2000 },
      product_type: { type: 'string', required: false, maxLength: 50 },
      cost_price: { type: 'decimal', required: false, min: 0 },
      selling_price: { type: 'decimal', required: true, min: 0 },
      mrp: { type: 'decimal', required: false, min: 0 },
      wholesale_price: { type: 'decimal', required: false, min: 0 },
      tax_type: { type: 'string', required: false, maxLength: 20 },
      tax_percentage: { type: 'decimal', required: false, min: 0, max: 100 },
      track_inventory: { type: 'string', required: false, maxLength: 5 },
      alert_quantity: { type: 'integer', required: false, min: 0 },
      has_warranty: { type: 'string', required: false, maxLength: 5 },
      warranty_period: { type: 'integer', required: false, min: 0 },
      warranty_type: { type: 'string', required: false, maxLength: 50 },
      primary_image_url: { type: 'string', required: false, maxLength: 500 },
      is_active: { type: 'string', required: false, maxLength: 5 },
      is_featured: { type: 'string', required: false, maxLength: 5 },
      expiry_date: { type: 'string', required: false, maxLength: 50 },
      batch_number: { type: 'string', required: false, maxLength: 100 },
      manufacture_date: { type: 'string', required: false, maxLength: 50 },
      serial_number: { type: 'string', required: false, maxLength: 100 },
      model_number: { type: 'string', required: false, maxLength: 100 },
      length: { type: 'decimal', required: false, min: 0 },
      width: { type: 'decimal', required: false, min: 0 },
      height: { type: 'decimal', required: false, min: 0 },
      weight: { type: 'decimal', required: false, min: 0 },
      manufacturer_name: { type: 'string', required: false, maxLength: 255 },
      manufacturer_code: { type: 'string', required: false, maxLength: 100 },
      country_of_origin: { type: 'string', required: false, maxLength: 100 },
      // attributes and tags are JSON / array, validated at model layer
      created_by_uuid: { type: 'uuid', required: false }
    }
  }),
  (req, res) => productController.createProduct(req, res)
);

router.put(
  '/products/:productUuid',
  InputValidation.validate({
    params: {
      productUuid: { type: 'uuid', required: true }
    },
    body: {
      name: { type: 'string', required: false, minLength: 1, maxLength: 255 },
      sku: { type: 'string', required: false, minLength: 1, maxLength: 100 },
      barcode: { type: 'string', required: false, maxLength: 100 },
      category_uuid: { type: 'uuid', required: false },
      brand_uuid: { type: 'uuid', required: false },
      unit_uuid: { type: 'uuid', required: false },
      description: { type: 'string', required: false, maxLength: 2000 },
      product_type: { type: 'string', required: false, maxLength: 50 },
      cost_price: { type: 'decimal', required: false, min: 0 },
      selling_price: { type: 'decimal', required: false, min: 0 },
      mrp: { type: 'decimal', required: false, min: 0 },
      wholesale_price: { type: 'decimal', required: false, min: 0 },
      tax_type: { type: 'string', required: false, maxLength: 20 },
      tax_percentage: { type: 'decimal', required: false, min: 0, max: 100 },
      track_inventory: { type: 'string', required: false, maxLength: 5 },
      alert_quantity: { type: 'integer', required: false, min: 0 },
      has_warranty: { type: 'string', required: false, maxLength: 5 },
      warranty_period: { type: 'integer', required: false, min: 0 },
      warranty_type: { type: 'string', required: false, maxLength: 50 },
      primary_image_url: { type: 'string', required: false, maxLength: 500 },
      is_active: { type: 'string', required: false, maxLength: 5 },
      is_featured: { type: 'string', required: false, maxLength: 5 },
      expiry_date: { type: 'string', required: false, maxLength: 50 },
      batch_number: { type: 'string', required: false, maxLength: 100 },
      manufacture_date: { type: 'string', required: false, maxLength: 50 },
      serial_number: { type: 'string', required: false, maxLength: 100 },
      model_number: { type: 'string', required: false, maxLength: 100 },
      length: { type: 'decimal', required: false, min: 0 },
      width: { type: 'decimal', required: false, min: 0 },
      height: { type: 'decimal', required: false, min: 0 },
      weight: { type: 'decimal', required: false, min: 0 },
      manufacturer_name: { type: 'string', required: false, maxLength: 255 },
      manufacturer_code: { type: 'string', required: false, maxLength: 100 },
      country_of_origin: { type: 'string', required: false, maxLength: 100 }
      // attributes, tags, notes handled in model
    }
  }),
  (req, res) => productController.updateProduct(req, res)
);

router.delete(
  '/products/:productUuid',
  InputValidation.validate({
    params: {
      productUuid: { type: 'uuid', required: true }
    }
  }),
  (req, res) => productController.deleteProduct(req, res)
);

// Brands
router.get(
  '/brands',
  InputValidation.validate({
    query: {
      tenant_uuid: { type: 'uuid', required: true }
    }
  }),
  (req, res) => productController.getBrands(req, res)
);

router.post(
  '/brands',
  InputValidation.validate({
    body: {
      tenant_uuid: { type: 'uuid', required: true },
      name: { type: 'string', required: true, minLength: 1, maxLength: 255 },
      description: { type: 'string', required: false, maxLength: 2000 },
      logo_url: { type: 'string', required: false, maxLength: 500 },
      is_active: { type: 'string', required: false, maxLength: 5 }
    }
  }),
  (req, res) => productController.createBrand(req, res)
);

router.put(
  '/brands/:brandUuid',
  InputValidation.validate({
    params: {
      brandUuid: { type: 'uuid', required: true }
    },
    body: {
      name: { type: 'string', required: false, minLength: 1, maxLength: 255 },
      description: { type: 'string', required: false, maxLength: 2000 },
      logo_url: { type: 'string', required: false, maxLength: 500 },
      is_active: { type: 'string', required: false, maxLength: 5 }
    }
  }),
  (req, res) => productController.updateBrand(req, res)
);

router.delete(
  '/brands/:brandUuid',
  InputValidation.validate({
    params: {
      brandUuid: { type: 'uuid', required: true }
    }
  }),
  (req, res) => productController.deleteBrand(req, res)
);

// Categories
router.get(
  '/categories',
  InputValidation.validate({
    query: {
      tenant_uuid: { type: 'uuid', required: true }
    }
  }),
  (req, res) => productController.getCategories(req, res)
);

router.post(
  '/categories',
  InputValidation.validate({
    body: {
      tenant_uuid: { type: 'uuid', required: true },
      name: { type: 'string', required: true, minLength: 1, maxLength: 255 },
      description: { type: 'string', required: false, maxLength: 2000 },
      parent_uuid: { type: 'uuid', required: false },
      image_url: { type: 'string', required: false, maxLength: 500 },
      is_active: { type: 'string', required: false, maxLength: 5 },
      display_order: { type: 'integer', required: false, min: 0 }
    }
  }),
  (req, res) => productController.createCategory(req, res)
);

router.put(
  '/categories/:categoryUuid',
  InputValidation.validate({
    params: {
      categoryUuid: { type: 'uuid', required: true }
    },
    body: {
      name: { type: 'string', required: false, minLength: 1, maxLength: 255 },
      description: { type: 'string', required: false, maxLength: 2000 },
      parent_uuid: { type: 'uuid', required: false },
      image_url: { type: 'string', required: false, maxLength: 500 },
      is_active: { type: 'string', required: false, maxLength: 5 },
      display_order: { type: 'integer', required: false, min: 0 }
    }
  }),
  (req, res) => productController.updateCategory(req, res)
);

router.delete(
  '/categories/:categoryUuid',
  InputValidation.validate({
    params: {
      categoryUuid: { type: 'uuid', required: true }
    }
  }),
  (req, res) => productController.deleteCategory(req, res)
);

// Units
router.get(
  '/units',
  InputValidation.validate({
    query: {
      tenant_uuid: { type: 'uuid', required: true },
      business_type_uuid: { type: 'uuid', required: true }
    }
  }),
  (req, res) => productController.getUnits(req, res)
);

router.post(
  '/units',
  InputValidation.validate({
    body: {
      tenant_uuid: { type: 'uuid', required: true },
      business_type_uuid: { type: 'uuid', required: true },
      name: { type: 'string', required: true, minLength: 1, maxLength: 50 },
      short_name: { 
        required: true,
        custom: (value) => {
          // Accept string (legacy) or object {en: "...", bn: "..."}
          if (typeof value === 'string') {
            if (value.length < 1 || value.length > 10) {
              return 'short_name must be between 1 and 10 characters when provided as string';
            }
            return true;
          }
          if (typeof value === 'object' && value !== null) {
            if (!value.en || typeof value.en !== 'string' || value.en.length > 10) {
              return 'short_name.en is required and must be at most 10 characters';
            }
            if (value.bn && (typeof value.bn !== 'string' || value.bn.length > 10)) {
              return 'short_name.bn must be a string with at most 10 characters';
            }
            return true;
          }
          return 'short_name must be a string or an object with en and optional bn properties';
        }
      },
      unit_type: { type: 'string', required: true, maxLength: 50 },
      is_base_unit: { type: 'string', required: false, maxLength: 5 },
      is_active: { type: 'string', required: false, maxLength: 5 }
    }
  }),
  (req, res) => productController.createUnit(req, res)
);

router.put(
  '/units/:unitUuid',
  InputValidation.validate({
    params: {
      unitUuid: { type: 'uuid', required: true }
    },
    body: {
      name: { type: 'string', required: false, minLength: 1, maxLength: 50 },
      short_name: {
        required: false,
        custom: (value) => {
          // Accept string (legacy) or object {en: "...", bn: "..."}
          if (value === undefined || value === null) {
            return true; // Optional field
          }
          if (typeof value === 'string') {
            if (value.length < 1 || value.length > 10) {
              return 'short_name must be between 1 and 10 characters when provided as string';
            }
            return true;
          }
          if (typeof value === 'object' && value !== null) {
            if (!value.en || typeof value.en !== 'string' || value.en.length > 10) {
              return 'short_name.en is required and must be at most 10 characters';
            }
            if (value.bn && (typeof value.bn !== 'string' || value.bn.length > 10)) {
              return 'short_name.bn must be a string with at most 10 characters';
            }
            return true;
          }
          return 'short_name must be a string or an object with en and optional bn properties';
        }
      },
      unit_type: { type: 'string', required: false, maxLength: 50 },
      is_base_unit: { type: 'string', required: false, maxLength: 5 },
      is_active: { type: 'string', required: false, maxLength: 5 }
    }
  }),
  (req, res) => productController.updateUnit(req, res)
);

router.delete(
  '/units/:unitUuid',
  InputValidation.validate({
    params: {
      unitUuid: { type: 'uuid', required: true }
    }
  }),
  (req, res) => productController.deleteUnit(req, res)
);

// Unit Conversions Routes
router.get(
  '/units/:unitUuid/conversions',
  InputValidation.validate({
    params: {
      unitUuid: { type: 'uuid', required: true }
    },
    query: {
      tenant_uuid: { type: 'uuid', required: true }
    }
  }),
  (req, res) => productController.getUnitConversions(req, res)
);

router.post(
  '/unit-conversions',
  InputValidation.validate({
    body: {
      tenant_uuid: { type: 'uuid', required: true },
      from_unit_uuid: { type: 'uuid', required: true },
      to_unit_uuid: { type: 'uuid', required: true },
      conversion_factor: { type: 'decimal', required: true, min: 0.000001 },
      formula: { type: 'string', required: false, maxLength: 255 },
      is_active: { type: 'string', required: false, maxLength: 5 }
    }
  }),
  (req, res) => productController.createUnitConversion(req, res)
);

router.put(
  '/unit-conversions/:conversionId',
  InputValidation.validate({
    params: {
      conversionId: { type: 'integer', required: true }
    },
    body: {
      conversion_factor: { type: 'decimal', required: false, min: 0.000001 },
      formula: { type: 'string', required: false, maxLength: 255 },
      is_active: { type: 'string', required: false, maxLength: 5 }
    }
  }),
  (req, res) => productController.updateUnitConversion(req, res)
);

router.delete(
  '/unit-conversions/:conversionId',
  InputValidation.validate({
    params: {
      conversionId: { type: 'integer', required: true }
    }
  }),
  (req, res) => productController.deleteUnitConversion(req, res)
);

module.exports = router;


