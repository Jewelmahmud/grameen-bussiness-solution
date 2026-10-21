const MasterUnitModel = require('../models/MasterUnitModel');

class MasterUnitController {
  // Public GET: list master units
  async getMasterUnits(req, res) {
    try {
      const q = req.query || {};
      const options = {};
      if (q.business_type_uuid) options.business_type_uuid = q.business_type_uuid;
      if (q.is_active !== undefined) options.is_active = q.is_active === 'true';
      if (q.search) options.search = q.search;
      if (q.page !== undefined) options.page = parseInt(q.page, 10);
      if (q.limit !== undefined) options.limit = parseInt(q.limit, 10);

      const result = await MasterUnitModel.getMasterUnits(options);
      return res.json({ success: true, ...result });
    } catch (error) {
      console.error('[MasterUnits] getMasterUnits error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load master units',
      });
    }
  }

  // Public GET: single master unit
  async getMasterUnit(req, res) {
    try {
      const { unitUuid } = req.params;
      const unit = await MasterUnitModel.getMasterUnitByUuid(unitUuid);
      if (!unit) {
        return res.status(404).json({
          success: false,
          message: 'Master unit not found',
        });
      }
      return res.json({ success: true, data: unit });
    } catch (error) {
      console.error('[MasterUnits] getMasterUnit error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load master unit',
      });
    }
  }

  // Admin POST: create master unit
  async createMasterUnit(req, res) {
    try {
      const created = await MasterUnitModel.createMasterUnit(req.body || {});
      return res.status(201).json({
        success: true,
        message: 'Master unit created',
        data: created,
      });
    } catch (error) {
      console.error('[MasterUnits] createMasterUnit error:', error.message);
      const status = /required|Invalid|duplicate/i.test(error.message || '')
        ? 400
        : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to create master unit',
      });
    }
  }

  // Admin PUT: update master unit
  async updateMasterUnit(req, res) {
    try {
      const { unitUuid } = req.params;
      const updated = await MasterUnitModel.updateMasterUnit(unitUuid, req.body || {});
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Master unit not found',
        });
      }
      return res.json({
        success: true,
        message: 'Master unit updated',
        data: updated,
      });
    } catch (error) {
      console.error('[MasterUnits] updateMasterUnit error:', error.message);
      const status = /required|Invalid/i.test(error.message || '') ? 400 : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to update master unit',
      });
    }
  }

  // Admin DELETE: delete master unit
  async deleteMasterUnit(req, res) {
    try {
      const { unitUuid } = req.params;
      const deleted = await MasterUnitModel.deleteMasterUnit(unitUuid);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Master unit not found',
        });
      }
      return res.json({
        success: true,
        message: 'Master unit deleted',
      });
    } catch (error) {
      console.error('[MasterUnits] deleteMasterUnit error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete master unit',
      });
    }
  }

  // Public GET: list master conversions
  async getMasterConversions(req, res) {
    try {
      const q = req.query || {};
      const options = {};
      if (q.business_type_uuid) options.business_type_uuid = q.business_type_uuid;
      if (q.is_active !== undefined) options.is_active = q.is_active === 'true';
      if (q.search) options.search = q.search;
      if (q.page !== undefined) options.page = parseInt(q.page, 10);
      if (q.limit !== undefined) options.limit = parseInt(q.limit, 10);

      const result = await MasterUnitModel.getMasterConversions(options);
      return res.json({ success: true, ...result });
    } catch (error) {
      console.error('[MasterUnits] getMasterConversions error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to load master unit conversions',
      });
    }
  }

  // Admin POST: create master conversion
  async createMasterConversion(req, res) {
    try {
      const created = await MasterUnitModel.createMasterConversion(req.body || {});
      return res.status(201).json({
        success: true,
        message: 'Master unit conversion created',
        data: created,
      });
    } catch (error) {
      console.error('[MasterUnits] createMasterConversion error:', error.message);
      const status = /required|Invalid|conversion_factor/i.test(error.message || '')
        ? 400
        : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to create master unit conversion',
      });
    }
  }

  // Admin PUT: update master conversion
  async updateMasterConversion(req, res) {
    try {
      const { id } = req.params;
      const updated = await MasterUnitModel.updateMasterConversion(id, req.body || {});
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Master unit conversion not found',
        });
      }
      return res.json({
        success: true,
        message: 'Master unit conversion updated',
        data: updated,
      });
    } catch (error) {
      console.error('[MasterUnits] updateMasterConversion error:', error.message);
      const status = /Invalid|conversion_factor/i.test(error.message || '') ? 400 : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to update master unit conversion',
      });
    }
  }

  // Admin DELETE: delete master conversion
  async deleteMasterConversion(req, res) {
    try {
      const { id } = req.params;
      const deleted = await MasterUnitModel.deleteMasterConversion(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Master unit conversion not found',
        });
      }
      return res.json({
        success: true,
        message: 'Master unit conversion deleted',
      });
    } catch (error) {
      console.error('[MasterUnits] deleteMasterConversion error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete master unit conversion',
      });
    }
  }
}

module.exports = new MasterUnitController();

