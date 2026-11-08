const express = require("express");
const router = express.Router();
const {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require("../controllers/billingController");

router.get("/invoices", getInvoices);
router.post("/invoices", createInvoice);
router.put("/invoices/:id", updateInvoice);
router.delete("/invoices/:id", deleteInvoice);

module.exports = router;

