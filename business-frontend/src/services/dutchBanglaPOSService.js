import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

const API_BASE_URL = getApiBaseUrl();

// Dutch-Bangla Bank POS Terminal Integration Service
class DutchBanglaPOSService {
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

  // Initialize POS terminal connection
  async initializeTerminal(terminalConfig) {
    try {
      const response = await this.api.post('/pos/dutchbangla/initialize', {
        terminalId: terminalConfig.terminalId,
        merchantId: terminalConfig.merchantId,
        terminalType: terminalConfig.terminalType, // 'PSTN' or 'GPRS'
        connectionType: terminalConfig.connectionType
      });
      
      return {
        success: true,
        terminalStatus: response.data.status,
        message: 'Terminal initialized successfully'
      };
    } catch (error) {
      console.error('Terminal initialization failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Terminal initialization failed'
      };
    }
  }

  // Process card payment
  async processCardPayment(paymentData) {
    try {
      const response = await this.api.post('/pos/dutchbangla/process-payment', {
        amount: paymentData.amount,
        cardType: paymentData.cardType, // 'nexus', 'mastercard', 'visa', 'unionpay'
        cardNumber: paymentData.cardNumber,
        expiryDate: paymentData.expiryDate,
        cvv: paymentData.cvv,
        merchantId: paymentData.merchantId,
        terminalId: paymentData.terminalId,
        transactionType: 'SALE'
      });

      return {
        success: true,
        transactionId: response.data.transactionId,
        approvalCode: response.data.approvalCode,
        responseCode: response.data.responseCode,
        message: response.data.message,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('Card payment failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Payment processing failed',
        responseCode: error.response?.data?.responseCode
      };
    }
  }

  // Process EMV chip card payment
  async processEMVPayment(paymentData) {
    try {
      const response = await this.api.post('/pos/dutchbangla/process-emv', {
        amount: paymentData.amount,
        emvData: paymentData.emvData,
        merchantId: paymentData.merchantId,
        terminalId: paymentData.terminalId,
        transactionType: 'SALE'
      });

      return {
        success: true,
        transactionId: response.data.transactionId,
        approvalCode: response.data.approvalCode,
        emvResponse: response.data.emvResponse,
        message: response.data.message,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('EMV payment failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'EMV payment processing failed',
        responseCode: error.response?.data?.responseCode
      };
    }
  }

  // Void/Refund transaction
  async voidTransaction(transactionData) {
    try {
      const response = await this.api.post('/pos/dutchbangla/void', {
        originalTransactionId: transactionData.originalTransactionId,
        amount: transactionData.amount,
        reason: transactionData.reason,
        merchantId: transactionData.merchantId,
        terminalId: transactionData.terminalId
      });

      return {
        success: true,
        voidTransactionId: response.data.voidTransactionId,
        message: response.data.message,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('Void transaction failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Void transaction failed'
      };
    }
  }

  // Get terminal status
  async getTerminalStatus(terminalId) {
    try {
      const response = await this.api.get(`/pos/dutchbangla/status/${terminalId}`);
      
      return {
        success: true,
        status: response.data.status,
        connectionType: response.data.connectionType,
        lastTransaction: response.data.lastTransaction,
        isOnline: response.data.isOnline
      };
    } catch (error) {
      console.error('Get terminal status failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get terminal status'
      };
    }
  }

  // Get transaction history
  async getTransactionHistory(filters = {}) {
    try {
      const response = await this.api.get('/pos/dutchbangla/transactions', {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          merchantId: filters.merchantId,
          terminalId: filters.terminalId,
          status: filters.status,
          limit: filters.limit || 50
        }
      });

      return {
        success: true,
        transactions: response.data.transactions,
        totalCount: response.data.totalCount
      };
    } catch (error) {
      console.error('Get transaction history failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get transaction history'
      };
    }
  }

  // Settlement
  async performSettlement(settlementData) {
    try {
      const response = await this.api.post('/pos/dutchbangla/settlement', {
        merchantId: settlementData.merchantId,
        terminalId: settlementData.terminalId,
        settlementType: settlementData.settlementType, // 'END_OF_DAY', 'MANUAL'
        batchNumber: settlementData.batchNumber
      });

      return {
        success: true,
        settlementId: response.data.settlementId,
        totalAmount: response.data.totalAmount,
        transactionCount: response.data.transactionCount,
        message: response.data.message,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('Settlement failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Settlement failed'
      };
    }
  }

  // Test connection
  async testConnection(terminalId) {
    try {
      const response = await this.api.post('/pos/dutchbangla/test-connection', {
        terminalId: terminalId
      });

      return {
        success: true,
        connectionStatus: response.data.connectionStatus,
        responseTime: response.data.responseTime,
        message: response.data.message
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Connection test failed'
      };
    }
  }

  // Get supported card types
  getSupportedCardTypes() {
    return [
      {
        type: 'nexus',
        name: 'Dutch Bangla Bank Nexus',
        description: 'Proprietary debit card',
        logo: '/images/cards/nexus.png'
      },
      {
        type: 'mastercard',
        name: 'MasterCard',
        description: 'Debit, Credit, Maestro',
        logo: '/images/cards/mastercard.png'
      },
      {
        type: 'visa',
        name: 'Visa',
        description: 'Debit, Credit, Electron',
        logo: '/images/cards/visa.png'
      },
      {
        type: 'unionpay',
        name: 'UnionPay',
        description: 'International payment network',
        logo: '/images/cards/unionpay.png'
      }
    ];
  }

  // Get terminal configuration
  getTerminalConfiguration() {
    return {
      supportedTerminals: ['VeriFone', 'Ingenico'],
      connectionTypes: ['PSTN', 'GPRS'],
      securityFeatures: ['EMV Chip', 'Liability Shift', 'Fraud Protection'],
      supportedCards: this.getSupportedCardTypes()
    };
  }
}

const dutchBanglaPOSService = new DutchBanglaPOSService();

export default dutchBanglaPOSService;