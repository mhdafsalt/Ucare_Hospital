const router = require("express").Router();
const { verifyToken } = require("../middleware/authMiddleware");

const {
  getAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  restoreAppointment,
} = require("../controllers/appointmentController");

router.get("/", verifyToken, getAppointments);
router.post("/", verifyToken, addAppointment);
router.put("/:id", verifyToken, updateAppointment);
router.delete("/:id", verifyToken, deleteAppointment);
router.patch("/restore/:id", verifyToken, restoreAppointment);

module.exports = router;