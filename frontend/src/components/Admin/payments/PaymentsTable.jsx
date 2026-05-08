import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import api from "../../../services/api";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const statusColors = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-600",
  success: "bg-green-100 text-green-700",
};

export default function PaymentsTable() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/payments")
      .then(res => setPayments(res.data.payments || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div {...fadeIn}>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Payments</h1>
        <p className="text-gray-500 text-sm">All payment transactions</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["#", "Customer", "Plan", "Amount", "Method", "Status", "Payment ID", "Date"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <DollarSign className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400">No payments yet</p>
                </td>
              </tr>
            ) : payments.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-3 text-slate-400">#{p.id}</td>
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{p.customer_name || "—"}</p>
                  <p className="text-xs text-slate-400">{p.customer_email || ""}</p>
                </td>
                <td className="px-5 py-3 text-slate-600">{p.plan_name || "—"}</td>
                <td className="px-5 py-3 text-slate-900 font-medium">₹{p.amount}</td>
                <td className="px-5 py-3 text-slate-600 capitalize">{p.payment_method || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || statusColors.pending}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-500 text-xs font-mono">{p.razorpay_payment_id || "—"}</td>
                <td className="px-5 py-3 text-slate-400 text-xs">
                  {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}