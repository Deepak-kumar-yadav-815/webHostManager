const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const Invoice = require('../models/Invoice');
const BillingService = require('../services/billingService');

// Helper to calculate end date
const calculateEndDate = (startDate, billingCycle) => {
  const endDate = new Date(startDate);
  if (billingCycle === 'daily') {
    endDate.setDate(endDate.getDate() + 1);
  } else if (billingCycle === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (billingCycle === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  return endDate;
};

// @desc    Purchase or Upgrade a plan (Instant override)
// @route   POST /api/subscriptions/purchase
// @access  Private
const purchasePlan = async (req, res) => {
  try {
    const { planId, paymentDetails } = req.body;
    const userId = req.user._id;

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // Process Mock Payment
    const paymentResult = await BillingService.processPayment(plan.priceINR, paymentDetails);

    const startDate = new Date();
    const endDate = calculateEndDate(startDate, plan.billingCycle);

    // Check if user already has a subscription
    let subscription = await Subscription.findOne({ user: userId });

    if (subscription) {
      // Instant Upgrade/Downgrade (Overrides current plan)
      subscription.plan = planId;
      subscription.startDate = startDate;
      subscription.endDate = endDate;
      subscription.status = 'active';
      // Clear any queued plan
      subscription.queuedPlan = undefined;
      subscription.queuedPlanStartDate = undefined;
      subscription.queuedPlanEndDate = undefined;
      await subscription.save();
    } else {
      // First time purchase
      subscription = await Subscription.create({
        user: userId,
        plan: planId,
        startDate,
        endDate,
        status: 'active'
      });
    }

    // Generate Invoice
    const invoice = await Invoice.create({
      user: userId,
      subscription: subscription._id,
      amountPaidINR: paymentResult.amountPaid,
      paymentMethod: 'Mock Credit Card', // Based on paymentDetails in real scenario
    });

    // Generate Notifications
    const Notification = require('../models/Notification');
    const User = require('../models/User');
    const io = req.app.get('io');
    
    // 1. Notify User
    const userMsg = `You have successfully purchased the ${plan.name} plan!`;
    const userNotif = await Notification.create({ user: userId, message: userMsg, type: 'success' });
    if (io) io.to(userId.toString()).emit('new_notification', userNotif);

    // 2. Notify Admin
    const adminUser = await User.findOne({ role: 'Admin' });
    if (adminUser) {
      const adminMsg = `User ${req.user.name} has purchased the ${plan.name} plan.`;
      const adminNotif = await Notification.create({ user: adminUser._id, message: adminMsg, type: 'info' });
      if (io) io.to(adminUser._id.toString()).emit('new_notification', adminNotif);
    }

    res.status(200).json({ message: 'Plan purchased successfully', subscription, invoice });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Queue a plan renewal (Starts after current plan ends)
// @route   POST /api/subscriptions/queue
// @access  Private
const queuePlan = async (req, res) => {
  try {
    const { planId, paymentDetails } = req.body;
    const userId = req.user._id;

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    let subscription = await Subscription.findOne({ user: userId });
    if (!subscription || subscription.status === 'expired' || subscription.status === 'cancelled') {
      return res.status(400).json({ message: 'No active subscription to queue after. Please purchase a plan first.' });
    }

    if (subscription.queuedPlan) {
       return res.status(400).json({ message: 'You already have a queued plan. Wait for it to activate before queuing another.' });
    }

    // Process Mock Payment
    const paymentResult = await BillingService.processPayment(plan.priceINR, paymentDetails);

    // Queue starts right after current ends
    const queuedStartDate = new Date(subscription.endDate);
    const queuedEndDate = calculateEndDate(queuedStartDate, plan.billingCycle);

    subscription.queuedPlan = planId;
    subscription.queuedPlanStartDate = queuedStartDate;
    subscription.queuedPlanEndDate = queuedEndDate;
    await subscription.save();

    // Generate Invoice
    const invoice = await Invoice.create({
      user: userId,
      subscription: subscription._id,
      amountPaidINR: paymentResult.amountPaid,
      paymentMethod: 'Mock Credit Card',
    });

    // Generate Notifications
    const Notification = require('../models/Notification');
    const User = require('../models/User');
    const io = req.app.get('io');
    
    // 1. Notify User
    const userMsg = `You have successfully queued the ${plan.name} plan!`;
    const userNotif = await Notification.create({ user: userId, message: userMsg, type: 'success' });
    if (io) io.to(userId.toString()).emit('new_notification', userNotif);

    // 2. Notify Admin
    const adminUser = await User.findOne({ role: 'Admin' });
    if (adminUser) {
      const adminMsg = `User ${req.user.name} has queued the ${plan.name} plan.`;
      const adminNotif = await Notification.create({ user: adminUser._id, message: adminMsg, type: 'info' });
      if (io) io.to(adminUser._id.toString()).emit('new_notification', adminNotif);
    }

    res.status(200).json({ message: 'Plan queued successfully', subscription, invoice });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's current subscription
// @route   GET /api/subscriptions/me
// @access  Private
const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id })
      .populate('plan')
      .populate('queuedPlan');
    
    if (!subscription) {
      return res.status(404).json({ message: 'No subscription found' });
    }
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel Active Plan
// @route   POST /api/subscriptions/cancel-active
// @access  Private
const cancelActivePlan = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id, status: 'active' });
    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'cancelled';
    subscription.endDate = new Date();
    await subscription.save();

    res.status(200).json({ message: 'Active plan cancelled successfully', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel Queued Plan
// @route   POST /api/subscriptions/cancel-queued
// @access  Private
const cancelQueuedPlan = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    if (!subscription || !subscription.queuedPlan) {
      return res.status(404).json({ message: 'No queued plan found' });
    }

    subscription.queuedPlan = undefined;
    subscription.queuedPlanStartDate = undefined;
    subscription.queuedPlanEndDate = undefined;
    await subscription.save();

    res.status(200).json({ message: 'Queued plan cancelled successfully', subscription });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { purchasePlan, queuePlan, getMySubscription, cancelActivePlan, cancelQueuedPlan };
