import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import api from "../../services/api";

const TIME_SLOTS = [
  { value: "morning", emoji: "🌅", label: "Morning", sub: "6AM–9AM" },
  { value: "evening", emoji: "🌆", label: "Evening", sub: "5PM–8PM" },
];

// --- Validation helpers ---
const validators = {
  customer_name: (v) => (!v?.trim() ? "Full name is required" : ""),
  customer_phone: (v) =>
    !v ? "Phone number is required" : !/^[6-9]\d{9}$/.test(v) ? "Enter a valid 10-digit phone number (starting 6-9)" : "",
  customer_email: (v) =>
    !v ? "Email is required" : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address" : "",
  address: (v) => (!v?.trim() ? "Address is required" : ""),
  city: (v) => (!v?.trim() ? "City is required" : ""),
  preferred_date: (v) => (!v ? "Start date is required" : ""),
};

const Field = ({ id, label, required, error, children }) => (
  <div>
    <label htmlFor={id} className="text-slate-700 text-sm font-medium">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
    {error && (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-red-500 text-xs mt-1"
      >
        {error}
      </motion.p>
    )}
  </div>
);

export default function CustomerForm({ formData, updateFormData }) {
  const [loaded, setLoaded] = useState(false);
  const [touched, setTouched] = useState({});

  // FIX 2: Auto-fill from DB on mount
  useEffect(() => {
    if (loaded) return;
    api.get("/customer/profile")
      .then(res => {
        const p = res.data?.profile || {};
        if (p.full_name && !formData?.customer_name) updateFormData("customer_name", p.full_name);
        if (p.phone && !formData?.customer_phone) updateFormData("customer_phone", p.phone);
        if (p.email && !formData?.customer_email) updateFormData("customer_email", p.email);
        if (p.address && !formData?.address) updateFormData("address", p.address);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  if (!formData) return <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>;

  const safe = { customer_name: "", customer_phone: "", customer_email: "", address: "", city: "", preferred_date: "", preferred_time: "morning", special_instructions: "", ...formData };
  const today = new Date().toISOString().split("T")[0];
  const handlePhone = (v) => updateFormData("customer_phone", v.replace(/\D/g, "").slice(0, 10));

  // Mark a field as touched on blur
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Get error message for a field (only if touched)
  const getError = (field) => {
    if (!touched[field]) return "";
    const validator = validators[field];
    return validator ? validator(safe[field]) : "";
  };

  // Compute border class: red if error, default otherwise
  const inputBorder = (field) =>
    getError(field)
      ? "border-red-400 focus:ring-red-400"
      : "border-slate-200 focus:ring-cyan-500";

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <Toaster position="top-right" />
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">Customer Details</h3>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Your contact and wash location</p>
      </div>

      {/* Contact */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-4">
        <p className="text-[10px] sm:text-xs font-semibold text-cyan-600 uppercase tracking-wide">Contact Information</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="customer_name" label="Full Name" required error={getError("customer_name")}>
            <input id="customer_name" placeholder="Raj Sharma" value={safe.customer_name}
              onChange={(e) => updateFormData("customer_name", e.target.value)}
              onBlur={() => handleBlur("customer_name")}
              required
              className={`mt-2 w-full border bg-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${inputBorder("customer_name")}`} />
          </Field>
          <Field id="customer_phone" label="Phone Number" required error={getError("customer_phone")}>
            <div className="mt-2 flex">
              <span className="inline-flex items-center px-3 border border-r-0 rounded-l-lg bg-slate-100 text-slate-500 text-sm font-medium">+91</span>
              <input id="customer_phone" placeholder="9876543210" value={safe.customer_phone}
                onChange={(e) => handlePhone(e.target.value)}
                onBlur={() => handleBlur("customer_phone")}
                maxLength={10} required
                className={`flex-1 border rounded-r-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition bg-white ${inputBorder("customer_phone")}`} />
            </div>
          </Field>
          <div className="sm:col-span-2">
            <Field id="customer_email" label="Email Address" required error={getError("customer_email")}>
              <input id="customer_email" type="email" placeholder="raj@example.com" value={safe.customer_email}
                onChange={(e) => updateFormData("customer_email", e.target.value)}
                onBlur={() => handleBlur("customer_email")}
                required
                className={`mt-2 w-full border bg-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${inputBorder("customer_email")}`} />
            </Field>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-4">
        <p className="text-[10px] sm:text-xs font-semibold text-cyan-600 uppercase tracking-wide">Wash Location</p>
        <Field id="address" label="Full Address" required error={getError("address")}>
          <textarea id="address" placeholder="Flat/House No., Street, Area, Landmark" value={safe.address}
            onChange={(e) => updateFormData("address", e.target.value)}
            onBlur={() => handleBlur("address")}
            required rows={2}
            className={`mt-2 w-full border bg-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition resize-none ${inputBorder("address")}`} />
        </Field>
        <Field id="city" label="City" required error={getError("city")}>
          <input id="city" placeholder="Pune" value={safe.city}
            onChange={(e) => updateFormData("city", e.target.value)}
            onBlur={() => handleBlur("city")}
            required
            className={`mt-2 w-full border bg-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${inputBorder("city")}`} />
        </Field>
      </div>

      {/* Schedule */}
      <div className="bg-slate-50 rounded-xl p-4 space-y-4">
        <p className="text-[10px] sm:text-xs font-semibold text-cyan-600 uppercase tracking-wide">Schedule</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="preferred_date" label="Start Date" required error={getError("preferred_date")}>
            <input id="preferred_date" type="date" min={today} value={safe.preferred_date}
              onChange={(e) => updateFormData("preferred_date", e.target.value)}
              onBlur={() => handleBlur("preferred_date")}
              required
              className={`mt-2 w-full border bg-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition ${inputBorder("preferred_date")}`} />
          </Field>
            <div>
            <label className="text-slate-700 text-sm font-medium">Preferred Time <span className="text-red-400">*</span></label>
            <div className="mt-2 flex gap-2 justify-center">
              {TIME_SLOTS.map((slot) => (
                <button key={slot.value} type="button" onClick={() => updateFormData("preferred_time", slot.value)}
                  className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border-2 transition-all flex-1 max-w-[140px] ${safe.preferred_time === slot.value ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-white text-slate-500 hover:border-cyan-200"
                    }`}>
                  <span className="text-lg sm:text-xl">{slot.emoji}</span>
                  <span className="text-[10px] sm:text-xs font-semibold mt-0.5">{slot.label}</span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400">{slot.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>


    </motion.div>
  );
}