const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderWalletId: {
      type: String,
      required: true,
    },

    receiverWalletId: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    nonce: {
      type: Number,
      required: true,
    },

    signature: {
      type: String,
      required: true,
    },

    transactionHash: {
      type: String,
      required: true,
      unique: true,
    },

    previousHash: {
      type: String,
      default: "GENESIS",
    },

    // ========================================
    // TRANSACTION STATUS
    // ========================================
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "FAILED",
      ],
      default: "PENDING",
    },

    // ========================================
    // REJECTION / ACCEPTANCE INFORMATION
    // ========================================
    processedAt: {
      type: Date,
      default: null,
    },

    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);

module.exports = Transaction;