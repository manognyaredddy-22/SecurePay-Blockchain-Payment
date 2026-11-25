const crypto = require("crypto");

const User = require("../models/User");
const Transaction = require("../models/Transaction");

const {
  executePaymentContract,
} = require("../services/paymentSmartContract");

const {
  createBlockForTransaction,
} = require("../services/blockchainService");

// ======================================================
// DECRYPT PRIVATE KEY
// ======================================================

const decryptPrivateKey = (encryptedPrivateKey) => {
  const [ivHex, encryptedData] =
    encryptedPrivateKey.split(":");

  const encryptionKey = crypto
    .createHash("sha256")
    .update(process.env.WALLET_ENCRYPTION_KEY)
    .digest();

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    encryptionKey,
    Buffer.from(ivHex, "hex")
  );

  let decrypted = decipher.update(
    encryptedData,
    "hex",
    "utf8"
  );

  decrypted += decipher.final("utf8");

  return decrypted;
};


// ======================================================
// SIGN TRANSACTION
// ======================================================

const signTransaction = (
  transactionData,
  privateKey
) => {
  const data = JSON.stringify(transactionData);

  const sign = crypto.createSign("SHA256");

  sign.update(data);
  sign.end();

  return sign.sign(
    privateKey,
    "base64"
  );
};


// ======================================================
// VERIFY DIGITAL SIGNATURE
// ======================================================

const verifySignature = (
  transactionData,
  signature,
  publicKey
) => {
  const data = JSON.stringify(transactionData);

  const verify =
    crypto.createVerify("SHA256");

  verify.update(data);
  verify.end();

  return verify.verify(
    publicKey,
    signature,
    "base64"
  );
};


// ======================================================
// GENERATE TRANSACTION HASH
// ======================================================

const generateTransactionHash = (
  transactionData,
  signature,
  previousHash
) => {
  const data = JSON.stringify({
    ...transactionData,
    signature,
    previousHash,
  });

  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
};


// ======================================================
// SEND PAYMENT
// ======================================================

