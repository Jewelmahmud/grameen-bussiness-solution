import axios from 'axios';
import { getApiBaseUrl } from '../config/api';

const API_BASE_URL = getApiBaseUrl();

// Multi-Bank POS Terminal Integration Service
class MultiBankPOSService {
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

  // Get all supported banks
  getSupportedBanks() {
    return [
      {
        id: 'dbbl',
        name: 'Dutch-Bangla Bank',
        shortName: 'DBBL',
        logo: '/images/banks/dbbl.png',
        color: '#1e3a8a',
        supportedCards: ['nexus', 'mastercard', 'visa', 'unionpay'],
        features: ['EMV Chip', 'Liability Shift', 'Fraud Protection'],
        terminals: ['VeriFone', 'Ingenico'],
        connectionTypes: ['PSTN', 'GPRS']
      },
      {
        id: 'citybank',
        name: 'City Bank',
        shortName: 'CityBank',
        logo: '/images/banks/citybank.png',
        color: '#dc2626',
        supportedCards: ['mastercard', 'visa', 'amex'],
        features: ['EMV Chip', 'Contactless', 'Mobile Payments'],
        terminals: ['VeriFone', 'PAX'],
        connectionTypes: ['PSTN', 'GPRS', 'WiFi']
      },
      {
        id: 'islamibank',
        name: 'Islami Bank Bangladesh',
        shortName: 'IBBL',
        logo: '/images/banks/islamibank.png',
        color: '#059669',
        supportedCards: ['mastercard', 'visa', 'unionpay'],
        features: ['EMV Chip', 'Islamic Banking', 'Halal Transactions'],
        terminals: ['VeriFone', 'Ingenico'],
        connectionTypes: ['PSTN', 'GPRS']
      },
      {
        id: 'bracbank',
        name: 'BRAC Bank',
        shortName: 'BRAC',
        logo: '/images/banks/bracbank.png',
        color: '#7c3aed',
        supportedCards: ['mastercard', 'visa', 'unionpay'],
        features: ['EMV Chip', 'Digital Banking', 'SME Focus'],
        terminals: ['VeriFone', 'PAX'],
        connectionTypes: ['PSTN', 'GPRS', 'WiFi']
      }
    ];
  }

  // Initialize POS terminal for any bank
  async initializeTerminal(bankId, terminalConfig) {
    try {
      const response = await this.api.post(`/pos/${bankId}/initialize`, {
        terminalId: terminalConfig.terminalId,
        merchantId: terminalConfig.merchantId,
        terminalType: terminalConfig.terminalType,
        connectionType: terminalConfig.connectionType,
        bankId: bankId
      });
      
      return {
        success: true,
        bankId: bankId,
        terminalStatus: response.data.status,
        message: `${this.getBankName(bankId)} terminal initialized successfully`
      };
    } catch (error) {
      console.error('Terminal initialization failed:', error);
      return {
        success: false,
        bankId: bankId,
        error: error.response?.data?.message || 'Terminal initialization failed'
      };
    }
  }

  // Process card payment for any bank
  async processCardPayment(bankId, paymentData) {
    try {
      const response = await this.api.post(`/pos/${bankId}/process-payment`, {
        amount: paymentData.amount,
        cardType: paymentData.cardType,
        cardNumber: paymentData.cardNumber,
        expiryDate: paymentData.expiryDate,
        cvv: paymentData.cvv,
        merchantId: paymentData.merchantId,
        terminalId: paymentData.terminalId,
        transactionType: 'SALE',
        bankId: bankId
      });

      return {
        success: true,
        bankId: bankId,
        bankName: this.getBankName(bankId),
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
        bankId: bankId,
        bankName: this.getBankName(bankId),
        error: error.response?.data?.message || 'Payment processing failed',
        responseCode: error.response?.data?.responseCode
      };
    }
  }

  // Process EMV chip card payment for any bank
  async processEMVPayment(bankId, paymentData) {
    try {
      const response = await this.api.post(`/pos/${bankId}/process-emv`, {
        amount: paymentData.amount,
        emvData: paymentData.emvData,
        merchantId: paymentData.merchantId,
        terminalId: paymentData.terminalId,
        transactionType: 'SALE',
        bankId: bankId
      });

      return {
        success: true,
        bankId: bankId,
        bankName: this.getBankName(bankId),
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
        bankId: bankId,
        bankName: this.getBankName(bankId),
        error: error.response?.data?.message || 'EMV payment processing failed',
        responseCode: error.response?.data?.responseCode
      };
    }
  }

