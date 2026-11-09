const Invoice = require("../models/Invoice");
const Activity = require("../models/Activity");

const DEFAULT_INVOICES = [
  {
    invoiceId: "INV-2026-001",
    patientName: "Ahmed Mansoor",
    patientId: "PAT-081",
    doctorName: "Dr. Salman",
    department: "Cardiology",
    service: "Cardiac Consultation & 12-Lead ECG",
    amount: 180.0,
    paidAmount: 180.0,
    status: "Paid",
    paymentMethod: "Credit Card",
    dueDate: new Date("2026-11-20"),
  },
  {
    invoiceId: "INV-2026-002",
    patientName: "Fatima Al-Sabah",
    patientId: "PAT-082",
    doctorName: "Dr. Salman",
    department: "Dental Clinic",
    service: "Dental Cleaning & Ortho Checkup",
    amount: 95.0,
    paidAmount: 0,
    status: "Pending",
    paymentMethod: "Insurance",
    dueDate: new Date("2026-11-19"),
  },
  {
    invoiceId: "INV-2026-003",
    patientName: "David Chen",
    patientId: "PAT-083",
    doctorName: "Dr. Salman",
    department: "Pediatrics",
    service: "Pediatric Consultation & Blood Labs",
    amount: 240.0,
    paidAmount: 240.0,
    status: "Paid",
    paymentMethod: "Cash",
    dueDate: new Date("2026-11-18"),
  },
  {
    invoiceId: "INV-2026-004",
    patientName: "Sarah Al-Rashidi",
    patientId: "PAT-084",
    doctorName: "Dr. Salman",
    department: "Emergency Care",
    service: "Emergency Room Observation & Vitals Monitoring",
    amount: 450.0,
    paidAmount: 0,
    status: "Pending",
    paymentMethod: "Direct Bill",
    dueDate: new Date("2026-11-25"),
  },
  {
    invoiceId: "INV-2026-005",
    patientName: "Shamil",
    patientId: "PAT-2026",
    doctorName: "Dr. Salman",
    department: "Internal Medicine",
    service: "Internal Medicine Comprehensive Consultation",
    amount: 320.0,
    paidAmount: 320.0,
    status: "Paid",
    paymentMethod: "Insurance",
    dueDate: new Date("2026-11-15"),
  },
  {
    invoiceId: "INV-2026-006",
    patientName: "Rinsha",
    patientId: "PAT-2027",
    doctorName: "Dr. Salman",
    department: "Orthopedics",
    service: "Orthopedic Knee Examination & Joint Therapy",
    amount: 150.0,
    paidAmount: 0,
    status: "Overdue",
    paymentMethod: "Direct Bill",
    dueDate: new Date("2026-10-29"),
  },
  {
    invoiceId: "INV-2026-007",
    patientName: "Michael Brown",
    patientId: "PAT-085",
    doctorName: "Dr. Salman",
    department: "Radiology & Scans",
    service: "MRI Brain Scan & Specialist Review",
    amount: 620.0,
    paidAmount: 620.0,
    status: "Paid",
    paymentMethod: "Credit Card",
    dueDate: new Date("2026-11-22"),
  },
  {
    invoiceId: "INV-2026-008",
    patientName: "Zainab Qasim",
    patientId: "PAT-086",
    doctorName: "Dr. Salman",
    department: "Dental Clinic",
    service: "Dental Extraction & Local Anesthesia",
    amount: 210.0,
    paidAmount: 210.0,
    status: "Paid",
    paymentMethod: "Insurance",
    dueDate: new Date("2026-11-14"),
  },
];

// Auto-seed if collection is empty
const seedInvoicesIfNeeded = async () => {
  try {
    const count = await Invoice.countDocuments();
    if (count === 0) {
      await Invoice.insertMany(DEFAULT_INVOICES);
    }
  } catch (err) {
    console.error("Auto-seed error in billingController:", err.message);
  }
};

// GET ALL INVOICES
exports.getInvoices = async (req, res) => {
  try {
    await seedInvoicesIfNeeded();

    const { status, search } = req.query;
    const filter = { isDeleted: false };
    if (status && status !== "All") filter.status = status;

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { invoiceId: regex },
        { patientName: regex },
        { service: regex },
        { paymentMethod: regex },
      ];
    }

    const invoices = await Invoice.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE INVOICE
exports.createInvoice = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (!payload.invoiceId) {
      payload.invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    }

    payload.amount = parseFloat(payload.amount) || 0;
    if (payload.status === "Paid") {
      payload.paidAmount = payload.amount;
    } else if (payload.paidAmount === undefined) {
      payload.paidAmount = 0;
    }

    if (!payload.dueDate) {
      payload.dueDate = new Date(Date.now() + 14 * 86400000);
    }

    const invoice = await Invoice.create(payload);

    await Activity.create({
      title: "Invoice Generated",
      description: `Invoice ${invoice.invoiceId} for ${invoice.patientName} (${invoice.service}) - $${invoice.amount.toFixed(2)}`,
      type: "invoice_generated",
      user: "Billing Staff",
      amount: invoice.amount,
    });

    if (invoice.status === "Paid") {
      await Activity.create({
        title: "Payment Received",
        description: `Payment of $${invoice.amount.toFixed(2)} received from ${invoice.patientName} via ${invoice.paymentMethod}`,
        type: "payment_completed",
        user: "Billing Staff",
        amount: invoice.amount,
      });
    }

    res.status(201).json({ success: true, invoice, message: "Invoice created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE INVOICE
exports.updateInvoice = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.status === "Paid" && payload.paidAmount === undefined) {
      const existing = await Invoice.findById(req.params.id);
      if (existing) {
        payload.paidAmount = existing.amount;
      }
    }

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    if (payload.status === "Paid") {
      await Activity.create({
        title: "Payment Received",
        description: `Invoice ${invoice.invoiceId} marked Paid ($${invoice.amount.toFixed(2)}) for ${invoice.patientName}`,
        type: "payment_completed",
        user: "Billing Staff",
        amount: invoice.amount,
      });
    }

    res.status(200).json({ success: true, invoice, message: "Invoice updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE INVOICE
exports.deleteInvoice = async (req, res) => {
  try {
    await Invoice.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ success: true, message: "Invoice removed from ledger" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
