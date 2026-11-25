const express = require("express");

const router =
  express.Router();

const {
  getBlockchainData,
  validateBlockchainData,
  getGenesisBlock,
} = require("../controllers/blockchainController");

const authMiddleware =
  require("../middleware/authMiddleware");


// ======================================================
// GET ENTIRE BLOCKCHAIN
// ======================================================

router.get(
  "/",
  authMiddleware,
  getBlockchainData
);


// ======================================================
// VALIDATE BLOCKCHAIN
// ======================================================

router.get(
  "/validate",
  authMiddleware,
  validateBlockchainData
);


// ======================================================
// GET GENESIS BLOCK
// ======================================================

router.get(
  "/genesis",
  authMiddleware,
  getGenesisBlock
);


module.exports = router;