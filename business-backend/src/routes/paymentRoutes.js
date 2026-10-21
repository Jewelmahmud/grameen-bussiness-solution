const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const InputValidation = require('../middleware/inputValidation');

/**
 * Payment Routes
 * Base path: /api/v1/payment
 */

// Sanitize all inputs (except IPN which comes from external service)
router.use((req, res, next) => {
  if (req.path !== '/ipn') {
    InputValidation.sanitize()(req, res, next);
  } else {
    next();
  }
});

// POST /api/v1/payment/initiate
router.post('/initiate',
  InputValidation.validate({
    body: {
      planId: { type: 'string', required: true },
      amount: { type: 'decimal', required: true, min: 0 }
    }
  }),
  (req, res) => paymentController.initiate(req, res)
);

// POST /api/v1/payment/ipn (SSLCommerz IPN endpoint)
// Note: IPN endpoint doesn't use validation as it receives data from external service
router.post('/ipn', express.urlencoded({ extended: true }), (req, res) => paymentController.handleIPN(req, res));

// GET /api/v1/payment/success
router.get('/success',
  InputValidation.validate({
    query: {
      tran_id: { type: 'string', required: true }
    }
  }),
  (req, res) => paymentController.success(req, res)
);

module.exports = router;

