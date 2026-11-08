const Receptionist = require("../models/Receptionist");

// ================= CREATE =================
exports.addReceptionist = async (req, res) => {
  try {
    const payload = { ...req.body };
    const uid = payload.userId || payload.receptionistId || `REC${Date.now()}`;
    payload.userId = uid;
    payload.receptionistId = payload.receptionistId || uid;
    if (payload.receptionistimage && !payload.image) {
      payload.image = payload.receptionistimage;
    }
    if (payload.image && !payload.receptionistimage) {
      payload.receptionistimage = payload.image;
    }
    payload.role = "receptionist";

    const receptionist = await Receptionist.create(payload);

    res.status(201).json({
      success: true,
      message: "Receptionist created",
      receptionist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET (ACTIVE / TRASH) =================
exports.getReceptionists = async (req, res) => {
  try {
    const { deleted } = req.query;

    const filter = deleted === "true"
      ? { isDeleted: true }
      : { isDeleted: false };

    const receptionists = await Receptionist.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      receptionists,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= UPDATE =================
exports.updateReceptionist = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.receptionistId && !payload.userId) {
      payload.userId = payload.receptionistId;
    }
    if (payload.receptionistimage && !payload.image) {
      payload.image = payload.receptionistimage;
    }
    if (payload.image && !payload.receptionistimage) {
      payload.receptionistimage = payload.image;
    }

    const updated = await Receptionist.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      receptionist: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//  SOFT DELETE
exports.deleteReceptionist = async (req, res) => {
  try {
    await Receptionist.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });

    res.status(200).json({
      success: true,
      message: "Moved to trash",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// RESTORE
exports.restoreReceptionist = async (req, res) => {
  try {
    await Receptionist.findByIdAndUpdate(req.params.id, {
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      message: "Restored successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};