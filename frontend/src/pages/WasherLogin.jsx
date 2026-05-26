import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { washerLogin } from "../services/admin.service";

export default function WasherLogin() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  const userRoles = useMemo(
    () => user?.roles || (user?.role ? [user.role] : []),
    [user]
  );

  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && userRoles.includes("washer")) {
      navigate("/washer", { replace: true });
    }
  }, [user, userRoles, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.email || !form.password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      await login({ email: form.email, password: form.password });
      setMessage("Logged in. Redirecting to washer...");
      setTimeout(() => {
        navigate("/washer");
      }, 300);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 sm:px-6">
      <div className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-xl border p-6 sm:p-8">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.jpg"
            alt="SparkleWash"
            className="w-14 h-14 sm:w-16 sm:h-16 object-cover"
            style={{ borderRadius: '16px' }}
          />

          <h1 className="text-xl sm:text-2xl font-bold mt-3 text-slate-900">
            Washer Login
          </h1>

          <p className="text-slate-500 text-xs sm:text-sm text-center">
            Sign in to view and start washes
          </p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded-md mb-3 text-center text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-100 text-green-700 p-2 rounded-md mb-3 text-center text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '14px', top: '50%',
              transform: 'translateY(-50%)', color: '#aaa'
            }}>
              🔒
            </span>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '14px 44px 14px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#888',
                display: 'flex',
                alignItems: 'center',
                padding: '0'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-md text-white font-medium text-sm sm:text-base transition ${
              loading
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs sm:text-sm text-slate-500">
          <Link to="/login" className="text-cyan-600 font-medium hover:underline">
            Customer login
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

