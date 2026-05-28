const express = require("express");
const { login, setupAdmin } = require("../controllers/authController");

const router = express.Router();

router.post("/login", login);
router.post("/setup-admin", setupAdmin);

module.exports = router;
