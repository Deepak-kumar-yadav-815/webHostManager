const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
  },
  amountPaidINR: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String, // e.g., 'Mock Credit Card', 'UPI'
    default: 'Mock Payment',
  },
  pdfUrl: {
    type: String, // Link to stored PDF invoice
  },
  billingDate: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
