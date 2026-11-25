import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  const [copied, setCopied] = useState(false);

  const copyWalletId = async () => {
    if (!user?.walletId) return;

    try {
      await navigator.clipboard.writeText(user.walletId);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy wallet ID:", error);
    }
  };

  const shortenKey = (key) => {
    if (!key) return "Not available";

    return `${key.slice(0, 35)}...${key.slice(-20)}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">

        {/* ========================================
            HEADER
        ======================================== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            Profile & Wallet
          </h1>

          <p className="mt-2 text-slate-400">
            Manage your account and view your secure wallet
            information.
          </p>
        </div>

        {/* ========================================
            PROFILE CARD
        ======================================== */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* User information */}
          <div className="rounded-2xl bg-white p-6 shadow-xl lg:col-span-1">

            <div className="flex flex-col items-center text-center">

              {/* Avatar */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-800">
                {user?.name || "User"}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                {user?.email || "Email not available"}
              </p>

              <div className="mt-5 w-full rounded-xl bg-green-50 p-4">

                <div className="flex items-center justify-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-green-500"></span>

                  <span className="font-semibold text-green-700">
                    Account Secure
                  </span>
                </div>

                <p className="mt-2 text-xs text-green-600">
                  Your account is protected with
                  authentication and cryptographic wallet
                  security.
                </p>
              </div>
            </div>
          </div>

          {/* ========================================
              WALLET INFORMATION
          ======================================== */}
          <div className="rounded-2xl bg-white p-6 shadow-xl lg:col-span-2">

            <h2 className="text-xl font-bold text-slate-800">
              Wallet Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your blockchain wallet identity and balance.
            </p>

            {/* Balance */}
            <div className="mt-6 rounded-xl bg-slate-900 p-6 text-white">

              <p className="text-sm text-slate-400">
                Available Balance
              </p>

              <p className="mt-2 text-4xl font-bold">
                ₹{Number(user?.balance || 0).toLocaleString()}
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Demo wallet balance
              </p>
            </div>

            {/* Wallet ID */}
            <div className="mt-5">

              <label className="text-sm font-medium text-slate-600">
                Wallet ID
              </label>

              <div className="mt-2 flex gap-2">

                <div className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700">
                  {user?.walletId || "Not available"}
                </div>

                <button
                  onClick={copyWalletId}
                  className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Share your Wallet ID when someone wants to
                send you a payment.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================
            SECURITY SECTION
        ======================================== */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-xl">

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-xl">
              🔐
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Wallet Security
              </h2>

              <p className="text-sm text-slate-500">
                Cryptographic protection used by your wallet.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            {/* Public Key */}
            <div className="rounded-xl border border-slate-200 p-5">

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">
                  Public Key
                </h3>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Active
                </span>
              </div>

              <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-600">
                {shortenKey(user?.publicKey)}
              </p>

              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Your public key is used to verify digital
                signatures associated with your transactions.
              </p>
            </div>

            {/* Private Key */}
            <div className="rounded-xl border border-slate-200 p-5">

              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">
                  Private Key
                </h3>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  Protected
                </span>
              </div>

              <div className="mt-3 rounded-lg bg-slate-900 p-4">

                <p className="font-mono text-sm tracking-widest text-green-400">
                  ••••••••••••••••••••••••••••••
                </p>

              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Your private key is never returned to the
                frontend. It is encrypted before being stored
                on the server.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================
            SECURITY FEATURES
        ======================================== */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-xl">

          <h2 className="text-xl font-bold text-slate-800">
            Security Features
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-2xl">🔑</div>

              <h3 className="mt-3 font-semibold text-slate-800">
                JWT Authentication
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Secure authentication protects your API
                requests.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-2xl">🔐</div>

              <h3 className="mt-3 font-semibold text-slate-800">
                Password Hashing
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Passwords are protected using bcrypt hashing.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-2xl">✍️</div>

              <h3 className="mt-3 font-semibold text-slate-800">
                Digital Signatures
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Transactions are digitally signed and verified.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-2xl">⛓️</div>

              <h3 className="mt-3 font-semibold text-slate-800">
                Hash Chaining
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Transactions are linked using cryptographic
                hashes.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================
            WARNING
        ======================================== */}
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">

          <div className="flex gap-3">

            <div className="text-xl">
              ⚠️
            </div>

            <div>
              <h3 className="font-semibold text-amber-800">
                Security Notice
              </h3>

              <p className="mt-1 text-sm leading-relaxed text-amber-700">
                Never share your password, authentication
                token, or private key with anyone. This project
                is an academic prototype and the wallet balance
                represents demo currency.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;