import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, DollarSign, Bell, Activity } from "lucide-react";
import api from "../../../services/api";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

function SystemPreferencesTab({ settings, onChange, onSave, saving }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-4">General Settings</h3>
        <div className="space-y-4">
          {[
            { key: "maintenance_mode", label: "Maintenance Mode", desc: "Disable customer access temporarily" },
            { key: "morning_slot_enabled", label: "Morning Slot", desc: "Enable morning wash slot (6AM-12PM)" },
            { key: "afternoon_slot_enabled", label: "Afternoon Slot", desc: "Enable afternoon wash slot (12PM-4PM)" },
            { key: "evening_slot_enabled", label: "Evening Slot", desc: "Enable evening wash slot (4PM-8PM)" },
          ].map(item => (
            <label key={item.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition cursor-pointer ${settings[item.key] === "true" ? "bg-cyan-500" : "bg-slate-300"}`}
                onClick={() => onChange(item.key, settings[item.key] === "true" ? "false" : "true")}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow ${settings[item.key] === "true" ? "translate-x-5.5" : "translate-x-0.5"}`} />
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Service Areas</h3>
        <textarea value={settings.service_areas || '[]'} onChange={e => onChange("service_areas", e.target.value)}
          rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder='["Warje","Kothrud","Bavdhan"]' />
        <p className="text-xs text-slate-400 mt-1">JSON array of service area names</p>
      </div>

      <button onClick={onSave} disabled={saving}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:shadow-lg transition disabled:opacity-50">
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}

function PricingSettingsTab({ settings, onChange, onSave, saving }) {
  const priceFields = [
    { key: "price_micro_daily", label: "Micro (Hatchback)" },
    { key: "price_sedan_daily", label: "Sedan" },
    { key: "price_mini_suv_daily", label: "Mini SUV" },
    { key: "price_suv_daily", label: "SUV" },
    { key: "price_interior_cleaning", label: "Interior Cleaning (Add-on)" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Monthly Pricing (₹)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {priceFields.map(f => (
            <div key={f.key}>
              <label className="text-sm text-slate-600 mb-1 block">{f.label}</label>
              <input type="number" value={settings[f.key] || ""} onChange={e => onChange(f.key, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          ))}
        </div>
      </div>

      <button onClick={onSave} disabled={saving}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:shadow-lg transition disabled:opacity-50">
        {saving ? "Saving..." : "Save Pricing"}
      </button>
    </div>
  );
}

function NotificationTemplatesTab({ settings, onChange, onSave, saving }) {
  const templates = [
    { key: "notif_welcome", label: "Welcome Message", hint: "Variables: {{name}}, {{email}}" },
    { key: "notif_wash_complete", label: "Wash Complete", hint: "Variables: {{name}}, {{vehicle}}, {{date}}" },
    { key: "notif_payment_receipt", label: "Payment Receipt", hint: "Variables: {{name}}, {{amount}}, {{date}}" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Notification Templates</h3>
        <div className="space-y-4">
          {templates.map(t => (
            <div key={t.key}>
              <label className="text-sm font-medium text-slate-700 mb-1 block">{t.label}</label>
              <textarea value={settings[t.key] || ""} onChange={e => onChange(t.key, e.target.value)}
                rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              <p className="text-xs text-slate-400 mt-1">{t.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onSave} disabled={saving}
        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:shadow-lg transition disabled:opacity-50">
        {saving ? "Saving..." : "Save Templates"}
      </button>
    </div>
  );
}

function ActivityLogTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/settings/activity-log")
      .then(res => setLogs(res.data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  return (
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
            <tr><td colSpan={3} className="px-5 py-12 text-center text-slate-400">No activity yet</td></tr>
          ) : logs.map((log, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="px-5 py-3 text-slate-900">{log.admin_full_name || log.admin_name || "System"}</td>
              <td className="px-5 py-3 text-slate-600">{log.action}</td>
              <td className="px-5 py-3 text-slate-400 text-xs">{new Date(log.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SystemPage() {
  const [activeTab, setActiveTab] = useState("preferences");
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultSettings = {
    maintenance_mode: "false",
    morning_slot_enabled: "true",
    afternoon_slot_enabled: "true",
    evening_slot_enabled: "true",
    service_areas: '["Warje","Kothrud","Bavdhan"]',
    price_micro_daily: "499",
    price_sedan_daily: "599",
    price_mini_suv_daily: "699",
    price_suv_daily: "799",
    price_interior_cleaning: "299",
  };

  useEffect(() => {
    api.get("/admin/settings")
      .then(res => setSettings({ ...defaultSettings, ...(res.data || {}) }))
      .catch(() => setSettings(defaultSettings))
      .finally(() => setLoading(false));
  }, []);

  const onChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const onSave = async () => {
    setSaving(true);
    try { await api.post("/admin/settings", settings); } catch {}
    finally { setSaving(false); }
  };

  const tabs = [
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "pricing", label: "Pricing", icon: DollarSign },
    { id: "notifications", label: "Templates", icon: Bell },
    { id: "activity", label: "Activity Log", icon: Activity },
  ];

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl" />)}</div>;

  return (
    <motion.div {...fadeIn}>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">System Settings</h1>
        <p className="text-gray-500 text-sm">Configure system preferences, pricing, and templates</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                activeTab === t.id ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "preferences" && <SystemPreferencesTab settings={settings} onChange={onChange} onSave={onSave} saving={saving} />}
      {activeTab === "pricing" && <PricingSettingsTab settings={settings} onChange={onChange} onSave={onSave} saving={saving} />}
      {activeTab === "notifications" && <NotificationTemplatesTab settings={settings} onChange={onChange} onSave={onSave} saving={saving} />}
      {activeTab === "activity" && <ActivityLogTab />}
    </motion.div>
  );
}