  // Void/Refund transaction for any bank
  async voidTransaction(bankId, transactionData) {
    try {
      const response = await this.api.post(`/pos/${bankId}/void`, {
        originalTransactionId: transactionData.originalTransactionId,
        amount: transactionData.amount,
        reason: transactionData.reason,
        merchantId: transactionData.merchantId,
        terminalId: transactionData.terminalId,
        bankId: bankId
      });

      return {
        success: true,
        bankId: bankId,
        bankName: this.getBankName(bankId),
        voidTransactionId: response.data.voidTransactionId,
        message: response.data.message,
        timestamp: response.data.timestamp
      };
    } catch (error) {
      console.error('Void transaction failed:', error);
      return {
        success: false,
        bankId: bankId,
        bankName: this.getBankName(bankId),
        error: error.response?.data?.message || 'Void transaction failed'
      };
    }
  }

  // Get terminal status for any bank
  async getTerminalStatus(bankId, terminalId) {
    try {
      const response = await this.api.get(`/pos/${bankId}/status/${terminalId}`);
      
      return {
        success: true,
        bankId: bankId,
        bankName: this.getBankName(bankId),
        status: response.data.status,
        connectionType: response.data.connectionType,
        lastTransaction: response.data.lastTransaction,
        isOnline: response.data.isOnline
      };
    } catch (error) {
      console.error('Get terminal status failed:', error);
      return {
        success: false,
        bankId: bankId,
        bankName: this.getBankName(bankId),
        error: error.response?.data?.message || 'Failed to get terminal status'
      };
    }
  }

  // Get transaction history for any bank
  async getTransactionHistory(bankId, filters = {}) {
    try {
      const response = await this.api.get(`/pos/${bankId}/transactions`, {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          merchantId: filters.merchantId,
          terminalId: filters.terminalId,
          status: filters.status,
          limit: filters.limit || 50,
          bankId: bankId
        }
      });

      return {
        success: true,
        bankId: bankId,
        bankName: this.getBankName(bankId),
        transactions: response.data.transactions,
        totalCount: response.data.totalCount
      };
    } catch (error) {
      console.error('Get transaction history failed:', error);
      return {
        success: false,
        bankId: bankId,
        bankName: this.getBankName(bankId),
        error: error.response?.data?.message || 'Failed to get transaction history'
      };
    }
  }

  // Settlement for any bank
  async performSettlement(bankId, settlementData) {
    try {
      const response = await this.api.post(`/pos/${bankId}/settlement`, {
        merchantId: settlementData.merchantId,
        terminalId: settlementData.terminalId,
        settlementType: settlementData.settlementType,
        batchNumber: settlementData.batchNumber,
        bankId: bankId
      });

      return {
        success: true,
        bankId: bankId,
        bankName: this.getBankName(bankId),
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
        bankId: bankId,
        bankName: this.getBankName(bankId),
        error: error.response?.data?.message || 'Settlement failed'
      };
    }
  }

  // Test connection for any bank
  async testConnection(bankId, terminalId) {
    try {
      const response = await this.api.post(`/pos/${bankId}/test-connection`, {
        terminalId: terminalId,
        bankId: bankId
      });

      return {
        success: true,
        bankId: bankId,
        bankName: this.getBankName(bankId),
        connectionStatus: response.data.connectionStatus,
        responseTime: response.data.responseTime,
        message: response.data.message
      };
    } catch (error) {
      console.error('Connection test failed:', error);
      return {
        success: false,
        bankId: bankId,
        bankName: this.getBankName(bankId),
        error: error.response?.data?.message || 'Connection test failed'
      };
    }
  }

  // Get bank name by ID
  getBankName(bankId) {
    const bank = this.getSupportedBanks().find(b => b.id === bankId);
    return bank ? bank.name : 'Unknown Bank';
  }

  // Get bank by ID
  getBank(bankId) {
    return this.getSupportedBanks().find(b => b.id === bankId);
  }

  // Get all supported card types across all banks
  getAllSupportedCardTypes() {
    const allCards = new Set();
    this.getSupportedBanks().forEach(bank => {
      bank.supportedCards.forEach(card => allCards.add(card));
    });

    const cardTypes = {
      nexus: { name: 'Dutch Bangla Bank Nexus', description: 'Proprietary debit card' },
      mastercard: { name: 'MasterCard', description: 'Debit, Credit, Maestro' },
      visa: { name: 'Visa', description: 'Debit, Credit, Electron' },
      unionpay: { name: 'UnionPay', description: 'International payment network' },
      amex: { name: 'American Express', description: 'Credit card network' }
    };

    return Array.from(allCards).map(cardType => ({
      type: cardType,
      ...cardTypes[cardType]
    }));
  }

  // Get bank-specific configuration
  getBankConfiguration(bankId) {
    const bank = this.getBank(bankId);
    if (!bank) return null;

    return {
      supportedCards: bank.supportedCards,
      features: bank.features,
      terminals: bank.terminals,
      connectionTypes: bank.connectionTypes,
      color: bank.color,
      logo: bank.logo
    };
  }
}

const multiBankPOSService = new MultiBankPOSService();

export default multiBankPOSService;