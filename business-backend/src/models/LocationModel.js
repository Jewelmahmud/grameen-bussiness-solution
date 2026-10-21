const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * Location Model - Handles location-related database operations
 */
class LocationModel {
  /**
   * Get all active countries
   * @param {Object} options - Query options
   * @param {boolean} options.pagination - Enable pagination (default: false)
   * @param {number} options.page - Page number (if pagination enabled, default: 1)
   * @param {number} options.limit - Items per page (if pagination enabled, default: 50)
   * @returns {Promise<Object|Array>} - Countries data with optional pagination metadata
   */
  static async getCountries(options = {}) {
    const { pagination = false, page = 1, limit = 50 } = options;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const query = `
      SELECT 
        country_uuid,
        name,
        name_bn,
        code,
        is_active,
        created_at,
        updated_at
      FROM core.countries
      WHERE is_active = true
      ORDER BY name
    `;

    if (pagination) {
      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM core.countries WHERE is_active = true`;
      const countResult = await SafeQuery.execute(countQuery);
      const total = parseInt(countResult.rows[0].total, 10);
      const totalPages = Math.ceil(total / limitNum);

      // Get paginated results
      const paginatedQuery = `${query} LIMIT $1 OFFSET $2`;
      const result = await SafeQuery.execute(paginatedQuery, [limitNum, offset]);

      return {
        countries: result.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          totalPages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      };
    }

    const result = await SafeQuery.execute(query);
    return result.rows;
  }

  /**
   * Get all active divisions
   * @param {Object} options - Query options
   * @param {string} options.country - Country name filter (optional)
   * @param {boolean} options.pagination - Enable pagination (default: false)
   * @param {number} options.page - Page number (if pagination enabled, default: 1)
   * @param {number} options.limit - Items per page (if pagination enabled, default: 50)
   * @returns {Promise<Object|Array>} - Divisions data with optional pagination metadata
   */
  static async getDivisions(options = {}) {
    const { country, pagination = false, page = 1, limit = 50 } = options;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    let query;
    let params = [];

    if (country) {
      // Filter by country
      query = `
        SELECT 
          d.division_uuid, 
          d.name, 
          d.name_bn, 
          d.code, 
          d.is_active,
          d.country_uuid,
          c.name AS country_name,
          c.name_bn AS country_name_bn
        FROM core.divisions d
        INNER JOIN core.countries c ON d.country_uuid = c.country_uuid
        WHERE d.is_active = true AND LOWER(c.name) = LOWER($1)
        ORDER BY d.name
      `;
      params = [country];
    } else {
      // Get all divisions
      query = `
        SELECT 
          d.division_uuid, 
          d.name, 
          d.name_bn, 
          d.code, 
          d.is_active,
          d.country_uuid,
          c.name AS country_name,
          c.name_bn AS country_name_bn
        FROM core.divisions d
        INNER JOIN core.countries c ON d.country_uuid = c.country_uuid
        WHERE d.is_active = true
        ORDER BY d.name
      `;
    }

    if (pagination) {
      // Get total count
      const countQuery = country
        ? `SELECT COUNT(*) as total FROM core.divisions d INNER JOIN core.countries c ON d.country_uuid = c.country_uuid WHERE d.is_active = true AND LOWER(c.name) = LOWER($1)`
        : `SELECT COUNT(*) as total FROM core.divisions WHERE is_active = true`;
      
      const countResult = await SafeQuery.execute(countQuery, country ? [country] : []);
      const total = parseInt(countResult.rows[0].total, 10);
      const totalPages = Math.ceil(total / limitNum);

      // Get paginated results
      const paginatedQuery = `${query} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      const result = await SafeQuery.execute(paginatedQuery, [...params, limitNum, offset]);

      return {
        divisions: result.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          totalPages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      };
    }

    const result = await SafeQuery.execute(query, params);
    return result.rows;
  }

