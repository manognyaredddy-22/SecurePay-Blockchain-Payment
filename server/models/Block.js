const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true,
      unique: true,
    },

    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },

    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],

    previousHash: {
      type: String,
      required: true,
    },

    hash: {
      type: String,
      required: true,
      unique: true,
    },

    nonce: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Block = mongoose.model(
  "Block",
  blockSchema
);

module.exports = Block;