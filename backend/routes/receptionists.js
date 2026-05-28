const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();
const {
  addReceptionist,
  getReceptionists,
  updateReceptionist,
  deleteReceptionist,
  restoreReceptionist,
} = require("../controllers/receptionistController");

router.post("/", verifyToken, addReceptionist);
router.get("/", verifyToken, getReceptionists);
router.put("/:id", verifyToken, updateReceptionist);
router.delete("/:id", verifyToken, deleteReceptionist);
router.patch("/restore/:id", verifyToken, restoreReceptionist);

module.exports = router;