  /**
   * Get districts by division UUID
   * @param {string} divisionUuid - Division UUID
   * @returns {Promise<Array>}
   */
  static async getDistrictsByDivision(divisionUuid) {
    // Validate UUID
    if (!SecurityUtils.isValidUUID(divisionUuid)) {
      throw new Error('Invalid division UUID format');
    }

    const query = `
      SELECT district_uuid, name, name_bn, code, is_active
      FROM core.districts
      WHERE division_uuid = $1 AND is_active = true
      ORDER BY name
    `;
    
    const result = await SafeQuery.execute(query, [divisionUuid]);
    return result.rows;
  }

  /**
   * Get districts with optional filters and pagination
   * @param {Object} options - Query options
   * @param {string} options.division_uuid - Division UUID filter (optional)
   * @param {string} options.division - Division name filter (optional)
   * @param {string} options.country - Country name filter (optional)
   * @param {boolean} options.pagination - Enable pagination (default: false)
   * @param {number} options.page - Page number (if pagination enabled, default: 1)
   * @param {number} options.limit - Items per page (if pagination enabled, default: 50)
   * @returns {Promise<Object|Array>} - Districts data with optional pagination metadata
   */
  static async getDistricts(options = {}) {
    const { division_uuid, division, country, pagination = false, page = 1, limit = 50 } = options;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    // Validate division_uuid if provided
    if (division_uuid && !SecurityUtils.isValidUUID(division_uuid)) {
      throw new Error('Invalid division UUID format');
    }

    let query;
    let params = [];
    let whereConditions = ['dist.is_active = true'];

    if (division_uuid) {
      whereConditions.push('dist.division_uuid = $' + (params.length + 1));
      params.push(division_uuid);
    }

    if (division) {
      whereConditions.push('LOWER(d.name) = LOWER($' + (params.length + 1) + ')');
      params.push(division);
    }

    if (country) {
      whereConditions.push('LOWER(c.name) = LOWER($' + (params.length + 1) + ')');
      params.push(country);
    }

    const whereClause = whereConditions.join(' AND ');

    query = `
      SELECT 
        dist.district_uuid,
        dist.name,
        dist.name_bn,
        dist.code,
        dist.is_active,
        dist.division_uuid,
        d.name AS division_name,
        d.name_bn AS division_name_bn,
        c.name AS country_name,
        c.name_bn AS country_name_bn
      FROM core.districts dist
      INNER JOIN core.divisions d ON dist.division_uuid = d.division_uuid
      INNER JOIN core.countries c ON d.country_uuid = c.country_uuid
      WHERE ${whereClause}
      ORDER BY dist.name
    `;

    if (pagination) {
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM core.districts dist
        INNER JOIN core.divisions d ON dist.division_uuid = d.division_uuid
        INNER JOIN core.countries c ON d.country_uuid = c.country_uuid
        WHERE ${whereClause}
      `;
      
      const countResult = await SafeQuery.execute(countQuery, params);
      const total = parseInt(countResult.rows[0].total, 10);
      const totalPages = Math.ceil(total / limitNum);

      // Get paginated results
      const paginatedQuery = `${query} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      const result = await SafeQuery.execute(paginatedQuery, [...params, limitNum, offset]);

      return {
        districts: result.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          totalPages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      };
    }

    const result = await SafeQuery.execute(query, params);
    return result.rows;
  }

  /**
   * Get upazilas by district UUID
   * @param {string} districtUuid - District UUID
   * @returns {Promise<Array>}
   */
  static async getUpazilasByDistrict(districtUuid) {
    // Validate UUID
    if (!SecurityUtils.isValidUUID(districtUuid)) {
      throw new Error('Invalid district UUID format');
    }

    const query = `
      SELECT upazila_uuid, name, name_bn, code, upazila_type, is_active
      FROM core.upazilas
      WHERE district_uuid = $1 AND is_active = true
      ORDER BY name
    `;
    
    const result = await SafeQuery.execute(query, [districtUuid]);
    return result.rows;
  }

