import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, UserPlus, X, Check } from "lucide-react";
import api from "../../../services/api";

const statusColors = {
  active: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  paused: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
};

function AssignWasherModal({ subscription, onClose, onAssigned }) {
  const [washers, setWashers] = useState([]);
  const [selectedWasher, setSelectedWasher] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/subscriptions/washers")
      .then(res => setWashers(res.data || []))
      .catch(() => {});
  }, []);

  const handleAssign = async () => {
    if (!selectedWasher) return;
    setSaving(true);
    try {
      await api.patch(`/admin/subscriptions/${subscription.id}/assign-washer`, {
        washer_id: selectedWasher,
      });
      onAssigned?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign washer");
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
          <h2 className="text-lg font-bold">Assign Washer</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Vehicle: <span className="font-medium text-slate-900">{subscription.vehicle_number}</span> ·
          Customer: <span className="font-medium text-slate-900">{subscription.customer_full_name || subscription.customer_name}</span>
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
          {washers.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No active washers found</p>
          ) : washers.map(w => (
            <button key={w.id} onClick={() => setSelectedWasher(w.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition ${
                selectedWasher === w.id ? "bg-cyan-50 border-2 border-cyan-500" : "bg-slate-50 border-2 border-transparent hover:bg-slate-100"
              }`}>
              <div>
                <p className="text-sm font-medium text-slate-900">{w.full_name || w.name}</p>
                <p className="text-xs text-slate-500">{w.phone} · {w.email}</p>
              </div>
              {selectedWasher === w.id && <Check className="w-5 h-5 text-cyan-600" />}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={handleAssign} disabled={!selectedWasher || saving}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium disabled:opacity-50 hover:shadow-lg transition">
            {saving ? "Assigning..." : "Assign Washer"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SubscriptionsTable() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignSub, setAssignSub] = useState(null);

  const fetchSubscriptions = () => {
    setLoading(true);
    api.get("/admin/subscriptions")
      .then(res => setSubscriptions(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSubscriptions(); }, []);

  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["#", "Customer", "Vehicle", "Plan", "Price", "Status", "Washer", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : subscriptions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400">No subscriptions yet</p>
                </td>
              </tr>
            ) : subscriptions.map(s => (
              <tr key={s.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-3 text-slate-400">#{s.id}</td>
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{s.customer_full_name || s.customer_name || "—"}</p>
                  <p className="text-xs text-slate-400">{s.customer_phone || ""}</p>
                </td>
                <td className="px-5 py-3 text-slate-600">{s.vehicle_number || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{s.plan_name || "—"}</td>
                <td className="px-5 py-3 text-slate-900 font-medium">₹{s.monthly_price || 0}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[s.status] || statusColors.pending}`}>
                    {s.status || "pending"}
                  </span>
                </td>
                <td className="px-5 py-3 text-slate-600">{s.washer_full_name || s.washer_name || "—"}</td>
                <td className="px-5 py-3">
                  <button onClick={() => setAssignSub(s)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 text-xs font-medium hover:bg-cyan-100 transition">
                    <UserPlus className="w-3.5 h-3.5" />
                    {s.washer_id ? "Reassign" : "Assign"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {assignSub && (
          <AssignWasherModal subscription={assignSub}
            onClose={() => setAssignSub(null)} onAssigned={fetchSubscriptions} />
        )}
      </AnimatePresence>
    </div>
  );
}