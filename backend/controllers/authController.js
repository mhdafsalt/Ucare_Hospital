const AdminModel = require("../models/Admin");
const DoctorModel = require("../models/Doctor");
const ReceptionistModel = require("../models/Receptionist");
const jwt = require("jsonwebtoken");


// LOGIN (ID & Email Verification)
const login = async (req, res) => {
  try {
    const { role, userId, email } = req.body;

    if (!role || !userId || !email) {
      return res.status(400).json({
        success: false,
        message: "Role, User ID, and Email are required.",
      });
    }

    let user = null;

    if (role === "admin") {
      user = await AdminModel.findOne({ adminId: userId, email: email, isDeleted: false });
    } else if (role === "doctor") {
      user = await DoctorModel.findOne({ doctorId: userId, email: email, isDeleted: false });
    } else if (role === "receptionist") {
      user = await ReceptionistModel.findOne({ receptionistId: userId, email: email, isDeleted: false });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified.",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid User ID or Email.",
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user,
      role,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login: " + error.message,
    });
  }
};


// SETUP ADMIN (Temporary helper to create first admin)

const setupAdmin = async (req, res) => {
  try {
    const { adminId, name, email } = req.body;

    if (!adminId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "adminId, name, and email are required to create an admin.",
      });
    }

    // Check if admin already exists
    const existingAdmin = await AdminModel.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists.",
      });
    }

    const admin = await AdminModel.create({
      adminId,
      name,
      email,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully.",
      admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  login,
  setupAdmin,
};
