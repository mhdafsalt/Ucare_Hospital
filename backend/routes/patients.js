const router = require("express").Router();
const { verifyToken } = require("../middleware/authMiddleware");

const {
  getPatients,
  addPatient,
  updatePatient,
  deletePatient,
  restorePatient,
} = require("../controllers/patientController");

router.get("/", verifyToken, getPatients);
router.post("/", verifyToken, addPatient);
router.put("/:id", verifyToken, updatePatient);
router.delete("/:id", verifyToken, deletePatient);
router.patch("/restore/:id", verifyToken, restorePatient);

module.exports = router;