import React, { useState, useEffect, useRef } from "react";
import {
  X, User, Car, Phone, Mail, Clock, Send, ShieldCheck,
  CheckCircle2, AlertCircle, RefreshCw, Loader2, MapPin
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import api from "../../../services/api";

const STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

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

export default function AdminComplaintDetailModal({ complaintId, onClose, onUpdated }) {
  const [complaint, setComplaint] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const messagesEndRef = useRef(null);

  const fetchDetails = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get(`/admin/complaints/${complaintId}`);
      setComplaint(res.data.complaint);
      setMessages(res.data.messages || []);
      if (!status) setStatus(res.data.complaint.status);
    } catch (err) {
      if (!isSilent) toast.error("Failed to load complaint details");
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    if (complaintId) {
      fetchDetails();

      // Real-time update: Poll every 4 seconds while modal is open
      const interval = setInterval(() => {
        fetchDetails(true);
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [complaintId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    try {
      const res = await api.post(`/admin/complaints/${complaintId}/reply`, {
        message: replyText.trim(),
        status
      });
      toast.success("Reply sent successfully!");
      setReplyText("");
      if (res.data.status) setStatus(res.data.status);
      fetchDetails(true);
      onUpdated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      await api.patch(`/admin/complaints/${complaintId}/status`, { status: newStatus });
      setStatus(newStatus);
      toast.success(`Status changed to ${newStatus}`);
      fetchDetails(true);
      onUpdated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!complaintId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden border border-slate-200 h-[90vh] flex flex-col"
      >
        {/* Top Gradient Accent */}
        <div style={{ height: 4, background: "linear-gradient(90deg, #00d4ff, #0066ff)" }} />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {complaint?.complaint_code || "..."}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
                {complaint?.title}
              </h2>
              <p className="text-xs text-slate-400">
                Logged on {complaint?.created_at ? new Date(complaint.created_at).toLocaleString("en-IN") : "..."}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            
            {/* LEFT COLUMN: Customer Info, Vehicle Info & Status Actions */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 p-4 sm:p-5 space-y-4 overflow-y-auto bg-slate-50/70">
              
              {/* Status & Quick Actions */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_BADGE[status] || STATUS_BADGE.Open}`}>
                    {status}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Change Status
                  </label>
                  <select
                    value={status}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold bg-white focus:ring-2 focus:ring-cyan-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleStatusChange("Resolved")}
                    disabled={status === "Resolved" || updatingStatus}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1 border border-green-200"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
                  </button>

                  <button
                    onClick={() => handleStatusChange("Closed")}
                    disabled={status === "Closed" || updatingStatus}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1 border border-slate-200"
                  >
                    <X className="w-3.5 h-3.5" /> Close
                  </button>
                </div>
              </div>

              {/* Customer Info Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 border-b pb-2 border-slate-100">
                  <User className="w-4 h-4 text-cyan-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Customer Info</h4>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{complaint.customer_name}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{complaint.customer_email}</span>
                </div>
                {complaint.customer_phone && (
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{complaint.customer_phone}</span>
                  </div>
                )}
                {complaint.customer_address && (
                  <div className="flex items-start gap-2 text-xs text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{complaint.customer_address}</span>
                  </div>
                )}
              </div>

              {/* Vehicle Info Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                <div className="flex items-center gap-2 border-b pb-2 border-slate-100">
                  <Car className="w-4 h-4 text-purple-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Vehicle Details</h4>
                </div>
                {complaint.vehicle_number ? (
                  <>
                    <p className="text-sm font-bold text-slate-900 font-mono tracking-wider">{complaint.vehicle_number}</p>
                    <p className="text-xs text-slate-600">{complaint.vehicle_model || "—"} ({complaint.vehicle_type || "Standard"})</p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 italic">No vehicle linked to complaint</p>
                )}
              </div>

              {/* Complaint Meta */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold text-slate-700">{complaint.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Priority:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${PRIORITY_BADGE[complaint.priority]}`}>
                    {complaint.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Complaint Description & Conversation Thread */}
            <div className="lg:col-span-8 flex flex-col h-full overflow-hidden bg-white">
              
              {/* Initial Complaint Text */}
              <div className="p-4 sm:p-5 border-b border-slate-100 bg-amber-50/40">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">Initial Complaint Description</p>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
              </div>

              {/* Conversation Messages Thread */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
                <div className="text-center my-2">
                  <span className="text-[11px] font-semibold text-slate-400 px-3 py-1 bg-slate-100 rounded-full">
                    Conversation History
                  </span>
                </div>

                {messages.map((m) => {
                  const isAdmin = m.sender_role === "admin";

                  return (
                    <div key={m.id} className={`flex gap-3 ${isAdmin ? "justify-end" : "justify-start"}`}>
                      {!isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                          <User className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm shadow-sm ${
                          isAdmin
                            ? "bg-gradient-to-r from-slate-900 to-slate-800 text-white"
                            : "bg-white text-slate-800 border border-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 border-b pb-1 border-slate-100/20 text-[11px] opacity-80">
                          <span className="font-bold">{isAdmin ? "Admin (You)" : m.sender_name}</span>
                          <span>
                            {new Date(m.created_at).toLocaleTimeString("en-IN", {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                      </div>

                      {isAdmin && (
                        <div className="w-8 h-8 rounded-full bg-slate-900 text-cyan-400 flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Admin Reply Composer Form */}
              <form onSubmit={handleSendReply} className="p-3 sm:p-4 border-t border-slate-200 bg-white flex gap-2">
                <input
                  type="text"
                  placeholder="Type admin reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-semibold text-sm transition disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Reply</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
