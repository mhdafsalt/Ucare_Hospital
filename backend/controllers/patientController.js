const Patient = require("../models/Patient");

//  GET ALL PATIENTS 
const getPatients = async (req, res) => {
  try {
    const { deleted } = req.query;
    const filter = deleted === "true" ? { isDeleted: true } : { isDeleted: false };
    
    const patients = await Patient.find(filter).sort({ createdAt: -1 });

    const formattedPatients = patients.map((p) => {
      const obj = p.toObject();
      if (!obj.patientId && obj._id) {
        obj.patientId = `PAT-${String(obj._id).slice(-4).toUpperCase()}`;
      }
      return obj;
    });

    res.status(200).json({ patients: formattedPatients });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  ADD PATIENT 
const addPatient = async (req, res) => {
  try {
    const patientData = { ...req.body };
    const patient = new Patient(patientData);
    if (!patient.patientId && patient._id) {
      patient.patientId = `PAT-${String(patient._id).slice(-4).toUpperCase()}`;
    }
    const savedPatient = await patient.save();

    res.status(201).json(savedPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PATIENT 
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedPatient = await Patient.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Patient updated successfully", updatedPatient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  DELETE PATIENT (SOFT) 
const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPatient = await Patient.findByIdAndUpdate(id, { isDeleted: true }, { new: true });

    if (!deletedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Patient moved to trash successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  RESTORE PATIENT 
const restorePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const restoredPatient = await Patient.findByIdAndUpdate(id, { isDeleted: false }, { new: true });

    if (!restoredPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({ message: "Patient restored successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPatients,
  addPatient,
  updatePatient,
  deletePatient,
  restorePatient,
};