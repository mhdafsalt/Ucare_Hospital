

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
      name,
      specialization,
      experience,
      email,
      phone,
      image,
    } = req.body;

    const doctor = await DoctorModel.create({
      doctorId,
      name,
      specialization,
      experience,
      email,
      phone,
      image,
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
    const doctor = await DoctorModel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      req.body,
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