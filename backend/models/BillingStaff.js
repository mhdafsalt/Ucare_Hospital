const mongoose = require("mongoose");

const billingStaffSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
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
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: "Inpatient & Outpatient Billing",
    },
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night"],
      default: "Morning",
    },
    image: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BillingStaff", billingStaffSchema);

