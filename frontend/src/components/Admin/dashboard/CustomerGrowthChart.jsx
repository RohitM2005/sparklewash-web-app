// components/Admin/dashboard/CustomerGrowthChart.jsx
import { useState, useEffect, useCallback } from "react";
import { Users, TrendingUp } from "lucide-react";
import api from "../../../services/api";
import CardFilter, { PRESET_GROUPS } from "./CardFilter";

function buildDateQuery(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate)   params.set("endDate",   endDate);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Aggregate customer rows into chart buckets.
 * groupBy: "week" | "month" | "quarter" | "year"
 */
function aggregateCustomers(customers, groupBy) {
  const buckets = {};
  const pad = (n) => String(n).padStart(2, "0");

  for (const c of customers) {
    const d = new Date(c.created_at);
    if (isNaN(d)) continue;

    let key = "";
    if (groupBy === "week") {
      // ISO week: YYYY-Www
      const jan1 = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((d - jan1) / 86400000 + jan1.getDay() + 1) / 7);
      key = `${d.getFullYear()}-W${pad(weekNum)}`;
    } else if (groupBy === "month") {
      key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    } else if (groupBy === "quarter") {
      const q = Math.ceil((d.getMonth() + 1) / 3);
      key = `${d.getFullYear()}-Q${q}`;
    } else {
      key = `${d.getFullYear()}`;
    }

    buckets[key] = (buckets[key] || 0) + 1;
  }

  return Object.entries(buckets)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .slice(-12); // show last 12 buckets max
}

export default function CustomerGrowthChart({ globalDates }) {
  const [chartPreset, setChartPreset]   = useState("30d");
  const [chartDates,  setChartDates]    = useState({ startDate: null, endDate: null });
  const [overridden,  setOverridden]    = useState(false);
  const [customers,   setCustomers]     = useState([]);
  const [loading,     setLoading]       = useState(true);

  // groupBy derived from preset
  const groupBy =
    chartPreset === "7d"  ? "week" :
    chartPreset === "30d" ? "week" :
    chartPreset === "3m"  ? "month" :
    "month";

  // Follow global unless overridden
  useEffect(() => {
    if (!overridden && globalDates) setChartDates(globalDates);
  }, [globalDates, overridden]);

  const fetchCustomers = useCallback(async (dates) => {
    setLoading(true);
    try {
      const qs = buildDateQuery(dates.startDate, dates.endDate);
      // Fetch all customers — we'll aggregate client-side
      const res = await api.get(`/admin/customers${qs}`);
      const list = res.data?.customers || res.data || [];
      setCustomers(Array.isArray(list) ? list : []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(chartDates); }, [chartDates, fetchCustomers]);

  const handleFilterChange = (newPreset, newDates) => {
    setChartPreset(newPreset);
    setChartDates(newDates);
    setOverridden(true);
  };

  const handleReset = () => {
    setChartPreset("30d");
    setChartDates(globalDates || { startDate: null, endDate: null });
    setOverridden(false);
  };

  const buckets = aggregateCustomers(customers, groupBy);
  const maxVal  = Math.max(...buckets.map(([, v]) => v), 1);
  const total   = buckets.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 gap-2">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 min-w-0">
          <Users className="w-4 h-4 text-cyan-500 flex-shrink-0" />
          <span className="truncate">Customer Growth</span>
        </h2>
        <CardFilter
          presets={PRESET_GROUPS.chart}
          value={chartPreset}
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

      {/* Summary */}
      {!loading && (
        <div className="px-5 pb-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-slate-500">{total} new customer{total !== 1 ? "s" : ""} in period</span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="px-5 pb-5">
        {loading ? (
          <div className="flex items-end gap-2 h-32 animate-pulse">
            {[60,40,70,50,80,65,45,75,55,85,70,90].map((h, i) => (
              <div key={i} className="flex-1 bg-slate-100 rounded-t-sm" style={{ height: `${h}%` }} />
            ))}
          </div>
        ) : buckets.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-sm text-slate-400">
            No data for this period
          </div>
        ) : (
          <div className="relative">
            {/* Y-axis hint */}
            <div className="absolute left-0 top-0 bottom-6 w-6 flex flex-col justify-between pointer-events-none">
              {[maxVal, Math.round(maxVal / 2), 0].map((v, i) => (
                <span key={i} className="text-xs text-slate-300 leading-none">{v}</span>
              ))}
            </div>

            {/* Bars */}
            <div className="ml-8 flex items-end gap-1.5 h-32">
              {buckets.map(([label, val], i) => {
                const pct = (val / maxVal) * 100;
                return (
                  <div key={label} className="flex-1 flex flex-col items-center gap-0.5 group">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -translate-y-8 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg shadow pointer-events-none whitespace-nowrap z-10">
                      {val} customers
                    </div>
                    <div
                      className="w-full rounded-t-sm transition-all duration-500 cursor-pointer group-hover:brightness-110"
                      style={{
                        height: `${Math.max(pct, 4)}%`,
                        background: "linear-gradient(to top, #6366f1, #818cf8)",
                        minHeight: 4,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-axis labels */}
            <div className="ml-8 flex gap-1.5 mt-1">
              {buckets.map(([label]) => {
                const short = label.length > 7 ? label.slice(-5) : label;
                return (
                  <div key={label} className="flex-1 text-center">
                    <span className="text-[9px] text-slate-400 leading-none">{short}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
