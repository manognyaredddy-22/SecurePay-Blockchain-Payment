const crypto = require("crypto");

const Block = require("../models/Block");
const Transaction = require("../models/Transaction");


// ======================================================
// CALCULATE BLOCK HASH
// ======================================================

const calculateBlockHash = ({
  index,
  timestamp,
  transactions,
  previousHash,
  nonce,
}) => {
  const blockData = JSON.stringify({
    index,
    timestamp,
    transactions,
    previousHash,
    nonce,
  });

  return crypto
    .createHash("sha256")
    .update(blockData)
    .digest("hex");
};


// ======================================================
// GET LAST BLOCK
// ======================================================

const getLastBlock = async () => {
  return await Block.findOne().sort({
    index: -1,
  });
};


// ======================================================
// CREATE GENESIS BLOCK
// ======================================================

const createGenesisBlock = async () => {
  const existingGenesis =
    await Block.findOne({
      index: 0,
    });

  if (existingGenesis) {
    return existingGenesis;
  }

  const timestamp =
    new Date();

  const previousHash =
    "0";

  const transactions = [];

  const nonce = 0;

  const hash =
    calculateBlockHash({
      index: 0,
      timestamp,
      transactions,
      previousHash,
      nonce,
    });

  const genesisBlock =
    await Block.create({
      index: 0,

      timestamp,

      transactions,

      previousHash,

      hash,

      nonce,
    });

  return genesisBlock;
};


// ======================================================
// CREATE BLOCK FOR CONFIRMED TRANSACTION
// ======================================================

const createBlockForTransaction = async (
  transactionId
) => {
  // ----------------------------------------------
  // Find transaction
  // ----------------------------------------------

  const transaction =
    await Transaction.findById(
      transactionId
    );

  if (!transaction) {
    throw new Error(
      "Transaction not found"
    );
  }

  // ----------------------------------------------
  // Only confirmed transactions
  // ----------------------------------------------

  if (
    transaction.status !==
    "CONFIRMED"
  ) {
    throw new Error(
      "Only confirmed transactions can be added to the blockchain"
    );
  }

  // ----------------------------------------------
  // Prevent duplicate blockchain entry
  // ----------------------------------------------

  const existingBlock =
    await Block.findOne({
      transactions:
        transaction._id,
    });

  if (existingBlock) {
    return existingBlock;
  }

  // ----------------------------------------------
  // Make sure genesis block exists
  // ----------------------------------------------

  await createGenesisBlock();

  // ----------------------------------------------
  // Get previous block
  // ----------------------------------------------

  const previousBlock =
    await getLastBlock();

  if (!previousBlock) {
    throw new Error(
      "Previous block not found"
    );
  }

  // ----------------------------------------------
  // New block information
  // ----------------------------------------------

  const index =
    previousBlock.index + 1;

  const timestamp =
    new Date();

  const transactions = [
    transaction._id,
  ];

  const previousHash =
    previousBlock.hash;

  const nonce = 0;

  // ----------------------------------------------
  // Calculate block hash
  // ----------------------------------------------

  const hash =
    calculateBlockHash({
      index,
      timestamp,
      transactions,
      previousHash,
      nonce,
    });

  // ----------------------------------------------
  // Create block
  // ----------------------------------------------

  const newBlock =
    await Block.create({
      index,

      timestamp,

      transactions,

      previousHash,

      hash,

      nonce,
    });

  return newBlock;
};


// ======================================================
// VALIDATE SINGLE BLOCK
// ======================================================

const validateBlock = (
  block,
  previousBlock
) => {
  // ----------------------------------------------
  // Check previous hash
  // ----------------------------------------------

  if (
    previousBlock &&
    block.previousHash !==
      previousBlock.hash
  ) {
    return {
      valid: false,
      reason:
        "Previous hash does not match",
    };
  }

  // ----------------------------------------------
  // Recalculate block hash
  // ----------------------------------------------

  const calculatedHash =
    calculateBlockHash({
      index:
        block.index,

      timestamp:
        block.timestamp,

      transactions:
        block.transactions,

      previousHash:
        block.previousHash,

      nonce:
        block.nonce,
    });

  // ----------------------------------------------
  // Compare hashes
  // ----------------------------------------------

  if (
    calculatedHash !==
    block.hash
  ) {
    return {
      valid: false,
      reason:
        "Block hash is invalid",
    };
  }

  return {
    valid: true,
    reason:
      "Block is valid",
  };
};


// ======================================================
// VALIDATE ENTIRE BLOCKCHAIN
// ======================================================

const validateBlockchain =
  async () => {
    const blocks =
      await Block.find()
        .sort({
          index: 1,
        });

    // ----------------------------------------------
    // Empty blockchain
    // ----------------------------------------------

    if (blocks.length === 0) {
      return {
        valid: false,
        reason:
          "Blockchain is empty",
      };
    }

    // ----------------------------------------------
    // Validate genesis block
    // ----------------------------------------------

    if (blocks[0].index !== 0) {
      return {
        valid: false,
        reason:
          "Genesis block is missing",
      };
    }

    // ----------------------------------------------
    // Validate each block
    // ----------------------------------------------

    for (
      let i = 0;
      i < blocks.length;
      i++
    ) {
      const currentBlock =
        blocks[i];

      const previousBlock =
        i > 0
          ? blocks[i - 1]
          : null;

      const result =
        validateBlock(
          currentBlock,
          previousBlock
        );

      if (!result.valid) {
        return {
          valid: false,

          reason:
            `Block ${currentBlock.index}: ${result.reason}`,

          invalidBlock:
            currentBlock.index,
        };
      }
    }

    // ----------------------------------------------
    // Blockchain valid
    // ----------------------------------------------

    return {
      valid: true,

      reason:
        "Blockchain is valid",

      blockCount:
        blocks.length,
    };
  };


// ======================================================
// GET ENTIRE BLOCKCHAIN
// ======================================================

const getBlockchain =
  async () => {
    return await Block.find()
      .populate({
        path: "transactions",
        select:
          "senderWalletId receiverWalletId amount nonce transactionHash previousHash status createdAt processedAt",
      })
      .sort({
        index: 1,
      });
  };


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  calculateBlockHash,
  getLastBlock,
  createGenesisBlock,
  createBlockForTransaction,
  validateBlock,
  validateBlockchain,
  getBlockchain,
};