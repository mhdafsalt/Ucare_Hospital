const express = require("express");
const router = express.Router();
const {
  getBillingStaff,
  addBillingStaff,
  updateBillingStaff,
  toggleStatus,
  deleteBillingStaff,
  restoreBillingStaff,
} = require("../controllers/billingStaffController");

router.get("/", getBillingStaff);
router.post("/", addBillingStaff);
router.put("/:id", updateBillingStaff);
router.patch("/:id/status", toggleStatus);
router.delete("/:id", deleteBillingStaff);
router.patch("/:id/restore", restoreBillingStaff);

module.exports = router;

