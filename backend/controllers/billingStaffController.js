const BillingStaff = require("../models/BillingStaff");
const Activity = require("../models/Activity");

// GET ALL BILLING STAFF
exports.getBillingStaff = async (req, res) => {
  try {
    const { deleted } = req.query;
    const filter = deleted === "true" ? { isDeleted: true } : { isDeleted: false };
    const billingStaff = await BillingStaff.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      billingStaff,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADD BILLING STAFF
exports.addBillingStaff = async (req, res) => {
  try {
    const payload = { ...req.body };
    const uid = payload.userId || payload.staffId || `BILL${Date.now()}`;
    payload.userId = uid;
    payload.staffId = payload.staffId || uid;
    payload.role = "billing";

    const staff = await BillingStaff.create(payload);

    // Log Activity
    await Activity.create({
      title: "New Billing Staff Added",
      description: `${staff.name} was registered to Billing team (${staff.staffId})`,
      type: "billing_staff_added",
      user: "Admin",
    });

    res.status(201).json({
      success: true,
      message: "Billing staff added successfully",
      billingStaff: staff,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE BILLING STAFF
exports.updateBillingStaff = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.staffId && !payload.userId) {
      payload.userId = payload.staffId;
    }

    const staff = await BillingStaff.findByIdAndUpdate(req.params.id, payload, {
      new: true,
    });

    if (!staff) {
      return res.status(404).json({ success: false, message: "Billing staff not found" });
    }

    res.status(200).json({
      success: true,
      message: "Billing staff updated successfully",
      billingStaff: staff,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// TOGGLE STATUS (ACTIVE / INACTIVE)
exports.toggleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const staff = await BillingStaff.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    await Activity.create({
      title: "Staff Status Updated",
      description: `Billing staff ${staff.name} status set to ${status}`,
      type: "staff_status_updated",
      user: "Admin",
    });

    res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      billingStaff: staff,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE (SOFT DELETE)
exports.deleteBillingStaff = async (req, res) => {
  try {
    const staff = await BillingStaff.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Billing staff moved to trash",
      billingStaff: staff,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// RESTORE FROM TRASH
exports.restoreBillingStaff = async (req, res) => {
  try {
    const staff = await BillingStaff.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Billing staff restored successfully",
      billingStaff: staff,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

