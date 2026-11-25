import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const ReceivePayment = () => {
  const { user, updateUser } = useAuth();

  const [pendingPayments, setPendingPayments] = useState([]);
  const [previousPayments, setPreviousPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  // ========================================
  // FETCH ALL RECEIVED PAYMENTS
  // ========================================

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/payment/history?type=received"
      );

      const transactions =
        response.data.transactions || [];

      // Pending payments
      const pending = transactions.filter(
        (payment) =>
          payment.status === "PENDING"
      );

      // Confirmed + failed/rejected payments
      const previous = transactions.filter(
        (payment) =>
          payment.status !== "PENDING"
      );

      setPendingPayments(pending);
      setPreviousPayments(previous);
    } catch (error) {
      console.error(
        "Failed to fetch received payments:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load received payments."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD PAYMENTS
  // ========================================

  useEffect(() => {
    fetchPayments();
  }, []);

  // ========================================
  // COPY WALLET ID
  // ========================================

  const handleCopyWalletId = async () => {
    if (!user?.walletId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        user.walletId
      );

      setSuccessMessage(
        "Wallet ID copied to clipboard."
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 2500);
    } catch (error) {
      console.error(
        "Failed to copy wallet ID:",
        error
      );

      setError("Failed to copy wallet ID.");
    }
  };

  // ========================================
  // ACCEPT PAYMENT
  // ========================================

  const handleAccept = async (transactionId) => {
    try {
      setActionLoading(transactionId);
      setError("");
      setSuccessMessage("");

      const response = await api.post(
        `/payment/${transactionId}/accept`
      );

      const data = response.data;

      if (
        data.receiverBalance !== undefined
      ) {
        updateUser({
          balance: data.receiverBalance,
        });
      }

      setSuccessMessage(
        "Payment accepted successfully."
      );

      await fetchPayments();
    } catch (error) {
      console.error(
        "Accept payment error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to accept payment."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ========================================
  // REJECT PAYMENT
  // ========================================

  const handleReject = async (transactionId) => {
    try {
      setActionLoading(transactionId);
      setError("");
      setSuccessMessage("");

      await api.post(
        `/payment/${transactionId}/reject`
      );

      setSuccessMessage(
        "Payment rejected successfully."
      );

      await fetchPayments();
    } catch (error) {
      console.error(
        "Reject payment error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to reject payment."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) {
      return "Unknown date";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  };

  // ========================================
  // PAYMENT STATUS DISPLAY
  // ========================================

  const getDisplayStatus = (payment) => {
    if (payment.status === "CONFIRMED") {
      return "CONFIRMED";
    }

    if (
      payment.status === "FAILED" &&
      payment.failureReason ===
        "Payment rejected by receiver"
    ) {
      return "REJECTED";
    }

    if (payment.status === "FAILED") {
      return "FAILED";
    }

    return payment.status;
  };

  // ========================================
  // STATUS STYLE
  // ========================================

  const getStatusStyle = (payment) => {
    const status = getDisplayStatus(payment);

    if (status === "CONFIRMED") {
      return "bg-green-100 text-green-700";
    }

    if (status === "REJECTED") {
      return "bg-red-100 text-red-700";
    }

    if (status === "FAILED") {
      return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="min-h-full bg-slate-100 p-6 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* ========================================
            PAGE HEADER
        ======================================== */}

        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Payments
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Receive Payment
          </h1>

          <p className="mt-2 text-slate-500">
            Share your wallet ID and manage incoming
            payment requests.
          </p>
        </div>

        {/* ========================================
            SUCCESS MESSAGE
        ======================================== */}

        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-medium text-green-700">
              ✓ {successMessage}
            </p>
          </div>
        )}

        {/* ========================================
            ERROR MESSAGE
        ======================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ========================================
            WALLET INFORMATION
        ======================================== */}

        <div className="mb-6 grid gap-6 md:grid-cols-2">

          {/* Wallet ID */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                <span className="text-xl text-blue-600">
                  $
                </span>
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Your Wallet ID
                </p>

                <h2 className="font-semibold text-slate-900">
                  Share this ID to receive money
                </h2>
              </div>

            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="break-all font-mono text-sm font-semibold text-slate-800">
                {user?.walletId ||
                  "Wallet ID unavailable"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyWalletId}
              className="mt-4 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Copy Wallet ID
            </button>

          </div>

          {/* Balance */}

          <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm">

            <p className="text-sm text-blue-100">
              Available Balance
            </p>

            <p className="mt-2 text-4xl font-bold">
              ₹
              {Number(
                user?.balance ?? 0
              ).toLocaleString("en-IN")}
            </p>

            <div className="mt-6 border-t border-blue-400/40 pt-5">

              <p className="text-sm text-blue-100">
                Pending requests
              </p>

              <p className="mt-1 text-2xl font-bold">
                {pendingPayments.length}
              </p>

            </div>

          </div>

        </div>

        {/* ========================================
            PENDING PAYMENT REQUESTS
        ======================================== */}

        <div className="mb-6 rounded-2xl bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Incoming Payment Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review and accept or reject pending
                payments.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchPayments}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

          {loading ? (

            <div className="flex min-h-56 items-center justify-center p-8">

              <div className="text-center">

                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading payment requests...
                </p>

              </div>

            </div>

          ) : pendingPayments.length === 0 ? (

            <div className="p-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <span className="text-2xl text-slate-400">
                  ✓
                </span>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No pending payments
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                New payment requests will appear here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-200">

              {pendingPayments.map(
                (payment) => {
                  const isProcessing =
                    actionLoading ===
                    payment.id;

                  return (
                    <div
                      key={payment.id}
                      className="p-6"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                        <div className="flex gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                            <span className="text-xl text-yellow-600">
                              ₹
                            </span>
                          </div>

                          <div>

                            <div className="flex flex-wrap items-center gap-3">

                              <h3 className="font-semibold text-slate-900">
                                Payment Request
                              </h3>

                              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                                PENDING
                              </span>

                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              From{" "}
                              <span className="font-medium text-slate-700">
                                {payment.sender
                                  ?.name ||
                                  "Unknown user"}
                              </span>
                            </p>

                          </div>

                        </div>

                        <div className="lg:text-right">

                          <p className="text-2xl font-bold text-slate-900">
                            ₹
                            {Number(
                              payment.amount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <p className="text-xs text-slate-500">
                            Pending payment
                          </p>

                        </div>

                      </div>

                      {/* Details */}

                      <div className="mt-6 grid gap-4 rounded-xl bg-slate-50 p-5 md:grid-cols-2">

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Sender Wallet
                          </p>

                          <p className="mt-1 break-all font-mono text-sm text-slate-700">
                            {payment.sender
                              ?.walletId ||
                              payment.senderWalletId ||
                              "Unavailable"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Amount
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            ₹
                            {Number(
                              payment.amount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Transaction Hash
                          </p>

                          <p className="mt-1 break-all font-mono text-xs text-slate-600">
                            {payment.transactionHash}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Created
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            {formatDate(
                              payment.createdAt
                            )}
                          </p>
                        </div>

                      </div>

                      <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">

                        <p className="text-sm font-medium text-green-700">
                          ✓ Digitally signed and
                          blockchain transaction
                          verified
                        </p>

                      </div>

                      {/* Actions */}

                      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">

                        <button
                          type="button"
                          onClick={() =>
                            handleReject(
                              payment.id
                            )
                          }
                          disabled={
                            isProcessing
                          }
                          className="rounded-xl border border-red-200 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing
                            ? "Processing..."
                            : "Reject"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleAccept(
                              payment.id
                            )
                          }
                          disabled={
                            isProcessing
                          }
                          className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {isProcessing
                            ? "Processing..."
                            : "Accept Payment"}
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

        {/* ========================================
            PREVIOUS RECEIVED PAYMENTS
        ======================================== */}

        <div className="rounded-2xl bg-white shadow-sm">

          <div className="border-b border-slate-200 p-6">

            <h2 className="text-xl font-bold text-slate-900">
              Previous Incoming Payments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Accepted and rejected payments received
              by this wallet.
            </p>

          </div>

          {loading ? (

            <div className="p-8 text-center text-sm text-slate-500">
              Loading payment history...
            </div>

          ) : previousPayments.length === 0 ? (

            <div className="p-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <span className="text-2xl text-slate-400">
                  ₹
                </span>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                No previous payments
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Accepted and rejected incoming payments
                will appear here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-200">

              {previousPayments.map(
                (payment) => {

                  const displayStatus =
                    getDisplayStatus(
                      payment
                    );

                  return (
                    <div
                      key={payment.id}
                      className="p-6"
                    >

                      {/* Payment header */}

                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-4">

                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-full ${
                              displayStatus ===
                              "CONFIRMED"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            <span
                              className={
                                displayStatus ===
                                "CONFIRMED"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              ₹
                            </span>
                          </div>

                          <div>

                            <p className="font-semibold text-slate-900">
                              From{" "}
                              {payment.sender
                                ?.name ||
                                "Unknown user"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(
                                payment.createdAt
                              )}
                            </p>

                          </div>

                        </div>

                        <div className="sm:text-right">

                          <p className="text-xl font-bold text-slate-900">
                            ₹
                            {Number(
                              payment.amount
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <span
                            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              payment
                            )}`}
                          >
                            {displayStatus}
                          </span>

                        </div>

                      </div>

                      {/* Payment details */}

                      <div className="mt-5 grid gap-4 rounded-xl bg-slate-50 p-5 md:grid-cols-2">

                        <div>

                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Sender Wallet
                          </p>

                          <p className="mt-1 break-all font-mono text-xs text-slate-700">
                            {payment.sender
                              ?.walletId ||
                              payment.senderWalletId ||
                              "Unavailable"}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Transaction Hash
                          </p>

                          <p className="mt-1 break-all font-mono text-xs text-slate-700">
                            {payment.transactionHash}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Nonce
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {payment.nonce}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                            Processed
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            {formatDate(
                              payment.processedAt ||
                                payment.createdAt
                            )}
                          </p>

                        </div>

                      </div>

                      {/* Rejection reason */}

                      {displayStatus ===
                        "REJECTED" && (
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">

                          <p className="text-xs font-medium uppercase tracking-wide text-red-500">
                            Rejection Reason
                          </p>

                          <p className="mt-1 text-sm font-medium text-red-700">
                            {payment.failureReason ||
                              "Payment rejected by receiver"}
                          </p>

                        </div>
                      )}

                      {/* Confirmed message */}

                      {displayStatus ===
                        "CONFIRMED" && (
                        <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">

                          <p className="text-sm font-medium text-green-700">
                            ✓ Payment accepted and
                            added to your wallet
                            balance.
                          </p>

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

        </div>

        {/* ========================================
            SECURITY INFORMATION
        ======================================== */}

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <span className="text-green-600">
                ✓
              </span>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900">
                Secure Payment Receiving
              </h3>

              <p className="text-xs text-green-600">
                Protected by blockchain security
              </p>
            </div>

          </div>

          <div className="mt-5 grid gap-3 text-sm text-slate-500 md:grid-cols-2">

            <p>✓ JWT authenticated requests</p>
            <p>✓ Digital signature verification</p>
            <p>✓ Transaction hash generation</p>
            <p>✓ Previous transaction hash chaining</p>
            <p>✓ Receiver authorization</p>
            <p>✓ Transaction status tracking</p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ReceivePayment;