import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = await register(
      formData.name,
      formData.email,
      formData.password
    );

    if (result.success) {
      navigate("/home");
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">

        {/* Left Section */}
        <div className="hidden md:flex bg-slate-900 text-white p-12 flex-col justify-between">

          <div>
            <div className="flex items-center gap-3 mb-10">

              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
                <ShieldCheck size={25} />
              </div>

              <div>
                <h1 className="text-xl font-bold">
                  SecurePay
                </h1>

                <p className="text-xs text-slate-400">
                  Blockchain Payment Framework
                </p>
              </div>

            </div>

            <h2 className="text-4xl font-bold leading-tight">
              Create your secure
              <span className="text-blue-400">
                {" "}digital wallet.
              </span>
            </h2>

            <p className="mt-6 text-slate-400 leading-relaxed">
              Join the SecurePay platform and experience
              secure, transparent and tamper-evident
              digital payments.
            </p>
          </div>

          <div className="space-y-4">

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck
                size={18}
                className="text-blue-400"
              />
              Secure account authentication
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck
                size={18}
                className="text-blue-400"
              />
              Unique blockchain wallet identity
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-300">
              <ShieldCheck
                size={18}
                className="text-blue-400"
              />
              Protected transaction records
            </div>

          </div>

        </div>

        {/* Register Section */}
        <div className="p-8 sm:p-12">

          <div className="max-w-md mx-auto">

            {/* Mobile Logo */}
            <div className="flex md:hidden items-center gap-3 mb-8">

              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h1 className="font-bold text-slate-900">
                  SecurePay
                </h1>

                <p className="text-xs text-slate-500">
                  Blockchain Payments
                </p>
              </div>

            </div>

            <div className="mb-7">

              <p className="text-sm font-medium text-blue-600 mb-2">
                Get started
              </p>

              <h2 className="text-3xl font-bold text-slate-900">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Set up your secure digital payment wallet.
              </p>

            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* Name */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full name
                </label>

                <div className="relative">

                  <User
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* Email */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>

                <div className="relative">

                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* Password */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* Confirm Password */}
              <div>

                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm password
                </label>

                <div className="relative">

                  <Lock
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Creating account...
                  </>
                ) : (
                  <>
                    Create account

                    <ArrowRight size={18} />
                  </>
                )}

              </button>

            </form>

            {/* Login */}
            <div className="mt-7 text-center text-sm text-slate-500">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign in
              </Link>

            </div>

            {/* Security notice */}
            <div className="mt-7 flex gap-3 rounded-xl bg-slate-50 p-4">

              <ShieldCheck
                size={20}
                className="flex-shrink-0 text-blue-600"
              />

              <p className="text-xs leading-relaxed text-slate-500">
                Your password is securely hashed before
                being stored. A unique wallet ID will be
                generated for your account.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Register;