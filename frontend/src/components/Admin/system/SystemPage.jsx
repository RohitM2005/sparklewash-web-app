import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Settings, DollarSign, Bell, Activity, Loader2 } from "lucide-react";
import api from "../../../services/api";
import toast, { Toaster } from "react-hot-toast";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const toastStyle = { style: { background: "#1e293b", color: "#fff" } };

/* ── Toggle Component ── */
function Toggle({ checked, onChange, label, desc }) {
  return (
    <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition">
      <div>
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${checked ? "bg-cyan-500" : "bg-slate-300"}`}>
        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-200 shadow ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
    </label>
  );
}

/* ═══ Tab 1: Preferences ═══ */
function PreferencesTab() {
  const [prefs, setPrefs] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/settings/preferences")
      .then(res => setPrefs(res.data.settings || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (key, val) => {
    const newVal = val ? "true" : "false";
    setPrefs(p => ({ ...p, [key]: newVal }));
    try {
      await api.put("/admin/settings/preferences", { [key]: newVal });
      toast.success("Settings saved", toastStyle);
    } catch { toast.error("Failed to save"); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}</div>;

  const toggles = [
    { key: "maintenance_mode", label: "Maintenance Mode", desc: "Disable customer access temporarily" },
    { key: "morning_slot_enabled", label: "Morning Slot (6AM–12PM)", desc: "Enable morning wash slot" },
    { key: "evening_slot_enabled", label: "Evening Slot (4PM–8PM)", desc: "Enable evening wash slot" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="font-semibold text-slate-900 mb-4">General Settings</h3>
      <div className="space-y-1">
        {toggles.map(t => (
          <Toggle key={t.key} label={t.label} desc={t.desc}
            checked={prefs[t.key] === "true"}
            onChange={(val) => handleToggle(t.key, val)} />
        ))}
      </div>
    </div>
  );
}

/* ═══ Tab 2: Pricing ═══ */
function PricingTab() {
  const [pricing, setPricing] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/settings/pricing")
      .then(res => setPricing(res.data.settings || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    // Validate positive numbers
    const fields = ["price_micro_daily","price_sedan_daily","price_mini_suv_daily","price_suv_daily","price_interior_cleaning"];
    for (const f of fields) {
      const v = Number(pricing[f]);
      if (pricing[f] !== undefined && pricing[f] !== "" && (isNaN(v) || v < 0)) {
        toast.error(`Invalid value for ${f.replace("price_","").replace(/_/g," ")}`);
        return;
      }
    }
    setSaving(true);
    try {
      await api.put("/admin/settings/pricing", pricing);
      toast.success("Pricing updated successfully and applied system-wide.", toastStyle);
    } catch { toast.error("Failed to save pricing"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-xl" />)}</div>;

  const priceFields = [
    { key: "price_micro_daily", label: "Micro / Hatchback (₹)" },
    { key: "price_sedan_daily", label: "Sedan (₹)" },
    { key: "price_mini_suv_daily", label: "Mini SUV (₹)" },
    { key: "price_suv_daily", label: "SUV (₹)" },
    { key: "price_interior_cleaning", label: "Interior Cleaning Add-on (₹)" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Monthly Pricing (₹)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {priceFields.map(f => (
            <div key={f.key}>
              <label className="text-sm text-slate-600 mb-1 block">{f.label}</label>
              <input type="number" min="0" value={pricing[f.key] || ""}
                onChange={e => setPricing(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleSave} disabled={saving}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? "Saving..." : "Save Pricing"}
      </button>
    </div>
  );
}

/* ═══ Tab 3: Templates ═══ */
function TemplatesTab() {
  const [templates, setTemplates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/settings/templates")
      .then(res => setTemplates(res.data.settings || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/admin/settings/templates", templates);
      toast.success("Templates saved", toastStyle);
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}</div>;

  const tpls = [
    { key: "notif_welcome", label: "Welcome Message", hint: "Variables: {{name}}, {{email}}" },
    { key: "notif_wash_complete", label: "Wash Complete", hint: "Variables: {{name}}, {{vehicle}}, {{date}}" },
    { key: "notif_payment_receipt", label: "Payment Receipt", hint: "Variables: {{name}}, {{amount}}, {{date}}" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Notification Templates</h3>
        <div className="space-y-4">
          {tpls.map(t => (
            <div key={t.key}>
              <label className="text-sm font-medium text-slate-700 mb-1 block">{t.label}</label>
              <textarea value={templates[t.key] || ""} onChange={e => setTemplates(p => ({ ...p, [t.key]: e.target.value }))}
                rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <p className="text-xs text-slate-400 mt-1">{t.hint}</p>
            </div>
          ))}
        </div>
      </div>
      <button onClick={handleSave} disabled={saving}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        {saving ? "Saving..." : "Save Templates"}
      </button>
    </div>
  );
}

/* ═══ Tab 4: Activity Log ═══ */
function ActivityLogTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const intervalRef = useRef(null);

  const fetchLogs = () => {
    const qs = dateFilter ? `?date=${dateFilter}` : "";
    api.get(`/admin/activity-log${qs}`)
      .then(res => setLogs(res.data.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, [dateFilter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    intervalRef.current = setInterval(fetchLogs, 30000);
    return () => clearInterval(intervalRef.current);
  }, [dateFilter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        {dateFilter && (
          <button onClick={() => setDateFilter("")}
            className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm hover:bg-slate-200">Clear</button>
        )}
        <span className="text-xs text-slate-400 ml-auto">Auto-refreshes every 30s</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Admin</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Action</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={3} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : logs.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-16 text-center">
                <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No activity yet</p>
              </td></tr>
            ) : logs.map((log, i) => (
              <tr key={log.id || i} className={`hover:bg-cyan-50/30 transition ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                <td className="px-5 py-3 text-slate-900 font-medium">{log.admin_name || "System"}</td>
                <td className="px-5 py-3 text-slate-600">{log.action}</td>
                <td className="px-5 py-3 text-slate-400 text-xs">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ */
export default function SystemPage() {
  const [activeTab, setActiveTab] = useState("preferences");

  const tabs = [
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "templates", label: "Templates", icon: Bell },
    { id: "activity", label: "Activity Log", icon: Activity },
  ];

  return (
    <motion.div {...fadeIn}>
      <Toaster position="top-right" />
      <div style={{ height: 3, background: "linear-gradient(90deg, #00d4ff, #0066ff)", borderRadius: 2, marginBottom: 16 }} />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">System Settings</h1>
        <p className="text-gray-500 text-sm">Configure system preferences, pricing, and templates</p>
      </div>

      {/* Pill-style tabs with sliding indicator */}
      <div className="relative inline-flex bg-slate-100 rounded-xl p-1 mb-6 flex-wrap gap-1">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 z-10 ${
                isActive
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "preferences" && <PreferencesTab />}
      {activeTab === "pricing" && <PricingTab />}
      {activeTab === "templates" && <TemplatesTab />}
      {activeTab === "activity" && <ActivityLogTab />}
    </motion.div>
  );
}
