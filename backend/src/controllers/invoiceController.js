const Invoice = require('../models/Invoice');
const InvoiceService = require('../services/invoiceService');

// @desc    Get user invoices
// @route   GET /api/invoices
// @access  Private
const getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user._id })
      .populate({ path: 'subscription', populate: { path: 'plan' } });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download PDF invoice
// @route   GET /api/invoices/:id/download
// @access  Private
const downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.user._id })
      .populate('user', 'name email')
      .populate({ path: 'subscription', populate: { path: 'plan' } });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const filePath = await InvoiceService.generatePDF(invoice);
    
    res.download(filePath, `invoice_${invoice._id}.pdf`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyInvoices, downloadInvoice };
