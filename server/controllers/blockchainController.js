const {
  createGenesisBlock,
  getBlockchain,
  validateBlockchain,
} = require("../services/blockchainService");


// ======================================================
// GET BLOCKCHAIN
// ======================================================

const getBlockchainData = async (
  req,
  res
) => {
  try {
    // Make sure genesis block exists
    await createGenesisBlock();

    const blockchain =
      await getBlockchain();

    return res.status(200).json({
      success: true,

      blockCount:
        blockchain.length,

      blockchain,
    });

  } catch (error) {
    console.error(
      "Get blockchain error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch blockchain",
    });
  }
};


// ======================================================
// VALIDATE BLOCKCHAIN
// ======================================================

const validateBlockchainData =
  async (req, res) => {
    try {
      const validationResult =
        await validateBlockchain();

      return res.status(200).json({
        success: true,

        ...validationResult,
      });

    } catch (error) {
      console.error(
        "Blockchain validation error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to validate blockchain",
      });
    }
  };


// ======================================================
// GET GENESIS BLOCK
// ======================================================

const getGenesisBlock =
  async (req, res) => {
    try {
      const genesisBlock =
        await createGenesisBlock();

      return res.status(200).json({
        success: true,

        block:
          genesisBlock,
      });

    } catch (error) {
      console.error(
        "Genesis block error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Failed to create or fetch genesis block",
      });
    }
  };


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getBlockchainData,
  validateBlockchainData,
  getGenesisBlock,
};