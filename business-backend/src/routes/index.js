const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const dbController = require('../controllers/dbController');
const authController = require('../controllers/authController');
const AuthMiddleware = require('../middleware/authMiddleware');
const CompanyContextMiddleware = require('../middleware/companyContextMiddleware');
const authRoutes = require('./authRoutes');
const locationRoutes = require('./locationRoutes');
const adminLocationRoutes = require('./adminLocationRoutes');
const adminSubscriptionPlanRoutes = require('./adminSubscriptionPlanRoutes');
const subscriptionPlanRoutes = require('./subscriptionPlanRoutes');
const marketplaceRoutes = require('./marketplaceRoutes');
const adminMarketplaceRoutes = require('./adminMarketplaceRoutes');
const businessTypeRoutes = require('./businessTypeRoutes');
const adminBusinessTypeRoutes = require('./adminBusinessTypeRoutes');
const businessTypeCategoryRoutes = require('./businessTypeCategoryRoutes');
const adminBusinessTypeCategoryRoutes = require('./adminBusinessTypeCategoryRoutes');
const businessesRoutes = require('./businessesRoutes');
const adminBusinessesRoutes = require('./adminBusinessesRoutes');
const masterUnitRoutes = require('./masterUnitRoutes');
const adminMasterUnitRoutes = require('./adminMasterUnitRoutes');
const businessRoutes = require('./businessRoutes');
const catalogRoutes = require('./catalogRoutes');
const paymentRoutes = require('./paymentRoutes');
const tenantRoutes = require('./tenantRoutes');
const tenantSettingsRoutes = require('./tenantSettingsRoutes');
const moduleRoutes = require('./moduleRoutes');
const moduleCategoryRoutes = require('./moduleCategoryRoutes');
const tenantModuleRoutes = require('./tenantModuleRoutes');

/**
 * Main Routes
 * Base path: /api/v1
 */

// Health check
router.get('/', healthController.info.bind(healthController));

// Database info
router.get('/db/info', (req, res) => dbController.getInfo(req, res));

// Users from auth server (fixed companyId = GRAMEEN_BAZAAR_ID)
// Mirrors /api/v1/auth/users but is exposed at /api/v1/users
router.get('/users', (req, res) => authController.getUsers(req, res));

// Populate req.user from Authorization: Bearer <token> (auth server GET /oauth/me)
router.use(AuthMiddleware.attachUserFromToken);

// Automatically attach company_id / companyId to request body
// when GRAMEEN_BAZAAR_ATTACH_COMPANY_ID=true and GRAMEEN_BAZAAR_ID is set.
router.use(CompanyContextMiddleware.attachCompanyId);

// Auth routes
router.use('/auth', authRoutes);

// Location routes (public)
router.use('/locations', locationRoutes);

// Subscription plans (public read - no auth)
router.use('/subscription-plans', subscriptionPlanRoutes);

// Admin-only location routes
router.use('/admin/locations', adminLocationRoutes);

// Admin-only subscription plan write (admin, super_admin)
router.use('/admin/subscription-plans', adminSubscriptionPlanRoutes);

// Marketplace public routes (no auth)
router.use('/marketplace', marketplaceRoutes);

// Admin marketplace management (admin, super_admin)
router.use('/admin/marketplace', adminMarketplaceRoutes);

// Business types (public read)
router.use('/business-types', businessTypeRoutes);

// Business type write (admin, super_admin, grameen_bazaar_admin)
router.use('/admin/business-types', adminBusinessTypeRoutes);

// Business type categories (public read)
router.use('/business-type-categories', businessTypeCategoryRoutes);

// Business type category write (admin, super_admin, grameen_bazaar_admin)
router.use('/admin/business-type-categories', adminBusinessTypeCategoryRoutes);

// Businesses (public read)
router.use('/businesses', businessesRoutes);

// Businesses write (admin, super_admin, grameen_bazaar_admin)
router.use('/admin/businesses', adminBusinessesRoutes);

// Master units (public read)
router.use('/master-units', masterUnitRoutes);

// Master units write (admin, super_admin, grameen_bazaar_admin, manager, support)
router.use('/admin/master-units', adminMasterUnitRoutes);

// Business routes
router.use('/business', businessRoutes);

// Tenant resource routes
router.use('/tenant', tenantRoutes);

// Tenant self-service settings routes
router.use('/tenant/settings', tenantSettingsRoutes);

// Per-tenant module configuration and billing routes
router.use('/tenant/modules', tenantModuleRoutes);

// Catalog / product routes
router.use('/catalog', catalogRoutes);

// Payment routes
router.use('/payment', paymentRoutes);

// Modules (admin: full CRUD; other roles: read-only)
router.use('/modules', moduleRoutes);

// Module categories (admin: full CRUD; other roles: read-only)
router.use('/module-categories', moduleCategoryRoutes);

module.exports = router;

