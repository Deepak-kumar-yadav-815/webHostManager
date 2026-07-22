const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  shortUrlAlias: {
    type: String, // e.g., 'xyz123'
    unique: true,
  },
  cloudinaryRawUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  enableFeedback: {
    type: Boolean,
    default: true
  },
  cpuUsageLimit: {
    type: Number,
    default: 100, // mock limit
  },
  ramUsageLimitMB: {
    type: Number,
    default: 512, // mock limit
  },
  aiInsightsCache: {
    type: String,
  },
  aiInsightsUpdatedAt: {
    type: Date,
  }
}, { timestamps: true });

const Website = mongoose.model('Website', websiteSchema);
module.exports = Website;
// Triggering reload for cache fields
