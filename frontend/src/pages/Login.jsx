import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import toast, { Toaster } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await login({ email: form.email, password: form.password });
      toast.success("Welcome back! 🎉");
      setTimeout(() => { navigate("/home"); }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 sm:px-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '10px',
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(0, 212, 255, 0.2)',
          },
          success: { iconTheme: { primary: '#00d4ff', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ff4444', secondary: '#fff' } },
        }}
      />

      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-xl border p-6 sm:p-8">

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.jpg"
            alt="SparkleWash"
            className="w-14 h-14 sm:w-16 sm:h-16 object-cover"
            style={{ borderRadius: '16px' }}
          />

          <h1 className="text-xl sm:text-2xl font-bold mt-3 text-slate-900">
            SparkleWash
          </h1>

          <p className="text-slate-500 text-xs sm:text-sm text-center">
            Login to your account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

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
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border rounded-md pl-10 pr-10 py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-xs sm:text-sm text-cyan-600 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>


          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-md text-white font-medium text-sm sm:text-base transition ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700'}`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-xs sm:text-sm text-center text-slate-500 mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-cyan-600 font-medium hover:underline"
          >
            Register
          </Link>
        </p>

      </div>
    </div>
  );
}
