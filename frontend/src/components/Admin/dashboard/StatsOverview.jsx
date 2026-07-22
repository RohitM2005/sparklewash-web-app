// components/Admin/dashboard/StatsOverview.jsx
import { motion } from "framer-motion";
import {
  Users, CreditCard, FileText, Car,
  CheckCircle2, Clock, Truck, Filter, MessageSquareWarning, AlertCircle,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import api from "../../../services/api";
import PaymentStats from "../payments/PaymentStats";
import SubscriptionAnalytics from "../subscriptions/SubscriptionAnalytics";
import CardFilter, { PRESET_GROUPS, presetToDates } from "./CardFilter";
import CustomerGrowthChart from "./CustomerGrowthChart";
import VehicleRegistrationChart from "./VehicleRegistrationChart";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

/* ── Animated Count-Up ── */
function AnimatedNumber({ value, prefix = "", duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const num =
      typeof value === "string"
        ? parseInt(value.replace(/[^0-9]/g, "")) || 0
        : Number(value) || 0;
    if (num === 0) { setDisplay(0); return; }
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * num));
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => ref.current && cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return <>{prefix}{display.toLocaleString()}</>;
}

/* ── Build query string from dates ── */
function buildDateQuery(startDate, endDate) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate)   params.set("endDate",   endDate);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/* ── Per-card filter hook ── */
function useCardFilter(globalDates, defaultPreset = "all") {
  const [preset, setPreset] = useState(defaultPreset);
  const [dates,  setDates]  = useState(() => presetToDates(defaultPreset, "", ""));
  const [overridden, setOverridden] = useState(false);

  // When global changes, reset card to global unless user explicitly overrode
  useEffect(() => {
    if (!overridden) {
      setDates(globalDates);
    }
  }, [globalDates, overridden]);

  const handleChange = (newPreset, newDates) => {
    setPreset(newPreset);
    setDates(newDates);
    setOverridden(true);
  };

  const reset = () => {
    setPreset(defaultPreset);
    setDates(globalDates);
    setOverridden(false);
  };

  return { preset, dates, overridden, handleChange, reset };
}

/* ════════════════════════════════════════════════════════ */
/* StatsOverview — main component                          */
/* ════════════════════════════════════════════════════════ */

