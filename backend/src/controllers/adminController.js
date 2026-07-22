const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Website = require('../models/Website');
const Invoice = require('../models/Invoice');
const Feedback = require('../models/Feedback');

// @desc    Get Global Analytics for Admin
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getGlobalAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'User' });
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const totalWebsitesHosted = await Website.countDocuments();
    
    const Repository = require('../models/Repository');
    const totalRepositories = await Repository.countDocuments();
    
    const invoices = await Invoice.find();
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.amountPaidINR || 0), 0);

    // Build real "Recent Activity" timeline by fetching latest records from various collections
    const recentUsers = await User.find({ role: 'User' }).sort({ createdAt: -1 }).limit(3).select('name createdAt');
    const recentWebsites = await Website.find().sort({ createdAt: -1 }).limit(3).select('name createdAt');
    const recentFeedback = await Feedback.find().sort({ createdAt: -1 }).limit(3).select('rating createdAt');
    const recentInvoices = await Invoice.find().sort({ createdAt: -1 }).limit(3).select('amountPaidINR createdAt');

    let recentActivity = [];
    
    recentUsers.forEach(u => recentActivity.push({
      action: `New User Registered: ${u.name}`,
      createdAt: u.createdAt
    }));
    
    recentWebsites.forEach(w => recentActivity.push({
      action: `New Website Hosted: ${w.name}`,
      createdAt: w.createdAt
    }));

    recentFeedback.forEach(f => recentActivity.push({
      action: `New Feedback Received (${f.rating}/5)`,
      createdAt: f.createdAt
    }));

    recentInvoices.forEach(i => recentActivity.push({
      action: `Payment Received: ₹${i.amountPaidINR}`,
      createdAt: i.createdAt
    }));

    // Sort all combined activities descending by date and take top 5
    recentActivity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    recentActivity = recentActivity.slice(0, 5).map((act, index) => {
      // Calculate relative time string manually or just send ISO date
      return {
        id: index + 1,
        action: act.action,
        time: new Date(act.createdAt).toLocaleString() // sending localized string
      };
    });

    res.json({
      totalUsers,
      activeSubscriptions,
      totalWebsitesHosted,
      totalRepositories,
      totalRevenue: `₹${totalRevenue.toLocaleString()}`,
      recentActivity
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getGlobalAnalytics };
