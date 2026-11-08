const Invoice = require("../models/Invoice");
const Activity = require("../models/Activity");

// GET ALL INVOICES
exports.getInvoices = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { isDeleted: false };
    if (status && status !== "All") filter.status = status;

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE INVOICE
exports.createInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.create(req.body);

    await Activity.create({
      title: "Invoice Generated",
      description: `Invoice ${invoice.invoiceId} for ${invoice.patientName} (${invoice.service}) - $${invoice.amount}`,
      type: "invoice_generated",
      user: "Billing Staff",
      amount: invoice.amount,
    });

    if (invoice.status === "Paid") {
      await Activity.create({
        title: "Payment Received",
        description: `Payment of $${invoice.amount} received from ${invoice.patientName} via ${invoice.paymentMethod}`,
        type: "payment_completed",
        user: "Billing Staff",
        amount: invoice.amount,
      });
    }

    res.status(201).json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE INVOICE
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE INVOICE
exports.deleteInvoice = async (req, res) => {
  try {
    await Invoice.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ success: true, message: "Invoice removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

