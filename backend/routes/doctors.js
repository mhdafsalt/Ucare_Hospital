const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const { addDoctor, deleteDoctor, getDoctors, updateDoctor, restoreDoctor } = require("../controllers/doctorController.js");


const router = express.Router();

router.get("/allDoctors", verifyToken, getDoctors);
router.post("/addDoctors", verifyToken, addDoctor);
router.put("/updateDoctors/:id", verifyToken, updateDoctor);
router.delete("/deleteDoctors/:id", verifyToken, deleteDoctor);
router.put("/restoreDoctors/:id", verifyToken, restoreDoctor);

module.exports = router;