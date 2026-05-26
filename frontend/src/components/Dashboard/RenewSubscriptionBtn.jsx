import React, { useState } from "react";
import { motion } from "framer-motion";
import { format, addMonths } from "date-fns";
import { RefreshCcw, Calendar, CreditCard } from "lucide-react";
import { renewSubscription } from "../../services/subscription.service";
import api from "../../services/api";

export default function RenewSubscriptionBtn({ subscription, onRenew }) {
  const [loading, setLoading] = useState(false);

  if (!subscription) return null;

  const handleRenew = async () => {
    try {
      setLoading(true);

      // 1. Create Razorpay order
      const orderRes = await api.post("/razorpay/create-order", {
        amount: subscription.monthly_price,
        subscription_id: subscription.id || subscription._id, // Support both ID formats
      });
      const order = orderRes.data.order;

      // 2. Open Razorpay Checkout
      const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

      const options = {
        key: RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "SparkleWash",
        description: `Subscription Renewal`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // 3. Verify payment
            await api.post("/razorpay/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              subscription_id: subscription.id || subscription._id,
              amount: subscription.monthly_price,
            });
            alert("Subscription renewed successfully!");
            if (onRenew) onRenew(); // Refresh dashboard data
          } catch (err) {
            console.error("Verification error:", err);
            alert("Payment verification failed. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        theme: { color: "#00d4ff" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            alert("Payment cancelled");
          },
        },
      };

      if (typeof window.Razorpay !== "undefined") {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", () => {
          setLoading(false);
          alert("Payment failed. Please try again.");
        });
        rzp.open();
      } else {
        alert("Payment gateway is not available right now.");
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to initialize payment");
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