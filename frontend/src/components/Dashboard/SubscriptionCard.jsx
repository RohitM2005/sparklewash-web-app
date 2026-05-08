import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays } from "date-fns";
import { Car, Calendar, Clock, Settings, Pause, Play } from "lucide-react";

export default function SubscriptionCard({ subscription }) {
  const navigate = useNavigate();

  const safeFormat = (date, formatType) => {
    try {
      return format(new Date(date), formatType);
    } catch {
      return "Invalid date";
    }
  };

  if (!subscription) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200"
      >
        <div className="text-center py-6 sm:py-8">
          <Car className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">
            No Active Subscription
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mb-4">
            Start your car wash subscription today
          </p>
          <button
            onClick={() => navigate("/subscription")}
            className="px-5 py-2 rounded-xl text-sm sm:text-base text-white font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition"
          >
            Subscribe Now
          </button>
        </div>
      </motion.div>
    );
  }

  const daysRemaining = Math.max(
    differenceInDays(new Date(subscription.end_date), new Date()), 0
  );

  const planColors = {
    basic: "from-slate-500 to-slate-600",
    standard: "from-cyan-500 to-blue-600",
    premium: "from-purple-500 to-indigo-600",
    corporate: "from-emerald-500 to-teal-600",
  };

  const planGradient = planColors[subscription.plan_name?.toLowerCase()] || planColors.standard;
  const timeSlots = {
    morning: "Morning (6–9 AM)",
    afternoon: "Afternoon (12–3 PM)",
    evening: "Evening (5–8 PM)",
  };
  const preferredTime = timeSlots[subscription.preferred_time] || "Morning";
  const progressWidth = Math.min(Math.max((daysRemaining / 30) * 100, 0), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
    >
      <div className={`bg-gradient-to-r ${planGradient} p-4 sm:p-6 text-white`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="inline-block mb-2 px-3 py-1 text-xs font-semibold rounded-full bg-white/20">
              {subscription.plan_name?.toUpperCase()} PLAN
            </span>
            <h3 className="text-base sm:text-xl font-bold">{subscription.vehicle_model}</h3>
            <p className="text-white/80 text-xs sm:text-sm">{subscription.vehicle_number}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xl sm:text-2xl font-bold">₹{subscription.monthly_price}</p>
            <p className="text-white/80 text-xs sm:text-sm">/month</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-slate-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Renews On</p>
              <p className="font-medium text-slate-900 text-xs sm:text-base truncate">
                {safeFormat(subscription.end_date, "MMM d, yyyy")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-slate-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-500">Time Slot</p>
              <p className="font-medium text-slate-900 text-xs sm:text-base truncate">{preferredTime}</p>
            </div>
          </div>
        </div>

        <div className="pt-3 sm:pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
            <span className="text-slate-500">Days Remaining</span>
            <span className="font-semibold text-slate-900">{daysRemaining} days</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 sm:pt-4 border-t border-slate-200">
          <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold ${
            subscription.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}>
            {subscription.status === "active" ? "● Active" : "○ Paused"}
          </span>
          <div className="flex flex-wrap gap-2">
            <button className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-xs sm:text-sm hover:bg-slate-100 transition">
              {subscription.status === "active" ? (
                <><Pause className="w-3.5 h-3.5" /> Pause</>
              ) : (
                <><Play className="w-3.5 h-3.5" /> Resume</>
              )}
            </button>
            <button className="p-1.5 sm:p-2 border rounded-lg hover:bg-slate-100 transition">
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}