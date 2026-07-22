const express = require('express');
const { purchasePlan, queuePlan, getMySubscription, cancelActivePlan, cancelQueuedPlan } = require('../controllers/subscriptionController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/purchase', protect, purchasePlan);
router.post('/queue', protect, queuePlan);
router.get('/me', protect, getMySubscription);
router.post('/cancel-active', protect, cancelActivePlan);
router.post('/cancel-queued', protect, cancelQueuedPlan);

module.exports = router;
