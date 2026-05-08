import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, X, Image, Filter } from "lucide-react";
import api from "../../../services/api";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const statusColors = {
  pending: "bg-amber-100 text-amber-700",
  washing: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  skipped: "bg-slate-100 text-slate-600",
  issue_reported: "bg-red-100 text-red-600",
};

function PhotoLightbox({ url, onClose }) {
  if (!url) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/40">
        <X className="w-6 h-6 text-white" />
      </button>
      <img src={url} alt="Wash photo" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
    </motion.div>
  );
}

export default function WashLogsTable() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [photoUrl, setPhotoUrl] = useState(null);

  const fetchRecords = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateFilter) params.append("date", dateFilter);
    if (statusFilter) params.append("status", statusFilter);
    const qs = params.toString() ? `?${params.toString()}` : "";

    api.get(`/admin/wash-records${qs}`)
      .then(res => setRecords(res.data.records || []))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRecords(); }, [dateFilter, statusFilter]);

  const statuses = ["", "pending", "washing", "completed", "skipped", "issue_reported"];

  return (
    <motion.div {...fadeIn}>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Wash Logs</h1>
        <p className="text-gray-500 text-sm">View all wash records with before/after photos</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
          <option value="">All Statuses</option>
          {statuses.filter(Boolean).map(s => (
            <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
          ))}
        </select>
        {(dateFilter || statusFilter) && (
          <button onClick={() => { setDateFilter(""); setStatusFilter(""); }}
            className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 transition">
            Clear Filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Date", "Customer", "Vehicle", "Washer", "Status", "Before 📷", "After 📷", "Duration", "Note"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={9} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-12 text-center">
                  <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400">No wash records found</p>
                </td>
              </tr>
            ) : records.map(r => (
              <tr key={r.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-3 text-slate-600 text-xs">{r.wash_date ? new Date(r.wash_date).toLocaleDateString() : "—"}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{r.customer_name || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{r.vehicle_number || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{r.washer_name || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || statusColors.pending}`}>
                    {(r.status || "pending").replace("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {r.before_photo_url ? (
                    <button onClick={() => setPhotoUrl(r.before_photo_url)}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:border-cyan-400 transition">
                      <img src={r.before_photo_url} alt="Before" className="w-full h-full object-cover" />
                    </button>
                  ) : <span className="text-slate-300 text-xs">—</span>}
                </td>
                <td className="px-5 py-3">
                  {r.after_photo_url ? (
                    <button onClick={() => setPhotoUrl(r.after_photo_url)}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:border-cyan-400 transition">
                      <img src={r.after_photo_url} alt="After" className="w-full h-full object-cover" />
                    </button>
                  ) : <span className="text-slate-300 text-xs">—</span>}
                </td>
                <td className="px-5 py-3 text-slate-600">{r.wash_duration_minutes ? `${r.wash_duration_minutes} min` : "—"}</td>
                <td className="px-5 py-3 text-slate-500 text-xs max-w-[150px] truncate">
                  {r.washer_note || r.issue_note || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {photoUrl && <PhotoLightbox url={photoUrl} onClose={() => setPhotoUrl(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}