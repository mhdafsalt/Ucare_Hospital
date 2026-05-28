const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema(
  {
    issueTitle: {
      type: String,
      required: true,
      trim: true,
    },
    supportZone: {
      type: String,
      required: true,
    },
    urgencyLevel: {
      type: String,
    },
    supportNote: {
      type: String,
      required: true,
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

module.exports = mongoose.model("Support", supportSchema);
