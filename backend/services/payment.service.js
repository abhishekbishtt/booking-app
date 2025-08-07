
const Razorpay = require('razorpay');

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createPaymentOrder(amount, reservationId, userEmail) {
    try {
      // Input validation
      if (!amount || !reservationId || !userEmail) {
        throw new Error('Invalid payment order parameters.');
      }
      
      if (amount <= 0) {
        throw new Error('Amount must be greater than zero.');
      }
      
      if (!userEmail.includes('@')) {
        throw new Error('Invalid email format.');
      }

      // Create Razorpay order
      const options = {
        amount: Math.round(amount * 100), 
        currency: 'INR',
        receipt: `receipt_${reservationId}`,
        notes: {
          reservationId: reservationId.toString(),
          userEmail: userEmail
        }
      };

      const order = await this.razorpay.orders.create(options);

      
      console.log(`Razorpay order created:`, {
        orderId: order.id,
        amount: order.amount,
        reservationId,
        userEmail,
        timestamp: new Date().toISOString()
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID, // will use inb fronted 
        status: order.status
      };
    } catch (error) {
      console.error(`Razorpay order creation failed:`, {
        error: error.message,
        reservationId,
        userEmail,
        amount,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Payment order creation failed: ${error.message}`);
    }
  }

  async verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
      // Input validation
      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new Error('Missing payment verification parameters.');
      }

      // Verify payment signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      const isValidSignature = expectedSignature === razorpaySignature;

      // Enhanced logging
      console.log(`Payment verification:`, {
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        isValid: isValidSignature,
        timestamp: new Date().toISOString()
      });

      if (isValidSignature) {
        // Get payment details
        const payment = await this.razorpay.payments.fetch(razorpayPaymentId);
        
        return {
          isSucceeded: payment.status === 'captured',
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          paymentId: razorpayPaymentId,
          orderId: razorpayOrderId
        };
      } else {
        throw new Error('Invalid payment signature');
      }
    } catch (error) {
      console.error(`Payment verification failed:`, {
        error: error.message,
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  // Bonus: Refund functionality
  async refundPayment(paymentId, amount = null) {
    try {
      const refundData = { payment_id: paymentId };
      if (amount) refundData.amount = Math.round(amount * 100);

      const refund = await this.razorpay.payments.refund(paymentId, refundData);
      
      console.log(`Refund processed:`, {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        timestamp: new Date().toISOString()
      });

      return {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status
      };
    } catch (error) {
      console.error(`Refund failed:`, {
        error: error.message,
        paymentId,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Refund failed: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
