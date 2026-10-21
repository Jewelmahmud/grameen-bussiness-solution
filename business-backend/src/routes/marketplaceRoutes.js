const express = require('express');
const router = express.Router();
const marketplaceCategoryController = require('../controllers/marketplaceCategoryController');
const marketplaceBrandController    = require('../controllers/marketplaceBrandController');
const marketplaceProductController  = require('../controllers/marketplaceProductController');
const InputValidation = require('../middleware/inputValidation');

/**
 * Public Marketplace Routes (no auth required)
 * Base path: /api/v1/marketplace
 */
router.use(InputValidation.sanitize());

// GET /api/v1/marketplace/categories
router.get('/categories', (req, res) => marketplaceCategoryController.getCategories(req, res));

// GET /api/v1/marketplace/categories/:identifier  (UUID or slug)
router.get('/categories/:identifier', (req, res) => marketplaceCategoryController.getCategory(req, res));

// GET /api/v1/marketplace/brands
router.get('/brands', (req, res) => marketplaceBrandController.getBrands(req, res));

// GET /api/v1/marketplace/brands/:identifier  (UUID or slug)
router.get('/brands/:identifier', (req, res) => marketplaceBrandController.getBrand(req, res));

// GET /api/v1/marketplace/products?category=electronics&search=samsung&page=1&limit=20
router.get('/products', (req, res) => marketplaceProductController.getProducts(req, res));

// GET /api/v1/marketplace/products/:productUuid
router.get(
  '/products/:productUuid',
  InputValidation.validate({ params: { productUuid: { type: 'uuid' } } }),
  (req, res) => marketplaceProductController.getProduct(req, res),
);

// GET /api/v1/marketplace/businesses/:businessUuid/products
router.get(
  '/businesses/:businessUuid/products',
  InputValidation.validate({ params: { businessUuid: { type: 'uuid' } } }),
  (req, res) => marketplaceProductController.getProductsByBusiness(req, res),
);

module.exports = router;
