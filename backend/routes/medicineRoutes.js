const express = require("express");
const router = express.Router();
const {
  getMedicines,
  addMedicine,
  updateMedicine,
  deleteMedicine,
  restockMedicine,
  dispenseMedicine,
  getSales,
  updateSale,
  deleteSale,
  quarantineMedicine,
} = require("../controllers/medicineController");

router.get("/sales", getSales);
router.put("/sales/:id", updateSale);
router.delete("/sales/:id", deleteSale);
router.post("/dispense", dispenseMedicine);
router.patch("/:id/restock", restockMedicine);
router.patch("/:id/quarantine", quarantineMedicine);

router.get("/", getMedicines);
router.post("/", addMedicine);
router.put("/:id", updateMedicine);
router.delete("/:id", deleteMedicine);

module.exports = router;
