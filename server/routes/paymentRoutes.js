const express = require("express");

const router = express.Router();

const {
  sendPayment,
  getTransactionHistory,
  acceptPayment,
  rejectPayment,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

// ========================================
// SEND PAYMENT
// ========================================

router.post(
  "/send",
  authMiddleware,
  sendPayment
);

// ========================================
// TRANSACTION HISTORY
// ========================================

router.get(
  "/history",
  authMiddleware,
  getTransactionHistory
);

// ========================================
// ACCEPT PAYMENT
// ========================================

router.post(
  "/:transactionId/accept",
  authMiddleware,
  acceptPayment
);

// ========================================
// REJECT PAYMENT
// ========================================

router.post(
  "/:transactionId/reject",
  authMiddleware,
  rejectPayment
);

module.exports = router;