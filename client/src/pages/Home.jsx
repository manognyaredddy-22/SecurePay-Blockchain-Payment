import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // FETCH TRANSACTIONS
  // ========================================

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/payment/history"
      );

      setTransactions(
        response.data.transactions || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch transactions:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load transaction data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ========================================
  // ONLY CONFIRMED TRANSACTIONS COUNT
  // ========================================

  const confirmedTransactions =
    transactions.filter(
      (transaction) =>
        transaction.status === "CONFIRMED"
    );

  // ========================================
  // TOTAL SENT
  // Only CONFIRMED sent payments
  // ========================================

  const totalSent =
    confirmedTransactions
      .filter(
        (transaction) =>
          transaction.type === "sent"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );

  // ========================================
  // TOTAL RECEIVED
  // Only CONFIRMED received payments
  // ========================================

  const totalReceived =
    confirmedTransactions
      .filter(
        (transaction) =>
          transaction.type === "received"
      )
      .reduce(
        (total, transaction) =>
          total +
          Number(transaction.amount || 0),
        0
      );

  // ========================================
  // RECENT TRANSACTIONS
  // ========================================

  const recentTransactions =
    [...transactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);

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
        dateStyle: "short",
        timeStyle: "short",
      }
    );
  };

  // ========================================
  // STATUS STYLE
  // ========================================

  const getStatusStyle = (status) => {
    if (status === "CONFIRMED") {
      return "bg-green-100 text-green-700";
    }

    if (status === "PENDING") {
      return "bg-yellow-100 text-yellow-700";
    }

    return "bg-red-100 text-red-700";
  };

  // ========================================
  // STATUS DISPLAY
  // ========================================

  const getDisplayStatus = (transaction) => {
    if (
      transaction.status === "FAILED" &&
      transaction.failureReason ===
        "Payment rejected by receiver"
    ) {
      return "REJECTED";
    }

    return transaction.status;
  };

  return (
    <div className="min-h-full bg-slate-100 p-6 md:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ========================================
            HEADER
        ======================================== */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-medium text-blue-600">
              Secure digital payment infrastructure
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Welcome, {user?.name || "User"}
            </h1>

            <p className="mt-2 text-slate-500">
              Monitor your blockchain payment activity.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchTransactions}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* ========================================
            SUMMARY CARDS
        ======================================== */}

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

          {/* Balance */}

          <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-sm">

            <p className="text-sm text-blue-100">
              Available Balance
            </p>

            <p className="mt-3 text-3xl font-bold">
              ₹
              {Number(
                user?.balance ?? 0
              ).toLocaleString("en-IN")}
            </p>

            <div className="mt-6 border-t border-blue-400/40 pt-4">

              <p className="text-xs text-blue-100">
                Wallet ID
              </p>

              <p className="mt-1 break-all font-mono text-sm font-semibold">
                {user?.walletId ||
                  "Unavailable"}
              </p>

            </div>

          </div>

          {/* Total Sent */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Total Sent
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  ₹
                  {totalSent.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-500">
                ↗
              </div>

            </div>

            <p className="mt-5 text-xs text-slate-400">
              Confirmed payments sent from your wallet.
            </p>

          </div>

          {/* Total Received */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Total Received
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  ₹
                  {totalReceived.toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-xl text-green-600">
                ↙
              </div>

            </div>

            <p className="mt-5 text-xs text-slate-400">
              Confirmed payments received in your wallet.
            </p>

          </div>

          {/* Transactions */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Transactions
                </p>

                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {transactions.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
                ~
              </div>

            </div>

            <p className="mt-5 text-xs text-slate-400">
              {confirmedTransactions.length} confirmed
              transactions.
            </p>

          </div>

        </div>

        {/* ========================================
            MAIN CONTENT
        ======================================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* ========================================
              RECENT TRANSACTIONS
          ======================================== */}

          <div className="rounded-2xl bg-white shadow-sm lg:col-span-2">

            <div className="flex items-center justify-between border-b border-slate-200 p-6">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recent Transactions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Your latest blockchain payment activity.
                </p>
              </div>

              <a
                href="/history"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View All
              </a>

            </div>

            {loading ? (

              <div className="p-10 text-center text-sm text-slate-500">
                Loading transactions...
              </div>

            ) : recentTransactions.length === 0 ? (

              <div className="p-10 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-xl text-slate-400">
                    ₹
                  </span>
                </div>

                <h3 className="mt-4 font-semibold text-slate-900">
                  No transactions yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Your payment activity will appear here.
                </p>

              </div>

            ) : (

              <div className="divide-y divide-slate-200">

                {recentTransactions.map(
                  (transaction) => {

                    const isSent =
                      transaction.type ===
                      "sent";

                    const displayStatus =
                      getDisplayStatus(
                        transaction
                      );

                    return (
                      <div
                        key={transaction.id}
                        className="p-5"
                      >

                        <div className="flex items-center justify-between gap-4">

                          <div className="flex min-w-0 items-center gap-4">

                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                                isSent
                                  ? "bg-red-50"
                                  : "bg-green-50"
                              }`}
                            >
                              <span
                                className={
                                  isSent
                                    ? "text-red-500"
                                    : "text-green-600"
                                }
                              >
                                {isSent
                                  ? "↗"
                                  : "↙"}
                              </span>
                            </div>

                            <div className="min-w-0">

                              <p className="font-semibold text-slate-900">
                                {isSent
                                  ? "Payment Sent"
                                  : "Payment Received"}
                              </p>

                              <p className="mt-1 truncate font-mono text-xs text-slate-500">
                                {isSent
                                  ? transaction
                                      .receiver
                                      ?.walletId ||
                                    transaction.receiverWalletId
                                  : transaction
                                      .sender
                                      ?.walletId ||
                                    transaction.senderWalletId}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                {formatDate(
                                  transaction.createdAt
                                )}
                              </p>

                            </div>

                          </div>

                          <div className="shrink-0 text-right">

                            <p
                              className={`font-bold ${
                                isSent
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {isSent
                                ? "-"
                                : "+"}
                              ₹
                              {Number(
                                transaction.amount
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>

                            <span
                              className={`mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusStyle(
                                transaction.status
                              )}`}
                            >
                              {displayStatus}
                            </span>

                          </div>

                        </div>

                        <div className="mt-4 border-t border-slate-100 pt-3">

                          <p className="truncate font-mono text-[11px] text-slate-400">
                            TX:{" "}
                            {transaction.transactionHash}
                          </p>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

          {/* ========================================
              SECURITY STATUS
          ======================================== */}

          <div className="rounded-2xl bg-white p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <span className="text-xl text-green-600">
                  ✓
                </span>
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Security Status
                </h2>

                <p className="text-xs text-green-600">
                  All systems operational
                </p>
              </div>

            </div>

            <div className="mt-6 divide-y divide-slate-100">

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-slate-500">
                  Authentication
                </span>

                <span className="text-sm font-semibold text-green-600">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-slate-500">
                  Wallet
                </span>

                <span className="text-sm font-semibold text-green-600">
                  Protected
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-slate-500">
                  Digital Signature
                </span>

                <span className="text-sm font-semibold text-green-600">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-slate-500">
                  Ledger
                </span>

                <span className="text-sm font-semibold text-green-600">
                  Active
                </span>
              </div>

            </div>

            {/* Confirmed count */}

            <div className="mt-5 rounded-xl bg-green-50 p-5">

              <p className="text-sm text-green-700">
                Confirmed Transactions
              </p>

              <p className="mt-2 text-3xl font-bold text-green-700">
                {confirmedTransactions.length}
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Home;