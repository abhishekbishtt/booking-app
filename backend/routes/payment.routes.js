const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Create a new payment intent
router.post('/', verifyToken, paymentController.createPayment);

// Get user's payment history
router.get('/history', verifyToken, paymentController.getPaymentHistory);

// Get specific payment details
router.get('/:paymentId', verifyToken, paymentController.getPaymentById);

// Confirm payment (with Razorpay verification)
router.post('/:paymentId/confirm', verifyToken, paymentController.confirmPayment);

// Payment webhook (for Razorpay notifications) - No auth needed as it comes from Razorpay
router.post('/webhook', paymentController.handleWebhook);

// Refund a payment (admin only)
router.post('/:paymentId/refund', verifyToken, isAdmin, paymentController.refundPayment);

module.exports = router;
