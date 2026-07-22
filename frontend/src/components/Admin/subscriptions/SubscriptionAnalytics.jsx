// components/Admin/subscriptions/SubscriptionAnalytics.jsx
import { useState, useEffect, useCallback } from "react";
import { BarChart3 } from "lucide-react";
import api from "../../../services/api";
import CardFilter, { PRESET_GROUPS } from "../dashboard/CardFilter";

function buildDateQuery(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate)   params.set("endDate",   endDate);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export default function SubscriptionAnalytics({ globalDates }) {
  const [preset, setPreset]         = useState("all");
  const [dates,  setDates]          = useState({ startDate: null, endDate: null });
  const [overridden, setOverridden] = useState(false);

  const [data,    setData]    = useState({ total: 0, active: 0, pending: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

  // Follow global filter unless overridden
  useEffect(() => {
    if (!overridden && globalDates) setDates(globalDates);
  }, [globalDates, overridden]);

  const fetchData = useCallback(async (activeDates) => {
    setLoading(true);
    try {
      const qs = buildDateQuery(activeDates.startDate, activeDates.endDate);
      const res = await api.get(`/admin/subscriptions${qs}`);
      const subs = res.data || [];
      setData({
        total:     subs.length,
        active:    subs.filter(s => s.status === "active").length,
        pending:   subs.filter(s => s.status === "pending").length,
        cancelled: subs.filter(s => s.status === "cancelled").length,
        expired:   subs.filter(s => s.status === "expired").length,
      });
    } catch {
      setData({ total: 0, active: 0, pending: 0, cancelled: 0, expired: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(dates); }, [dates, fetchData]);

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

  const bars = [
    { label: "Active",    value: data.active,    color: "from-green-400 to-emerald-500",   bg: "bg-green-50",   text: "text-green-700" },
    { label: "Pending",   value: data.pending,   color: "from-amber-400 to-orange-500",    bg: "bg-amber-50",   text: "text-amber-700" },
    { label: "Cancelled", value: data.cancelled, color: "from-red-400 to-rose-500",        bg: "bg-red-50",     text: "text-red-600" },
    { label: "Expired",   value: data.expired || 0, color: "from-slate-400 to-slate-500",  bg: "bg-slate-50",   text: "text-slate-500" },
  ];
  const max = Math.max(...bars.map(b => b.value), 1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 gap-2">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 min-w-0">
          <BarChart3 className="w-4 h-4 text-cyan-500 flex-shrink-0" />
          <span className="truncate">Subscription Analytics</span>
        </h2>
        <CardFilter
          presets={PRESET_GROUPS.subscription}
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

      {loading ? (
        <div className="px-5 pb-5 space-y-4 mt-1">
          {[1,2,3,4].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex justify-between mb-1">
                <div className="h-3 bg-slate-200 rounded w-20" />
                <div className="h-3 bg-slate-200 rounded w-6" />
              </div>
              <div className="h-2 bg-slate-100 rounded-full w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="px-5 pb-5 mt-1">
          <p className="text-xs text-slate-400 mb-4">{data.total} total subscription{data.total !== 1 ? "s" : ""}</p>

          {/* Summary chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {bars.filter(b => b.value > 0).map(b => (
              <span key={b.label} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${b.bg} ${b.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${b.color}`} />
                {b.label}: {b.value}
              </span>
            ))}
          </div>

          {/* Progress bars */}
          <div className="space-y-3">
            {bars.map(b => (
              <div key={b.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{b.label}</span>
                  <span className="font-bold text-slate-900">{b.value}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${b.color} transition-all duration-700`}
                    style={{ width: `${(b.value / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}