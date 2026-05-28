const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const connectDB = require("./config/db");

dotenv.config();

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