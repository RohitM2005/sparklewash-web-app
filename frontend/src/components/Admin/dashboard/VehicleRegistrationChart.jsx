// components/Admin/dashboard/VehicleRegistrationChart.jsx
import { useState, useEffect, useCallback } from "react";
import { Car, TrendingUp } from "lucide-react";
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
 * Aggregate vehicle rows into chart buckets by groupBy period.
 */
function aggregateVehicles(vehicles, groupBy) {
  const buckets = {};
  const pad = (n) => String(n).padStart(2, "0");

  for (const v of vehicles) {
    const d = new Date(v.created_at);
    if (isNaN(d)) continue;

    let key = "";
    if (groupBy === "week") {
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

export default function VehicleRegistrationChart({ globalDates }) {
  const [chartPreset, setChartPreset]   = useState("30d");
  const [chartDates,  setChartDates]    = useState({ startDate: null, endDate: null });
  const [overridden,  setOverridden]    = useState(false);
  const [vehicles,    setVehicles]      = useState([]);
  const [loading,     setLoading]       = useState(true);

  // Derive groupBy from preset
  const groupBy =
    chartPreset === "7d"  ? "week" :
    chartPreset === "30d" ? "week" :
    chartPreset === "3m"  ? "month" :
    "month";

  // Follow global unless overridden
  useEffect(() => {
    if (!overridden && globalDates) setChartDates(globalDates);
  }, [globalDates, overridden]);

  const fetchVehicles = useCallback(async (dates) => {
    setLoading(true);
    try {
      const qs = buildDateQuery(dates.startDate, dates.endDate);
      const res = await api.get(`/admin/vehicles${qs}`);
      const list = res.data?.vehicles || res.data || [];
      setVehicles(Array.isArray(list) ? list : []);
    } catch {
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVehicles(chartDates); }, [chartDates, fetchVehicles]);

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

  const buckets = aggregateVehicles(vehicles, groupBy);
  const maxVal  = Math.max(...buckets.map(([, v]) => v), 1);
  const total   = buckets.reduce((s, [, v]) => s + v, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 gap-2">
        <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2 min-w-0">
          <Car className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="truncate">Vehicle Registrations</span>
        </h2>
        <CardFilter
          presets={PRESET_GROUPS.chart}
          value={chartPreset}
          onChange={handleFilterChange}
        />
      </div>

      {overridden && (
        <div className="px-5 pb-1">
          <button
            onClick={handleReset}
            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium hover:underline transition"
          >
            Reset to global
          </button>
        </div>
      )}

      {/* Summary */}
      {!loading && (
        <div className="px-5 pb-2 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs text-slate-500">
            {total} vehicle{total !== 1 ? "s" : ""} registered in period
          </span>
        </div>
      )}

      {/* Chart */}
      <div className="px-5 pb-5">
        {loading ? (
          <div className="flex items-end gap-2 h-32 animate-pulse">
            {[50, 70, 40, 85, 60, 75, 55, 90, 65, 80, 45, 95].map((h, i) => (
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
              {buckets.map(([label, val]) => {
                const pct = (val / maxVal) * 100;
                return (
                  <div key={label} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 bg-slate-800 text-white text-xs px-2 py-1 rounded-lg shadow pointer-events-none whitespace-nowrap z-10">
                      {val} vehicle{val !== 1 ? "s" : ""}
                    </div>
                    <div
                      className="w-full rounded-t-sm transition-all duration-500 cursor-pointer group-hover:brightness-110"
                      style={{
                        height: `${Math.max(pct, 4)}%`,
                        background: "linear-gradient(to top, #f59e0b, #fbbf24)",
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
