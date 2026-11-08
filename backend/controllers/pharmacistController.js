const Pharmacist = require("../models/Pharmacist");
const Activity = require("../models/Activity");

// GET ALL PHARMACISTS
exports.getPharmacists = async (req, res) => {
  try {
    const { deleted } = req.query;
    const filter = deleted === "true" ? { isDeleted: true } : { isDeleted: false };
    const pharmacists = await Pharmacist.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      pharmacists,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD PHARMACIST
exports.addPharmacist = async (req, res) => {
  try {
    const payload = { ...req.body };
    const uid = payload.userId || payload.pharmacistId || `PH${Date.now()}`;
    payload.userId = uid;
    payload.pharmacistId = payload.pharmacistId || uid;
    payload.role = "pharmacist";

    const pharmacist = await Pharmacist.create(payload);

    // Log Activity
    await Activity.create({
      title: "New Pharmacist Added",
      description: `${pharmacist.name} was registered to Pharmacy staff (${pharmacist.pharmacistId})`,
      type: "pharmacist_added",
      user: "Admin",
    });

    res.status(201).json({
      success: true,
      message: "Pharmacist added successfully",
      pharmacist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE PHARMACIST
exports.updatePharmacist = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.pharmacistId && !payload.userId) {
      payload.userId = payload.pharmacistId;
    }

    const pharmacist = await Pharmacist.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });

    if (!pharmacist) {
      return res.status(404).json({ success: false, message: "Pharmacist not found" });
    }

    res.status(200).json({
      success: true,
      message: "Pharmacist updated successfully",
      pharmacist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// TOGGLE STATUS (ACTIVE / INACTIVE)
exports.toggleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const pharmacist = await Pharmacist.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    await Activity.create({
      title: "Staff Status Updated",
      description: `Pharmacist ${pharmacist.name} status set to ${status}`,
      type: "staff_status_updated",
      user: "Admin",
    });

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      pharmacist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE (SOFT DELETE)
exports.deletePharmacist = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Pharmacist moved to trash",
      pharmacist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// RESTORE
exports.restorePharmacist = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Pharmacist restored successfully",
      pharmacist,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

