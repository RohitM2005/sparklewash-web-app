import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X, Trash2, Loader2 } from "lucide-react";
import api from "../../../services/api";
import toast, { Toaster } from "react-hot-toast";

const toastStyle = { style: { background: "#1e293b", color: "#fff" } };
const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

function StatusBadge({ status }) {
  const s = status || "pending";
  const colors = {
    active: "bg-green-50 text-green-700", pending: "bg-amber-50 text-amber-700",
    paused: "bg-blue-50 text-blue-700", cancelled: "bg-red-50 text-red-600",
  };
  const dots = { active: "bg-green-500", pending: "bg-amber-500", paused: "bg-blue-500", cancelled: "bg-red-500" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[s] || colors.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[s] || dots.pending}`} />{s}
    </span>
  );
}

export default function SubscriptionsTable() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubscriptions = () => {
    setLoading(true);
    api.get("/admin/subscriptions")
      .then(res => setSubscriptions(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubscriptions(); }, []);

  const analytics = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === "active").length,
    pending: subscriptions.filter(s => s.status === "pending").length,
    cancelled: subscriptions.filter(s => s.status === "cancelled").length,
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/subscriptions/${deleteTarget.id}`);
      setSubscriptions(prev => prev.filter(s => s.id !== deleteTarget.id));
      toast.success("Subscription deleted successfully", toastStyle);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete subscription");
    } finally {
      setDeleting(false);
    }
  };

  const analyticsCards = [
    { label: "Total", value: analytics.total, color: "from-cyan-500 to-blue-600" },
    { label: "Active", value: analytics.active, color: "from-green-500 to-emerald-600" },
    { label: "Pending", value: analytics.pending, color: "from-amber-500 to-orange-600" },
    { label: "Cancelled", value: analytics.cancelled, color: "from-red-500 to-rose-600" },
  ];

  return (
    <motion.div {...fadeIn}>
      <Toaster position="top-right" />
      <div style={{ height: 3, background: "linear-gradient(90deg, #00d4ff, #0066ff)", borderRadius: 2, marginBottom: 16 }} />

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">Subscriptions</h1>
      <p className="text-gray-500 text-sm mb-6">Manage customer subscriptions</p>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {analyticsCards.map((c, i) => (
          <motion.div key={c.label} {...fadeIn} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4"
            whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
            <p className="text-xs text-slate-500 mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
            <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${c.color} mt-2`} />
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["#", "Customer", "Vehicle", "Plan", "Price", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : subscriptions.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-16 text-center">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No subscriptions yet</p>
              </td></tr>
            ) : subscriptions.map((s, i) => (
              <tr key={s.id} className={`hover:bg-cyan-50/30 transition ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                <td className="px-5 py-3 text-slate-400">#{s.id}</td>
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{s.customer_full_name || s.customer_name || "—"}</p>
                  <p className="text-xs text-slate-400">{s.customer_phone || ""}</p>
                </td>
                <td className="px-5 py-3 text-slate-600">{s.vehicle_number || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{s.plan_name || "—"}</td>
                <td className="px-5 py-3 text-slate-900 font-medium">₹{s.monthly_price || 0}</td>
                <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-5 py-3">
                  <button onClick={() => setDeleteTarget(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition border border-red-200 hover:shadow-sm">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={() => setDeleteTarget(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-2">Delete Subscription</h3>
              <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete the subscription for <strong>{deleteTarget.customer_full_name || deleteTarget.customer_name}</strong>? This will permanently remove it from the database and customer panel.</p>
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