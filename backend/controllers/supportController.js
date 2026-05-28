const Support = require("../models/Support");

// Create Support
const createSupport = async (req, res) => {
  try {
    const { issueTitle, supportZone, urgencyLevel, supportNote } = req.body;

    const newSupport = new Support({
      issueTitle,
      supportZone,
      urgencyLevel,
      supportNote,
    });

    const savedSupport = await newSupport.save();
    res.status(201).json({ success: true, support: savedSupport });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get All Support Tickets
const getAllSupports = async (req, res) => {
  try {
    const supports = await Support.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, supports });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  createSupport,
  getAllSupports,
};
