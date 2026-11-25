import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const SendPayment = () => {
  // ========================================
  // AUTH CONTEXT
  // ========================================
  const { user, updateUser } = useAuth();

  const [receiverWalletId, setReceiverWalletId] =
    useState("");

  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(null);

  // ========================================
  // CURRENT BALANCE
  // ========================================
  const balance = user?.balance ?? 0;

  // ========================================
  // HANDLE PAYMENT
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(null);

    const trimmedWalletId =
      receiverWalletId.trim();

    const paymentAmount = Number(amount);

    // ----------------------------------------
    // FRONTEND VALIDATION
    // ----------------------------------------

    if (!trimmedWalletId) {
      setError(
        "Receiver wallet ID is required."
      );
      return;
    }

    if (!amount || paymentAmount <= 0) {
      setError(
        "Please enter a valid amount greater than zero."
      );
      return;
    }

    if (paymentAmount > balance) {
      setError("Insufficient balance.");
      return;
    }

    if (
      user?.walletId &&
      trimmedWalletId === user.walletId
    ) {
      setError(
        "You cannot send payment to yourself."
      );
      return;
    }

    // ----------------------------------------
    // SEND PAYMENT TO BACKEND
    // ----------------------------------------

    try {
      setLoading(true);

      const response = await api.post(
        "/payment/send",
        {
          receiverWalletId: trimmedWalletId,
          amount: paymentAmount,
        }
      );

      const data = response.data;

      // ----------------------------------------
      // UPDATE AUTH CONTEXT
      // ----------------------------------------
      //
      // This updates:
      // 1. React user state
      // 2. localStorage user
      //
      // Therefore Home.jsx will immediately
      // receive the new balance.
      //
      if (data.senderBalance !== undefined) {
        updateUser({
          balance: data.senderBalance,
        });
      }

      // ----------------------------------------
      // SHOW SUCCESS
      // ----------------------------------------

      setSuccess(data.transaction);

      // ----------------------------------------
      // CLEAR FORM
      // ----------------------------------------

      setReceiverWalletId("");
      setAmount("");

    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      if (error.response) {
        setError(
          error.response.data?.message ||
            "Payment failed. Please try again."
        );
      } else if (error.request) {
        setError(
          "Unable to connect to the server. Make sure the backend is running."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // SEND ANOTHER PAYMENT
  // ========================================
  const handleSendAnother = () => {
    setSuccess(null);
    setError("");
    setReceiverWalletId("");
    setAmount("");
  };

  return (
    <div className="min-h-full bg-slate-100 p-6 md:p-8">
      <div className="mx-auto max-w-5xl">

        {/* ========================================
            PAGE HEADER
        ======================================== */}

        <div className="mb-8">

          <p className="text-sm font-medium text-blue-600">
            Payments
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Send Payment
          </h1>

          <p className="mt-2 text-slate-500">
            Send a secure blockchain payment to another
            wallet.
          </p>

        </div>

        {/* ========================================
            SUCCESS SCREEN
        ======================================== */}

        {success ? (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">

            {/* Success Header */}
            <div className="border-b border-slate-200 p-8 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">

                <span className="text-3xl text-green-600">
                  ✓
                </span>

              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Payment Successful
              </h2>

              <p className="mt-2 text-slate-500">
                Your blockchain transaction has been
                confirmed.
              </p>

            </div>

            {/* Transaction Details */}
            <div className="p-8">

              <div className="grid gap-4 md:grid-cols-2">

                {/* Amount */}
                <div className="rounded-xl bg-slate-50 p-5">

                  <p className="text-sm text-slate-500">
                    Amount
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    ₹
                    {Number(
                      success.amount
                    ).toLocaleString("en-IN")}
                  </p>

                </div>

                {/* Status */}
                <div className="rounded-xl bg-green-50 p-5">

                  <p className="text-sm text-slate-500">
                    Status
                  </p>

                  <p className="mt-1 font-bold text-green-600">
                    {success.status}
                  </p>

                </div>

                {/* Sender */}
                <div className="rounded-xl bg-slate-50 p-5">

                  <p className="text-sm text-slate-500">
                    Sender Wallet
                  </p>

                  <p className="mt-1 break-all font-medium text-slate-900">
                    {success.senderWalletId}
                  </p>

                </div>

                {/* Receiver */}
                <div className="rounded-xl bg-slate-50 p-5">

                  <p className="text-sm text-slate-500">
                    Receiver Wallet
                  </p>

                  <p className="mt-1 break-all font-medium text-slate-900">
                    {success.receiverWalletId}
                  </p>

                </div>

                {/* Nonce */}
                <div className="rounded-xl bg-slate-50 p-5">

                  <p className="text-sm text-slate-500">
                    Nonce
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {success.nonce}
                  </p>

                </div>

                {/* New Balance */}
                <div className="rounded-xl bg-blue-50 p-5">

                  <p className="text-sm text-slate-500">
                    Available Balance
                  </p>

                  <p className="mt-1 text-xl font-bold text-blue-600">
                    ₹
                    {Number(
                      user?.balance || 0
                    ).toLocaleString("en-IN")}
                  </p>

                </div>

              </div>

              {/* Blockchain Information */}
              <div className="mt-6 rounded-xl border border-slate-200 p-5">

                <h3 className="font-semibold text-slate-900">
                  Blockchain Transaction
                </h3>

                <div className="mt-4 space-y-4">

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Transaction Hash
                    </p>

                    <p className="mt-1 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
                      {success.transactionHash}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Previous Hash
                    </p>

                    <p className="mt-1 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
                      {success.previousHash}
                    </p>

                  </div>

                </div>

              </div>

              {/* Send Another */}
              <button
                type="button"
                onClick={handleSendAnother}
                className="mt-6 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Send Another Payment
              </button>

            </div>

          </div>

        ) : (

          /* ========================================
             PAYMENT FORM
          ======================================== */

          <div className="grid gap-6 lg:grid-cols-3">

            {/* Form */}
            <div className="rounded-2xl bg-white p-8 shadow-sm lg:col-span-2">

              <div className="mb-6">

                <h2 className="text-xl font-bold text-slate-900">
                  Payment Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the receiver's wallet ID and
                  payment amount.
                </p>

              </div>

              {/* Error */}
              {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">

                  <p className="text-sm font-medium text-red-600">
                    {error}
                  </p>

                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >

                {/* Receiver Wallet */}
                <div>

                  <label
                    htmlFor="receiverWalletId"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Receiver Wallet ID
                  </label>

                  <input
                    id="receiverWalletId"
                    type="text"
                    value={receiverWalletId}
                    onChange={(e) =>
                      setReceiverWalletId(
                        e.target.value
                      )
                    }
                    placeholder="e.g. SP-A9F0B97FAB23"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Enter the wallet ID of the person you
                    want to pay.
                  </p>

                </div>

                {/* Amount */}
                <div>

                  <label
                    htmlFor="amount"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Amount
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-slate-500">
                      ₹
                    </span>

                    <input
                      id="amount"
                      type="number"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value)
                      }
                      placeholder="0.00"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    />

                  </div>

                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">

                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />

                      Processing Payment...

                    </span>
                  ) : (
                    "Send Payment"
                  )}
                </button>

              </form>

            </div>

            {/* Wallet Summary */}
            <div className="space-y-6">

              {/* Balance */}
              <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm">

                <p className="text-sm text-blue-100">
                  Available Balance
                </p>

                <p className="mt-2 text-3xl font-bold">
                  ₹
                  {Number(
                    balance
                  ).toLocaleString("en-IN")}
                </p>

                <div className="mt-6 border-t border-blue-400/40 pt-5">

                  <p className="text-xs text-blue-100">
                    Your Wallet ID
                  </p>

                  <p className="mt-1 break-all font-mono text-sm font-semibold">
                    {user?.walletId ||
                      "Wallet ID unavailable"}
                  </p>

                </div>

              </div>

              {/* Security */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">

                    <span className="text-green-600">
                      ✓
                    </span>

                  </div>

                  <div>

                    <h3 className="font-semibold text-slate-900">
                      Secure Payment
                    </h3>

                    <p className="text-xs text-green-600">
                      Protected by blockchain
                    </p>

                  </div>

                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-500">

                  <p>
                    ✓ JWT authenticated request
                  </p>

                  <p>
                    ✓ Digital signature verification
                  </p>

                  <p>
                    ✓ Transaction hash generated
                  </p>

                  <p>
                    ✓ Blockchain transaction chaining
                  </p>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default SendPayment;