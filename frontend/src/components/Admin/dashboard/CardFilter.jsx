// components/Admin/dashboard/CardFilter.jsx
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Calendar } from "lucide-react";

export const PRESET_GROUPS = {
  standard: [
    { label: "All Time",      value: "all" },
    { label: "Today",         value: "today" },
    { label: "Last 7 Days",   value: "7d" },
    { label: "Last 30 Days",  value: "30d" },
    { label: "This Month",    value: "this_month" },
    { label: "Last Month",    value: "last_month" },
    { label: "Last 3 Months", value: "3m" },
    { label: "Last 6 Months", value: "6m" },
    { label: "Last 12 Months",value: "12m" },
    { label: "Custom Range",  value: "custom" },
  ],
  revenue: [
    { label: "All Time",     value: "all" },
    { label: "1 Month",      value: "30d" },
    { label: "3 Months",     value: "3m" },
    { label: "6 Months",     value: "6m" },
    { label: "12 Months",    value: "12m" },
    { label: "Custom Range", value: "custom" },
  ],
  chart: [
    { label: "Weekly",    value: "7d" },
    { label: "Monthly",   value: "30d" },
    { label: "Quarterly", value: "3m" },
    { label: "Yearly",    value: "12m" },
  ],
  payment: [
    { label: "All Time",      value: "all" },
    { label: "This Month",    value: "this_month" },
    { label: "Last Month",    value: "last_month" },
    { label: "Last 3 Months", value: "3m" },
    { label: "Last 6 Months", value: "6m" },
    { label: "Custom Range",  value: "custom" },
  ],
  subscription: [
    { label: "All Time",       value: "all" },
    { label: "This Month",     value: "this_month" },
    { label: "Last Month",     value: "last_month" },
    { label: "Last 3 Months",  value: "3m" },
    { label: "Last 6 Months",  value: "6m" },
    { label: "Last 12 Months", value: "12m" },
  ],
};

/** Convert a preset value to { startDate, endDate } YYYY-MM-DD strings */
export function presetToDates(value, customFrom, customTo) {
  if (value === "all") return { startDate: null, endDate: null };
  if (value === "custom") return { startDate: customFrom || null, endDate: customTo || null };

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const today = fmt(now);
  const daysAgo = (n) => {
    const d = new Date(now);
    d.setDate(d.getDate() - n);
    return fmt(d);
  };

  if (value === "today")       return { startDate: today, endDate: today };
  if (value === "7d")          return { startDate: daysAgo(6),   endDate: today };
  if (value === "30d")         return { startDate: daysAgo(29),  endDate: today };
  if (value === "3m")          return { startDate: daysAgo(89),  endDate: today };
  if (value === "6m")          return { startDate: daysAgo(179), endDate: today };
  if (value === "12m")         return { startDate: daysAgo(364), endDate: today };
  if (value === "this_month") {
    return { startDate: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), endDate: today };
  }
  if (value === "last_month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end   = new Date(now.getFullYear(), now.getMonth(), 0);
    return { startDate: fmt(start), endDate: fmt(end) };
  }
  return { startDate: null, endDate: null };
}

/**
 * CardFilter — Reusable per-card time-range filter dropdown
 *
 * Props:
 *   presets  — array of { label, value } (use PRESET_GROUPS.standard, etc.)
 *   value    — current preset value string
 *   onChange — (presetValue, { startDate, endDate }) => void
 */
export default function CardFilter({ presets = PRESET_GROUPS.standard, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo,   setCustomTo]   = useState("");
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentPreset = presets.find(p => p.value === value) || presets[0];

  const handleSelect = (preset) => {
    if (preset.value !== "custom") {
      setOpen(false);
      onChange(preset.value, presetToDates(preset.value, "", ""));
    } else {
      // Keep dropdown open to show date inputs
      onChange(preset.value, presetToDates("custom", customFrom, customTo));
    }
  };

  const handleCustomApply = () => {
    if (customFrom && customTo) {
      setOpen(false);
      onChange("custom", { startDate: customFrom, endDate: customTo });
    }
  };

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all select-none hover:shadow-sm"
        style={{
          background: "rgba(99,102,241,0.07)",
          borderColor: "rgba(99,102,241,0.28)",
          color: "#6366f1",
          whiteSpace: "nowrap",
        }}
      >
        <Calendar className="w-3 h-3 flex-shrink-0" />
        <span className="truncate" style={{ maxWidth: 108 }}>{currentPreset.label}</span>
        <ChevronDown
          className={"w-3 h-3 flex-shrink-0 transition-transform" + (open ? " rotate-180" : "")}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
          style={{ minWidth: 180 }}
        >
          <div className="py-1 max-h-64 overflow-y-auto">
            {presets.map(preset => (
              <button
                key={preset.value}
                onClick={() => handleSelect(preset)}
                className={
                  "w-full text-left px-3 py-2 text-xs font-medium transition-colors " +
                  (value === preset.value ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50")
                }
              >
                {value === preset.value && <span className="mr-1.5 text-indigo-500">✓</span>}
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom date range picker (only shown when "custom" is selected) */}
          {value === "custom" && (
            <div className="border-t border-slate-100 p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Custom Range</p>
              <div className="space-y-1.5">
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    max={customTo || undefined}
                    onChange={e => {
                      setCustomFrom(e.target.value);
                      onChange("custom", { startDate: e.target.value, endDate: customTo });
                    }}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-0.5">To</label>
                  <input
                    type="date"
                    value={customTo}
                    min={customFrom || undefined}
                    onChange={e => {
                      setCustomTo(e.target.value);
                      onChange("custom", { startDate: customFrom, endDate: e.target.value });
                    }}
                    className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>
              <button
                onClick={handleCustomApply}
                disabled={!customFrom || !customTo}
                className="w-full py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-40 transition"
                style={{ background: "linear-gradient(135deg,#6366f1,#818cf8)" }}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
