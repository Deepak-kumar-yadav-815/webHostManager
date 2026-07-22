const express = require('express');
const { getMyInvoices, downloadInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getMyInvoices);

router.route('/:id/download')
  .get(protect, downloadInvoice);

module.exports = router;
