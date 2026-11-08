const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    medicineId: {
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
    category: {
      type: String,
      required: true,
      default: "General",
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    minStock: {
      type: Number,
      default: 20,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    batch: {
      type: String,
      default: "BCH-01",
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["In Stock", "Low Stock", "Expired", "Out of Stock"],
      default: "In Stock",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);

