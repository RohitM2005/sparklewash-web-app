import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquareWarning, Search, Filter, CheckCircle2, Clock,
  AlertCircle, Eye, Check, X, RefreshCw, Loader2, Car, User, AlertTriangle
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import api from "../../../services/api";
import AdminComplaintDetailModal from "./AdminComplaintDetailModal";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const STATUS_OPTIONS = ["all", "Open", "In Progress", "Resolved", "Closed"];
const CATEGORY_OPTIONS = [
  "all",
  "Service Quality",
  "Washer Issue",
  "Billing",
  "Vehicle Damage",
  "Late Service",
  "Other"
];
const PRIORITY_OPTIONS = ["all", "Low", "Medium", "High"];

const STATUS_BADGE = {
  Open: "bg-amber-50 text-amber-700 border-amber-200",
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Resolved: "bg-green-50 text-green-700 border-green-200",
  Closed: "bg-slate-100 text-slate-600 border-slate-200"
};

const PRIORITY_BADGE = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-amber-50 text-amber-800 border-amber-200",
  High: "bg-red-50 text-red-700 border-red-200 font-semibold"
};

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Selected complaint modal
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);

  const fetchComplaints = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await api.get(`/admin/complaints?${params.toString()}`);
      setComplaints(res.data.complaints || []);
    } catch (err) {
      if (!isSilent) toast.error("Failed to load complaints");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get("/admin/complaints/stats");
      setStats(res.data.stats || { total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchStats();

    // Poll every 5s for real-time table & stats updates
    const interval = setInterval(() => {
      fetchComplaints(true);
      fetchStats();
    }, 5000);

    return () => clearInterval(interval);
  }, [statusFilter, categoryFilter, priorityFilter, search]);

  const handleQuickStatusChange = async (e, id, newStatus) => {
    e.stopPropagation();
    try {
      await api.patch(`/admin/complaints/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchComplaints(true);
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Customer Complaints</h1>
          <p className="text-slate-500 text-sm">Manage customer tickets, resolve issues, and send replies</p>
        </div>

        <button
          onClick={() => { fetchComplaints(); fetchStats(); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* Stats Cards Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center flex-shrink-0 font-bold">
            <MessageSquareWarning className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Complaints</p>
            <p className="text-xl font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Open Complaints</p>
            <p className="text-xl font-bold text-amber-600">{stats.open}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">In Progress</p>
            <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0 font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Resolved</p>
            <p className="text-xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4 justify-between">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Complaint ID, Title, Customer, or Vehicle..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Categories</option>
              {CATEGORY_OPTIONS.filter((c) => c !== "all").map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mb-2" />
            <p className="text-sm text-slate-500">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquareWarning className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Complaints Found</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing search filters or check back later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Complaint ID</th>
                  <th className="py-3.5 px-4">Customer Name</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs">
                {complaints.map((c) => {
                  const hasUnread = !c.admin_read;

                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedComplaintId(c.id)}
                      className={`hover:bg-slate-50/80 cursor-pointer transition ${
                        hasUnread ? "bg-cyan-50/30" : ""
                      }`}
                    >
                      {/* Complaint ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {hasUnread && (
                            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping flex-shrink-0" />
                          )}
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {c.complaint_code}
                          </span>
                        </div>
                      </td>

                      {/* Customer Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">{c.customer_name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{c.customer_email}</div>
                      </td>

                      {/* Vehicle */}
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {c.vehicle_number ? (
                          <span>{c.vehicle_number}</span>
                        ) : (
                          <span className="text-slate-400 italic">N/A</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                          {c.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[11px] ${PRIORITY_BADGE[c.priority] || PRIORITY_BADGE.Medium}`}>
                          {c.priority}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={c.status}
                          onChange={(e) => handleQuickStatusChange(e, c.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${STATUS_BADGE[c.status]} bg-white focus:outline-none cursor-pointer`}
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedComplaintId(c.id)}
                            title="View & Reply"
                            className="p-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-600 font-semibold transition flex items-center gap-1 text-[11px] px-2"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>

                          {c.status !== "Resolved" && (
                            <button
                              onClick={(e) => handleQuickStatusChange(e, c.id, "Resolved")}
                              title="Mark Resolved"
                              className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 font-semibold transition flex items-center gap-1 text-[11px] px-2"
                            >
                              <Check className="w-3.5 h-3.5" /> Resolve
                            </button>
                          )}

                          {c.status !== "Closed" && (
                            <button
                              onClick={(e) => handleQuickStatusChange(e, c.id, "Closed")}
                              title="Close Complaint"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition text-[11px] px-2"
                            >
                              Close
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaintId && (
        <AdminComplaintDetailModal
          complaintId={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
          onUpdated={() => {
            fetchComplaints(true);
            fetchStats();
          }}
        />
      )}
    </motion.div>
  );
}
