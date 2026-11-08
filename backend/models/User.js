const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      trim: true,
      index: true,
      default: function () {
        return (
          this.doctorId ||
          this.receptionistId ||
          this.pharmacistId ||
          this.staffId ||
          this.adminId ||
          `USR${Date.now()}`
        );
      },
    },
    // Role-specific ID aliases for backward compatibility across modules
    adminId: { type: String, trim: true, index: true },
    doctorId: { type: String, trim: true, index: true },
    receptionistId: { type: String, trim: true, index: true },
    pharmacistId: { type: String, trim: true, index: true },
    staffId: { type: String, trim: true, index: true },

    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "doctor", "receptionist", "pharmacist", "billing"],
      required: true,
      default: "admin",
      index: true,
    },
    image: {
      type: String,
      default: "",
    },
    receptionistimage: {
      type: String,
      default: "",
    },

    // Role-specific clinical and administrative metadata
    specialization: {
      type: String,
      default: "",
    },
    experience: {
      type: String,
      default: "",
    },
    qualification: {
      type: String,
      default: "B.Pharm",
    },
    licenseNumber: {
      type: String,
      default: "",
    },
    department: {
      type: String,
      default: "Inpatient & Outpatient Billing",
    },
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night", "All"],
      default: "Morning",
    },
    status: {
      type: String,
      default: "Active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    collection: "users",
    discriminatorKey: "role",
  }
);

// Pre-validate normalization runs BEFORE Mongoose validation checks
userSchema.pre("validate", function (next) {
  if (!this.userId) {
    this.userId =
      this.doctorId ||
      this.receptionistId ||
      this.pharmacistId ||
      this.staffId ||
      this.adminId ||
      `USR${Date.now()}`;
  }

  // Ensure role-specific ID mirrors the master userId
  if (this.role === "doctor") {
    if (!this.doctorId) this.doctorId = this.userId;
    if (!this.status || this.status === "Active") this.status = "Available";
  } else if (this.role === "receptionist") {
    if (!this.receptionistId) this.receptionistId = this.userId;
    if (!this.receptionistimage && this.image) this.receptionistimage = this.image;
    if (!this.image && this.receptionistimage) this.image = this.receptionistimage;
  } else if (this.role === "pharmacist") {
    if (!this.pharmacistId) this.pharmacistId = this.userId;
  } else if (this.role === "billing") {
    if (!this.staffId) this.staffId = this.userId;
  } else if (this.role === "admin") {
    if (!this.adminId) this.adminId = this.userId;
  }

  next();
});

// Pre-save normalization to synchronize unified fields
userSchema.pre("save", function (next) {
  if (!this.userId) {
    this.userId =
      this.doctorId ||
      this.receptionistId ||
      this.pharmacistId ||
      this.staffId ||
      this.adminId ||
      `USR${Date.now()}`;
  }

  if (this.role === "doctor") {
    if (!this.doctorId) this.doctorId = this.userId;
  } else if (this.role === "receptionist") {
    if (!this.receptionistId) this.receptionistId = this.userId;
    if (!this.receptionistimage && this.image) this.receptionistimage = this.image;
    if (!this.image && this.receptionistimage) this.image = this.receptionistimage;
  } else if (this.role === "pharmacist") {
    if (!this.pharmacistId) this.pharmacistId = this.userId;
  } else if (this.role === "billing") {
    if (!this.staffId) this.staffId = this.userId;
  } else if (this.role === "admin") {
    if (!this.adminId) this.adminId = this.userId;
  }

  next();
});

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = UserModel;
