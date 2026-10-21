const SafeQuery = require('../utils/safeQuery');
const SecurityUtils = require('../utils/security');

/**
 * Payment Model - Handles payment-related database operations
 */
class PaymentModel {
  /**
   * Ensure payment method exists for tenant
   * @param {string} tenantUuid - Tenant UUID
   * @returns {Promise<void>}
   */
  static async ensurePaymentMethod(tenantUuid) {
    // Validate UUID
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }

    const query = `
      INSERT INTO finance.payment_methods (payment_method_uuid, tenant_uuid, name, type, is_active)
      SELECT gen_random_uuid(), $1, 'SSLCommerz', 'mobile_banking', true
      WHERE NOT EXISTS (
        SELECT 1 FROM finance.payment_methods WHERE tenant_uuid = $1 AND type = 'mobile_banking'
      )
    `;
    
    await SafeQuery.execute(query, [tenantUuid]);
  }

  /**
   * Get payment method UUID for tenant
   * @param {string} tenantUuid - Tenant UUID
   * @returns {Promise<string|null>}
   */
  static async getPaymentMethodUuid(tenantUuid) {
    // Validate UUID
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }

    const query = `
      SELECT payment_method_uuid 
      FROM finance.payment_methods 
      WHERE tenant_uuid = $1 AND type = 'mobile_banking' AND is_active = true
      LIMIT 1
    `;
    
    const result = await SafeQuery.execute(query, [tenantUuid]);
    return result.rows[0]?.payment_method_uuid || null;
  }

  /**
   * Create payment record
   * @param {Object} paymentData - Payment data
   * @param {string} paymentData.tenantUuid - Tenant UUID
   * @param {string} paymentData.paymentNumber - Payment number
   * @param {string} paymentData.referenceUuid - Reference UUID (usually tenant UUID for subscriptions)
   * @param {number} paymentData.amount - Payment amount
   * @param {string} paymentData.transactionId - Transaction ID from payment gateway
   * @param {string} paymentData.paymentMethodUuid - Payment method UUID
   * @returns {Promise<Object>}
   */
  static async createPayment(paymentData) {
    const {
      tenantUuid,
      paymentNumber,
      referenceUuid,
      amount,
      transactionId,
      paymentMethodUuid
    } = paymentData;

    // Validate UUIDs
    if (!SecurityUtils.isValidUUID(tenantUuid)) {
      throw new Error('Invalid tenant UUID format');
    }

    if (referenceUuid && !SecurityUtils.isValidUUID(referenceUuid)) {
      throw new Error('Invalid reference UUID format');
    }

    if (paymentMethodUuid && !SecurityUtils.isValidUUID(paymentMethodUuid)) {
      throw new Error('Invalid payment method UUID format');
    }

    // Validate and sanitize payment number
    const sanitizedPaymentNumber = SecurityUtils.sanitizeString(paymentNumber || `PAY-${Date.now()}`, { maxLength: 50 });
    
    // Validate and sanitize transaction ID
    const sanitizedTransactionId = SecurityUtils.sanitizeString(transactionId || '', { maxLength: 100 });
    
    // Validate amount
    const validatedAmount = SecurityUtils.validateDecimal(amount, { min: 0 });
    if (validatedAmount === null) {
      throw new Error('Invalid payment amount');
    }

    const query = `
      INSERT INTO finance.payments (
        payment_uuid, tenant_uuid, payment_number, payment_type,
        reference_type, reference_uuid, payment_date, amount,
        payment_method_uuid, transaction_id, notes
      ) VALUES (
        gen_random_uuid(), $1, $2, 'subscription',
        'subscription', $3, CURRENT_DATE, $4,
        $5, $6, 'SSLCommerz payment for subscription'
      )
      RETURNING *
    `;
    
    const result = await SafeQuery.execute(query, [
      tenantUuid,
      sanitizedPaymentNumber,
      referenceUuid,
      validatedAmount,
      paymentMethodUuid,
      sanitizedTransactionId
    ]);
    
    return result.rows[0];
  }
}

module.exports = PaymentModel;

