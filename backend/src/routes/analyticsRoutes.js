const express = require('express');
const { getWebsiteAnalytics, generateAIReport } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:websiteId', protect, getWebsiteAnalytics);
router.post('/:websiteId/ai-report', protect, generateAIReport);

module.exports = router;
