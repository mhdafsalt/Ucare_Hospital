const mongoose = require("mongoose");
const Medicine = require("../models/Medicine");
const Activity = require("../models/Activity");
const Invoice = require("../models/Invoice");

const DEFAULT_MEDICINES = [
  {
    medicineId: "MED-101",
    name: "Amoxicillin 500mg",
    category: "Antibiotic",
    stock: 240,
    minStock: 50,
    price: 14.5,
    batch: "AMX-2026-A",
    expiryDate: new Date("2026-11-20"),
    status: "In Stock",
  },
  {
    medicineId: "MED-102",
    name: "Paracetamol 650mg",
    category: "Analgesic",
    stock: 580,
    minStock: 100,
    price: 4.2,
    batch: "PCM-2026-C",
    expiryDate: new Date("2027-05-15"),
    status: "In Stock",
  },
  {
    medicineId: "MED-103",
    name: "Metformin 850mg",
    category: "Antidiabetic",
    stock: 24,
    minStock: 60,
    price: 12.0,
    batch: "MET-2025-F",
    expiryDate: new Date("2026-12-01"),
    status: "Low Stock",
  },
  {
    medicineId: "MED-104",
    name: "Atorvastatin 20mg",
    category: "Cardiovascular",
    stock: 15,
    minStock: 40,
    price: 28.5,
    batch: "ATV-2025-B",
    expiryDate: new Date("2026-11-14"),
    status: "Low Stock",
  },
  {
    medicineId: "MED-105",
    name: "Omeprazole 20mg",
    category: "Gastrointestinal",
    stock: 310,
    minStock: 50,
    price: 9.8,
    batch: "OMP-2027-A",
    expiryDate: new Date("2027-08-30"),
    status: "In Stock",
  },
  {
    medicineId: "MED-106",
    name: "Ibuprofen 400mg",
    category: "Analgesic",
    stock: 420,
    minStock: 80,
    price: 6.5,
    batch: "IBU-2026-D",
    expiryDate: new Date("2027-01-10"),
    status: "In Stock",
  },
  {
    medicineId: "MED-107",
    name: "Azithromycin 250mg",
    category: "Antibiotic",
    stock: 18,
    minStock: 50,
    price: 22.0,
    batch: "AZI-2025-H",
    expiryDate: new Date("2026-11-28"),
    status: "Low Stock",
  },
];

