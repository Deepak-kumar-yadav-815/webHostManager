const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  priceINR: {
    type: Number,
    required: true,
  },
  billingCycle: {
    type: String,
    enum: ['daily', 'monthly', 'yearly'],
    default: 'monthly',
  },
  features: [String],
  maxWebsites: {
    type: Number,
    default: 1,
  },
  storageLimitMB: {
    type: Number,
    default: 100,
  }
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);
module.exports = Plan;
