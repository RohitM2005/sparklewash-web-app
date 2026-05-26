import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Truck, UserPlus, X, Pencil, Trash2, Loader2 } from "lucide-react";
import api from "../../../services/api";
import toast, { Toaster } from "react-hot-toast";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const toastStyle = { style: { background: "#1e293b", color: "#fff" } };

function StatusBadge({ status }) {
  const s = status || "active";
  const c = { active: "bg-green-500", suspended: "bg-red-500" };
  const bg = { active: "bg-green-50 text-green-700", suspended: "bg-red-50 text-red-600" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg[s] || bg.active}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c[s] || c.active}`} />{s}
    </span>
  );
}

/* ── Add/Edit Washer Modal ── */
function WasherFormModal({ washer, onClose, onSaved }) {
  const isEdit = !!washer;
  const [form, setForm] = useState({
    full_name: washer?.full_name || "", email: washer?.email || "",
    phone: washer?.phone || "", password: "", area: washer?.area || "",
    status: washer?.status || "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.full_name || !form.email || (!isEdit && !form.password)) {
      return setError(isEdit ? "Name and email required" : "Name, email and password required");
    }
    setSaving(true); setError("");
    try {
      if (isEdit) {
        await api.patch(`/admin/washers/${washer.id}`, {
          full_name: form.full_name, email: form.email, phone: form.phone,
          address: form.area, status: form.status,
        });
        toast.success("Washer updated", toastStyle);
      } else {
        await api.post("/admin/washers", form);
        toast.success("Washer created", toastStyle);
      }
      onSaved?.(); onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed");
    } finally { setSaving(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(12px)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: "linear-gradient(90deg, #00d4ff, #0066ff)" }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">{isEdit ? "Edit Washer" : "Add New Washer"}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
          <div className="space-y-3">
            {[
              { key: "full_name", label: "Full Name", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Phone", type: "tel" },
              ...(!isEdit ? [{ key: "password", label: "Password", type: "password" }] : []),
              { key: "area", label: "Area", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-sm text-slate-600 mb-1 block">{f.label}</label>
                <input type={f.type} value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
            ))}
            {isEdit && (
              <div>
                <label className="text-sm text-slate-600 mb-1 block">Status</label>
                <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium disabled:opacity-50 hover:shadow-lg transition flex items-center justify-center gap-2">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Washer"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Delete Confirm ── */
function DeleteConfirm({ name, onClose, onConfirm, deleting }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: "linear-gradient(90deg, #ef4444, #dc2626)", borderRadius: "8px 8px 0 0", margin: "-24px -24px 16px -24px" }} />
        <h3 className="text-lg font-bold mb-2">Delete Washer</h3>
        <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 flex items-center justify-center gap-2">
            {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function WashersTable() {
  const [washers, setWashers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editWasher, setEditWasher] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchWashers = () => {
    setLoading(true);
    api.get("/admin/washers")
      .then(res => setWashers(res.data.washers || []))
      .catch(() => setWashers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWashers(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/washers/${deleteTarget.id}`);
      setWashers(prev => prev.filter(w => w.id !== deleteTarget.id));
      toast.success("Washer deleted", toastStyle);
      setDeleteTarget(null);
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await api.patch(`/admin/washers/${id}/status`, { status: newStatus });
      setWashers(prev => prev.map(w => w.id === id ? { ...w, status: newStatus } : w));
      toast.success(`Washer ${newStatus}`, toastStyle);
    } catch { toast.error("Failed to update status"); }
  };

  return (
    <motion.div {...fadeIn}>
      <Toaster position="top-right" />
      <div style={{ height: 3, background: "linear-gradient(90deg, #00d4ff, #0066ff)", borderRadius: 2, marginBottom: 16 }} />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Washer Management</h1>
          <p className="text-gray-500 text-sm">Manage all washers and assignments</p>
        </div>
        <button onClick={() => { setEditWasher(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg transition"
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
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
              <tr><td colSpan={8} className="px-5 py-16 text-center">
                <Truck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No washers found</p>
                <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-cyan-600 hover:underline">Add your first washer</button>
              </td></tr>
            ) : washers.map((w, i) => (
              <tr key={w.id} className={`hover:bg-cyan-50/30 transition ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                <td className="px-5 py-3 font-medium text-slate-900">{w.full_name}</td>
                <td className="px-5 py-3 text-slate-600">{w.email}</td>
                <td className="px-5 py-3 text-slate-600">{w.phone || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{w.area || "—"}</td>
                <td className="px-5 py-3"><StatusBadge status={w.status} /></td>
                <td className="px-5 py-3 text-slate-900 font-medium">{w.assigned_vehicles || 0}</td>
                <td className="px-5 py-3 text-slate-900 font-medium">{w.today_completed || 0}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditWasher(w); setShowForm(true); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-cyan-600" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleStatus(w.id, w.status)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        w.status === "active" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}>
                      {w.status === "active" ? "Suspend" : "Activate"}
                    </button>
                    <button onClick={() => setDeleteTarget(w)}
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
        {showForm && <WasherFormModal washer={editWasher} onClose={() => setShowForm(false)} onSaved={fetchWashers} />}
        {deleteTarget && <DeleteConfirm name={deleteTarget.full_name} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} deleting={deleting} />}
      </AnimatePresence>
    </motion.div>
  );
}