const express = require('express');
const { postFeedback, getWebsiteFeedback, submitPlatformFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/platform', submitPlatformFeedback);
router.get('/platform', protect, getAllFeedback);
router.post('/:shortUrlAlias', postFeedback);
router.get('/website/:websiteId', protect, getWebsiteFeedback);

module.exports = router;
