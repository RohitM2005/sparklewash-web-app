import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ClipboardList, UserPlus, CheckCircle, Loader2 } from "lucide-react";
import api from "../../../services/api";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

function StatusBadge({ status }) {
  const s = status || "pending";
  const colors = {
    pending: "bg-amber-50 text-amber-700", washing: "bg-blue-50 text-blue-700",
    completed: "bg-green-50 text-green-700", skipped: "bg-slate-100 text-slate-600",
    issue_reported: "bg-red-50 text-red-600",
  };
  const dots = {
    pending: "bg-amber-500", washing: "bg-blue-500", completed: "bg-green-500",
    skipped: "bg-slate-400", issue_reported: "bg-red-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[s] || colors.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[s] || dots.pending}`} />
      {(s || "pending").replace("_", " ")}
    </span>
  );
}

function VerifyBadge({ verified }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
        <CheckCircle className="w-3 h-3" /> Verified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
      Pending
    </span>
  );
}

export default function WashLogsTable() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verifyingId, setVerifyingId] = useState(null);

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

  const handleVerify = async (id) => {
    setVerifyingId(id);
    try {
      await api.patch(`/admin/wash-records/${id}/verify`);
      setRecords((prev) =>
        prev.map((r) => r.id === id ? { ...r, verified: 1, verified_at: new Date().toISOString() } : r)
      );
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    } finally {
      setVerifyingId(null);
    }
  };

  const statuses = ["", "pending", "washing", "completed", "skipped", "issue_reported"];

  return (
    <motion.div {...fadeIn}>
      <div style={{ height: 3, background: "linear-gradient(90deg, #00d4ff, #0066ff)", borderRadius: 2, marginBottom: 16 }} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Wash Logs</h1>
          <p className="text-gray-500 text-sm">View all wash records and verify completed washes</p>
        </div>
        <button
          onClick={() => navigate("/admin/washlogs/assign")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:scale-105"
        >
          <UserPlus className="w-4 h-4" />
          Assign Vehicles for Wash
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
          <option value="">All Statuses</option>
          {statuses.filter(Boolean).map(s => (
            <option key={s} value={s}>{s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>
          ))}
        </select>
        {(dateFilter || statusFilter) && (
          <button onClick={() => { setDateFilter(""); setStatusFilter(""); }}
            className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 transition">
            Clear Filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Date", "Customer", "Vehicle", "Washer", "Status", "Duration", "Note", "Verified", "Action"].map(h => (
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
              <tr><td colSpan={9} className="px-5 py-16 text-center">
                <ClipboardList className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No wash records found</p>
                <p className="text-slate-300 text-xs mt-1">Try adjusting your filters</p>
              </td></tr>
            ) : records.map((r, i) => (
              <tr key={r.id} className={`hover:bg-cyan-50/30 transition ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                <td className="px-5 py-3 text-slate-600 text-xs">{r.wash_date ? new Date(r.wash_date).toLocaleDateString() : "—"}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{r.customer_name || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{r.vehicle_number || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{r.washer_name || "—"}</td>
                <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-3 text-slate-600">{r.wash_duration_minutes ? `${r.wash_duration_minutes} min` : "—"}</td>
                <td className="px-5 py-3 text-slate-500 text-xs max-w-[150px] truncate">
                  {r.washer_note || r.issue_note || "—"}
                </td>
                <td className="px-5 py-3">
                  {r.status === "completed" ? (
                    <VerifyBadge verified={r.verified} />
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  {r.status === "completed" && !r.verified ? (
                    <button
                      onClick={() => handleVerify(r.id)}
                      disabled={verifyingId === r.id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition border border-green-200 disabled:opacity-50"
                    >
                      {verifyingId === r.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3.5 h-3.5" />
                      )}
                      Verify
                    </button>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}