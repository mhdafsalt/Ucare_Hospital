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

    const cleanUserId = String(userId).trim();
    const cleanEmail = String(email).trim();

    // Escape regex special characters for safe query matching
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const idRegex = new RegExp(`^${escapeRegex(cleanUserId)}$`, "i");
    const emailRegex = new RegExp(`^${escapeRegex(cleanEmail)}$`, "i");

    let user = null;

    if (role === "admin") {
      // If admin collection is currently empty, automatically seed the initial admin account
      const adminCount = await AdminModel.countDocuments();
      if (adminCount === 0) {
        user = await AdminModel.create({
          adminId: cleanUserId || "ADM001",
          name: "Hospital Admin",
          email: cleanEmail || "admin@ucare.com",
          isDeleted: false,
        });
      } else {
        // Query active admin case-insensitively
        user = await AdminModel.findOne({
          adminId: idRegex,
          email: emailRegex,
          isDeleted: { $ne: true },
        });

        // Fallback: match by email or adminId if ID was entered as 'admin' or matches registered email
        if (!user) {
          user = await AdminModel.findOne({
            $or: [{ email: emailRegex }, { adminId: idRegex }],
            isDeleted: { $ne: true },
          });
        }
      }
    } else if (role === "doctor") {
      user = await DoctorModel.findOne({
        doctorId: idRegex,
        email: emailRegex,
        isDeleted: { $ne: true },
      });

      // Flexible fallback: match by doctorId or email
      if (!user) {
        user = await DoctorModel.findOne({
          $or: [{ doctorId: idRegex }, { email: emailRegex }],
          isDeleted: { $ne: true },
        });
      }
    } else if (role === "receptionist") {
      user = await ReceptionistModel.findOne({
        receptionistId: idRegex,
        email: emailRegex,
        isDeleted: { $ne: true },
      });

      // Flexible fallback: match by receptionistId or email
      if (!user) {
        user = await ReceptionistModel.findOne({
          $or: [{ receptionistId: idRegex }, { email: emailRegex }],
          isDeleted: { $ne: true },
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified.",
      });
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: `Invalid ${role.charAt(0).toUpperCase() + role.slice(1)} ID or Email. Please check your credentials.`,
      });
    }

    const secret = process.env.JWT_SECRET || "supersecretjwtkey123";
    const token = jwt.sign(
      { userId: user._id, role: role },
      secret,
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
