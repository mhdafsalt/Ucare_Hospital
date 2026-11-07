const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  addDoctor,
  deleteDoctor,
  getDoctors,
  updateDoctor,
  restoreDoctor,
} = require("../controllers/doctorController.js");

const router = express.Router();

// Public: allows landing page and patient views to see active doctors
router.get("/allDoctors", getDoctors);

// Protected routes (Admin operations)
router.post("/addDoctors", verifyToken, addDoctor);
router.put("/updateDoctors/:id", verifyToken, updateDoctor);
router.delete("/deleteDoctors/:id", verifyToken, deleteDoctor);
router.put("/restoreDoctors/:id", verifyToken, restoreDoctor);

module.exports = router;