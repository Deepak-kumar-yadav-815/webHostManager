const Plan = require('../models/Plan');

// @desc    Create a new plan
// @route   POST /api/plans
// @access  Private/Admin
const createPlan = async (req, res) => {
  try {
    const { name, priceINR, billingCycle, features, maxWebsites, storageLimitMB } = req.body;

    const plan = new Plan({
      name,
      priceINR,
      billingCycle,
      features,
      maxWebsites,
      storageLimitMB,
    });

    const createdPlan = await plan.save();
    res.status(201).json(createdPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all plans
// @route   GET /api/plans
// @access  Public
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (plan) {
      plan.name = req.body.name || plan.name;
      plan.priceINR = req.body.priceINR || plan.priceINR;
      plan.billingCycle = req.body.billingCycle || plan.billingCycle;
      plan.features = req.body.features || plan.features;
      plan.maxWebsites = req.body.maxWebsites || plan.maxWebsites;
      plan.storageLimitMB = req.body.storageLimitMB || plan.storageLimitMB;

      const updatedPlan = await plan.save();
      res.json(updatedPlan);
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (plan) {
      await plan.remove();
      res.json({ message: 'Plan removed' });
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPlan, getPlans, updatePlan, deletePlan };
