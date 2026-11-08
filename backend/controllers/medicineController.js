const Medicine = require("../models/Medicine");
const Activity = require("../models/Activity");

// GET ALL MEDICINES
exports.getMedicines = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = { isDeleted: false };
    if (category) filter.category = category;
    if (status) filter.status = status;

    const medicines = await Medicine.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD MEDICINE
exports.addMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create(req.body);
    await Activity.create({
      title: "Medicine Added to Inventory",
      description: `${medicine.name} (Batch: ${medicine.batch}) stock updated (${medicine.stock} units)`,
      type: "medicine_sold",
      user: "Pharmacy",
      amount: medicine.price,
    });
    res.status(201).json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE MEDICINE
exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE MEDICINE
exports.deleteMedicine = async (req, res) => {
  try {
    await Medicine.findByIdAndUpdate(req.params.id, { isDeleted: true });
    res.status(200).json({ success: true, message: "Medicine removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

