const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "patient_registered",
        "doctor_added",
        "receptionist_added",
        "pharmacist_added",
        "billing_staff_added",
        "appointment_booked",
        "prescription_created",
        "medicine_sold",
        "payment_completed",
        "invoice_generated",
        "staff_status_updated",
      ],
      default: "patient_registered",
    },
    user: {
      type: String,
      default: "System Admin",
    },
    amount: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Activity", activitySchema);

