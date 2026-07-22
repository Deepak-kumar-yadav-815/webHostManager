const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceService {
  /**
   * Generates a PDF invoice
   * @param {Object} invoiceData populated invoice data
   * @returns {Promise<string>} path to the generated PDF
   */
  static generatePDF(invoiceData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const invoiceId = invoiceData._id.toString();
        
        // Ensure uploads/invoices directory exists
        const dir = path.join(__dirname, '..', '..', 'uploads', 'invoices');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }

        const filePath = path.join(dir, `invoice_${invoiceId}.pdf`);
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Header
        doc.fontSize(20).text('Web Host Manager - Invoice', { align: 'center' });
        doc.moveDown();

        // Customer Details
        doc.fontSize(12).text(`Billed To: ${invoiceData.user.name}`);
        doc.text(`Email: ${invoiceData.user.email}`);
        doc.moveDown();

        // Invoice Details
        doc.text(`Invoice ID: ${invoiceId}`);
        doc.text(`Date: ${new Date(invoiceData.billingDate).toLocaleDateString()}`);
        doc.text(`Payment Method: ${invoiceData.paymentMethod}`);
        doc.moveDown();

        // Line Items
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        doc.text(`Plan Subscribed: ${invoiceData.subscription.plan.name}`, { continued: true });
        doc.text(`INR ${invoiceData.amountPaidINR.toFixed(2)}`, { align: 'right' });
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // Total
        doc.fontSize(14).text(`Total Paid: INR ${invoiceData.amountPaidINR.toFixed(2)}`, { align: 'right' });

        doc.end();

        writeStream.on('finish', () => {
          resolve(filePath);
        });

      } catch (error) {
        reject(error);
      }
    });
  }
}

module.exports = InvoiceService;
