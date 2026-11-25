import { useEffect, useState } from "react";
import {
  Blocks,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Link2,
  Clock3,
  Hash,
  Database,
} from "lucide-react";
import api from "../services/api";

const Blockchain = () => {
  const [blockchain, setBlockchain] = useState([]);
  const [blockCount, setBlockCount] = useState(0);
  const [validation, setValidation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [copiedHash, setCopiedHash] = useState("");

  const fetchBlockchain = async () => {
    try {
      setError("");

      const [blockchainResponse, validationResponse] = await Promise.all([
        api.get("/blockchain"),
        api.get("/blockchain/validate"),
      ]);

      setBlockchain(blockchainResponse.data.blockchain || []);
      setBlockCount(blockchainResponse.data.blockCount || 0);
      setValidation(validationResponse.data);
    } catch (err) {
      console.error("Blockchain fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load blockchain data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBlockchain();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBlockchain();
  };

  const copyHash = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);

      setTimeout(() => {
        setCopiedHash("");
      }, 1500);
    } catch (error) {
      console.error("Failed to copy hash:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700";

      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "FAILED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading blockchain...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Blocks size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Blockchain Explorer
              </h1>

              <p className="text-sm text-slate-500">
                View blocks, hashes, transactions and chain integrity.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 text-red-600" size={20} />

          <div>
            <p className="font-medium text-red-800">
              Blockchain data unavailable
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Blocks */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Blocks
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {blockCount}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Blocks size={22} />
            </div>
          </div>
        </div>

        {/* Blockchain Transactions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Blockchain Transactions
              </p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {blockchain.reduce(
                  (total, block) =>
                    total + (block.transactions?.length || 0),
                  0
                )}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
              <Database size={22} />
            </div>
          </div>
        </div>

        {/* Chain Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Chain Status
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {validation?.valid ? "Valid" : "Invalid"}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                validation?.valid
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {validation?.valid ? (
                <CheckCircle2 size={22} />
              ) : (
                <AlertCircle size={22} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Validation Banner */}
      <div
        className={`rounded-2xl border p-5 ${
          validation?.valid
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
        }`}
      >
        <div className="flex items-start gap-3">
          {validation?.valid ? (
            <CheckCircle2
              size={22}
              className="mt-0.5 text-green-600"
            />
          ) : (
            <AlertCircle
              size={22}
              className="mt-0.5 text-red-600"
            />
          )}

          <div>
            <h2
              className={`font-semibold ${
                validation?.valid
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              {validation?.valid
                ? "Blockchain integrity verified"
                : "Blockchain validation failed"}
            </h2>

            <p
              className={`mt-1 text-sm ${
                validation?.valid
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {validation?.reason ||
                "Blockchain validation result unavailable."}
            </p>

            {validation?.invalidBlock !== undefined && (
              <p className="mt-1 text-sm font-medium text-red-700">
                Invalid block: #{validation.invalidBlock}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Blockchain Information */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-blue-600" />

          <h2 className="font-semibold text-slate-900">
            Blockchain Security
          </h2>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <Hash size={18} className="text-blue-600" />

            <p className="mt-2 text-sm font-medium text-slate-800">
              SHA-256 Hashing
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Each block has a cryptographic hash.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <Link2 size={18} className="text-purple-600" />

            <p className="mt-2 text-sm font-medium text-slate-800">
              Hash Chaining
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Every block references the previous block.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <ShieldCheck size={18} className="text-green-600" />

            <p className="mt-2 text-sm font-medium text-slate-800">
              Integrity Validation
            </p>

            <p className="mt-1 text-xs text-slate-500">
              The complete chain can be validated.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <Clock3 size={18} className="text-orange-600" />

            <p className="mt-2 text-sm font-medium text-slate-800">
              Timestamped Blocks
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Blocks record when transactions were processed.
            </p>
          </div>
        </div>
      </div>

      {/* Blocks */}
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Blocks
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Complete blockchain ledger structure.
          </p>
        </div>

        {blockchain.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <Blocks
              size={40}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 font-medium text-slate-700">
              No blocks found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              The blockchain has not been initialized yet.
            </p>
          </div>
        ) : (
          blockchain.map((block) => (
            <div
              key={block._id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Block Header */}
              <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 font-bold text-white">
                    #{block.index}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {block.index === 0
                        ? "Genesis Block"
                        : `Block #${block.index}`}
                    </h3>

                    <p className="text-xs text-slate-500">
                      {formatDate(block.timestamp)}
                    </p>
                  </div>
                </div>

                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  <CheckCircle2 size={14} />
                  Valid Block
                </span>
              </div>

              {/* Block Details */}
              <div className="grid gap-5 p-5 lg:grid-cols-2">
                {/* Previous Hash */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Previous Hash
                  </p>

                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                    <code className="min-w-0 flex-1 break-all text-xs text-slate-600">
                      {block.previousHash}
                    </code>

                    <button
                      onClick={() =>
                        copyHash(block.previousHash)
                      }
                      className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                      title="Copy previous hash"
                    >
                      {copiedHash === block.previousHash ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Block Hash */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Block Hash
                  </p>

                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                    <code className="min-w-0 flex-1 break-all text-xs text-slate-600">
                      {block.hash}
                    </code>

                    <button
                      onClick={() => copyHash(block.hash)}
                      className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                      title="Copy block hash"
                    >
                      {copiedHash === block.hash ? (
                        <Check size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Nonce */}
              <div className="border-t border-slate-200 px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Nonce
                  </span>

                  <span className="font-mono text-sm font-semibold text-slate-800">
                    {block.nonce}
                  </span>
                </div>
              </div>

              {/* Transactions */}
              <div className="border-t border-slate-200 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">
                    Transactions
                  </h4>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    {block.transactions?.length || 0} transaction
                    {block.transactions?.length === 1 ? "" : "s"}
                  </span>
                </div>

                {block.transactions?.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
                    <Blocks
                      size={28}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 text-sm text-slate-500">
                      Genesis block — no transactions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {block.transactions.map((transaction) => (
                      <div
                        key={transaction._id}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Payment Transaction
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>

                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                              transaction.status
                            )}`}
                          >
                            {transaction.status}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-4 sm:grid-cols-3">
                          <div>
                            <p className="text-xs text-slate-500">
                              Amount
                            </p>

                            <p className="mt-1 font-semibold text-slate-900">
                              {Number(
                                transaction.amount
                              ).toLocaleString("en-IN")}{" "}
                              SP
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              Sender
                            </p>

                            <p className="mt-1 break-all font-mono text-xs text-slate-700">
                              {transaction.senderWalletId}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              Receiver
                            </p>

                            <p className="mt-1 break-all font-mono text-xs text-slate-700">
                              {transaction.receiverWalletId}
                            </p>
                          </div>
                        </div>

                        {/* Transaction Hash */}
                        <div className="mt-4">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Transaction Hash
                          </p>

                          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                            <code className="min-w-0 flex-1 break-all text-xs text-slate-600">
                              {transaction.transactionHash}
                            </code>

                            <button
                              onClick={() =>
                                copyHash(
                                  transaction.transactionHash
                                )
                              }
                              className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                              title="Copy transaction hash"
                            >
                              {copiedHash ===
                              transaction.transactionHash ? (
                                <Check size={16} />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Transaction Metadata */}
                        <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-slate-500">
                              Transaction Nonce
                            </p>

                            <p className="mt-1 font-mono text-sm font-semibold text-slate-800">
                              {transaction.nonce}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-500">
                              Processed At
                            </p>

                            <p className="mt-1 text-sm text-slate-700">
                              {formatDate(
                                transaction.processedAt
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Blockchain;