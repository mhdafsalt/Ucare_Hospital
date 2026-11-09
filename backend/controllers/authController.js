const UserModel = require("../models/User");
const jwt = require("jsonwebtoken");

// UNIFIED LOGIN (Single Collection "users" - Verifies Email with User ID)
const login = async (req, res) => {
  try {
    const { userId, email } = req.body;

    const cleanInput = (val) => String(val || "").trim();
    const cleanUserId = cleanInput(userId);
    const cleanEmail = cleanInput(email);

    if (!cleanUserId || !cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Please enter both your User ID and registered Email address.",
      });
    }

    // Escape regex special characters for safe query matching
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const idRegex = new RegExp(`^${escapeRegex(cleanUserId)}$`, "i");
    const emailRegex = new RegExp(`^${escapeRegex(cleanEmail)}$`, "i");

    // Auto-seed default Admin if database users collection is completely empty or default admin credentials provided
    const userCount = await UserModel.countDocuments();
    if (
      userCount === 0 ||
      (cleanUserId.toUpperCase() === "ADM001" && cleanEmail.toLowerCase() === "admin@ucare.com")
    ) {
      let defaultAdmin = await UserModel.findOne({
        email: new RegExp("^admin@ucare\\.com$", "i"),
      });
      if (!defaultAdmin) {
        await UserModel.create({
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

    // Role-specific ID alias conditions
    const idConditions = [
      { userId: idRegex },
      { doctorId: idRegex },
      { receptionistId: idRegex },
      { pharmacistId: idRegex },
      { staffId: idRegex },
      { adminId: idRegex },
    ];

    // Find user where BOTH Email AND User ID match the same document
    let user = await UserModel.findOne({
      email: emailRegex,
      $or: idConditions,
      isDeleted: { $ne: true },
    });

    // If no exact match for both Email and User ID together, provide precise diagnostic feedback
    if (!user) {
      const userById = await UserModel.findOne({
        $or: idConditions,
        isDeleted: { $ne: true },
      });

      const userByEmail = await UserModel.findOne({
        email: emailRegex,
        isDeleted: { $ne: true },
      });

      if (userById && !userByEmail) {
        return res.status(401).json({
          success: false,
          message: `The Email address entered does not match User ID "${cleanUserId}". Please verify your email.`,
        });
      }

      if (!userById && userByEmail) {
        return res.status(401).json({
          success: false,
          message: `The User ID "${cleanUserId}" does not match the account registered with this email. Please verify your User ID.`,
        });
      }

      if (userById && userByEmail && userById._id.toString() !== userByEmail._id.toString()) {
        return res.status(401).json({
          success: false,
          message: "User ID and Email address belong to different staff accounts. Both must match the same user.",
        });
      }

      return res.status(401).json({
        success: false,
        message: "Invalid credentials. No registered hospital staff found matching this User ID and Email.",
      });
    }

    // Check if account has been deactivated
    if (user.status && user.status.toLowerCase() === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Your account is currently inactive. Please contact the Hospital Administrator.",
      });
    }

    const userRole = user.role || "admin";
    const secret = process.env.JWT_SECRET || "supersecretjwtkey123";
    const token = jwt.sign(
      { userId: user._id, role: userRole, email: user.email },
      secret,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user,
      role: userRole,
      token,
    });
  } catch (error) {
    return res.status(500).json({
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
