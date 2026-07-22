import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquareWarning, Plus, Send, X, Clock, CheckCircle2,
  AlertCircle, ChevronRight, Car, User, ShieldCheck, RefreshCw, Loader2, MessageSquare
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const CATEGORIES = [
  "Service Quality",
  "Washer Issue",
  "Billing",
  "Vehicle Damage",
  "Late Service",
  "Other"
];

const PRIORITIES = ["Low", "Medium", "High"];

const STATUS_CONFIG = {
  Open: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", label: "Open" },
  "In Progress": { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", label: "In Progress" },
  Resolved: { bg: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500", label: "Resolved" },
  Closed: { bg: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400", label: "Closed" }
};

const PRIORITY_BADGE = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-amber-50 text-amber-800 border-amber-200",
  High: "bg-red-50 text-red-700 border-red-200 font-semibold"
};

export default function CustomerComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Submit Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Service Quality",
    priority: "Medium",
    vehicle_id: ""
  });
  const [submitting, setSubmitting] = useState(false);

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch complaints & vehicles
  const fetchComplaints = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get("/customer/complaints");
      setComplaints(res.data.complaints || []);
    } catch (err) {
      if (!isSilent) toast.error("Failed to load complaints");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await api.get("/customer/vehicles");
      setVehicles(res.data.vehicles || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchVehicles();

    // Periodic polling every 5s for main list updates
    const interval = setInterval(() => {
      fetchComplaints(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Fetch thread detail when a complaint is opened
  const fetchComplaintDetails = async (id, isSilent = false) => {
    if (!isSilent) setLoadingDetails(true);
    try {
      const res = await api.get(`/customer/complaints/${id}`);
      setActiveComplaint(res.data.complaint);
      setMessages(res.data.messages || []);
    } catch (err) {
      if (!isSilent) toast.error("Failed to load complaint details");
    } finally {
      if (!isSilent) setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (!selectedComplaintId) return;

    fetchComplaintDetails(selectedComplaintId);

    // Polling every 4s while thread is active for real-time replies
    const pollThread = setInterval(() => {
      fetchComplaintDetails(selectedComplaintId, true);
    }, 4000);

    return () => clearInterval(pollThread);
  }, [selectedComplaintId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle Submit Form
  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Please enter a title");
    if (!form.description.trim()) return toast.error("Please enter description");

    setSubmitting(true);
    try {
      await api.post("/customer/complaints", form);
      toast.success("Complaint submitted successfully!");
      setForm({
        title: "",
        description: "",
        category: "Service Quality",
        priority: "Medium",
        vehicle_id: ""
      });
      setShowSubmitModal(false);
      fetchComplaints(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Send Reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedComplaintId) return;

    setSendingReply(true);
    try {
      await api.post(`/customer/complaints/${selectedComplaintId}/reply`, {
        message: replyText.trim()
      });
      setReplyText("");
      fetchComplaintDetails(selectedComplaintId, true);
      fetchComplaints(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reply");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <MessageSquareWarning className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Customer Complaints</h1>
            <p className="text-sm text-slate-500 mt-0.5">Submit concerns and get assistance from support</p>
          </div>
        </div>

        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          Submit Complaint
        </button>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse">
              <div className="h-5 bg-slate-100 rounded w-1/3 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-14 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4 text-amber-500">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Complaints Logged</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            If you have any issues regarding service quality, billing, washer, or vehicle damage, click below to log a complaint.
          </p>
          <button
            onClick={() => setShowSubmitModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" /> Submit New Complaint
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.Open;
            const hasUnreadReply = !c.customer_read;

            return (
              <motion.div
                key={c.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedComplaintId(c.id)}
                className={`bg-white border ${
                  hasUnreadReply ? "border-cyan-400 ring-2 ring-cyan-100" : "border-slate-200"
                } rounded-2xl p-4 sm:p-5 hover:shadow-md transition-all cursor-pointer relative overflow-hidden`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        {c.complaint_code}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${PRIORITY_BADGE[c.priority] || PRIORITY_BADGE.Medium}`}>
                        {c.priority} Priority
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {c.category}
                      </span>
                      {hasUnreadReply && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white animate-pulse">
                          New Reply
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 truncate">{c.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">{c.description}</p>

                    {c.vehicle_number && (
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-mono">
                        <Car className="w-3.5 h-3.5 text-slate-400" />
                        {c.vehicle_number} {c.vehicle_model ? `(${c.vehicle_model})` : ""}
                      </p>
                    )}

                    {c.last_admin_reply && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-xs">
                        <ShieldCheck className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-700">Latest Admin Reply: </span>
                          <span className="text-slate-600">{c.last_admin_reply}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 flex-shrink-0">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg}`}>
                      <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </span>

                    <span className="text-[11px] text-slate-400">
                      {new Date(c.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </span>

                    <button className="hidden sm:flex items-center gap-1 text-xs text-cyan-600 font-semibold hover:text-cyan-700 mt-1">
                      View Thread <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* SUBMIT COMPLAINT MODAL */}
      <AnimatePresence>
        {showSubmitModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(10, 15, 30, 0.6)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowSubmitModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col"
            >
              <div style={{ height: 4, background: "linear-gradient(90deg, #f59e0b, #ef4444)" }} />
              
              <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                    <MessageSquareWarning className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Submit New Complaint</h2>
                </div>
                <button onClick={() => setShowSubmitModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitComplaint} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Complaint Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Brief title summarizing the issue"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Priority
                    </label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                    >
                      {PRIORITIES.map((pri) => (
                        <option key={pri} value={pri}>{pri}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {vehicles.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Related Vehicle (Optional)
                    </label>
                    <select
                      value={form.vehicle_id}
                      onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white"
                    >
                      <option value="">Select vehicle (if applicable)</option>
                      {vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.vehicle_number} - {v.vehicle_model}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details about your complaint..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-500 text-white text-sm font-semibold shadow hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submitting ? "Submitting..." : "Submit Complaint"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPLAINT THREAD DRAWER / MODAL */}
      <AnimatePresence>
        {selectedComplaintId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            style={{ background: "rgba(10, 15, 30, 0.65)", backdropFilter: "blur(6px)" }}
            onClick={() => setSelectedComplaintId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-md bg-slate-200 text-slate-800">
                      {activeComplaint?.complaint_code || "..."}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      STATUS_CONFIG[activeComplaint?.status]?.bg || STATUS_CONFIG.Open.bg
                    }`}>
                      {activeComplaint?.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{activeComplaint?.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedComplaintId(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Complaint Summary metadata */}
              <div className="px-5 py-3 bg-cyan-50/50 border-b border-cyan-100 text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-slate-500">Category: </span>
                  <span className="font-semibold text-slate-800">{activeComplaint?.category}</span>
                  <span className="mx-2 text-slate-300">|</span>
                  <span className="text-slate-500">Priority: </span>
                  <span className="font-semibold text-slate-800">{activeComplaint?.priority}</span>
                </div>
                {activeComplaint?.vehicle_number && (
                  <div className="font-mono text-slate-700">
                    Vehicle: <strong>{activeComplaint.vehicle_number}</strong>
                  </div>
                )}
              </div>

              {/* Messages Thread */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                {loadingDetails ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                  </div>
                ) : (
                  messages.map((m) => {
                    const isAdmin = m.sender_role === "admin";

                    return (
                      <div
                        key={m.id}
                        className={`flex gap-3 ${isAdmin ? "justify-start" : "justify-end"}`}
                      >
                        {isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-cyan-400 flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] rounded-2xl p-4 text-sm shadow-sm ${
                            isAdmin
                              ? "bg-white text-slate-800 border border-slate-200"
                              : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-4 mb-1 border-b pb-1 border-slate-100/20 text-[11px] opacity-80">
                            <span className="font-bold">{isAdmin ? "SparkleWash Support" : "You"}</span>
                            <span>
                              {new Date(m.created_at).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">{m.message}</p>
                        </div>

                        {!isAdmin && (
                          <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Composer */}
              <form onSubmit={handleSendReply} className="p-3 sm:p-4 border-t border-slate-200 bg-white flex gap-2">
                <input
                  type="text"
                  placeholder={
                    activeComplaint?.status === "Closed"
                      ? "Reply to reopen this complaint..."
                      : "Write your message..."
                  }
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-sm transition disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                >
                  {sendingReply ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
