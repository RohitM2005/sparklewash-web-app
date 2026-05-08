import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle, XCircle, Clock, IndianRupee } from "lucide-react";
import api from "../../services/api";

export default function Billing() {
  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await api.get("/customer/dashboard");
        const data = res.data;
        setSubscription(data.subscription || null);
        setPayments(data.payments || []);
      } catch (err) {
        console.error("Billing fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBilling();
  }, []);

  const statusBadge = (status) => {
    const map = {
      paid: { bg: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
      success: { bg: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
      failed: { bg: "bg-red-100 text-red-700", icon: <XCircle className="w-3.5 h-3.5" /> },
      pending: { bg: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3.5 h-3.5" /> },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
        {s.icon} {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Billing</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Payments, invoices, and subscription billing
            </p>
          </div>
        </div>

        {/* Active Subscription Card */}
        {subscription && (
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-cyan-100 text-sm font-medium mb-1">Active Plan</p>
                <h2 className="text-2xl font-bold">{subscription.plan_name || "Standard Plan"}</h2>
                <div className="flex gap-4 mt-3 text-sm text-cyan-100">
                  <span>Start: {new Date(subscription.start_date).toLocaleDateString("en-IN")}</span>
                  <span>Renewal: {new Date(subscription.renewal_date).toLocaleDateString("en-IN")}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-cyan-100 text-sm mb-1">Monthly</p>
                <p className="text-3xl font-bold flex items-center gap-1">
                  <IndianRupee className="w-6 h-6" />
                  {subscription.monthly_price}
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
                  {subscription.status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payments Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Payment History</h2>
          </div>

          {payments.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 text-sm">No payment history yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Amount</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Payment ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-700">
                        {new Date(p.paid_at || p.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        ₹{p.amount}
                      </td>
                      <td className="px-6 py-4">{statusBadge(p.status)}</td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                        {p.razorpay_payment_id || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}