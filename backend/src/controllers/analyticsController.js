const Analytics = require('../models/Analytics');
const Website = require('../models/Website');
const Subscription = require('../models/Subscription');
const AIService = require('../services/aiService');
const axios = require('axios');

// @desc    Get website analytics
// @route   GET /api/analytics/:websiteId
// @access  Private
const getWebsiteAnalytics = async (req, res) => {
  try {
    const website = await Website.findOne({ _id: req.params.websiteId, user: req.user._id });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    let analytics = await Analytics.findOne({ website: website._id });
    if (!analytics) {
      // Create mock initial analytics
      analytics = await Analytics.create({
        website: website._id,
        totalVisits: Math.floor(Math.random() * 1000),
        uniqueVisitors: Math.floor(Math.random() * 500),
        currentActiveVisitors: Math.floor(Math.random() * 50),
      });
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate AI Report for a website
// @route   POST /api/analytics/:websiteId/ai-report
// @access  Private
const generateAIReport = async (req, res) => {
  try {
    const website = await Website.findOne({ _id: req.params.websiteId, user: req.user._id });
    if (!website) {
      return res.status(404).json({ message: 'Website not found' });
    }

    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' }).populate('plan');
    if (!subscription) {
      return res.status(403).json({ message: 'Active subscription required' });
    }

    // Fetch snippet of HTML from Cloudinary to send to AI
    const response = await axios.get(website.cloudinaryRawUrl);
    const htmlSnippet = response.data.substring(0, 1000); // Send first 1000 chars

    const report = await AIService.analyzeWebsite(
      website.name,
      subscription.plan.features,
      htmlSnippet
    );

    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWebsiteAnalytics, generateAIReport };
