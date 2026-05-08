import { useState, useEffect } from "react";
import { TrendingUp, DollarSign } from "lucide-react";
import api from "../../../services/api";

export default function PaymentStats() {
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });

  useEffect(() => {
    api.get("/admin/payments")
      .then(res => {
        const payments = res.data.payments || [];
        const paid = payments.filter(p => p.status === "paid" || p.status === "success");
        const pending = payments.filter(p => p.status === "pending");
        const total = paid.reduce((s, p) => s + Number(p.amount || 0), 0);
        setStats({ total, paid: paid.length, pending: pending.length });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-cyan-500" /> Payment Overview
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Total Revenue</span>
          <span className="text-lg font-bold text-slate-900">₹{stats.total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Successful Payments</span>
          <span className="text-sm font-medium text-green-600">{stats.paid}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">Pending Payments</span>
          <span className="text-sm font-medium text-amber-600">{stats.pending}</span>
        </div>
      </div>
    </div>
  );
}