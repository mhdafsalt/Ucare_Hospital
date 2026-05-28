const Appointment = require("../models/Appointment");

/*Get All Appointments */
const getAppointments = async (req, res) => {
  try {
    const { deleted } = req.query;
    const filter = deleted === "true" ? { isDeleted: true } : { isDeleted: false };
    
    const appointments = await Appointment.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/*Add Appointment*/
const addAppointment = async (req, res) => {
  try {
    const { patientName, doctorName, date, time } = req.body;

    if (!patientName || !doctorName || !date || !time) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    const appointment = new Appointment(req.body);
    const savedAppointment = await appointment.save();

    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* Update Appointment*/
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      message: "Appointment updated successfully",
      updatedAppointment,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* Delete Appointment (Soft Delete)*/
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedAppointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      message: "Appointment moved to trash successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* Restore Appointment*/
const restoreAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const restoredAppointment = await Appointment.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true }
    );

    if (!restoredAppointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      message: "Appointment restored successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  restoreAppointment,
};