const express = require('express');
const { createWebsite, getMyWebsites, deleteWebsite, getAIInsights, serveWebsite } = require('../controllers/websiteController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, upload.single('htmlFile'), createWebsite)
  .get(protect, getMyWebsites);

router.route('/:id')
  .delete(protect, deleteWebsite);

router.get('/:id/ai-insights', protect, getAIInsights);

// The public route is handled differently, usually in app.js directly or exported separately
// But for cleaner structure, we can export a separate router or just attach it in app.js
const publicRouter = express.Router();
publicRouter.get('/:shortUrlAlias', serveWebsite);

module.exports = { router, publicRouter };
