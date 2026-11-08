const mongoose = require("mongoose");
const UserModel = require("./User");

const adminSchema = new mongoose.Schema(
  {
    adminId: { type: String, trim: true },
  },
  { discriminatorKey: "role" }
);

const AdminModel =
  UserModel.discriminators && UserModel.discriminators["admin"]
    ? UserModel.discriminators["admin"]
    : UserModel.discriminator("admin", adminSchema);

module.exports = AdminModel;
