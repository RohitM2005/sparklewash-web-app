// components/Admin/payments/PaymentStats.jsx
import { useState, useEffect, useCallback } from "react";
import { DollarSign, TrendingUp, TrendingDown, Minus } from "lucide-react";
import api from "../../../services/api";
import CardFilter, { PRESET_GROUPS, presetToDates } from "../dashboard/CardFilter";

function buildDateQuery(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate)   params.set("endDate",   endDate);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default function PaymentStats({ globalDates }) {
  const [preset, setPreset]       = useState("all");
  const [dates,  setDates]        = useState({ startDate: null, endDate: null });
  const [overridden, setOverridden] = useState(false);

  const [stats, setStats]     = useState({ total: 0, paid: 0, pending: 0, failed: 0 });
  const [loading, setLoading] = useState(true);

  // Follow global filter unless overridden
  useEffect(() => {
    if (!overridden && globalDates) {
      setDates(globalDates);
    }
  }, [globalDates, overridden]);

  const fetchStats = useCallback(async (activeDates) => {
    setLoading(true);
    try {
      const qs = buildDateQuery(activeDates.startDate, activeDates.endDate);
      const res = await api.get(`/admin/payments${qs}`);
      const payments = res.data.payments || [];
      const paid    = payments.filter(p => p.status === "paid"    || p.status === "success" || p.status === "captured");
      const pending = payments.filter(p => p.status === "pending");
      const failed  = payments.filter(p => p.status === "failed");
      const total   = paid.reduce((s, p) => s + Number(p.amount || 0), 0);
      setStats({ total, paid: paid.length, pending: pending.length, failed: failed.length });
    } catch {
      setStats({ total: 0, paid: 0, pending: 0, failed: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(dates); }, [dates, fetchStats]);

  const handleFilterChange = (newPreset, newDates) => {
    setPreset(newPreset);
    setDates(newDates);
    setOverridden(true);
  };

  const handleReset = () => {
    setPreset("all");
    setDates(globalDates || { startDate: null, endDate: null });
    setOverridden(false);
  };

  const rows = [
    { label: "Total Revenue",        value: `₹${stats.total.toLocaleString()}`,  color: "text-slate-900",  dot: "bg-blue-500" },
    { label: "Successful Payments",  value: stats.paid,                           color: "text-green-600",  dot: "bg-green-500" },
    { label: "Pending Payments",     value: stats.pending,                        color: "text-amber-600",  dot: "bg-amber-400" },
    { label: "Failed Payments",      value: stats.failed,                         color: "text-red-500",    dot: "bg-red-400" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 gap-2">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 min-w-0">
          <DollarSign className="w-4 h-4 text-cyan-500 flex-shrink-0" />
          <span className="truncate">Payment Overview</span>
        </h2>
        <CardFilter
          presets={PRESET_GROUPS.payment}
          value={preset}
          onChange={handleFilterChange}
        />
      </div>

      {overridden && (
        <div className="px-5 pb-1">
          <button onClick={handleReset} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium hover:underline transition">
            Reset to global
          </button>
        </div>
      )}

      {/* Body */}
      <div className="px-5 pb-5 space-y-3 mt-1">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex justify-between items-center animate-pulse">
                <div className="h-3 bg-slate-200 rounded w-32" />
                <div className="h-4 bg-slate-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : (
          rows.map(row => (
            <div key={row.label} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${row.dot}`} />
                <span className="text-sm text-slate-500">{row.label}</span>
              </div>
              <span className={`text-sm font-semibold ${row.color}`}>{row.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}