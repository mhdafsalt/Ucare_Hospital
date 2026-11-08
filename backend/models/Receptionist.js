const mongoose = require("mongoose");
const UserModel = require("./User");

const receptionistSchema = new mongoose.Schema(
  {
    receptionistId: { type: String, trim: true },
    receptionistimage: { type: String, default: "" },
    shift: {
      type: String,
      enum: ["Morning", "Evening", "Night", "All"],
      default: "Morning",
    },
  },
  { discriminatorKey: "role" }
);

const ReceptionistModel =
  UserModel.discriminators && UserModel.discriminators["receptionist"]
    ? UserModel.discriminators["receptionist"]
    : UserModel.discriminator("receptionist", receptionistSchema);

module.exports = ReceptionistModel;
