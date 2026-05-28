const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const router = express.Router();
const { createSupport, getAllSupports } = require("../controllers/supportController");

router.post("/", verifyToken, createSupport);
router.get("/", verifyToken, getAllSupports);

module.exports = router;
