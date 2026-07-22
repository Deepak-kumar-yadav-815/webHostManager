const express = require('express');
const { getGlobalAnalytics } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/analytics', protect, admin, getGlobalAnalytics);

module.exports = router;
