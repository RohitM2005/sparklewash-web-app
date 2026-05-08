import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import api from "../../../services/api";

export default function FailedPayments() {
  const [failed, setFailed] = useState([]);

  useEffect(() => {
    api.get("/admin/payments")
      .then(res => {
        const payments = res.data.payments || [];
        setFailed(payments.filter(p => p.status === "failed"));
      })
      .catch(() => setFailed([]));
  }, []);

  if (failed.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
        <p className="text-green-600 font-medium">🎉 No failed transactions</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
      <div className="px-5 py-3 border-b border-slate-200 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <h3 className="font-semibold text-slate-900">Failed Payments ({failed.length})</h3>
      </div>
      <table className="min-w-full text-sm">
        <thead className="bg-red-50 border-b">
          <tr>
            {["Customer", "Amount", "Payment ID", "Date"].map(h => (
              <th key={h} className="px-5 py-2 text-left text-xs font-semibold text-red-600 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {failed.map(p => (
            <tr key={p.id} className="hover:bg-red-50/50">
              <td className="px-5 py-3 text-slate-900">{p.customer_name || "—"}</td>
              <td className="px-5 py-3 text-slate-900 font-medium">₹{p.amount}</td>
              <td className="px-5 py-3 text-slate-500 text-xs font-mono">{p.razorpay_payment_id || "—"}</td>
              <td className="px-5 py-3 text-slate-400 text-xs">
                {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}