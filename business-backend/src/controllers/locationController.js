const LocationModel = require('../models/LocationModel');

/**
 * Location Controller - Handles location-related requests
 */
class LocationController {
  /**
   * Get all countries with optional pagination
   * Query params:
   * - pagination (optional, boolean): Enable pagination (default: false)
   * - page (optional, number): Page number when pagination is enabled (default: 1)
   * - limit (optional, number): Items per page when pagination is enabled (default: 50, max: 100)
   */
  async getCountries(req, res) {
    try {
      const { pagination, page, limit } = req.query;

      // Parse pagination boolean
      const enablePagination = pagination === 'true' || pagination === true;

      const options = {
        pagination: enablePagination,
        page: page || 1,
        limit: limit || 50
      };

      const result = await LocationModel.getCountries(options);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[Location] Get countries error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'দেশ লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Get all divisions with optional filters and pagination
   * Query params:
   * - country (optional): Filter by country name
   * - pagination (optional, boolean): Enable pagination (default: false)
   * - page (optional, number): Page number when pagination is enabled (default: 1)
   * - limit (optional, number): Items per page when pagination is enabled (default: 50, max: 100)
   */
  async getDivisions(req, res) {
    try {
      const { country, pagination, page, limit } = req.query;

      // Parse pagination boolean
      const enablePagination = pagination === 'true' || pagination === true;

      const options = {
        country: country || null,
        pagination: enablePagination,
        page: page || 1,
        limit: limit || 50
      };

      const result = await LocationModel.getDivisions(options);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[Location] Get divisions error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'বিভাগ লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Get districts with optional filters and pagination
   * Query params:
   * - division_uuid (optional): Filter by division UUID
   * - division (optional): Filter by division name
   * - country (optional): Filter by country name
   * - pagination (optional, boolean): Enable pagination (default: false)
   * - page (optional, number): Page number when pagination is enabled (default: 1)
   * - limit (optional, number): Items per page when pagination is enabled (default: 50, max: 100)
   */
  async getDistricts(req, res) {
    try {
      const { division_uuid, division, country, pagination, page, limit } = req.query;

      // Parse pagination boolean
      const enablePagination = pagination === 'true' || pagination === true;

      const options = {
        division_uuid: division_uuid || null,
        division: division || null,
        country: country || null,
        pagination: enablePagination,
        page: page || 1,
        limit: limit || 50
      };

      const result = await LocationModel.getDistricts(options);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[Location] Get districts error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'জেলা লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Get upazilas with optional filters and pagination
   * Query params:
   * - district_uuid (optional): Filter by district UUID
   * - district (optional): Filter by district name
   * - division_uuid (optional): Filter by division UUID
   * - country (optional): Filter by country name
   * - pagination (optional, boolean): Enable pagination (default: false)
   * - page (optional, number): Page number when pagination is enabled (default: 1)
   * - limit (optional, number): Items per page when pagination is enabled (default: 50, max: 100)
   */
  async getUpazilas(req, res) {
    try {
      const { district_uuid, district, division_uuid, country, pagination, page, limit } = req.query;

      // Parse pagination boolean
      const enablePagination = pagination === 'true' || pagination === true;

      const options = {
        district_uuid: district_uuid || null,
        district: district || null,
        division_uuid: division_uuid || null,
        country: country || null,
        pagination: enablePagination,
        page: page || 1,
        limit: limit || 50
      };

      const result = await LocationModel.getUpazilas(options);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[Location] Get upazilas error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'উপজেলা লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Get upazila details with hierarchy (division and district)
   */
  async getUpazila(req, res) {
    try {
      const { upazilaUuid } = req.params;

      if (!upazilaUuid) {
        return res.status(400).json({
          success: false,
          message: 'উপজেলা UUID প্রয়োজন'
        });
      }

      const upazila = await LocationModel.getUpazilaWithHierarchy(upazilaUuid);

      if (!upazila) {
        return res.status(404).json({
          success: false,
          message: 'উপজেলা পাওয়া যায়নি'
        });
      }

      return res.json({
        success: true,
        data: upazila
      });
    } catch (error) {
      console.error('[Location] Get upazila error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'উপজেলা তথ্য লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Get all locations with optional country filter and pagination
   * Query params:
   * - country (optional): Filter by country name
   * - pagination (optional, boolean): Enable pagination (default: false)
   * - page (optional, number): Page number when pagination is enabled (default: 1)
   * - limit (optional, number): Items per page when pagination is enabled (default: 50, max: 100)
   */
  async getAllLocations(req, res) {
    try {
      const { country, pagination, page, limit } = req.query;

      // Parse pagination boolean
      const enablePagination = pagination === 'true' || pagination === true;

      const options = {
        country: country || null,
        pagination: enablePagination,
        page: page || 1,
        limit: limit || 50
      };

      const result = await LocationModel.getAllLocations(options);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[Location] Get all locations error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'অবস্থান তথ্য লোড করতে ব্যর্থ হয়েছে'
      });
    }
  }
}

module.exports = new LocationController();

