import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Droplets, User, Mail, Lock } from "lucide-react";
import { registerUser } from "../services/auth.service";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!form.fullName || !form.email || !form.password) {
      setError("Please fill all fields");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match ❌");
      return;
    }

    try {
      setLoading(true);

      // Hit the backend register API
      await registerUser({
        name: form.fullName,
        email: form.email,
        password: form.password,
      });

      setMessage("Account created successfully 🎉");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      // Show error from backend (e.g. email already exists)
      const serverMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 sm:px-6">

      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-xl border p-6 sm:p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
            <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold mt-3 text-slate-900">
            Create Account
          </h1>

          <p className="text-slate-500 text-xs sm:text-sm text-center">
            Start your SparkleWash journey
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded-md mb-3 text-center text-sm">
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="bg-green-100 text-green-700 p-2 rounded-md mb-3 text-center text-sm">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="fullName"
              placeholder="Full name"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full border rounded-md pl-10 pr-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-md pl-10 pr-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border rounded-md pl-10 pr-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="w-full border rounded-md pl-10 pr-3 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-md text-white font-medium text-sm sm:text-base transition ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'}`}
          >
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs sm:text-sm text-center text-slate-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-cyan-600 font-medium hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}