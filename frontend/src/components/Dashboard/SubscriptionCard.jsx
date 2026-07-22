import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Car, Calendar, Clock, CheckCircle2, AlertTriangle,
  AlertCircle, ChevronRight, Tag, Wrench, ChevronDown, ChevronUp,
} from "lucide-react";
import api from "../../services/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const TIME_LABELS = {
  morning:   "Morning (6–9 AM)",
  afternoon: "Afternoon (12–3 PM)",
  evening:   "Evening (5–8 PM)",
};

const TYPE_LABELS = {
  micro:    "Hatchback",
  sedan:    "Sedan",
  mini_suv: "Mini SUV",
  suv:      "SUV",
};

const STATUS_CONFIG = {
  active:    { label: "Active",    cls: "bg-green-100 text-green-700",  dot: "bg-green-500"  },
  paused:    { label: "Paused",    cls: "bg-amber-100 text-amber-700",  dot: "bg-amber-500"  },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-600",     dot: "bg-red-500"    },
  pending:   { label: "Pending",   cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400"  },
};

const URGENCY = {
  red: {
    badge:   "bg-red-100 text-red-700 border border-red-200",
    header:  "from-red-500 to-rose-600",
    ring:    "ring-red-200",
    icon:    AlertCircle,
    iconCls: "text-red-500",
    label:   "Expiring Soon!",
  },
  yellow: {
    badge:   "bg-amber-100 text-amber-700 border border-amber-200",
    header:  "from-amber-500 to-orange-500",
    ring:    "ring-amber-200",
    icon:    AlertTriangle,
    iconCls: "text-amber-500",
    label:   "Renew Soon",
  },
  green: {
    badge:   "bg-green-100 text-green-700 border border-green-200",
    header:  "from-cyan-500 to-blue-600",
    ring:    "ring-green-200",
    icon:    CheckCircle2,
    iconCls: "text-green-500",
    label:   "Active",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatINR(n) {
  return Number(n || 0).toLocaleString("en-IN");
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Empty state ───────────────────────────────────────────────────────────────

function NoSubscription({ index }) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl p-6 border border-dashed border-slate-300 text-center"
    >
      <Car className="w-10 h-10 mx-auto text-slate-300 mb-3" />
      <h3 className="font-semibold text-slate-900 mb-1 text-sm">No Active Subscription</h3>
      <p className="text-xs text-slate-500 mb-4">Start a wash plan for this vehicle</p>
      <button
        onClick={() => navigate("/booking")}
        className="px-4 py-2 rounded-xl text-xs text-white font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition"
      >
        Subscribe Now
      </button>
    </motion.div>
  );
}

// ── Additional Services History (per vehicle) ─────────────────────────────────

function AdditionalServicesSection({ vehicleId, basePrice }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!vehicleId) { setLoading(false); return; }
    api.get(`/customer/vehicles/${vehicleId}/addon-services`)
      .then(r => setServices(r.data.services || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
        {[1, 2].map(i => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}
      </div>
    );
  }

  // Filter to billable services only
  const billable = services.filter(s =>
    ["paid", "completed", "pending_payment"].includes(s.status)
  );
  const addonsTotal = billable.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const grandTotal  = Number(basePrice || 0) + addonsTotal;

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      {/* Section header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between text-left mb-3"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
            <Wrench className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
            Additional Services
            {billable.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold normal-case">
                {billable.length}
              </span>
            )}
          </p>
        </div>
        {expanded
          ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        }
      </button>

      {expanded && (
        <>
          {billable.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2 text-center">No additional services</p>
          ) : (
            <div className="space-y-0">
              {billable.map((svc, idx) => (
                <div key={svc.id}>
                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 leading-tight">{svc.service_type}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {formatDate(svc.service_date)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-900 flex-shrink-0 ml-2">
                      ₹{formatINR(svc.amount)}
                    </p>
                  </div>
                  {idx < billable.length - 1 && <div className="border-b border-slate-100 ml-3" />}
                </div>
              ))}
            </div>
          )}

          {/* Billing Breakdown */}
          <div className="mt-3 bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Monthly Plan</span>
              <span className="font-semibold text-slate-800">₹{formatINR(basePrice)}</span>
            </div>
            {addonsTotal > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Additional Services</span>
                <span className="font-semibold text-purple-700">₹{formatINR(addonsTotal)}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-1.5 flex justify-between">
              <span className="text-xs font-bold text-slate-900">Total Charges</span>
              <span className="text-sm font-bold text-blue-700">₹{formatINR(grandTotal)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────

export default function SubscriptionCard({ subscription, index = 0 }) {
  const navigate = useNavigate();
  if (!subscription) return <NoSubscription index={index} />;

  const urgencyKey  = subscription.urgency || "green";
  const urg         = URGENCY[urgencyKey] || URGENCY.green;
  const UrgIcon     = urg.icon;

  const statusInfo  = STATUS_CONFIG[subscription.status] || STATUS_CONFIG.pending;
  const daysLeft    = subscription.daysLeft ?? 0;
  const plan        = subscription.plan || { name: subscription.plan_name || "Daily Wash", basePrice: Number(subscription.monthly_price) };
  const basePrice   = plan.basePrice ?? Number(subscription.monthly_price) ?? 0;

  const vehicleName   = subscription.vehicle_model  || subscription.vehicle_number || "Vehicle";
  const vehicleNumber = subscription.vehicle_number || "";
  const vehicleType   = TYPE_LABELS[subscription.vehicle_type] || subscription.vehicle_type || "—";
  const timeSlot      = TIME_LABELS[subscription.preferred_time] || "Morning (6–9 AM)";
  const startDate     = formatDate(subscription.start_date);
  const renewalDate   = formatDate(subscription.renewal_date);

  const showRenewBtn  = subscription.status !== "active" || daysLeft <= 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 280, damping: 24 }}
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ring-1 ${urg.ring}`}
    >
      {/* ── Header ── */}
      <div className={`bg-gradient-to-r ${urg.header} px-4 sm:px-5 pt-4 sm:pt-5 pb-4`}>
        <div className="flex items-start justify-between gap-3">
          {/* Vehicle identity */}
          <div className="min-w-0">
            <p className="text-white/80 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
              {plan.name}
            </p>
            <h3 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
              {vehicleName}
            </h3>
            {vehicleNumber && (
              <p className="text-white/75 text-xs font-mono tracking-[0.2em] mt-0.5">
                {vehicleNumber}
              </p>
            )}
          </div>

          {/* Days left badge */}
          <div className="flex-shrink-0 text-right">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
              <UrgIcon className="w-3.5 h-3.5" />
              {daysLeft}d left
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-4 sm:p-5 space-y-4">

        {/* ── Details Grid (type, slot, start, renewal, days) ── */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {/* Vehicle Type */}
          <div className="flex items-start gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Car className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Type</p>
              <p className="text-xs font-semibold text-slate-700 truncate">{vehicleType}</p>
            </div>
          </div>

          {/* Time Slot */}
          <div className="flex items-start gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-cyan-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Slot</p>
              <p className="text-xs font-semibold text-slate-700 truncate">{timeSlot}</p>
            </div>
          </div>

          {/* Start Date */}
          <div className="flex items-start gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Start Date</p>
              <p className="text-xs font-semibold text-slate-700 truncate">{startDate}</p>
            </div>
          </div>

          {/* Renewal Date */}
          <div className="flex items-start gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Renewal</p>
              <p className="text-xs font-semibold text-slate-700 truncate">{renewalDate}</p>
            </div>
          </div>

          {/* Days Left — full width */}
          <div className="col-span-2 flex items-start gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
              urgencyKey === "red" ? "bg-red-50" : urgencyKey === "yellow" ? "bg-amber-50" : "bg-green-50"
            }`}>
              <UrgIcon className={`w-3.5 h-3.5 ${urg.iconCls}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">Days Left</p>
              <p className={`text-xs font-bold ${
                urgencyKey === "red" ? "text-red-600" : urgencyKey === "yellow" ? "text-amber-600" : "text-green-600"
              }`}>
                {daysLeft} {daysLeft === 1 ? "Day" : "Days"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Monthly Price highlight ── */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Monthly Plan</span>
          </div>
          <span className="text-base font-bold text-blue-700">
            ₹{formatINR(basePrice)}<span className="text-xs font-normal text-slate-400">/mo</span>
          </span>
        </div>

        {/* ── Additional Services History + Billing Breakdown ── */}
        <AdditionalServicesSection
          vehicleId={subscription.vehicle_id}
          basePrice={basePrice}
        />

        {/* ── Status Footer ── */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusInfo.cls}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
            {statusInfo.label}
          </span>
          {showRenewBtn && (
            <button
              onClick={() => navigate("/booking")}
              className="flex items-center gap-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition"
            >
              Renew <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}