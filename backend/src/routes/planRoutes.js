const express = require('express');
const { createPlan, getPlans, updatePlan, deletePlan } = require('../controllers/planController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, admin, createPlan)
  .get(getPlans);

router.route('/:id')
  .put(protect, admin, updatePlan)
  .delete(protect, admin, deletePlan);

module.exports = router;
