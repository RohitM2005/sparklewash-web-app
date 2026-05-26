import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Car, Search, X, Pencil, Trash2, Loader2 } from "lucide-react";
import api from "../../../services/api";
import toast, { Toaster } from "react-hot-toast";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const toastStyle = { style: { background: "#1e293b", color: "#fff" } };
const typeLabels = { micro: "Hatchback", sedan: "Sedan", mini_suv: "Mini SUV", suv: "SUV" };

function StatusBadge({ status }) {
  if (!status) return <span className="text-xs text-slate-400">No sub</span>;
  const colors = {
    active: "bg-green-50 text-green-700", cancelled: "bg-red-50 text-red-600",
    pending: "bg-amber-50 text-amber-700", paused: "bg-blue-50 text-blue-700",
  };
  const dots = { active: "bg-green-500", cancelled: "bg-red-500", pending: "bg-amber-500", paused: "bg-blue-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status] || dots.pending}`} />{status}
    </span>
  );
}

function EditVehicleModal({ vehicle, washers, onClose, onSaved }) {
  const [form, setForm] = useState({
    vehicle_number: vehicle?.vehicle_number || "",
    vehicle_model: vehicle?.vehicle_model || "",
    vehicle_type: vehicle?.vehicle_type || "sedan",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.vehicle_number) { toast.error("Vehicle number required"); return; }
    setSaving(true);
    try {
      await api.patch(`/admin/vehicles/${vehicle.id}`, form);
      toast.success("Vehicle updated", toastStyle);
      onSaved?.(); onClose();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to update"); }
    finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: "linear-gradient(90deg, #00d4ff, #0066ff)" }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Edit Vehicle</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-600 mb-1 block">Vehicle Number</label>
              <input value={form.vehicle_number} onChange={e => setForm(p => ({ ...p, vehicle_number: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1 block">Vehicle Model</label>
              <input value={form.vehicle_model} onChange={e => setForm(p => ({ ...p, vehicle_model: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-1 block">Vehicle Type</label>
              <select value={form.vehicle_type} onChange={e => setForm(p => ({ ...p, vehicle_type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
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
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium disabled:opacity-50 hover:shadow-lg flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VehiclesTable() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editVehicle, setEditVehicle] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchVehicles = () => {
    setLoading(true);
    api.get("/admin/vehicles")
      .then(res => setVehicles(res.data.vehicles || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVehicles(); }, []);

  const filtered = vehicles.filter(v => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (v.vehicle_number || "").toLowerCase().includes(s) ||
           (v.owner_name || "").toLowerCase().includes(s) ||
           (v.vehicle_type || "").toLowerCase().includes(s) ||
           (v.vehicle_model || "").toLowerCase().includes(s);
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/vehicles/${deleteTarget.id}`);
      setVehicles(prev => prev.filter(v => v.id !== deleteTarget.id));
      toast.success("Vehicle deleted", toastStyle);
      setDeleteTarget(null);
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  return (
    <motion.div {...fadeIn}>
      <Toaster position="top-right" />
      <div style={{ height: 3, background: "linear-gradient(90deg, #00d4ff, #0066ff)", borderRadius: 2, marginBottom: 16 }} />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Vehicle Management</h1>
        <p className="text-gray-500 text-sm">All registered customer vehicles</p>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by number, owner, type..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Vehicle", "Type", "Owner", "Phone", "Plan", "Status", "Registered", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-16 text-center">
                <Car className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No vehicles found</p>
              </td></tr>
            ) : filtered.map((v, i) => (
              <tr key={v.id} className={`hover:bg-cyan-50/30 transition ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{v.vehicle_number}</p>
                  <p className="text-xs text-slate-400">{v.vehicle_model || ""}</p>
                </td>
                <td className="px-5 py-3 text-slate-600">{typeLabels[v.vehicle_type] || v.vehicle_type}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{v.owner_name || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{v.owner_phone || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{v.plan_name || "—"}</td>
                <td className="px-5 py-3"><StatusBadge status={v.subscription_status} /></td>
                <td className="px-5 py-3 text-slate-400 text-xs">{v.created_at ? new Date(v.created_at).toLocaleDateString() : "—"}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setEditVehicle(v)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-cyan-600" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(v)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editVehicle && <EditVehicleModal vehicle={editVehicle} onClose={() => setEditVehicle(null)} onSaved={fetchVehicles} />}
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-2">Delete Vehicle</h3>
              <p className="text-sm text-slate-600 mb-6">Delete <strong>{deleteTarget.vehicle_number}</strong>? This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 flex items-center justify-center gap-2">
                  {deleting && <Loader2 className="w-4 h-4 animate-spin" />} {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}