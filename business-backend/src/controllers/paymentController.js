const paymentService = require('../services/paymentService');
const BusinessModel = require('../models/BusinessModel');
const PaymentModel = require('../models/PaymentModel');

/**
 * Payment Controller - Handles payment requests
 */
class PaymentController {
  /**
   * Initiate payment
   */
  async initiate(req, res) {
    try {
      const { planId, amount, registrationData } = req.body;

      if (!planId || !amount || !registrationData) {
        return res.status(400).json({
          success: false,
          message: 'পেমেন্ট তথ্য প্রয়োজন'
        });
      }

      const result = await paymentService.initiatePayment({
        planId,
        amount,
        registrationData
      });

      return res.json(result);
    } catch (error) {
      console.error('[Payment] Initiate error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'পেমেন্ট শুরু করতে ব্যর্থ হয়েছে'
      });
    }
  }

  /**
   * Handle SSLCommerz IPN (Instant Payment Notification)
   */
  async handleIPN(req, res) {
    try {
      const ipnData = req.body;

      // Verify payment
      const verification = await paymentService.verifyPayment(ipnData);

      if (verification.verified && verification.data.status === 'VALID') {
        // Get tenant UUID from value_a
        const tenantUuid = ipnData.value_a;
        const planId = ipnData.value_b;

        if (tenantUuid && planId) {
          // Update subscription plan
          await BusinessModel.updateSubscriptionPlan(tenantUuid, planId);

          // Ensure payment method exists
          await PaymentModel.ensurePaymentMethod(tenantUuid);

          // Get payment method UUID
          const paymentMethodUuid = await PaymentModel.getPaymentMethodUuid(tenantUuid);

          // Log payment
          await PaymentModel.createPayment({
            tenantUuid,
            paymentNumber: `PAY-${Date.now()}`,
            referenceUuid: tenantUuid,
            amount: ipnData.amount,
            transactionId: ipnData.tran_id,
            paymentMethodUuid
          });
        }
      }

      // Always return success to SSLCommerz
      return res.status(200).send('SUCCESS');
    } catch (error) {
      console.error('[Payment] IPN error:', error.message);
      return res.status(200).send('FAILED'); // Still return to SSLCommerz
    }
  }

  /**
   * Handle payment success callback
   */
  async success(req, res) {
    try {
      const { tran_id } = req.query;

      // Verify payment
      const verification = await paymentService.verifyPayment({ tran_id });

      if (verification.verified) {
        return res.json({
          success: true,
          message: 'পেমেন্ট সফল হয়েছে',
          data: verification.data
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'পেমেন্ট যাচাইকরণ ব্যর্থ হয়েছে'
        });
      }
    } catch (error) {
      console.error('[Payment] Success callback error:', error.message);
      return res.status(500).json({
        success: false,
        message: error.message || 'পেমেন্ট প্রক্রিয়াকরণে সমস্যা হয়েছে'
      });
    }
  }
}

module.exports = new PaymentController();

