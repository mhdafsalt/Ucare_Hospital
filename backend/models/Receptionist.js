const mongoose = require("mongoose");

const receptionistSchema = new mongoose.Schema(
    {
        receptionistId: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        phone: {
            type: String,
            required: true,
        },
        receptionistimage: {
            type: String,
            required: true,
        },

        shift: {
            type: String,
            enum: ["Morning", "Evening", "Night"],
            required: true,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Receptionist", receptionistSchema);