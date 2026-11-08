

// GET ALL DOCTORS


const DoctorModel = require("../models/Doctor.js");

const getDoctors = async (req, res) => {
  try {
    const { showDeleted } = req.query;

    const doctors = await DoctorModel.find({
      isDeleted: showDeleted === "true",
    });

    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ADD DOCTOR


const addDoctor = async (req, res) => {
  try {
    const {
      doctorId,
      userId,
      name,
      specialization,
      experience,
      email,
      phone,
      image,
      status,
    } = req.body;

    const finalUserId = userId || doctorId || `DOC${Date.now()}`;

    const doctor = await DoctorModel.create({
      userId: finalUserId,
      doctorId: doctorId || finalUserId,
      name,
      specialization,
      experience,
      email,
      phone,
      image,
      status: status || "Available",
      role: "doctor",
    });

    res.status(201).json({
      success: true,
      message: "Doctor Added Successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// UPDATE DOCTOR


const updateDoctor = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.doctorId && !updateData.userId) {
      updateData.userId = updateData.doctorId;
    }

    const doctor = await DoctorModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updateData,
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found or deleted",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor Updated Successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE DOCTOR



const deleteDoctor = async (req, res) => {
  try {
    const doctor = await DoctorModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor moved to trash successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




const restoreDoctor = async (req, res) => {
  try {
    const doctor = await DoctorModel.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor restored successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};







module.exports = {
  getDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
  restoreDoctor,
};