const sendPayment = async (req, res) => {
  try {
    const {
      receiverWalletId,
      amount,
    } = req.body;

    // ----------------------------------------------
    // Validate receiver wallet
    // ----------------------------------------------

    if (!receiverWalletId) {
      return res.status(400).json({
        message:
          "Receiver wallet ID is required",
      });
    }

    // ----------------------------------------------
    // Validate amount
    // ----------------------------------------------

    const paymentAmount =
      Number(amount);

    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      return res.status(400).json({
        message:
          "Payment amount must be greater than zero",
      });
    }

    // ----------------------------------------------
    // Find sender
    // ----------------------------------------------

    const sender =
      await User.findById(
        req.user._id
      );

    if (!sender) {
      return res.status(404).json({
        message:
          "Sender not found",
      });
    }

    // ----------------------------------------------
    // Find receiver
    // ----------------------------------------------

    const receiver =
      await User.findOne({
        walletId:
          receiverWalletId,
      });

    if (!receiver) {
      return res.status(404).json({
        message:
          "Receiver wallet not found",
      });
    }

    // ----------------------------------------------
    // Prevent self-payment
    // ----------------------------------------------

    if (
      sender._id.toString() ===
      receiver._id.toString()
    ) {
      return res.status(400).json({
        message:
          "You cannot send payment to yourself",
      });
    }

    // ----------------------------------------------
    // Check sender balance
    // ----------------------------------------------

    if (
      sender.balance <
      paymentAmount
    ) {
      return res.status(400).json({
        message:
          "Insufficient balance",
      });
    }

    // ----------------------------------------------
    // Get sender nonce
    // ----------------------------------------------

    const nonce =
      sender.nonce;

    // ----------------------------------------------
    // Create transaction data
    // ----------------------------------------------

    const transactionData = {
      senderWalletId:
        sender.walletId,

      receiverWalletId:
        receiver.walletId,

      amount:
        paymentAmount,

      nonce,

      timestamp:
        new Date().toISOString(),
    };

    // ----------------------------------------------
    // Decrypt private key
    // ----------------------------------------------

    const privateKey =
      decryptPrivateKey(
        sender.encryptedPrivateKey
      );

    // ----------------------------------------------
    // Sign transaction
    // ----------------------------------------------

    const signature =
      signTransaction(
        transactionData,
        privateKey
      );

    // ----------------------------------------------
    // Verify signature
    // ----------------------------------------------

    const signatureValid =
      verifySignature(
        transactionData,
        signature,
        sender.publicKey
      );

    if (!signatureValid) {
      return res.status(400).json({
        message:
          "Digital signature verification failed",
      });
    }

    // ----------------------------------------------
    // Get previous transaction hash
    // ----------------------------------------------

    const previousTransaction =
      await Transaction.findOne({
        $or: [
          {
            sender:
              sender._id,
          },
          {
            receiver:
              sender._id,
          },
        ],
      }).sort({
        createdAt: -1,
      });

    const previousHash =
      previousTransaction
        ? previousTransaction.transactionHash
        : "GENESIS";

    // ----------------------------------------------
    // Generate transaction hash
    // ----------------------------------------------

    const transactionHash =
      generateTransactionHash(
        transactionData,
        signature,
        previousHash
      );

    // ----------------------------------------------
    // Create pending transaction
    // ----------------------------------------------

    const transaction =
      await Transaction.create({
        sender:
          sender._id,

        receiver:
          receiver._id,

        senderWalletId:
          sender.walletId,

        receiverWalletId:
          receiver.walletId,

        amount:
          paymentAmount,

        nonce,

        signature,

        transactionHash,

        previousHash,

        status:
          "PENDING",
      });

    // ----------------------------------------------
    // Response
    // ----------------------------------------------

    return res.status(201).json({
      message:
        "Payment request created successfully",

      transaction: {
        id:
          transaction._id,

        senderWalletId:
          transaction.senderWalletId,

        receiverWalletId:
          transaction.receiverWalletId,

        amount:
          transaction.amount,

        nonce:
          transaction.nonce,

        transactionHash:
          transaction.transactionHash,

        previousHash:
          transaction.previousHash,

        status:
          transaction.status,

        createdAt:
          transaction.createdAt,
      },

      senderBalance:
        sender.balance,

      signatureVerified:
        signatureValid,
    });

  } catch (error) {
    console.error(
      "Send payment error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create payment request",
    });
  }
};


// ======================================================
// GET TRANSACTION HISTORY
// ======================================================

