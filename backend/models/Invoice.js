const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientId: {
      type: String,
      trim: true,
    },
    doctorName: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
      default: "General",
    },
    service: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Partially Paid", "Overdue"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "Cash", "Insurance", "Bank Transfer", "Direct Bill"],
      default: "Credit Card",
    },
    dueDate: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);

