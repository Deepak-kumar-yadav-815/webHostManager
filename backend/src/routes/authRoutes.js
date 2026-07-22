const express = require('express');
const { adminLogin, syncUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/admin-login', adminLogin);
router.post('/sync', protect, syncUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
