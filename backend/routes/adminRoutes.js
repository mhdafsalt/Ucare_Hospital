const express = require("express");
const router = express.Router();
const {
  getDashboardOverview,
  getActivities,
  createActivity,
} = require("../controllers/adminDashboardController");

router.get("/dashboard-overview", getDashboardOverview);
router.get("/activities", getActivities);
router.post("/activities", createActivity);

module.exports = router;

