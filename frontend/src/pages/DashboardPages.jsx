import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useOutletContext } from "react-router-dom";
import {
  Menu, Car, Calendar, Bell,
  History, CreditCard, Receipt, Settings as SettingsIcon,
  User, Loader2, Trash2,
  ArrowLeft, X, ChevronDown, AlertCircle, AlertTriangle,
  CheckCircle2, Info, ChevronRight,
} from "lucide-react";
import { startOfMonth, format } from "date-fns";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import Sidebar from "../components/Dashboard/SideBar";
import StatsCard from "../components/Dashboard/StatsCard";
import WashCalendar from "../components/Dashboard/WashCalendar";
import SubscriptionCard from "../components/Dashboard/SubscriptionCard";
import RenewSubscriptionBtn from "../components/Dashboard/RenewSubscriptionBtn";
import Loader from "../components/common/Loader";
import InvoiceModal from "../components/Billing/InvoiceModal";
import { getDashboardData } from "../services/dashboard.service";
import api from "../services/api";

const toastStyle = { style: { background: "#1e293b", color: "#fff" } };

function fmt(d) {
  if (!d) return "—";
  const str = String(d).split("T")[0];
  const parts = str.split("-");
  if (parts.length === 3) {
    const [y, m, day] = parts;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthName = months[parseInt(m, 10) - 1];
    if (monthName) return `${parseInt(day, 10)} ${monthName} ${y}`;
  }
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return String(d);
  return dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ============================================ */
/* 1. DASHBOARD LAYOUT                          */
/* ============================================ */

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getDashboardData();
        setUser(data?.user || null);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
          <button className="p-2 rounded-md hover:bg-slate-100 transition" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-900 text-base">SparkleWash</span>
        </header>
        <main className="flex-1">
          <Outlet context={{ user, setUser }} />
        </main>
      </div>
    </div>
  );
}

/* ============================================ */
/* NEXT RENEWAL CARD                             */
/* ============================================ */

const URGENCY_STYLES = {
  red:    { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    badge: "bg-red-100 text-red-700",    icon: AlertCircle,    iconCls: "text-red-500",    label: "Expiring Soon!" },
  yellow: { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  badge: "bg-amber-100 text-amber-700",  icon: AlertTriangle,  iconCls: "text-amber-500", label: "Renew Soon" },
  green:  { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  badge: "bg-green-100 text-green-700",  icon: CheckCircle2,   iconCls: "text-green-500", label: "On Track" },
};

