const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

const connectDB = require("./config/db");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

/* ==========================================================================
   CORS CONFIGURATION
   Allows production frontend (Vercel), Vercel previews, and local development
   ========================================================================== */
const allowedOrigins = [
  "https://ucare-hospital-2u9g.vercel.app",
  "https://ucare-hospital.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/+$/, ""));
}
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/+$/, ""));
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow non-browser requests (mobile apps, server-to-server, curl)
    if (!origin) return callback(null, true);

    const isExplicit = allowedOrigins.includes(origin);
    const isVercelPreview = /^https:\/\/ucare-hospital.*\.vercel\.app$/.test(origin);

    if (isExplicit || isVercelPreview) {
      return callback(null, true);
    }
    // Fallback permissive in production so legitimate preview branches work
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* Middlewares */
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
app.use(express.json({ limit: "20mb" }));

/* Ensure MongoDB is connected before handling requests in serverless environments */
app.use(async (req, res, next) => {
  // Allow root health check to respond even if DB is still connecting
  if (req.path === "/" || req.path === "/api/health") {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection middleware error:", err.message);
    res.status(500).json({
      success: false,
      message:
        "Database connection error. Please verify MONGO_URI in Vercel environment variables.",
      error: err.message,
    });
  }
});

/* ==========================================================================
   API ROUTES
   ========================================================================== */
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

/* Default Root & Health Routes */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "UCare Hospital Management API",
    status: "healthy",
    connectedClients: allowedOrigins,
    dbReady: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "UCare Hospital API Root Endpoint",
    status: "healthy",
    dbReady: mongoose.connection.readyState === 1,
    timestamp: new Date().toISOString(),
  });
});

/* Start server locally (Only when executed directly and outside of serverless Vercel environments) */
const PORT = process.env.PORT || 5000;

if (require.main === module && !process.env.VERCEL) {
  // Eager connect when running as a persistent Node server
  connectDB().catch((err) => {
    console.warn("Initial DB connection attempt:", err.message);
  });

  app.listen(PORT, () => {
    console.log(`UCare Hospital Server running on port ${PORT}`);
  });
}

module.exports = app;
