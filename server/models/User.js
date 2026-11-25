const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // User's wallet identifier
    walletId: {
      type: String,
      required: true,
      unique: true,
    },

    // Public key used to verify transactions
    publicKey: {
      type: String,
      required: true,
    },

    // Encrypted private key
    // Never send this to the frontend
    encryptedPrivateKey: {
      type: String,
      required: true,
    },

    balance: {
      type: Number,
      default: 10000,
      min: 0,
    },

    nonce: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;