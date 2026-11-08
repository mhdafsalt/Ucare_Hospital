const UserModel = require("../models/User");
const jwt = require("jsonwebtoken");

// UNIFIED LOGIN (Single Collection "users" - No Role Selection Required)
const login = async (req, res) => {
  try {
    const { userId, email, role: requestedRole } = req.body;

    if (!userId && !email) {
      return res.status(400).json({
        success: false,
        message: "Please enter your User ID or Email Address.",
      });
    }

    const cleanInput = (val) => String(val || "").trim();
    const cleanUserId = cleanInput(userId);
    const cleanEmail = cleanInput(email);

    // Escape regex special characters for safe query matching
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const idRegex = cleanUserId ? new RegExp(`^${escapeRegex(cleanUserId)}$`, "i") : null;
    const emailRegex = cleanEmail ? new RegExp(`^${escapeRegex(cleanEmail)}$`, "i") : null;

    // Build flexible query matching against the single unified "users" collection
    const queryConditions = [];
    if (idRegex) {
      queryConditions.push(
        { userId: idRegex },
        { doctorId: idRegex },
        { receptionistId: idRegex },
        { pharmacistId: idRegex },
        { staffId: idRegex },
        { adminId: idRegex }
      );
    }
    if (emailRegex) {
      queryConditions.push({ email: emailRegex });
    }

    let user = null;

    if (queryConditions.length > 0) {
      user = await UserModel.findOne({
        $or: queryConditions,
        isDeleted: { $ne: true },
      });
    }

    // Auto-seed default Admin if the database users collection is completely empty
    if (!user) {
      const userCount = await UserModel.countDocuments();
      if (
        userCount === 0 ||
        cleanUserId.toUpperCase() === "ADM001" ||
        cleanEmail.toLowerCase() === "admin@ucare.com"
      ) {
        user = await UserModel.findOne({ email: "admin@ucare.com" });
        if (!user) {
          user = await UserModel.create({
            userId: "ADM001",
            adminId: "ADM001",
            name: "Hospital Administrator",
            email: "admin@ucare.com",
            role: "admin",
            phone: "+1 (555) 000-0001",
            status: "Active",
            isDeleted: false,
          });
        }
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. No registered hospital staff found matching this ID or Email.",
      });
    }

    const userRole = user.role || "admin";
    const secret = process.env.JWT_SECRET || "supersecretjwtkey123";
    const token = jwt.sign(
      { userId: user._id, role: userRole, email: user.email },
      secret,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user,
      role: userRole,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login: " + error.message,
    });
  }
};

// SETUP ADMIN (Creates Admin record directly in the single "users" collection)
const setupAdmin = async (req, res) => {
  try {
    const { adminId, name, email, phone } = req.body;

    if (!adminId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: "adminId, name, and email are required to create an admin.",
      });
    }

    // Check if admin/user already exists in single collection
    const existing = await UserModel.findOne({
      $or: [{ email: String(email).trim().toLowerCase() }, { userId: String(adminId).trim() }],
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A staff account with this ID or Email already exists.",
      });
    }

    const admin = await UserModel.create({
      userId: String(adminId).trim(),
      adminId: String(adminId).trim(),
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : "",
      role: "admin",
      status: "Active",
      isDeleted: false,
    });

    res.status(201).json({
      success: true,
      message: "Admin created successfully in unified users collection.",
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