const getTransactionHistory = async (
  req,
  res
) => {
  try {
    const {
      type,
      status,
      search,
      startDate,
      endDate,
    } = req.query;

    const userId =
      req.user._id;

    // ----------------------------------------------
    // Base query
    // ----------------------------------------------

    const query = {
      $or: [
        {
          sender:
            userId,
        },
        {
          receiver:
            userId,
        },
      ],
    };

    // ----------------------------------------------
    // Type filter
    // ----------------------------------------------

    if (type === "sent") {
      query.$or = [
        {
          sender:
            userId,
        },
      ];
    }

    if (type === "received") {
      query.$or = [
        {
          receiver:
            userId,
        },
      ];
    }

    // ----------------------------------------------
    // Status filter
    // ----------------------------------------------

    if (
      status &&
      [
        "PENDING",
        "CONFIRMED",
        "FAILED",
      ].includes(status)
    ) {
      query.status =
        status;
    }

    // ----------------------------------------------
    // Search
    // ----------------------------------------------

    if (search) {
      query.$and = [
        {
          $or: [
            {
              senderWalletId: {
                $regex:
                  search,
                $options:
                  "i",
              },
            },
            {
              receiverWalletId: {
                $regex:
                  search,
                $options:
                  "i",
              },
            },
            {
              transactionHash: {
                $regex:
                  search,
                $options:
                  "i",
              },
            },
          ],
        },
      ];
    }

    // ----------------------------------------------
    // Date filter
    // ----------------------------------------------

    if (startDate || endDate) {
      query.createdAt = {};

      if (startDate) {
        query.createdAt.$gte =
          new Date(startDate);
      }

      if (endDate) {
        const endDateValue =
          new Date(endDate);

        endDateValue.setHours(
          23,
          59,
          59,
          999
        );

        query.createdAt.$lte =
          endDateValue;
      }
    }

    // ----------------------------------------------
    // Fetch transactions
    // ----------------------------------------------

    const transactions =
      await Transaction.find(
        query
      )
        .populate(
          "sender",
          "name walletId"
        )
        .populate(
          "receiver",
          "name walletId"
        )
        .sort({
          createdAt:
            -1,
        });

    // ----------------------------------------------
    // Format response
    // ----------------------------------------------

    const formattedTransactions =
      transactions.map(
        (transaction) => ({
          id:
            transaction._id,

          type:
            transaction.sender._id.toString() ===
            userId.toString()
              ? "sent"
              : "received",

          sender: {
            name:
              transaction.sender.name,

            walletId:
              transaction.sender.walletId,
          },

          receiver: {
            name:
              transaction.receiver.name,

            walletId:
              transaction.receiver.walletId,
          },

          amount:
            transaction.amount,

          nonce:
            transaction.nonce,

          transactionHash:
            transaction.transactionHash,

          previousHash:
            transaction.previousHash,

          status:
            transaction.status,

          createdAt:
            transaction.createdAt,

          processedAt:
            transaction.processedAt,

          failureReason:
            transaction.failureReason,
        })
      );

    return res.status(200).json({
      transactions:
        formattedTransactions,
    });

  } catch (error) {
    console.error(
      "Transaction history error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to fetch transaction history",
    });
  }
};


// ======================================================
// ACCEPT PAYMENT
// ======================================================

