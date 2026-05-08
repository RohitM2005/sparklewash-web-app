import React, { useState, useEffect } from "react";
import { History, Car, CheckCircle, Clock, AlertTriangle, X } from "lucide-react";
import api from "../../services/api";

export default function WashHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/customer/wash-history");
        setRecords(Array.isArray(res.data) ? res.data : res.data.records || []);
      } catch (err) {
        console.error("Wash history fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const statusBadge = (status) => {
    const map = {
      completed: { bg: "bg-green-100 text-green-700", icon: <CheckCircle className="w-3.5 h-3.5" /> },
      pending: { bg: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3.5 h-3.5" /> },
      skipped: { bg: "bg-red-100 text-red-700", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    };
    const s = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg}`}>
        {s.icon} {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Wash History</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Your completed and scheduled washes
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {records.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Car className="w-14 h-14 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No wash history yet 🚗</p>
              <p className="text-slate-400 text-sm mt-1">Your completed washes will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Vehicle</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Washer</th>
                    <th className="px-6 py-3 text-center">Before</th>
                    <th className="px-6 py-3 text-center">After</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                        {new Date(r.wash_date || r.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-800">{r.vehicle_number}</span>
                        {r.vehicle_model && (
                          <span className="block text-xs text-slate-400 mt-0.5">{r.vehicle_model}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{statusBadge(r.status)}</td>
                      <td className="px-6 py-4 text-slate-600">{r.washer_name || "—"}</td>
                      <td className="px-6 py-4 text-center">
                        {r.before_photo_url ? (
                          <img
                            src={r.before_photo_url}
                            alt="Before"
                            className="w-12 h-12 rounded-lg object-cover mx-auto cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all"
                            onClick={() => setLightbox(r.before_photo_url)}
                          />
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {r.after_photo_url ? (
                          <img
                            src={r.after_photo_url}
                            alt="After"
                            className="w-12 h-12 rounded-lg object-cover mx-auto cursor-pointer hover:ring-2 hover:ring-cyan-400 transition-all"
                            onClick={() => setLightbox(r.after_photo_url)}
                          />
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-lg hover:bg-slate-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-slate-700" />
            </button>
            <img
              src={lightbox}
              alt="Wash proof"
              className="w-full rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}