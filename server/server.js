const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// ========================================
// IMPORT ROUTES
// ========================================
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const blockchainRoutes =
  require("./routes/blockchainRoutes");
// ========================================
// CREATE EXPRESS APP
// ========================================
const app = express();

// ========================================
// MIDDLEWARE
// ========================================

// Allow frontend requests
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// ========================================
// API ROUTES
// ========================================

// Authentication routes
// POST /api/auth/register
// POST /api/auth/login
app.use("/api/auth", authRoutes);

// Payment routes
// POST /api/payment/send
app.use("/api/payment", paymentRoutes);
app.use(
  "/api/blockchain",
  blockchainRoutes
);

// ========================================
// TEST ROUTE
// ========================================
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Blockchain Payment API is running",
  });
});

// ========================================
// 404 ROUTE
// ========================================
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ========================================
// ERROR HANDLER
// ========================================
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    message: "Internal server error",
  });
});

// ========================================
// DATABASE + SERVER START
// ========================================

const PORT = process.env.PORT || 5000;

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing in .env file");
  process.exit(1);
}

if (!process.env.WALLET_ENCRYPTION_KEY) {
  console.error(
    "❌ WALLET_ENCRYPTION_KEY is missing in .env file"
  );
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}`);
      console.log(
        `Auth: http://localhost:${PORT}/api/auth`
      );
      console.log(
        `Payment: http://localhost:${PORT}/api/payment`
      );
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });