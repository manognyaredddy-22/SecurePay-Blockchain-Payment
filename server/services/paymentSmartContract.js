const crypto = require("crypto");

/*
  ======================================================
  PAYMENT SMART CONTRACT
  ======================================================

  This module defines the rules that must be satisfied
  before a pending payment can be confirmed.

  This is an application-level smart contract for the
  academic prototype. It is not a Solidity/Ethereum
  smart contract.
*/


// ======================================================
// VALIDATE PAYMENT
// ======================================================

const validatePayment = ({
  sender,
  receiver,
  transaction,
}) => {
  // ----------------------------------------------
  // Rule 1: Sender must exist
  // ----------------------------------------------

  if (!sender) {
    return {
      valid: false,
      reason: "Sender not found",
    };
  }

  // ----------------------------------------------
  // Rule 2: Receiver must exist
  // ----------------------------------------------

  if (!receiver) {
    return {
      valid: false,
      reason: "Receiver not found",
    };
  }

  // ----------------------------------------------
  // Rule 3: Sender cannot pay themselves
  // ----------------------------------------------

  if (
    sender._id.toString() ===
    receiver._id.toString()
  ) {
    return {
      valid: false,
      reason:
        "Sender and receiver cannot be the same",
    };
  }

  // ----------------------------------------------
  // Rule 4: Transaction must exist
  // ----------------------------------------------

  if (!transaction) {
    return {
      valid: false,
      reason: "Transaction not found",
    };
  }

  // ----------------------------------------------
  // Rule 5: Transaction must be PENDING
  // ----------------------------------------------

  if (
    transaction.status !== "PENDING"
  ) {
    return {
      valid: false,
      reason:
        "Only pending transactions can be confirmed",
    };
  }

  // ----------------------------------------------
  // Rule 6: Amount must be valid
  // ----------------------------------------------

  const amount =
    Number(transaction.amount);

  if (
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return {
      valid: false,
      reason:
        "Payment amount must be greater than zero",
    };
  }

  // ----------------------------------------------
  // Rule 7: Sender must have enough balance
  // ----------------------------------------------

  if (
    Number(sender.balance) < amount
  ) {
    return {
      valid: false,
      reason:
        "Sender has insufficient balance",
    };
  }

  // ----------------------------------------------
  // Rule 8: Sender wallet must match
  // ----------------------------------------------

  if (
    transaction.senderWalletId !==
    sender.walletId
  ) {
    return {
      valid: false,
      reason:
        "Sender wallet ID does not match transaction",
    };
  }

  // ----------------------------------------------
  // Rule 9: Receiver wallet must match
  // ----------------------------------------------

  if (
    transaction.receiverWalletId !==
    receiver.walletId
  ) {
    return {
      valid: false,
      reason:
        "Receiver wallet ID does not match transaction",
    };
  }

  // ----------------------------------------------
  // Rule 10: Transaction amount must be valid
  // ----------------------------------------------

  if (
    transaction.amount !== amount
  ) {
    return {
      valid: false,
      reason:
        "Transaction amount is invalid",
    };
  }

  // ----------------------------------------------
  // All rules passed
  // ----------------------------------------------

  return {
    valid: true,
    reason:
      "Payment satisfies all smart contract rules",
  };
};


// ======================================================
// GENERATE SMART CONTRACT HASH
// ======================================================

const generateContractHash = ({
  transaction,
  result,
}) => {
  const contractData = {
    transactionId:
      transaction._id.toString(),

    transactionHash:
      transaction.transactionHash,

    senderWalletId:
      transaction.senderWalletId,

    receiverWalletId:
      transaction.receiverWalletId,

    amount:
      transaction.amount,

    nonce:
      transaction.nonce,

    status:
      transaction.status,

    validationResult:
      result.valid,

    validationReason:
      result.reason,
  };

  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify(contractData)
    )
    .digest("hex");
};


// ======================================================
// EXECUTE SMART CONTRACT
// ======================================================

const executePaymentContract = ({
  sender,
  receiver,
  transaction,
}) => {
  // Run validation rules
  const validationResult =
    validatePayment({
      sender,
      receiver,
      transaction,
    });

  // Generate cryptographic contract hash
  const contractHash =
    generateContractHash({
      transaction,
      result:
        validationResult,
    });

  return {
    valid:
      validationResult.valid,

    reason:
      validationResult.reason,

    contractHash,

    executedAt:
      new Date(),
  };
};


// ======================================================
// EXPORT
// ======================================================

module.exports = {
  validatePayment,
  generateContractHash,
  executePaymentContract,
};