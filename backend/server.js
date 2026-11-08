const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const connectDB = require("./config/db");

dotenv.config({ path: path.join(__dirname, ".env") });

connectDB();

const app = express();

/*Middlewares*/
app.use(cors());

app.use(bodyParser.json());

app.use(express.json());

/* Routes*/
app.use("/api/patients", require("./routes/patients"));

app.use("/api/doctors", require("./routes/doctors"));

app.use("/api/appointments", require("./routes/appointments"));

app.use("/api/receptionists", require("./routes/receptionists"));

app.use("/api/pharmacists", require("./routes/pharmacistRoutes"));

app.use("/api/billing-staff", require("./routes/billingStaffRoutes"));

app.use("/api/pharmacy", require("./routes/medicineRoutes"));

app.use("/api/billing", require("./routes/billingRoutes"));

app.use("/api/admin", require("./routes/adminRoutes"));

app.use("/api/supports", require("./routes/supportRoutes"));

app.use("/api/auth", require("./routes/authRoutes"));

/* Default Route*/
app.get("/", (req, res) => {
  res.send("Hospital Management API Running...");
});

/*PORT*/
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    ` Server running on http://localhost:${PORT}`
  );
});