import { useEffect, useState } from "react";
import api from "../services/api";

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  // ========================================
  // FETCH TRANSACTION HISTORY
  // ========================================
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (type !== "all") {
        params.type = type;
      }

      if (status !== "all") {
        params.status = status;
      }

      if (search.trim()) {
        params.search = search.trim();
      }

      const response = await api.get("/payment/history", {
        params,
      });

      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error("History error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load transaction history."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever filters change
  useEffect(() => {
    fetchTransactions();
  }, [type, status]);

  // ========================================
  // SEARCH
  // ========================================
  const handleSearch = (e) => {
    e.preventDefault();
    fetchTransactions();
  };

  // ========================================
  // FORMAT DATE
  // ========================================
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  // ========================================
  // FORMAT HASH
  // ========================================
  const shortenHash = (hash) => {
    if (!hash) return "N/A";

    return `${hash.slice(0, 12)}...${hash.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ========================================
            HEADER
        ======================================== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Transaction History
          </h1>

          <p className="mt-2 text-slate-400">
            View and track all your blockchain transactions.
          </p>
        </div>

        {/* ========================================
            FILTER SECTION
        ======================================== */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-xl">

          <div className="grid gap-4 md:grid-cols-3">

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="md:col-span-1"
            >
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Search
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Wallet ID or transaction hash"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Transaction Type
              </label>

              <select
                value={type}
                onChange={(e) =>
                  setType(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">All Transactions</option>
                <option value="sent">Sent</option>
                <option value="received">Received</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="all">All Status</option>
                <option value="CONFIRMED">
                  Confirmed
                </option>
                <option value="PENDING">
                  Pending
                </option>
                <option value="FAILED">
                  Failed
                </option>
              </select>
            </div>
          </div>

          {/* Refresh */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={fetchTransactions}
              className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {/* ========================================
            ERROR
        ======================================== */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* ========================================
            LOADING
        ======================================== */}
        {loading && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-xl">
            <div className="text-lg font-medium text-slate-700">
              Loading transactions...
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Fetching your secure transaction history.
            </p>
          </div>
        )}

        {/* ========================================
            NO TRANSACTIONS
        ======================================== */}
        {!loading && transactions.length === 0 && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-xl">
            <div className="text-5xl">📭</div>

            <h2 className="mt-4 text-xl font-semibold text-slate-800">
              No transactions found
            </h2>

            <p className="mt-2 text-slate-500">
              Try changing your filters or make a payment.
            </p>
          </div>
        )}

        {/* ========================================
            TRANSACTION LIST
        ======================================== */}
        {!loading && transactions.length > 0 && (
          <div className="space-y-5">

            {transactions.map((transaction) => {
              const isSent =
                transaction.type === "sent";

              const counterparty = isSent
                ? transaction.receiver
                : transaction.sender;

              return (
                <div
                  key={transaction.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-xl"
                >

                  {/* Top section */}
                  <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">

                    <div className="flex items-center gap-4">

                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${
                          isSent
                            ? "bg-red-100"
                            : "bg-green-100"
                        }`}
                      >
                        {isSent ? "↑" : "↓"}
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-800">
                          {isSent
                            ? "Payment Sent"
                            : "Payment Received"}
                        </h2>

                        <p className="text-sm text-slate-500">
                          {formatDate(
                            transaction.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="text-left md:text-right">

                      <p
                        className={`text-2xl font-bold ${
                          isSent
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {isSent ? "-" : "+"}
                        {transaction.amount}
                      </p>

                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                        {transaction.status}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-4">

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        {isSent
                          ? "Receiver"
                          : "Sender"}
                      </p>

                      <p className="mt-1 font-medium text-slate-800">
                        {counterparty.name}
                      </p>

                      <p className="break-all text-xs text-slate-500">
                        {counterparty.walletId}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Nonce
                      </p>

                      <p className="mt-1 font-semibold text-slate-800">
                        #{transaction.nonce}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Transaction Hash
                      </p>

                      <p
                        className="mt-1 break-all font-mono text-xs text-blue-600"
                        title={transaction.transactionHash}
                      >
                        {shortenHash(
                          transaction.transactionHash
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Previous Hash
                      </p>

                      <p
                        className="mt-1 break-all font-mono text-xs text-slate-600"
                        title={transaction.previousHash}
                      >
                        {shortenHash(
                          transaction.previousHash
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Blockchain verification */}
                  <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">

                    <div className="flex flex-col gap-2 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">

                      <span>
                        🔐 Digitally signed & verified
                      </span>

                      <span className="font-mono">
                        TX ID: {transaction.id}
                      </span>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;