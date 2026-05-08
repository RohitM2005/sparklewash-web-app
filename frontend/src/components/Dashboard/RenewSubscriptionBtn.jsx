import React, { useState } from "react";
import { motion } from "framer-motion";
import { format, addMonths } from "date-fns";
import { RefreshCcw, Calendar, CreditCard } from "lucide-react";
import { renewSubscription } from "../../services/subscription.service";

export default function RenewSubscriptionBtn({ subscription, onRenew }) {
  const [loading, setLoading] = useState(false);

  if (!subscription) return null;

  const handleRenew = async () => {
    try {
      setLoading(true);
      const res = await renewSubscription(subscription._id);
      if (res.success) {
        onRenew && onRenew(res.subscription);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to renew subscription");
    } finally {
      setLoading(false);
    }
  };

  const newEndDate = addMonths(new Date(subscription.end_date), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900">
            Renew Subscription
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Extend your current plan for another month
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 flex-shrink-0" />
            <span className="text-sm text-slate-700">
              New Expiry: <strong>{format(newEndDate, "MMM d, yyyy")}</strong>
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 flex-shrink-0" />
            <span className="text-sm text-slate-700">
              ₹{subscription.monthly_price} will be charged
            </span>
          </div>
        </div>
        <button
          onClick={handleRenew}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-xl text-white text-sm sm:text-base bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition disabled:opacity-50"
        >
          <RefreshCcw className="w-4 h-4" />
          {loading ? "Processing..." : "Renew Now"}
        </button>
      </div>
    </motion.div>
  );
}