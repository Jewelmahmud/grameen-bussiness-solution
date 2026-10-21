import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

const API_BASE_URL = getApiBaseUrl();

// POS System Integration Service
class POSService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // ===== SALES TRANSACTIONS =====
  
  // Create a new sale transaction
  async createSale(saleData) {
    try {
      const response = await this.api.post('/pos/sales', saleData);
      return response.data;
    } catch (error) {
      console.error('Error creating sale:', error);
      throw error;
    }
  }

  // Get all sales transactions
  async getSales(filters = {}) {
    try {
      const response = await this.api.get('/pos/sales', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw error;
    }
  }

  // Get sale by ID
  async getSaleById(saleId) {
    try {
      const response = await this.api.get(`/pos/sales/${saleId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sale:', error);
      throw error;
    }
  }

  // Update sale status
  async updateSaleStatus(saleId, status) {
    try {
      const response = await this.api.patch(`/pos/sales/${saleId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating sale status:', error);
      throw error;
    }
  }

  // ===== INVENTORY UPDATES =====

  // Update inventory after sale
  async updateInventoryAfterSale(saleId) {
    try {
      const response = await this.api.post(`/pos/sales/${saleId}/update-inventory`);
      return response.data;
    } catch (error) {
      console.error('Error updating inventory:', error);
      throw error;
    }
  }

  // Get inventory levels for POS
  async getInventoryForPOS(productIds = []) {
    try {
      const response = await this.api.get('/pos/inventory', {
        params: { productIds: productIds.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory for POS:', error);
      throw error;
    }
  }

  // Check stock availability
  async checkStockAvailability(productId, quantity) {
    try {
      const response = await this.api.post('/pos/check-stock', {
        productId,
        quantity
      });
      return response.data;
    } catch (error) {
      console.error('Error checking stock:', error);
      throw error;
    }
  }

  // ===== PRODUCTS =====

  // Get products for POS
  async getProductsForPOS(category = null, search = '') {
    try {
      const response = await this.api.get('/pos/products', {
        params: { category, search }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products for POS:', error);
      throw error;
    }
  }

  // Get product by barcode/SKU
  async getProductByBarcode(barcode) {
    try {
      const response = await this.api.get(`/pos/products/barcode/${barcode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product by barcode:', error);
      throw error;
    }
  }

  // ===== REPORTS =====

  // Get sales reports
  async getSalesReport(startDate, endDate, groupBy = 'day') {
    try {
      const response = await this.api.get('/pos/reports/sales', {
        params: { startDate, endDate, groupBy }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sales report:', error);
      throw error;
    }
  }

  // Get inventory movement report
  async getInventoryMovementReport(startDate, endDate) {
    try {
      const response = await this.api.get('/pos/reports/inventory-movement', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory movement report:', error);
      throw error;
    }
  }

  // ===== REAL-TIME UPDATES =====

  // Subscribe to real-time updates
  subscribeToUpdates(callback) {
    // WebSocket connection for real-time updates
    const ws = new WebSocket(`${process.env.REACT_APP_WS_URL || 'ws://localhost:8000'}/pos/updates`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return ws;
  }

  // ===== SYNC FUNCTIONS =====

  // Sync offline sales when connection is restored
  async syncOfflineSales(offlineSales) {
    try {
      const response = await this.api.post('/pos/sync/offline-sales', {
        sales: offlineSales
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing offline sales:', error);
      throw error;
    }
  }

  // Sync inventory changes
  async syncInventoryChanges(changes) {
    try {
      const response = await this.api.post('/pos/sync/inventory', {
        changes
      });
      return response.data;
    } catch (error) {
      console.error('Error syncing inventory changes:', error);
      throw error;
    }
  }
}

export default new POSService(); 