  /**
   * Get upazilas with optional filters and pagination
   * @param {Object} options - Query options
   * @param {string} options.district_uuid - District UUID filter (optional)
   * @param {string} options.district - District name filter (optional)
   * @param {string} options.division_uuid - Division UUID filter (optional)
   * @param {string} options.country - Country name filter (optional)
   * @param {boolean} options.pagination - Enable pagination (default: false)
   * @param {number} options.page - Page number (if pagination enabled, default: 1)
   * @param {number} options.limit - Items per page (if pagination enabled, default: 50)
   * @returns {Promise<Object|Array>} - Upazilas data with optional pagination metadata
   */
  static async getUpazilas(options = {}) {
    const { district_uuid, district, division_uuid, country, pagination = false, page = 1, limit = 50 } = options;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    // Validate UUIDs if provided
    if (district_uuid && !SecurityUtils.isValidUUID(district_uuid)) {
      throw new Error('Invalid district UUID format');
    }
    if (division_uuid && !SecurityUtils.isValidUUID(division_uuid)) {
      throw new Error('Invalid division UUID format');
    }

    let params = [];
    let whereConditions = ['u.is_active = true'];

    if (district_uuid) {
      whereConditions.push('u.district_uuid = $' + (params.length + 1));
      params.push(district_uuid);
    }

    if (district) {
      whereConditions.push('LOWER(dist.name) = LOWER($' + (params.length + 1) + ')');
      params.push(district);
    }

    if (division_uuid) {
      whereConditions.push('dist.division_uuid = $' + (params.length + 1));
      params.push(division_uuid);
    }

    if (country) {
      whereConditions.push('LOWER(c.name) = LOWER($' + (params.length + 1) + ')');
      params.push(country);
    }

    const whereClause = whereConditions.join(' AND ');

    const query = `
      SELECT 
        u.upazila_uuid,
        u.name,
        u.name_bn,
        u.code,
        u.upazila_type,
        u.is_active,
        u.district_uuid,
        dist.name AS district_name,
        dist.name_bn AS district_name_bn,
        d.division_uuid,
        d.name AS division_name,
        d.name_bn AS division_name_bn,
        c.name AS country_name,
        c.name_bn AS country_name_bn
      FROM core.upazilas u
      INNER JOIN core.districts dist ON u.district_uuid = dist.district_uuid
      INNER JOIN core.divisions d ON dist.division_uuid = d.division_uuid
      INNER JOIN core.countries c ON d.country_uuid = c.country_uuid
      WHERE ${whereClause}
      ORDER BY u.name
    `;

    if (pagination) {
      // Get total count
      const countQuery = `
        SELECT COUNT(*) as total
        FROM core.upazilas u
        INNER JOIN core.districts dist ON u.district_uuid = dist.district_uuid
        INNER JOIN core.divisions d ON dist.division_uuid = d.division_uuid
        INNER JOIN core.countries c ON d.country_uuid = c.country_uuid
        WHERE ${whereClause}
      `;
      
      const countResult = await SafeQuery.execute(countQuery, params);
      const total = parseInt(countResult.rows[0].total, 10);
      const totalPages = Math.ceil(total / limitNum);

      // Get paginated results
      const paginatedQuery = `${query} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      const result = await SafeQuery.execute(paginatedQuery, [...params, limitNum, offset]);

      return {
        upazilas: result.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: total,
          totalPages: totalPages,
          hasNext: pageNum < totalPages,
          hasPrev: pageNum > 1
        }
      };
    }

    const result = await SafeQuery.execute(query, params);
    return result.rows;
  }

  /**
   * Get upazila details with hierarchy (division and district)
   * @param {string} upazilaUuid - Upazila UUID
   * @returns {Promise<Object|null>}
   */
  static async getUpazilaWithHierarchy(upazilaUuid) {
    // Validate UUID
    if (!SecurityUtils.isValidUUID(upazilaUuid)) {
      throw new Error('Invalid upazila UUID format');
    }

    const query = `
      SELECT 
        u.upazila_uuid,
        u.name,
        u.name_bn,
        u.code,
        u.upazila_type,
        d.district_uuid,
        d.name AS district_name,
        d.name_bn AS district_name_bn,
        div.division_uuid,
        div.name AS division_name,
        div.name_bn AS division_name_bn
      FROM core.upazilas u
      JOIN core.districts d ON u.district_uuid = d.district_uuid
      JOIN core.divisions div ON d.division_uuid = div.division_uuid
      WHERE u.upazila_uuid = $1 AND u.is_active = true
    `;
    
    const result = await SafeQuery.execute(query, [upazilaUuid]);
    return result.rows[0] || null;
  }

  /**
   * Get all locations with optional country filter and pagination
   * @param {Object} options - Query options
   * @param {string} options.country - Country name filter (optional)
   * @param {boolean} options.pagination - Enable pagination (default: false)
   * @param {number} options.page - Page number (if pagination enabled, default: 1)
   * @param {number} options.limit - Items per page (if pagination enabled, default: 50)
   * @returns {Promise<Object>} - Location data with optional pagination metadata
   */
  static async getAllLocations(options = {}) {
    const { country, pagination = false, page = 1, limit = 50 } = options;
    
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    let countryUuid = null;
    
    // If country filter is provided, get country UUID
    if (country) {
      const countryQuery = `
        SELECT country_uuid FROM core.countries 
        WHERE LOWER(name) = LOWER($1) AND is_active = true
        LIMIT 1
      `;
      const countryResult = await SafeQuery.execute(countryQuery, [country]);
      if (countryResult.rows.length > 0) {
        countryUuid = countryResult.rows[0].country_uuid;
      } else {
        // Country not found, return empty result
        return {
          countries: [],
          total: 0,
          page: pageNum,
          limit: limitNum,
          totalPages: 0
        };
      }
    }

    // Build query based on whether country filter is provided
    if (countryUuid) {
      // Get hierarchical data for specific country
      const countriesQuery = `
        SELECT 
          c.country_uuid,
          c.name,
          c.name_bn,
          c.code,
          c.is_active
        FROM core.countries c
        WHERE c.country_uuid = $1 AND c.is_active = true
      `;

      const divisionsQuery = `
        SELECT 
          d.division_uuid,
          d.name,
          d.name_bn,
          d.code,
          d.is_active
        FROM core.divisions d
        WHERE d.country_uuid = $1 AND d.is_active = true
        ORDER BY d.name
      `;

      const districtsQuery = `
        SELECT 
          dist.district_uuid,
          dist.division_uuid,
          dist.name,
          dist.name_bn,
          dist.code,
          dist.is_active
        FROM core.districts dist
        INNER JOIN core.divisions d ON dist.division_uuid = d.division_uuid
        WHERE d.country_uuid = $1 AND dist.is_active = true
        ORDER BY dist.name
      `;

      const upazilasQuery = `
        SELECT 
          u.upazila_uuid,
          u.district_uuid,
          u.name,
          u.name_bn,
          u.code,
          u.upazila_type,
          u.is_active
        FROM core.upazilas u
        INNER JOIN core.districts dist ON u.district_uuid = dist.district_uuid
        INNER JOIN core.divisions d ON dist.division_uuid = d.division_uuid
        WHERE d.country_uuid = $1 AND u.is_active = true
        ORDER BY u.name
      `;

      const [countriesResult, divisionsResult, districtsResult, upazilasResult] = await Promise.all([
        SafeQuery.execute(countriesQuery, [countryUuid]),
        SafeQuery.execute(divisionsQuery, [countryUuid]),
        SafeQuery.execute(districtsQuery, [countryUuid]),
        SafeQuery.execute(upazilasQuery, [countryUuid])
      ]);

      // Organize data hierarchically
      const country = countriesResult.rows[0];
      const divisions = divisionsResult.rows;
      const districts = districtsResult.rows;
      const upazilas = upazilasResult.rows;

      // Group districts by division
      const districtsByDivision = {};
      districts.forEach(district => {
        if (!districtsByDivision[district.division_uuid]) {
          districtsByDivision[district.division_uuid] = [];
        }
        districtsByDivision[district.division_uuid].push(district);
      });

      // Group upazilas by district
      const upazilasByDistrict = {};
      upazilas.forEach(upazila => {
        if (!upazilasByDistrict[upazila.district_uuid]) {
          upazilasByDistrict[upazila.district_uuid] = [];
        }
        upazilasByDistrict[upazila.district_uuid].push(upazila);
      });

      // Build hierarchical structure
      const divisionsWithData = divisions.map(division => ({
        ...division,
        districts: (districtsByDivision[division.division_uuid] || []).map(district => ({
          ...district,
          upazilas: upazilasByDistrict[district.district_uuid] || []
        }))
      }));

      const result = {
        country: {
          ...country,
          divisions: divisionsWithData
        }
      };

      // Apply pagination if enabled
      if (pagination) {
        const totalItems = divisions.length + districts.length + upazilas.length;
        const totalPages = Math.ceil(totalItems / limitNum);
        
        // For hierarchical data, we'll paginate at the upazila level
        // This is a simplified approach - you might want to paginate differently
        return {
          ...result,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalItems,
            totalPages: totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        };
      }

      return result;
    } else {
      // Get all countries with their data
      const countriesQuery = `
        SELECT 
          c.country_uuid,
          c.name,
          c.name_bn,
          c.code,
          c.is_active
        FROM core.countries c
        WHERE c.is_active = true
        ORDER BY c.name
      `;

      const countriesResult = await SafeQuery.execute(countriesQuery);
      const countries = countriesResult.rows;

      // Get all divisions, districts, and upazilas
      const [divisionsResult, districtsResult, upazilasResult] = await Promise.all([
        SafeQuery.execute(`
          SELECT division_uuid, country_uuid, name, name_bn, code, is_active
          FROM core.divisions
          WHERE is_active = true
          ORDER BY name
        `),
        SafeQuery.execute(`
          SELECT district_uuid, division_uuid, name, name_bn, code, is_active
          FROM core.districts
          WHERE is_active = true
          ORDER BY name
        `),
        SafeQuery.execute(`
          SELECT upazila_uuid, district_uuid, name, name_bn, code, upazila_type, is_active
          FROM core.upazilas
          WHERE is_active = true
          ORDER BY name
        `)
      ]);

      const divisions = divisionsResult.rows;
      const districts = districtsResult.rows;
      const upazilas = upazilasResult.rows;

      // Group data by country
      const divisionsByCountry = {};
      divisions.forEach(div => {
        if (!divisionsByCountry[div.country_uuid]) {
          divisionsByCountry[div.country_uuid] = [];
        }
        divisionsByCountry[div.country_uuid].push(div);
      });

      const districtsByDivision = {};
      districts.forEach(dist => {
        if (!districtsByDivision[dist.division_uuid]) {
          districtsByDivision[dist.division_uuid] = [];
        }
        districtsByDivision[dist.division_uuid].push(dist);
      });

      const upazilasByDistrict = {};
      upazilas.forEach(up => {
        if (!upazilasByDistrict[up.district_uuid]) {
          upazilasByDistrict[up.district_uuid] = [];
        }
        upazilasByDistrict[up.district_uuid].push(up);
      });

      // Build hierarchical structure for each country
      const countriesWithData = countries.map(country => {
        const countryDivisions = (divisionsByCountry[country.country_uuid] || []).map(division => ({
          ...division,
          districts: (districtsByDivision[division.division_uuid] || []).map(district => ({
            ...district,
            upazilas: upazilasByDistrict[district.district_uuid] || []
          }))
        }));

        return {
          ...country,
          divisions: countryDivisions
        };
      });

      // Apply pagination if enabled
      if (pagination) {
        const totalItems = countries.length;
        const totalPages = Math.ceil(totalItems / limitNum);
        const paginatedCountries = countriesWithData.slice(offset, offset + limitNum);

        return {
          countries: paginatedCountries,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalItems,
            totalPages: totalPages,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1
          }
        };
      }

      return {
        countries: countriesWithData
      };
    }
  }
}

module.exports = LocationModel;

