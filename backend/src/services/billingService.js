/**
 * Mock Billing Service
 * Simulates a payment gateway (e.g., Stripe, Razorpay)
 */

class BillingService {
  /**
   * Process a payment (Mock)
   * @param {number} amountINR Amount in INR
   * @param {Object} paymentDetails e.g., mock credit card info
   * @returns {Promise<Object>} Mock transaction result
   */
  static async processPayment(amountINR, paymentDetails) {
    return new Promise((resolve, reject) => {
      // Simulate network delay
      setTimeout(() => {
        if (amountINR < 0) {
          return reject(new Error('Invalid payment amount'));
        }
        
        // Mock 90% success rate
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
          resolve({
            success: true,
            transactionId: `txn_mock_${Math.random().toString(36).substr(2, 9)}`,
            amountPaid: amountINR,
            currency: 'INR',
            timestamp: new Date()
          });
        } else {
          reject(new Error('Payment failed. Bank declined the transaction.'));
        }
      }, 1000); // 1 second mock delay
    });
  }
}

module.exports = BillingService;