function NextRenewalCard({ nextRenewal, delay = 0.05 }) {
  const navigate = useNavigate();
  if (!nextRenewal) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white rounded-2xl p-3 sm:p-5 lg:p-6 border border-slate-200 hover:shadow-xl transition-all duration-300"
      >
        <p className="text-slate-500 text-xs sm:text-sm font-medium">Next Renewal</p>
        <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-slate-400 mt-1">—</p>
        <p className="text-slate-400 text-xs mt-1">No active plans</p>
      </motion.div>
    );
  }

  const u = URGENCY_STYLES[nextRenewal.urgency] || URGENCY_STYLES.green;
  const UrgIcon = u.icon;
  const renewalStr = nextRenewal.renewalDate
    ? new Date(nextRenewal.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
      className={`${u.bg} rounded-2xl p-3 sm:p-5 lg:p-6 border ${u.border} hover:shadow-xl transition-all duration-300 cursor-pointer`}
      onClick={() => navigate("/dashboard/wash-history")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <Bell className="w-3.5 h-3.5 text-slate-500" />
            <p className="text-slate-500 text-xs sm:text-sm font-medium">Next Renewal</p>
          </div>
          <p className="text-base sm:text-xl font-bold text-slate-900 truncate leading-tight">
            {nextRenewal.vehicleName}
          </p>
          {nextRenewal.vehicleNumber && (
            <p className="font-mono text-[10px] sm:text-xs text-slate-500 tracking-widest mt-0.5">
              {nextRenewal.vehicleNumber}
            </p>
          )}
          <p className="text-xs text-slate-600 mt-1 font-medium">{renewalStr}</p>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${u.badge}`}>
            <UrgIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${u.iconCls}`} />
          </div>
          <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${u.badge}`}>
            {nextRenewal.daysLeft}d left
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================================ */
/* RENEWAL SUMMARY PANEL                         */
/* ============================================ */

function RenewalSummaryPanel({ renewalSummary, count }) {
  if (!renewalSummary || count <= 1) return null;
  const { red = 0, yellow = 0, green = 0 } = renewalSummary;
  if (red === 0 && yellow === 0) return null; // all green, no need to show

  const items = [
    red    > 0 && { emoji: "🔴", label: `${red} vehicle${red > 1 ? "s" : ""} expiring within 7 days`,  cls: "bg-red-50 border-red-100 text-red-800" },
    yellow > 0 && { emoji: "🟡", label: `${yellow} vehicle${yellow > 1 ? "s" : ""} expiring within 30 days`, cls: "bg-amber-50 border-amber-100 text-amber-800" },
    green  > 0 && { emoji: "🟢", label: `${green} vehicle${green > 1 ? "s" : ""} active beyond 30 days`,    cls: "bg-green-50 border-green-100 text-green-800" },
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5"
    >
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Renewal Summary</p>
      <div className="flex flex-col sm:flex-row flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border ${item.cls}`}>
            {item.emoji} {item.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

/* ============================================ */
/* 2. DASHBOARD OVERVIEW                        */
/* ============================================ */

const PAGE_SIZE = 4; // cards shown before "Show More"

export function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white border rounded-2xl shadow p-6 text-center">
          <h1 className="text-lg font-semibold mb-2 text-slate-900">Dashboard unavailable</h1>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <a href="/home" className="inline-block px-4 py-2 rounded-md bg-cyan-600 text-white text-sm hover:bg-cyan-700">Go to Home</a>
        </div>
      </div>
    );
  }

  const { user, activeSubscriptions = [], stats = {}, nextRenewal, renewalSummary } = dashboardData;

  const count = activeSubscriptions.length;
  const gridCols =
    count === 1 ? "grid-cols-1 max-w-lg"
    : "grid-cols-1 sm:grid-cols-2";

  const visibleSubs = showAll ? activeSubscriptions : activeSubscriptions.slice(0, PAGE_SIZE);
  const hasMore = activeSubscriptions.length > PAGE_SIZE;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Welcome back, {user?.full_name?.split(" ")[0]}
          </p>
        </div>
        <BackToHomeBtn />
      </div>

      {/* Stat Cards — 2 standard + 1 smart Next Renewal */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatsCard
          title="Active Vehicles"
          value={stats.activeVehicles || 0}
          subtitle="Registered"
          icon={Car}
          color="purple"
          delay={0}
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions || 0}
          subtitle="Current plans"
          icon={Calendar}
          color="cyan"
          delay={0.1}
        />
        {/* Smart Next Renewal card (replaces Days Left) */}
        <NextRenewalCard nextRenewal={nextRenewal} delay={0.05} />
      </div>

      {/* Renewal Summary Banner (only shown when urgency > 0) */}
      <RenewalSummaryPanel renewalSummary={renewalSummary} count={count} />

      {/* Subscriptions Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">
            {count === 0
              ? "Subscriptions"
              : count === 1
              ? "Your Subscription"
              : `Your Subscriptions (${count})`}
          </h2>
          {count > 1 && (
            <p className="text-xs text-slate-400">Sorted by renewal date</p>
          )}
        </div>

        {count === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <Car className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">No Active Subscriptions</h3>
            <p className="text-sm text-slate-500 mb-4">Book a car wash plan to get started.</p>
            <a
              href="/booking"
              className="inline-block px-5 py-2 rounded-xl text-sm text-white font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition"
            >
              Book Now
            </a>
          </div>
        ) : (
          <>
            <div className={`grid ${gridCols} gap-4`}>
              {visibleSubs.map((sub, idx) => (
                <SubscriptionCard key={sub.id} subscription={sub} index={idx} />
              ))}
            </div>

            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowAll(p => !p)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
                  {showAll ? "Show Less" : `Show ${activeSubscriptions.length - PAGE_SIZE} More`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================ */
/* 3. WASH HISTORY                              */
/* ============================================ */

const timeSlotLabels = {
  morning: "Morning (6–9 AM)",
  afternoon: "Afternoon (12–3 PM)",
  evening: "Evening (5–8 PM)",
};

export function WashHistory() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [vehicleDetail, setVehicleDetail] = useState(null);
  const [washRecords, setWashRecords] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [error, setError] = useState("");

  // Step 1: fetch all customer vehicles
  useEffect(() => {
    api.get("/customer/vehicles")
      .then(res => {
        const v = res.data.vehicles || [];
        setVehicles(v);
        if (v.length > 0) {
          // Default to first vehicle
          setSelectedVehicleId(v[0].id);
        }
      })
      .catch(() => setError("Failed to load vehicles"))
      .finally(() => setLoadingVehicles(false));
  }, []);

  // Step 2: fetch wash history whenever selected vehicle changes
  const fetchVehicleHistory = useCallback(async (vehicleId) => {
    if (!vehicleId) return;
    setLoadingHistory(true);
    setError("");
    try {
      const res = await api.get(`/customer/wash-history/${vehicleId}`);
      setVehicleDetail(res.data.vehicle || null);
      setWashRecords(res.data.washHistory || []);
    } catch (err) {
      console.error("Failed to load wash history for vehicle", vehicleId, ":", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load wash history");
      setWashRecords([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (selectedVehicleId) {
      fetchVehicleHistory(selectedVehicleId);
      const interval = setInterval(() => {
        api.get(`/customer/wash-history/${selectedVehicleId}`)
          .then(res => {
            if (res.data.washHistory) {
              setWashRecords(res.data.washHistory);
            }
          })
          .catch(() => {});
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedVehicleId, fetchVehicleHistory]);

  const handleVehicleChange = (e) => {
    setSelectedVehicleId(Number(e.target.value));
    setCurrentMonth(startOfMonth(new Date()));
  };

  if (loadingVehicles) return <Loader />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Page header */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Wash History</h1>
            <p className="text-sm text-slate-500 mt-0.5">Your completed and scheduled washes</p>
          </div>
        </div>

        {/* 0 vehicles */}
        {vehicles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <Car className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="font-semibold text-slate-900 mb-2">No Vehicles Registered</h3>
            <p className="text-sm text-slate-500">
              Add a vehicle and subscribe to a wash plan to see your history.
            </p>
          </div>
        ) : (
          <>
            {/* ── Vehicle Selector ── */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                Select Vehicle
              </label>
              <div className="relative inline-block w-full sm:w-auto min-w-[220px]">
                <select
                  id="vehicle-history-selector"
                  value={selectedVehicleId || ""}
                  onChange={handleVehicleChange}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm cursor-pointer"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_number}{v.vehicle_model ? ` — ${v.vehicle_model}` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* ── Selected Vehicle Detail Card ── */}
            {vehicleDetail && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Vehicle</p>
                    <p className="font-bold text-slate-900 font-mono tracking-widest text-xs sm:text-sm">
                      {vehicleDetail.vehicle_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Plan</p>
                    <p className="font-semibold text-slate-700">
                      {vehicleDetail.plan_name || "No Plan"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      vehicleDetail.sub_status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {vehicleDetail.sub_status === "active" ? "● Active" : "○ No Subscription"}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Renewal</p>
                    <p className="font-semibold text-slate-700">
                      {vehicleDetail.renewal_date
                        ? new Date(vehicleDetail.renewal_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-5 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* ── Calendar (with loading overlay) ── */}
            <div className="relative">
              {loadingHistory && (
                <div className="absolute inset-0 bg-white/70 rounded-2xl z-10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
              )}
              <WashCalendar
                washRecords={washRecords}
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
              />
            </div>

            {/* ── Recent Wash Activity & Reported Issues ── */}
            {!loadingHistory && washRecords.length > 0 && (
              <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span>📋</span> Recent Wash Activity & Notes
                </h3>
                <div className="space-y-3">
                  {washRecords.slice(0, 15).map((r) => {
                    const isCompleted = r.status === "completed";
                    const isIssue = r.status === "issue_reported" || r.status === "skipped" || !!r.issue_type;
                    const catInfo = r.issue_type ? issueCategoryMap[r.issue_type] || { label: r.issue_type.replace(/_/g, " "), emoji: "⚠️" } : null;

                    return (
                      <div
                        key={r.id}
                        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                          isCompleted
                            ? "bg-green-50/50 border-green-200"
                            : isIssue
                            ? "bg-red-50/50 border-red-200"
                            : "bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                              isCompleted
                                ? "bg-green-100 text-green-700"
                                : isIssue
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {isCompleted ? "✓" : isIssue ? "✕" : "•"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900 text-sm">
                                {r.wash_date
                                  ? new Date(r.wash_date).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  isCompleted
                                    ? "bg-green-100 text-green-800"
                                    : isIssue
                                    ? "bg-red-100 text-red-800"
                                    : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {isCompleted
                                  ? "Car Washed"
                                  : isIssue
                                  ? `Car Not Washed${catInfo ? ` (${catInfo.label})` : ""}`
                                  : r.status}
                              </span>
                            </div>
                            {(r.issue_note || r.washer_note) && (
                              <p className="text-xs text-slate-600 mt-1 font-medium">
                                <span className="text-slate-400">Note:</span> {r.issue_note || r.washer_note}
                              </p>
                            )}
                          </div>
                        </div>

                        {r.washed_at && (
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(r.washed_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty history hint */}
            {!loadingHistory && !error && washRecords.length === 0 && (
              <div className="mt-4 flex items-start gap-2 text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
                <span>No wash records found for this vehicle yet.</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const issueCategoryMap = {
  car_not_available: { label: "Car Not Available" },
  parking_locked:    { label: "Parking Locked" },
  rain:              { label: "Rain Issue" },
  customer_complaint:{ label: "Customer Issue" },
  other:             { label: "Other Issue" },
};

/* ============================================ */
/* BACK TO HOME BUTTON                          */
/* ============================================ */

function BackToHomeBtn() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/home')}
      className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
      style={{ border: '1.5px solid rgba(0, 212, 255, 0.4)', color: '#00d4ff', background: 'transparent' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 212, 255, 0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Home
    </button>
  );
}

/* ============================================ */
/* 4. VEHICLES — Full CRUD                      */
/* ============================================ */

const typeLabels = { micro: "Hatchback", sedan: "Sedan", mini_suv: "Mini SUV", suv: "SUV" };

function VehicleFormModal({ vehicle, onClose, onSaved }) {
  const isEdit = !!vehicle;
  const [form, setForm] = useState({
    vehicle_number: vehicle?.vehicle_number || "",
    vehicle_model: vehicle?.vehicle_model || "",
    vehicle_type: vehicle?.vehicle_type || "sedan",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.vehicle_number.trim()) return toast.error("Vehicle number required");
    if (!form.vehicle_model.trim()) return toast.error("Model required");
    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/customer/vehicles/${vehicle.id}`, form);
        toast.success("Vehicle updated successfully");
      } else {
        await api.post("/customer/vehicles", form);
        toast.success("Vehicle added successfully");
      }
      onSaved?.(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: "linear-gradient(90deg, #a855f7, #6366f1)" }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">{isEdit ? "Edit Vehicle" : "Add Vehicle"}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-600 mb-1 block">Vehicle Number</label>
              <input value={form.vehicle_number} onChange={e => setForm(p => ({ ...p, vehicle_number: e.target.value.toUpperCase() }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="MH 12 XX 1234" />
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1 block">Model Name</label>
              <input value={form.vehicle_model} onChange={e => setForm(p => ({ ...p, vehicle_model: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Maruti Swift" />
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1 block">Vehicle Type</label>
              <select value={form.vehicle_type} onChange={e => setForm(p => ({ ...p, vehicle_type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="micro">Hatchback</option>
                <option value="sedan">Sedan</option>
                <option value="mini_suv">Mini SUV</option>
                <option value="suv">SUV</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Vehicle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVehicles = () => {
    setLoading(true);
    api.get("/customer/vehicles")
      .then(res => setVehicles(res.data.vehicles || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/customer/vehicles/${deleteTarget.id}`);
      setVehicles(prev => prev.filter(v => v.id !== deleteTarget.id));
      toast.success("Vehicle removed");
      setDeleteTarget(null);
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Vehicles</h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage your registered vehicles</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {[1,2].map(i => <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse"><div className="h-6 bg-slate-100 rounded mb-3"/><div className="h-4 bg-slate-100 rounded w-2/3 mb-2"/><div className="h-4 bg-slate-100 rounded w-1/2"/></div>)}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">No vehicles added yet</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">Book a service to add your vehicle.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {vehicles.map(v => (
              <div key={v.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                      <Car className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900 tracking-wide">{v.vehicle_number}</p>
                      <p className="text-xs text-slate-500">{v.vehicle_model || "—"} · {typeLabels[v.vehicle_type] || v.vehicle_type}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div><span className="text-slate-400">Plan:</span> <span className="font-medium text-slate-700">{v.plan_name || "No Sub"}</span></div>
                  <div><span className="text-slate-400">Status:</span> {v.sub_status === "active" ? <span className="text-green-600 font-medium">● Active</span> : <span className="text-slate-400">No Sub</span>}</div>
                  <div><span className="text-slate-400">Added:</span> <span className="font-medium text-slate-700">{v.created_at ? new Date(v.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</span></div>
                </div>
                {/* Start Date & Renewal Date */}
                <div className="flex gap-6 mb-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Start Date</span>
                    <span className="font-semibold text-slate-700">{v.start_date ? new Date(v.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5">End Date (Renewal)</span>
                    <span className="font-semibold" style={{ color: "#0066ff" }}>{v.renewal_date ? new Date(v.renewal_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => setDeleteTarget(v)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showForm && <VehicleFormModal vehicle={editVehicle} onClose={() => setShowForm(false)} onSaved={fetchVehicles} />}

        {/* Delete Confirm */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={() => setDeleteTarget(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-2">Remove Vehicle</h3>
              <p className="text-sm text-slate-600 mb-6">Are you sure you want to remove <strong>{deleteTarget.vehicle_number}</strong>? This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 flex items-center justify-center gap-2">
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {deleting ? "Removing..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================ */
/* 5. BILLING — Unpaid bills + payment history   */
/* ============================================ */

function PaymentStatusBadge({ status }) {
  const s = (status || "pending").toLowerCase();
  const colors = {
    paid: "bg-green-50 text-green-700 border border-green-200",
    success: "bg-green-50 text-green-700 border border-green-200",
    captured: "bg-green-50 text-green-700 border border-green-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    created: "bg-amber-50 text-amber-700 border border-amber-200",
    failed: "bg-red-50 text-red-600 border border-red-200",
    cancelled: "bg-slate-100 text-slate-600 border border-slate-200",
    refunded: "bg-purple-50 text-purple-700 border border-purple-200",
  };
  const dots = {
    paid: "bg-green-500", success: "bg-green-500", captured: "bg-green-500",
    pending: "bg-amber-500", created: "bg-amber-500",
    failed: "bg-red-500", cancelled: "bg-slate-400", refunded: "bg-purple-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${colors[s] || colors.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[s] || dots.pending}`} />{s}
    </span>
  );
}

export function Billing() {
  const [payments, setPayments] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBills, setLoadingBills] = useState(true);
  const [paying, setPaying] = useState(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);

  const fetchPaymentHistory = () => {
    getDashboardData()
      .then(data => setPayments(data?.payments || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };

  const fetchUnpaidBills = () => {
    api.get("/customer/billing/unpaid")
      .then(res => setUnpaidBills(res.data.data || []))
      .catch(() => setUnpaidBills([]))
      .finally(() => setLoadingBills(false));
  };

  useEffect(() => {
    fetchPaymentHistory();
    fetchUnpaidBills();
  }, []);

  const handlePayBill = async (bill) => {
    setPaying(bill.payment_id);
    try {
      const res = await api.post("/customer/billing/pay", {
        payment_id: bill.payment_id,
        amount: bill.total,
      });

      const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder";

      const options = {
        key: RAZORPAY_KEY,
        amount: Math.round(bill.total * 100),
        currency: "INR",
        name: "SparkleWash",
        description: `Bill for ${bill.bill_month || ""}`,
        order_id: res.data.razorpay_order_id,
        handler: async (response) => {
          try {
            await api.post("/customer/billing/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_id: bill.payment_id,
            });
            toast.success("Bill paid successfully! 🎉", toastStyle);
            fetchUnpaidBills();
            fetchPaymentHistory();
          } catch (err) {
            toast.error("Payment verification failed: " + (err.response?.data?.error || err.message));
          }
          setPaying(null);
        },
        theme: { color: "#00d4ff" },
        modal: {
          ondismiss: () => { setPaying(null); toast.error("Payment cancelled"); },
        },
      };

      if (typeof window.Razorpay !== "undefined") {
        new window.Razorpay(options).open();
      } else {
        toast.error("Payment gateway not available. Please refresh.");
        setPaying(null);
      }
    } catch (error) {
      toast.error("Payment failed: " + (error.response?.data?.error || error.message));
      setPaying(null);
    }
  };

  if (loading && loadingBills) return <Loader />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Billing</h1>
            <p className="text-sm text-slate-500 mt-0.5">Payments, invoices, and subscription billing details</p>
          </div>
        </div>

        {/* ─── Unpaid Bills ─── */}
        {loadingBills ? (
          <div className="space-y-4 mb-8">
            {[1,2].map(i => <div key={i} className="bg-white border rounded-2xl p-6 animate-pulse"><div className="h-6 bg-slate-100 rounded mb-3" /><div className="h-4 bg-slate-100 rounded w-2/3" /></div>)}
          </div>
        ) : unpaidBills.length > 0 ? (
          <div className="space-y-5 mb-8">
            {unpaidBills.map(bill => {
              const washerItem = bill.items?.find(i => (i.item_name || "").toLowerCase().includes("washer"));

              return (
                <div key={bill.payment_id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm mb-6">
                  {/* Bill Header */}
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">💳 Invoice & Bill Details</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Includes all vehicle plans, add-on services, and washer charges</p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 flex-shrink-0">
                      Pending Payment
                    </span>
                  </div>

                  {/* Optional Bill Note */}
                  {bill.bill_note && (
                    <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      📝 <strong className="font-semibold">Note from Admin:</strong> {bill.bill_note}
                    </div>
                  )}

                  {/* 1. Vehicle Plans Breakdown */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2.5 flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                      <span>Vehicle Plans</span>
                      <span className="text-[11px] font-normal text-slate-500">Subscription Charges</span>
                    </p>
                    {bill.vehicle_billing?.length > 0 ? (
                      <div className="space-y-2">
                        {bill.vehicle_billing.map(vh => (
                          <div key={vh.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-0">
                            <div>
                              <span className="font-bold text-slate-900 font-mono tracking-wide">{vh.vehicle_number}</span>
                              {vh.vehicle_model ? <span className="text-slate-600 font-medium ml-1.5">({vh.vehicle_model})</span> : ""}
                              {vh.plan_name ? <span className="text-slate-400 text-[10px] block">{vh.plan_name}</span> : ""}
                            </div>
                            <span className="font-bold text-blue-700 text-sm">
                              ₹{Number(vh.monthly_price || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-medium text-slate-700">Monthly Plan</span>
                        <span className="font-bold text-blue-700 text-sm">
                          ₹{Number(bill.items?.find(i => i.item_type === "monthly")?.amount || bill.total || 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 2. Add-On Services Breakdown */}
                  {bill.addon_services?.length > 0 && (
                    <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-3.5 mb-4">
                      <p className="text-xs font-bold text-purple-900 uppercase tracking-wide mb-2 flex items-center justify-between border-b border-purple-100 pb-1">
                        <span>Add-On Services</span>
                        <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                          {bill.addon_services.length}
                        </span>
                      </p>
                      <div className="space-y-1.5">
                        {bill.addon_services.map(svc => (
                          <div key={svc.id} className="bg-white rounded-lg px-3 py-2 border border-purple-100 flex items-center justify-between gap-2 shadow-xs">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 leading-tight">{svc.service_type}</p>
                              <p className="text-[11px] text-cyan-700 font-semibold leading-tight font-mono">
                                {svc.vehicle_number}{svc.vehicle_model ? ` (${svc.vehicle_model})` : ""}
                              </p>
                              <p className="text-[10px] text-slate-400 leading-tight">
                                {fmt(svc.service_date)}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-purple-700 flex-shrink-0">
                              ₹{Number(svc.amount || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3. Washer Charges (Separate) */}
                  {washerItem && (
                    <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-blue-900">Washer Charges</p>
                        <p className="text-[10px] text-blue-600">Assigned washer service fee</p>
                      </div>
                      <span className="text-sm font-bold text-blue-700">
                        +₹{Number(washerItem.amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  {/* 4. Total Payable Amount */}
                  <div className="bg-slate-900 text-white rounded-xl p-4 mb-4 flex items-center justify-between shadow-md">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">Total Payable Amount</p>
                      <p className="text-[10px] text-cyan-400 mt-0.5">Vehicle Plans + Services + Washer Charges</p>
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-cyan-300">
                      ₹{Number(bill.total || 0).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Pay Button */}
                  <button onClick={() => handlePayBill(bill)} disabled={paying === bill.payment_id}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg hover:opacity-95"
                    style={{ background: "linear-gradient(135deg, #00d4ff, #0066ff)" }}>
                    {paying === bill.payment_id ? (<><Loader2 className="w-4 h-4 animate-spin" />Processing Payment…</>) : `✓ Pay Bill — ₹${Number(bill.total || 0).toLocaleString("en-IN")}`}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center mb-8">
            <div className="text-4xl mb-3">✅</div>
            <p className="font-semibold text-slate-800">No pending bills</p>
            <p className="text-xs text-slate-400 mt-1">Your account is all clear</p>
          </div>
        )}

        {/* ─── Payment History ─── */}
        <h2 className="text-lg font-bold text-slate-900 mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">No billing history</h3>
            <p className="text-sm text-slate-500 max-w-xs mx-auto">Subscribe to a plan to see your billing details here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {["Date", "Plan", "Amount", "Method", "Status", "Invoice"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p, i) => {
                  const isPaid = ["paid", "captured", "success"].includes((p.status || "").toLowerCase());
                  return (
                    <tr key={p.id || i} className={`hover:bg-cyan-50/30 transition ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                      <td className="px-5 py-3 text-slate-600 text-xs">{p.paid_at ? new Date(p.paid_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : p.created_at ? new Date(p.created_at).toLocaleDateString("en-IN") : "—"}</td>
                      <td className="px-5 py-3 text-slate-700 font-medium">{p.plan_name || "—"}</td>
                      <td className="px-5 py-3 text-slate-900 font-medium">₹{p.amount || 0}</td>
                      <td className="px-5 py-3 text-slate-600 capitalize">{p.payment_method || "—"}</td>
                      <td className="px-5 py-3"><PaymentStatusBadge status={p.status} /></td>
                      <td className="px-5 py-3">
                        {isPaid ? (
                          <button
                            onClick={() => setSelectedInvoiceId(p.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 hover:underline bg-cyan-50 border border-cyan-200 px-2.5 py-1 rounded-lg transition"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>View Invoice</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceId && (
        <InvoiceModal
          paymentId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  );
}


/* ============================================ */
/* 6. SETTINGS (Full DB-connected)              */
/* ============================================ */

/* ============================================ */
/* 6. SETTINGS (Full DB-connected)              */
/* ============================================ */

export function Settings() {
  const ctx = useOutletContext();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your profile information</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <ProfileTab onUserUpdate={ctx?.setUser} />
        </div>
      </div>
    </div>
  );
}

/* ── Profile Tab ── */
function ProfileTab({ onUserUpdate }) {
  const [form, setForm] = useState({ full_name: "", phone: "", email: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/customer/profile")
      .then(res => {
        const p = res.data.profile || {};
        setForm({
          full_name: p.full_name || p.name || "",
          phone: p.phone || "",
          email: p.email || "",
          address: p.address || "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.full_name.trim()) return toast.error("Full name is required");
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return toast.error("Valid email address is required");
    }
    const rawPhone = form.phone ? form.phone.trim() : "";
    const cleanPhone = rawPhone.replace(/^(\+91|91)/, "").replace(/[\s\-]/g, "");
    if (rawPhone && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return toast.error("Valid 10-digit Indian phone number is required");
    }

    setSaving(true);
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: cleanPhone || rawPhone || "",
        address: form.address ? form.address.trim() : "",
      };
      const res = await api.patch("/customer/profile", payload);
      const updated = res.data.profile || res.data.data || payload;
      toast.success(res.data.message || "Profile updated successfully", toastStyle);
      onUserUpdate?.(prev => ({
        ...prev,
        full_name: updated.full_name || updated.name || form.full_name,
        name: updated.name || updated.full_name || form.full_name,
        email: updated.email || form.email,
        phone: updated.phone || form.phone,
        address: updated.address || form.address,
      }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="font-semibold text-lg text-slate-900">Profile Information</h3>
        <p className="text-sm text-slate-500 mt-1">Update your personal details below</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
          <input type="text" value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
          <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" placeholder="+91 98765 43210" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
          <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" placeholder="user@example.com" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
          <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 transition resize-none" placeholder="Flat No, Building, Street, Area, City" />
        </div>
      </div>
      <div className="pt-2">
        <button onClick={handleSave} disabled={saving}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}