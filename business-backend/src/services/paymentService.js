const axios = require('axios');
const crypto = require('crypto');

/**
 * Payment Service - Handles SSLCommerz payment integration
 */
class PaymentService {
  constructor() {
    // SSLCommerz configuration (from environment variables)
    this.storeId = process.env.SSLCOMMERZ_STORE_ID || '';
    this.storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD || '';
    this.isLive = process.env.SSLCOMMERZ_IS_LIVE === 'true';
    this.baseUrl = this.isLive
      ? 'https://securepay.sslcommerz.com'
      : 'https://sandbox.sslcommerz.com';
  }

  /**
   * Initiate payment with SSLCommerz
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} - Payment initiation response
   */
  async initiatePayment(paymentData) {
    const { planId, amount, registrationData } = paymentData;

    if (!this.storeId || !this.storePassword) {
      throw new Error('SSLCommerz configuration is missing');
    }

    // Generate transaction ID
    const tranId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Prepare payment request
    const paymentRequest = {
      store_id: this.storeId,
      store_passwd: this.storePassword,
      total_amount: amount,
      currency: 'BDT',
      tran_id: tranId,
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?tran_id=${tranId}`,
      fail_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/fail?tran_id=${tranId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel?tran_id=${tranId}`,
      ipn_url: `${process.env.BACKEND_URL || 'http://localhost:3002'}/api/v1/payment/ipn`,
      cus_name: `${registrationData.user.firstName} ${registrationData.user.lastName}`,
      cus_email: registrationData.user.email,
      cus_add1: registrationData.business?.address || '',
      cus_city: 'Dhaka',
      cus_postcode: registrationData.business?.postalCode || '',
      cus_country: 'Bangladesh',
      cus_phone: registrationData.user.phone,
      shipping_method: 'NO',
      product_name: `Subscription Plan: ${planId}`,
      product_category: 'Subscription',
      product_profile: 'general',
      value_a: registrationData.tenant?.tenant_uuid || '',
      value_b: planId,
      value_c: registrationData.user.id
    };

    try {
      // Convert to URL-encoded format
      const formData = new URLSearchParams();
      Object.keys(paymentRequest).forEach(key => {
        formData.append(key, paymentRequest[key]);
      });

      const response = await axios.post(
        `${this.baseUrl}/gwprocess/v4/api.php`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 30000
        }
      );

      // SSLCommerz can return different formats
      let responseData = response.data;
      
      // Handle string response (key=value format)
      if (typeof responseData === 'string') {
        const params = new URLSearchParams(responseData);
        const status = params.get('status');
        const gatewayUrl = params.get('GatewayPageURL') || params.get('gatewayPageURL');
        const failedReason = params.get('failedreason') || params.get('failedReason');
        
        if (status === 'SUCCESS' && gatewayUrl) {
          return {
            success: true,
            data: {
              paymentUrl: gatewayUrl,
              tranId: tranId,
              sessionKey: params.get('sessionkey') || params.get('sessionKey')
            }
          };
        } else {
          throw new Error(failedReason || 'Payment initiation failed');
        }
      }

      // Handle JSON/object response
      if (responseData && (responseData.status === 'SUCCESS' || responseData.status === 'success')) {
        return {
          success: true,
          data: {
            paymentUrl: responseData.GatewayPageURL || responseData.gatewayPageURL,
            tranId: tranId,
            sessionKey: responseData.sessionkey || responseData.sessionKey
          }
        };
      } else {
        throw new Error(responseData.failedreason || responseData.failedReason || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('[Payment] SSLCommerz error:', error.message);
      throw new Error('পেমেন্ট শুরু করতে ব্যর্থ হয়েছে');
    }
  }

  /**
   * Verify payment from SSLCommerz IPN
   * @param {Object} ipnData - IPN data from SSLCommerz
   * @returns {Promise<Object>} - Verification result
   */
  async verifyPayment(ipnData) {
    const { tran_id, val_id, amount, store_amount, currency, status } = ipnData;

    // Verify with SSLCommerz
    const verifyRequest = {
      store_id: this.storeId,
      store_passwd: this.storePassword,
      val_id: val_id,
      format: 'json'
    };

    try {
      const response = await axios.get(
        `${this.baseUrl}/validator/api/validationserverAPI.php`,
        { params: verifyRequest, timeout: 30000 }
      );

      if (response.data && response.data.status === 'VALID' || response.data.status === 'VALIDATED') {
        return {
          success: true,
          verified: true,
          data: {
            tranId: tran_id,
            amount: amount,
            currency: currency,
            status: status
          }
        };
      } else {
        return {
          success: false,
          verified: false,
          message: 'Payment verification failed'
        };
      }
    } catch (error) {
      console.error('[Payment] Verification error:', error.message);
      throw new Error('Payment verification failed');
    }
  }
}

module.exports = new PaymentService();

