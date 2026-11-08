const mongoose = require("mongoose");
const UserModel = require("./User");

const billingStaffSchema = new mongoose.Schema(
  {
    staffId: { type: String, trim: true },
    department: { type: String, default: "Inpatient & Outpatient Billing" },
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night", "All"],
      default: "Morning",
    },
  },
  { discriminatorKey: "role" }
);

const BillingStaffModel =
  UserModel.discriminators && UserModel.discriminators["billing"]
    ? UserModel.discriminators["billing"]
    : UserModel.discriminator("billing", billingStaffSchema);

module.exports = BillingStaffModel;
