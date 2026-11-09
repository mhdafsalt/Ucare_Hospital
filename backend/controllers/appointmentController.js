const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");

/*Get All Appointments */
const getAppointments = async (req, res) => {
  try {
    const { deleted } = req.query;
    const filter = deleted === "true" ? { isDeleted: true } : { isDeleted: false };
    
    const appointments = await Appointment.find(filter).sort({
      createdAt: -1,
    });

    const patients = await Patient.find({ isDeleted: false });
    const patientMap = new Map();
    patients.forEach((p) => {
      const pId =
        p.patientId ||
        (p._id ? `PAT-${String(p._id).slice(-4).toUpperCase()}` : "");
      if (p.name) patientMap.set(p.name.trim().toLowerCase(), pId);
    });

    const formattedAppointments = appointments.map((a) => {
      const obj = a.toObject();
      if (!obj.patientId && obj.patientName) {
        const found = patientMap.get(obj.patientName.trim().toLowerCase());
        if (found) obj.patientId = found;
      }
      return obj;
    });

    res.status(200).json(formattedAppointments);
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

    const appointmentData = { ...req.body };
    if (!appointmentData.patientId && appointmentData.patientName) {
      const matchPat = await Patient.findOne({
        name: {
          $regex: new RegExp(`^${appointmentData.patientName.trim()}$`, "i"),
        },
        isDeleted: false,
      });
      if (matchPat) {
        appointmentData.patientId =
          matchPat.patientId ||
          `PAT-${String(matchPat._id).slice(-4).toUpperCase()}`;
      }
    }

    const appointment = new Appointment(appointmentData);
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