// GET ALL MEDICINES (AUTO-SEEDS IF EMPTY)
exports.getMedicines = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = { isDeleted: false };
    if (category && category !== "All") filter.category = category;
    if (status && status !== "All") filter.status = status;

    let medicines = await Medicine.find(filter).sort({ createdAt: -1 });

    // Auto-seed default medicines if database is empty
    if (medicines.length === 0 && (!category || category === "All") && (!status || status === "All")) {
      const totalCount = await Medicine.countDocuments();
      if (totalCount === 0) {
        await Medicine.insertMany(DEFAULT_MEDICINES);
        medicines = await Medicine.find(filter).sort({ createdAt: -1 });
      }
    }

    res.status(200).json({ success: true, medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD MEDICINE
exports.addMedicine = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Auto-generate medicine ID if omitted
    if (!payload.medicineId) {
      payload.medicineId = `MED-${Math.floor(100 + Math.random() * 900)}`;
    }

    // Standardize expiryDate
    if (!payload.expiryDate && payload.expiry) {
      payload.expiryDate = new Date(payload.expiry);
    } else if (!payload.expiryDate) {
      payload.expiryDate = new Date(Date.now() + 365 * 24 * 3600 * 1000);
    }

    const stockNum = Number(payload.stock) || 0;
    const minStockNum = Number(payload.minStock) || 20;
    payload.stock = stockNum;
    payload.minStock = minStockNum;
    payload.price = parseFloat(payload.price) || 0;

    // Determine status
    if (stockNum <= minStockNum) {
      payload.status = "Low Stock";
    } else {
      payload.status = "In Stock";
    }

    const medicine = await Medicine.create(payload);

    await Activity.create({
      title: "Medicine Added to Inventory",
      description: `${medicine.name} (${medicine.batch}) added (${medicine.stock} units)`,
      type: "medicine_sold",
      user: "Pharmacy Staff",
      amount: medicine.price,
    });

    res.status(201).json({ success: true, medicine, message: "Medicine added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE MEDICINE
exports.updateMedicine = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.stock !== undefined && payload.minStock !== undefined) {
      payload.status = Number(payload.stock) <= Number(payload.minStock) ? "Low Stock" : "In Stock";
    }

    const medicine = await Medicine.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!medicine) {
      return res.status(404).json({ success: false, message: "Medicine not found" });
    }
    res.status(200).json({ success: true, medicine, message: "Medicine updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// RESTOCK MEDICINE
exports.restockMedicine = async (req, res) => {
  try {
    const { amount = 100 } = req.body;
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: "Medicine not found" });
    }

    medicine.stock += Number(amount);
    medicine.status = medicine.stock <= medicine.minStock ? "Low Stock" : "In Stock";
    await medicine.save();

    await Activity.create({
      title: "Medicine Stock Replenished",
      description: `Restocked +${amount} units for ${medicine.name} (Total: ${medicine.stock})`,
      type: "medicine_sold",
      user: "Pharmacy Staff",
      amount: medicine.price * Number(amount),
    });

    res.status(200).json({
      success: true,
      medicine,
      message: `Restocked +${amount} units for ${medicine.name}`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DISPENSE MEDICINE / RECORD SALE
exports.dispenseMedicine = async (req, res) => {
  try {
    const { medicineId, patientName, doctorName, quantity = 1, paymentMethod = "Cash" } = req.body;

    const query = mongoose.isValidObjectId(medicineId)
      ? { $or: [{ _id: medicineId }, { medicineId: medicineId }], isDeleted: false }
      : { medicineId: medicineId, isDeleted: false };

    let medicine = await Medicine.findOne(query);

    if (!medicine) {
      return res.status(404).json({ success: false, message: "Medicine not found in inventory." });
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be at least 1." });
    }

    if (medicine.stock < qty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock! Only ${medicine.stock} units available in stock.`,
      });
    }

    // Deduct stock
    medicine.stock -= qty;
    medicine.status = medicine.stock <= medicine.minStock ? "Low Stock" : "In Stock";
    await medicine.save();

    const totalAmount = medicine.price * qty;
    const cleanPatient = (patientName || "Walk-in Patient").trim();
    const cleanDoctor = (doctorName || "Dr. Staff On-Duty").trim();

    // Log Activity
    await Activity.create({
      title: "Prescription Dispensed",
      description: `${medicine.name} (x${qty}) dispensed to ${cleanPatient}`,
      type: "medicine_sold",
      user: cleanDoctor,
      amount: totalAmount,
    });

    // Create Invoice record in database
    const invoiceId = `TXN-${Math.floor(9000 + Math.random() * 1000)}`;
    const invoice = await Invoice.create({
      invoiceId,
      patientName: cleanPatient,
      patientId: req.body.patientId || "",
      doctorName: cleanDoctor,
      department: "Pharmacy",
      service: `${medicine.name} (x${qty})`,
      amount: totalAmount,
      paidAmount: totalAmount,
      status: "Paid",
      paymentMethod: paymentMethod || "Cash",
    });

    res.status(200).json({
      success: true,
      message: `Dispensed ${medicine.name} (x${qty}) for $${totalAmount.toFixed(2)}`,
      medicine,
      sale: {
        id: invoice.invoiceId,
        _id: invoice._id,
        patient: invoice.patientName,
        patientId: invoice.patientId,
        doctor: cleanDoctor,
        items: `${medicine.name} (x${qty})`,
        total: totalAmount,
        time: "Just now",
        payment: invoice.paymentMethod,
        status: "Completed",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET SALES HISTORY (FILTERED STRICTLY FOR PHARMACY DISPENSARY TRANSACTIONS)
exports.getSales = async (req, res) => {
  try {
    let query = {
      isDeleted: false,
      $or: [
        { department: "Pharmacy" },
        { invoiceId: { $regex: /^TXN-/i } },
        { service: { $regex: /\(x\d+\)|tablet|capsule|mg|syrup|dispens/i } },
      ],
    };

    let invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(60);

    // Auto-seed dynamic pharmacy dispensary sales if none exist
    if (invoices.length === 0) {
      const defaultDispensarySales = [
        {
          invoiceId: "TXN-9101",
          patientName: "Shamil",
          patientId: "PAT-2026",
          doctorName: "Dr. Salman",
          service: "Amoxicillin 500mg (x2)",
          amount: 36.0,
          paidAmount: 36.0,
          status: "Paid",
          paymentMethod: "Cash",
          department: "Pharmacy",
        },
        {
          invoiceId: "TXN-9102",
          patientName: "Rinsha",
          patientId: "PAT-2027",
          doctorName: "Dr. Salman",
          service: "Paracetamol 650mg (x1)",
          amount: 12.5,
          paidAmount: 12.5,
          status: "Paid",
          paymentMethod: "Credit Card",
          department: "Pharmacy",
        },
        {
          invoiceId: "TXN-9103",
          patientName: "Ahmed Mansoor",
          patientId: "PAT-081",
          doctorName: "Dr. Salman",
          service: "Atorvastatin 20mg (x2)",
          amount: 48.0,
          paidAmount: 48.0,
          status: "Paid",
          paymentMethod: "Insurance",
          department: "Pharmacy",
        },
        {
          invoiceId: "TXN-9104",
          patientName: "Fatima Al-Sabah",
          patientId: "PAT-082",
          doctorName: "Dr. Salman",
          service: "Metformin 850mg (x3)",
          amount: 42.0,
          paidAmount: 42.0,
          status: "Paid",
          paymentMethod: "Cash",
          department: "Pharmacy",
        },
        {
          invoiceId: "TXN-9105",
          patientName: "David Chen",
          patientId: "PAT-083",
          doctorName: "Dr. Salman",
          service: "Omeprazole 20mg (x1)",
          amount: 18.5,
          paidAmount: 18.5,
          status: "Paid",
          paymentMethod: "Credit Card",
          department: "Pharmacy",
        },
      ];

      await Invoice.insertMany(defaultDispensarySales);
      invoices = await Invoice.find(query).sort({ createdAt: -1 });
    }

    const sales = invoices.map((inv) => ({
      id: inv.invoiceId,
      _id: inv._id,
      patient: inv.patientName,
      patientId: inv.patientId || "",
      doctor: inv.doctorName || "Dr. Salman",
      items: inv.service,
      total: inv.amount,
      time: new Date(inv.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      createdAt: inv.createdAt,
      payment: inv.paymentMethod,
      status: inv.status === "Paid" ? "Completed" : inv.status,
    }));

    res.status(200).json({ success: true, sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE SALE RECORD
exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, patientId, doctorName, items, total, paymentMethod, status } = req.body;

    const updateData = {};
    if (patientName) updateData.patientName = patientName;
    if (patientId) updateData.patientId = patientId;
    if (doctorName) updateData.doctorName = doctorName;
    if (items) updateData.service = items;
    if (total !== undefined) {
      updateData.amount = Number(total);
      updateData.paidAmount = Number(total);
    }
    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (status) updateData.status = status === "Completed" ? "Paid" : status;

    const updated = await Invoice.findOneAndUpdate(
      { $or: [{ _id: id }, { invoiceId: id }] },
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      sale: {
        id: updated.invoiceId,
        _id: updated._id,
        patient: updated.patientName,
        patientId: updated.patientId || "",
        doctor: updated.doctorName || "Dr. Salman",
        items: updated.service,
        total: updated.amount,
        payment: updated.paymentMethod,
        status: updated.status === "Paid" ? "Completed" : updated.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE SALE RECORD
exports.deleteSale = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Invoice.findOneAndDelete({
      $or: [{ _id: id }, { invoiceId: id }],
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Transaction record not found" });
    }

    res.status(200).json({ success: true, message: "Transaction deleted from records" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// TOGGLE QUARANTINE STATUS
exports.quarantineMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: "Medicine not found" });
    }
    const isQuarantined = medicine.status === "Quarantined";
    medicine.status = isQuarantined ? "In Stock" : "Quarantined";
    await medicine.save();

    await Activity.create({
      title: isQuarantined ? "Medicine Released from Quarantine" : "Medicine Moved to Quarantine",
      description: `${medicine.name} (${medicine.batch}) status updated to ${medicine.status}`,
      type: "medicine_sold",
      user: "Pharmacy Staff",
      amount: 0,
    });

    res.status(200).json({
      success: true,
      medicine,
      message: isQuarantined
        ? `Batch ${medicine.batch} (${medicine.name}) released back to stock.`
        : `Batch ${medicine.batch} (${medicine.name}) quarantined for inspection.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE MEDICINE
exports.deleteMedicine = async (req, res) => {
  try {
    await Medicine.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ success: true, message: "Medicine removed from catalog" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