const acceptPayment = async (
  req,
  res
) => {
  try {
    const {
      transactionId,
    } = req.params;

    // ----------------------------------------------
    // FIND TRANSACTION
    // ----------------------------------------------

    const transaction =
      await Transaction.findById(
        transactionId
      );

    if (!transaction) {
      return res.status(404).json({
        message:
          "Transaction not found",
      });
    }

    // ----------------------------------------------
    // VERIFY RECEIVER
    // ----------------------------------------------

    if (
      transaction.receiver.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the receiver can accept this payment",
      });
    }

    // ----------------------------------------------
    // CHECK TRANSACTION STATUS
    // ----------------------------------------------

    if (
      transaction.status !==
      "PENDING"
    ) {
      return res.status(400).json({
        message:
          "Only pending payments can be accepted",
      });
    }

    // ----------------------------------------------
    // FIND SENDER
    // ----------------------------------------------

    const sender =
      await User.findById(
        transaction.sender
      );

    // ----------------------------------------------
    // FIND RECEIVER
    // ----------------------------------------------

    const receiver =
      await User.findById(
        transaction.receiver
      );

    if (!sender || !receiver) {
      return res.status(404).json({
        message:
          "Sender or receiver not found",
      });
    }

    // ==================================================
    // SMART CONTRACT
    // ==================================================

    const contractResult =
      executePaymentContract({
        sender,
        receiver,
        transaction,
      });

    // ----------------------------------------------
    // SMART CONTRACT REJECTED
    // ----------------------------------------------

    if (
      !contractResult.valid
    ) {
      transaction.status =
        "FAILED";

      transaction.failureReason =
        contractResult.reason;

      transaction.processedAt =
        new Date();

      await transaction.save();

      return res.status(400).json({
        message:
          "Smart contract rejected the payment",

        reason:
          contractResult.reason,

        contractHash:
          contractResult.contractHash,
      });
    }

    // ==================================================
    // SMART CONTRACT APPROVED
    // ==================================================

    // Deduct sender balance
    sender.balance -=
      transaction.amount;

    // Add receiver balance
    receiver.balance +=
      transaction.amount;

    // Increase sender nonce
    sender.nonce += 1;

    // Mark transaction confirmed
    transaction.status =
      "CONFIRMED";

    transaction.processedAt =
      new Date();

    transaction.failureReason =
      null;

    // ----------------------------------------------
    // SAVE BALANCE CHANGES
    // ----------------------------------------------

    await sender.save();

    await receiver.save();

    // ----------------------------------------------
    // SAVE CONFIRMED TRANSACTION
    // ----------------------------------------------

    await transaction.save();

    // ==================================================
    // CREATE BLOCK
    // ==================================================

    const block =
      await createBlockForTransaction(
        transaction._id
      );

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      message:
        "Payment accepted and added to blockchain",

      smartContract: {
        executed:
          true,

        status:
          "APPROVED",

        contractHash:
          contractResult.contractHash,

        executedAt:
          contractResult.executedAt,
      },

      blockchain: {
        blockCreated:
          true,

        blockIndex:
          block.index,

        blockHash:
          block.hash,

        previousHash:
          block.previousHash,
      },

      transaction: {
        id:
          transaction._id,

        senderWalletId:
          transaction.senderWalletId,

        receiverWalletId:
          transaction.receiverWalletId,

        amount:
          transaction.amount,

        nonce:
          transaction.nonce,

        transactionHash:
          transaction.transactionHash,

        previousHash:
          transaction.previousHash,

        status:
          transaction.status,

        processedAt:
          transaction.processedAt,
      },

      receiverBalance:
        receiver.balance,
    });

  } catch (error) {
    console.error(
      "Accept payment error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to accept payment",
    });
  }
};


// ======================================================
// REJECT PAYMENT
// ======================================================

const rejectPayment = async (
  req,
  res
) => {
  try {
    const {
      transactionId,
    } = req.params;

    // ----------------------------------------------
    // Find transaction
    // ----------------------------------------------

    const transaction =
      await Transaction.findById(
        transactionId
      );

    if (!transaction) {
      return res.status(404).json({
        message:
          "Transaction not found",
      });
    }

    // ----------------------------------------------
    // Verify receiver
    // ----------------------------------------------

    if (
      transaction.receiver.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "Only the receiver can reject this payment",
      });
    }

    // ----------------------------------------------
    // Check status
    // ----------------------------------------------

    if (
      transaction.status !==
      "PENDING"
    ) {
      return res.status(400).json({
        message:
          "Only pending payments can be rejected",
      });
    }

    // ----------------------------------------------
    // Mark as failed/rejected
    // ----------------------------------------------

    transaction.status =
      "FAILED";

    transaction.failureReason =
      "Payment rejected by receiver";

    transaction.processedAt =
      new Date();

    await transaction.save();

    // ----------------------------------------------
    // Response
    // ----------------------------------------------

    return res.status(200).json({
      message:
        "Payment rejected successfully",

      transaction: {
        id:
          transaction._id,

        senderWalletId:
          transaction.senderWalletId,

        receiverWalletId:
          transaction.receiverWalletId,

        amount:
          transaction.amount,

        nonce:
          transaction.nonce,

        transactionHash:
          transaction.transactionHash,

        previousHash:
          transaction.previousHash,

        status:
          transaction.status,

        processedAt:
          transaction.processedAt,

        failureReason:
          transaction.failureReason,
      },
    });

  } catch (error) {
    console.error(
      "Reject payment error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to reject payment",
    });
  }
};


// ======================================================
// EXPORT CONTROLLERS
// ======================================================

module.exports = {
  sendPayment,
  getTransactionHistory,
  acceptPayment,
  rejectPayment,
};