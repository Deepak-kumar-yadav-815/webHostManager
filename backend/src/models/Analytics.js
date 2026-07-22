const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: true,
  },
  totalVisits: {
    type: Number,
    default: 0,
  },
  uniqueVisitors: {
    type: Number,
    default: 0,
  },
  locations: [{
    country: String,
    count: Number,
  }],
  currentActiveVisitors: {
    type: Number,
    default: 0,
  },
  mockUptimePercentage: {
    type: Number,
    default: 100,
  }
}, { timestamps: true });

const Analytics = mongoose.model('Analytics', analyticsSchema);
module.exports = Analytics;
