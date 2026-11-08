const express = require("express");
const router = express.Router();
const {
  getPharmacists,
  addPharmacist,
  updatePharmacist,
  toggleStatus,
  deletePharmacist,
  restorePharmacist,
} = require("../controllers/pharmacistController");

router.get("/", getPharmacists);
router.post("/", addPharmacist);
router.put("/:id", updatePharmacist);
router.patch("/:id/status", toggleStatus);
router.delete("/:id", deletePharmacist);
router.patch("/:id/restore", restorePharmacist);

module.exports = router;

