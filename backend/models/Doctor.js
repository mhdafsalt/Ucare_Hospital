const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
     doctorId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },

    specialization: {
      type: String,
      required: true,
    },

    experience: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    phone: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Available", "Unavailable", "On Leave"],
      default: "Available",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  }
);

const DoctorModel = mongoose.model(
  "Doctor",
  doctorSchema
);

module.exports = DoctorModel;