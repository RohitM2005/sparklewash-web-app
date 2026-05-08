import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Truck, UserPlus, X } from "lucide-react";
import api from "../../../services/api";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

function AddWasherModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", area: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || !form.password) {
      return setError("Name, email and password are required");
    }
    setSaving(true);
    setError("");
    try {
      await api.post("/admin/washers", form);
      onAdded?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create washer");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Add New Washer</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <div className="space-y-3">
          {[
            { key: "full_name", label: "Full Name", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "phone", label: "Phone", type: "tel" },
            { key: "password", label: "Password", type: "password" },
            { key: "area", label: "Area", type: "text" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-sm text-slate-600 mb-1 block">{f.label}</label>
              <input type={f.type} value={form[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium disabled:opacity-50 hover:shadow-lg transition">
            {saving ? "Creating..." : "Create Washer"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WashersTable() {
  const [washers, setWashers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchWashers = () => {
    setLoading(true);
    api.get("/admin/washers")
      .then(res => setWashers(res.data.washers || []))
      .catch(() => setWashers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWashers(); }, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await api.patch(`/admin/washers/${id}/status`, { status: newStatus });
      setWashers(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
    } catch {}
  };

  return (
    <motion.div {...fadeIn}>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Washer Management</h1>
          <p className="text-gray-500 text-sm">Manage all washers and assignments</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg transition">
          <UserPlus className="w-4 h-4" /> Add Washer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Name", "Email", "Phone", "Area", "Status", "Assigned", "Today Done", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : washers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <Truck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400">No washers found</p>
                </td>
              </tr>
            ) : washers.map(w => (
              <tr key={w.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-3 font-medium text-slate-900">{w.full_name}</td>
                <td className="px-5 py-3 text-slate-600">{w.email}</td>
                <td className="px-5 py-3 text-slate-600">{w.phone || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{w.area || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    w.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}>{w.status}</span>
                </td>
                <td className="px-5 py-3 text-slate-900 font-medium">{w.assigned_vehicles || 0}</td>
                <td className="px-5 py-3 text-slate-900 font-medium">{w.today_completed || 0}</td>
                <td className="px-5 py-3">
                  <button onClick={() => toggleStatus(w.id, w.status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      w.status === "active"
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-green-50 text-green-600 hover:bg-green-100"
                    }`}>
                    {w.status === "active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddWasherModal onClose={() => setShowAddModal(false)} onAdded={fetchWashers} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}