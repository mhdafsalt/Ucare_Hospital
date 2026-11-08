const mongoose = require("mongoose");
const UserModel = require("./User");

const pharmacistSchema = new mongoose.Schema(
  {
    pharmacistId: { type: String, trim: true },
    qualification: { type: String, default: "B.Pharm" },
    licenseNumber: { type: String, default: "" },
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night", "All"],
      default: "Morning",
    },
  },
  { discriminatorKey: "role" }
);

const PharmacistModel =
  UserModel.discriminators && UserModel.discriminators["pharmacist"]
    ? UserModel.discriminators["pharmacist"]
    : UserModel.discriminator("pharmacist", pharmacistSchema);

module.exports = PharmacistModel;
