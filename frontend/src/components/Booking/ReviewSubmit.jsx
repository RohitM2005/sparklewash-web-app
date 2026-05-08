import React from "react";
import { motion } from "framer-motion";
import { Car, User, MapPin, Calendar, CreditCard, Check, Loader2, Clock, Shield } from "lucide-react";
import { format, addMonths } from "date-fns";

const PLAN_NAMES = { basic: "Basic", standard: "Standard", premium: "Premium" };
const VEHICLE_TYPES = { micro: "Micro", sedan: "Sedan", mini_suv: "Mini SUV", suv: "SUV", hatchback: "Hatchback", luxury: "Luxury" };
const TIME_SLOTS = { morning: "Morning · 6AM–9AM", afternoon: "Afternoon · 12PM–3PM", evening: "Evening · 5PM–8PM" };
const PLAN_HIGHLIGHTS = { basic: "Daily wash + weekly dusting", standard: "Full wash + tire & dashboard", premium: "Full wash + wax & deep clean" };
const planColors = { basic: "text-slate-600 bg-slate-100", standard: "text-cyan-600 bg-cyan-100", premium: "text-purple-600 bg-purple-100" };

export default function ReviewSubmit({ formData, onSubmit, isSubmitting }) {
  const startDate = formData?.preferred_date ? new Date(formData.preferred_date) : new Date();
  const endDate = addMonths(startDate, 1);
  const safeFormat = (d, f) => { try { return format(d, f); } catch { return "-"; } };
  const isValid = formData?.vehicle_number && formData?.customer_name && formData?.plan_name;
  const planColor = planColors[formData?.plan_name] || planColors.basic;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-slate-900">Review & Confirm</h3>
        <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Verify your details before subscribing</p>
      </div>

      <Section icon={Car} title="Vehicle">
        <Detail label="Type" value={VEHICLE_TYPES[formData?.vehicle_type]} />
        <Detail label="Number" value={formData?.vehicle_number} />
        <Detail label="Model" value={formData?.vehicle_model} full />
      </Section>

      <Section icon={User} title="Customer">
        <Detail label="Name" value={formData?.customer_name} />
        <Detail label="Phone" value={formData?.customer_phone ? `+91 ${formData.customer_phone}` : "-"} />
        <Detail label="Email" value={formData?.customer_email} full />
      </Section>

      <Section icon={MapPin} title="Service Address">
        <div className="sm:col-span-2">
          <p className="text-xs sm:text-sm text-slate-900">{formData?.address || "-"}</p>
          {formData?.city && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{formData.city}</p>}
        </div>
      </Section>

      <Section icon={Calendar} title="Plan & Schedule">
        <div className="sm:col-span-2 flex flex-wrap items-center gap-2 mb-2">
          <span className={`text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${planColor}`}>
            {PLAN_NAMES[formData?.plan_name] || "-"} Plan
          </span>
          {formData?.plan_name && <span className="text-[10px] sm:text-xs text-slate-500">{PLAN_HIGHLIGHTS[formData.plan_name]}</span>}
        </div>
        <Detail label="Time" value={TIME_SLOTS[formData?.preferred_time]} />
        <Detail label="Start" value={safeFormat(startDate, "dd MMM yyyy")} />
        <Detail label="Renews" value={safeFormat(endDate, "dd MMM yyyy")} />
      </Section>

      {/* Price Breakdown */}
      <div className="bg-slate-50 rounded-xl p-3 sm:p-4 space-y-3">
        <p className="text-xs sm:text-sm font-semibold text-slate-700 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Price Breakdown
        </p>
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm text-slate-600">
            <span>Daily Wash · {VEHICLE_TYPES[formData?.vehicle_type] || "-"}</span>
            <span className="font-medium">₹{formData?.monthly_price || "-"}/mo</span>
          </div>
          <div className="flex justify-between text-[10px] sm:text-xs text-slate-400">
            <span>Interior Cleaning (add-on)</span><span>₹300/visit</span>
          </div>
          <div className="flex justify-between text-[10px] sm:text-xs text-slate-400">
            <span>Service charge</span><span>Additional</span>
          </div>
        </div>
        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
          <span className="font-semibold text-slate-800 text-sm">Monthly Total</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900">₹{formData?.monthly_price || "-"}</span>
        </div>
      </div>

      {/* Perks */}
      <div className="grid grid-cols-3 gap-2">
        {[{ icon: Shield, text: "7-day trial" }, { icon: Check, text: "Cancel anytime" }, { icon: Clock, text: "Daily service" }].map(({ icon: Icon, text }) => (
          <div key={text} className="flex flex-col items-center gap-1 p-2 sm:p-3 bg-green-50 border border-green-100 rounded-xl text-center">
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
            <span className="text-[9px] sm:text-[10px] text-green-700 font-medium leading-tight">{text}</span>
          </div>
        ))}
      </div>

      {/* Terms */}
      <div className="flex gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] sm:text-xs text-blue-700">
          By subscribing, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>

      {/* Submit */}
      <button onClick={onSubmit} disabled={isSubmitting || !isValid}
        className="w-full flex items-center justify-center gap-2 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-xl text-white
          bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.99]">
        {isSubmitting ? (<><Loader2 className="w-4 h-4 animate-spin" />Processing...</>) : (<><Check className="w-4 h-4" />Confirm & Subscribe</>)}
      </button>

      {!isValid && <p className="text-center text-[10px] sm:text-xs text-red-400">Please complete all steps before confirming.</p>}
    </motion.div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 sm:p-4">
      <div className="flex gap-2 mb-2.5 text-slate-700">
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5" />
        <span className="font-semibold text-xs sm:text-sm">{title}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">{children}</div>
    </div>
  );
}

function Detail({ label, value, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <span className="text-slate-400 text-[10px] sm:text-xs">{label}:</span>
      <span className="ml-1.5 text-slate-800 font-medium text-xs sm:text-sm">{value || "-"}</span>
    </div>
  );
}