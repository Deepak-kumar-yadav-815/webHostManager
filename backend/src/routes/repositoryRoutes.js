const express = require('express');
const multer = require('multer');
const { protect } = require('../middlewares/authMiddleware');
const { 
  uploadRepository, 
  getMyRepositories, 
  hostRepository, 
  unhostRepository 
} = require('../controllers/repositoryController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', protect, upload.single('htmlFile'), uploadRepository);
router.get('/', protect, getMyRepositories);
router.post('/:id/host', protect, hostRepository);
router.post('/:id/unhost', protect, unhostRepository);

module.exports = router;
