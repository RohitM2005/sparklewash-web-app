import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CheckCircle, ArrowRight, Home } from "lucide-react";

export default function BookingConfirmedPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const subscription = state?.subscription;
  const bookingData = state?.bookingData;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!subscription) navigate("/dashboard");
  }, []);

  if (!subscription) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{ background: "linear-gradient(135deg, #0a0f1e, #0d1b2a)" }}>
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-lg w-full text-center shadow-2xl">

        {/* Success Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #00d4ff, #0066ff)" }}>
          <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">Booking Confirmed! 🎉</h1>
        <p className="text-slate-500 text-sm mb-6 sm:mb-8">Your car wash subscription has been successfully activated.</p>

        {/* Booking Details */}
        <div className="bg-slate-50 rounded-xl p-4 sm:p-6 text-left mb-5 sm:mb-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">📋 Booking Details</h3>
          <div className="space-y-2.5 text-sm">
            {[
              ["Vehicle", subscription.vehicle_number],
              ["Plan", subscription.plan_name || "Daily Wash"],
              ["Preferred Time", (subscription.preferred_time || "morning").charAt(0).toUpperCase() + (subscription.preferred_time || "morning").slice(1)],
              ["Start Date", subscription.start_date ? new Date(subscription.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"],
              ["Renewal Date", subscription.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"],
              ["Address", bookingData?.address ? `${bookingData.address}${bookingData.city ? `, ${bookingData.city}` : ""}` : (subscription.address || "—")],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-start">
                <span className="text-slate-400 text-xs sm:text-sm">{label}</span>
                <span className="font-medium text-slate-800 text-right max-w-[55%] text-xs sm:text-sm">{value}</span>
              </div>
            ))}
            <hr className="border-slate-200 my-1" />
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs sm:text-sm">Monthly Amount</span>
              <span className="font-bold text-lg" style={{ color: "#0066ff" }}>₹{subscription.monthly_price}</span>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="rounded-xl p-3 mb-5 sm:mb-6 text-left text-xs"
          style={{ background: "#fffbeb", border: "1px solid #fcd34d", color: "#92400e" }}>
          💡 <strong>Note:</strong> Bill will be generated at the end of your monthly cycle. You will receive it on your billing page.
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button onClick={() => navigate("/dashboard")}
            className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #00d4ff, #0066ff)" }}>
            <ArrowRight className="w-4 h-4" /> Go to Dashboard
          </button>
          <button onClick={() => navigate("/home")}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition hover:bg-slate-50"
            style={{ border: "1.5px solid #0066ff", color: "#0066ff", background: "transparent" }}>
            <Home className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