export default function StatsOverview() {
  // ── Global filter ────────────────────────────────────────
  const [globalPreset, setGlobalPreset]   = useState("all");
  const [globalDates,  setGlobalDates]    = useState({ startDate: null, endDate: null });

  const handleGlobalChange = (preset, dates) => {
    setGlobalPreset(preset);
    setGlobalDates(dates);
  };

  // ── Static stats (washers, today counts — never filtered) ─
  const [staticStats, setStaticStats] = useState({});
  const [staticLoading, setStaticLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(res => setStaticStats(res.data || {}))
      .catch(() => {})
      .finally(() => setStaticLoading(false));
  }, []);

  // ── Per-card states ───────────────────────────────────────
  const customersFilter    = useCardFilter(globalDates, "all");
  const vehiclesFilter     = useCardFilter(globalDates, "all");
  const subscriptFilter    = useCardFilter(globalDates, "all");
  const revenueFilter      = useCardFilter(globalDates, "all");

  const [customersVal,   setCustomersVal]   = useState(null);
  const [vehiclesVal,    setVehiclesVal]    = useState(null);
  const [subscriptVal,   setSubscriptVal]   = useState(null);
  const [revenueVal,     setRevenueVal]     = useState(null);

  const [customersLoading,  setCustomersLoading]  = useState(true);
  const [vehiclesLoading,   setVehiclesLoading]   = useState(true);
  const [subscriptLoading,  setSubscriptLoading]  = useState(true);
  const [revenueLoading,    setRevenueLoading]    = useState(true);

  const fetchCard = useCallback(async (dates, setVal, setLoading) => {
    setLoading(true);
    try {
      const qs = buildDateQuery(dates.startDate, dates.endDate);
      const res = await api.get(`/admin/stats${qs}`);
      setVal(res.data);
    } catch { setVal(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCard(customersFilter.dates,  setCustomersVal,  setCustomersLoading);  }, [customersFilter.dates,  fetchCard]);
  useEffect(() => { fetchCard(vehiclesFilter.dates,   setVehiclesVal,   setVehiclesLoading);   }, [vehiclesFilter.dates,   fetchCard]);
  useEffect(() => { fetchCard(subscriptFilter.dates,  setSubscriptVal,  setSubscriptLoading);  }, [subscriptFilter.dates,  fetchCard]);
  useEffect(() => { fetchCard(revenueFilter.dates,    setRevenueVal,    setRevenueLoading);    }, [revenueFilter.dates,    fetchCard]);

  // ── Filtered cards config ────────────────────────────────
  const filteredCards = [
    {
      label:    "Customers",
      value:    customersVal?.totalCustomers ?? 0,
      icon:     Users,
      color:    "from-cyan-500 to-blue-600",
      loading:  customersLoading,
      filter:   customersFilter,
      presets:  PRESET_GROUPS.standard,
      description: "Registered customers",
    },
    {
      label:    "Active Subscriptions",
      value:    subscriptVal?.activeSubscriptions ?? 0,
      icon:     FileText,
      color:    "from-emerald-500 to-green-600",
      loading:  subscriptLoading,
      filter:   subscriptFilter,
      presets:  PRESET_GROUPS.subscription,
      description: "Active plans",
    },
    {
      label:    "Total Revenue",
      value:    revenueVal?.totalRevenue ?? 0,
      icon:     CreditCard,
      color:    "from-violet-500 to-purple-600",
      prefix:   "₹",
      loading:  revenueLoading,
      filter:   revenueFilter,
      presets:  PRESET_GROUPS.revenue,
      description: "Collected revenue",
    },
    {
      label:    "Vehicles",
      value:    vehiclesVal?.totalVehicles ?? 0,
      icon:     Car,
      color:    "from-amber-500 to-orange-600",
      loading:  vehiclesLoading,
      filter:   vehiclesFilter,
      presets:  PRESET_GROUPS.standard,
      description: "Registered vehicles",
    },
  ];

  // ── Static (non-filterable) cards ───────────────────────
  const staticCards = [
    { label: "Washers",             value: staticStats.totalWashers      || 0, icon: Truck,                color: "from-pink-500 to-rose-600" },
    { label: "Today Completed",     value: staticStats.todayCompleted     || 0, icon: CheckCircle2,         color: "from-green-500 to-emerald-600" },
    { label: "Today Pending",       value: staticStats.todayPending       || 0, icon: Clock,                color: "from-yellow-500 to-amber-600" },
    { label: "Total Complaints",    value: staticStats.totalComplaints    || 0, icon: MessageSquareWarning, color: "from-cyan-500 to-blue-600" },
    { label: "Open Complaints",     value: staticStats.openComplaints     || 0, icon: AlertCircle,          color: "from-amber-500 to-orange-600" },
    { label: "Resolved Complaints", value: staticStats.resolvedComplaints || 0, icon: CheckCircle2,         color: "from-emerald-500 to-teal-600" },
  ];

  const allLoading = staticLoading && customersLoading && vehiclesLoading && subscriptLoading && revenueLoading;

  if (allLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gradient accent bar */}
      <div style={{ height: 3, background: "linear-gradient(90deg, #00d4ff, #0066ff)", borderRadius: 2 }} />

      {/* Header + Global Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm">Overview of your business</p>
        </div>

        {/* Global filter */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Dashboard:</span>
          <CardFilter
            presets={PRESET_GROUPS.standard}
            value={globalPreset}
            onChange={handleGlobalChange}
          />
        </div>
      </div>

      {/* ── Filterable Stats Cards (4) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              {...fadeIn}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              style={{ transition: "box-shadow 0.2s ease" }}
              whileHover={{ boxShadow: "0 8px 30px rgba(0,0,0,0.09)" }}
            >
              {/* Card header with filter */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 truncate">{card.label}</span>
                </div>
                <CardFilter
                  presets={card.presets}
                  value={card.filter.preset}
                  onChange={card.filter.handleChange}
                />
              </div>

              {/* Card body */}
              <div className="px-4 pb-4">
                {card.loading ? (
                  <div className="h-8 bg-slate-100 rounded animate-pulse w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    <AnimatedNumber value={card.value} prefix={card.prefix || ""} />
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-0.5">{card.description}</p>
                {card.filter.overridden && (
                  <button
                    onClick={card.filter.reset}
                    className="mt-1.5 text-xs text-indigo-500 hover:text-indigo-700 font-medium underline-offset-2 hover:underline transition"
                  >
                    Reset to global
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Static Cards (Washers, Today Completed/Pending, Complaints) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staticCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              {...fadeIn}
              transition={{ delay: 0.3 + i * 0.07 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 cursor-default"
              whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">{card.label}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {staticLoading ? (
                  <span className="inline-block h-7 w-12 bg-slate-200 rounded animate-pulse" />
                ) : (
                  <AnimatedNumber value={card.value} />
                )}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Live count</p>
            </motion.div>
          );
        })}
      </div>

      {/* ── Charts Row: Payment Overview + Subscription Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fadeIn} transition={{ delay: 0.5 }}>
          <PaymentStats globalDates={globalDates} />
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.6 }}>
          <SubscriptionAnalytics globalDates={globalDates} />
        </motion.div>
      </div>

      {/* ── Charts Row: Customer Growth + Vehicle Registration ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fadeIn} transition={{ delay: 0.65 }}>
          <CustomerGrowthChart globalDates={globalDates} />
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.7 }}>
          <VehicleRegistrationChart globalDates={globalDates} />
        </motion.div>
      </div>
    </div>
  );
}
