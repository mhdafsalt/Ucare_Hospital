const mongoose = require("mongoose");
const UserModel = require("./User");

const doctorSchema = new mongoose.Schema(
  {
    doctorId: { type: String, trim: true },
    specialization: { type: String, default: "" },
    experience: { type: String, default: "" },
  },
  { discriminatorKey: "role" }
);

const DoctorModel =
  UserModel.discriminators && UserModel.discriminators["doctor"]
    ? UserModel.discriminators["doctor"]
    : UserModel.discriminator("doctor", doctorSchema);

module.exports = DoctorModel;
