import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Download, Upload, Users, UserCheck, UserX, UserPlus,
  X, Pencil, Trash2, Loader2, Car, Calendar, CheckCircle2,
  TrendingUp, FileText, CreditCard, Plus, Clock, Wrench,
} from "lucide-react";
import api from "../../../services/api";
import toast, { Toaster } from "react-hot-toast";
import Papa from "papaparse";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const ts = { style: { background: "#1e293b", color: "#fff" } };

const SERVICE_TYPES = [
  "Interior Cleaning", "Exterior Cleaning", "Polishing",
  "Tyre Dressing", "Engine Cleaning", "Vacuum Cleaning",
  "Seat Cleaning", "Ceramic Coating", "Other",
];

/* ── Status badge ── */
function StatusBadge({ status }) {
  const s = (status || "active").toLowerCase().replace(/ /g, "_");
  const map = {
    active:          "bg-green-50 text-green-700 border-green-200",
    suspended:       "bg-red-50 text-red-600 border-red-200",
    pending:         "bg-amber-50 text-amber-700 border-amber-200",
    pending_payment: "bg-orange-50 text-orange-700 border-orange-200",
    completed:       "bg-emerald-50 text-emerald-700 border-emerald-200",
    cancelled:       "bg-red-50 text-red-600 border-red-200",
    scheduled:       "bg-blue-50 text-blue-700 border-blue-200",
    upcoming:        "bg-cyan-50 text-cyan-700 border-cyan-200",
    paid:            "bg-green-50 text-green-700 border-green-200",
    paused:          "bg-slate-100 text-slate-600 border-slate-200",
  };
  const dot = {
    active: "bg-green-500", suspended: "bg-red-500", pending: "bg-amber-500",
    pending_payment: "bg-orange-500", completed: "bg-emerald-500", cancelled: "bg-red-400",
    scheduled: "bg-blue-500", upcoming: "bg-cyan-500", paid: "bg-green-500",
    paused: "bg-slate-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${map[s] || map.active}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot[s] || dot.active}`} />
      {status}
    </span>
  );
}

/* ── Section wrapper ── */
function Section({ icon: Icon, title, iconColor = "text-blue-600", children, action }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function fmt(d) {
  if (!d) return "—";
  const str = String(d).split("T")[0];
  const parts = str.split("-");
  if (parts.length === 3) {
    const [y, m, day] = parts;
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const monthName = months[parseInt(m, 10) - 1];
    if (monthName) return `${parseInt(day, 10)} ${monthName} ${y}`;
  }
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return String(d);
  return dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* ════════════════════════════════════════════════════════════════════ */
/*  Service Modal — Add OR Edit a single addon service                 */
/* ════════════════════════════════════════════════════════════════════ */
function ServiceModal({ customerId, vehicle, editingService, onClose, onSaved }) {
  const isEdit = Boolean(editingService);
  const [form, setForm] = useState(
    isEdit
      ? {
          service_type: editingService.service_type || SERVICE_TYPES[0],
          amount:       String(editingService.amount || ""),
          service_date: editingService.service_date
            ? editingService.service_date.split("T")[0]
            : "",
          notes: editingService.notes || "",
        }
      : {
          vehicle_id:   vehicle?.id || "",
          service_type: SERVICE_TYPES[0],
          amount:       "",
          service_date: new Date().toISOString().split("T")[0],
          notes:        "",
          status:       "completed",
        }
  );
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    if (!form.amount || isNaN(Number(form.amount)))
      return toast.error("Enter a valid price");
    setSaving(true);
    try {
      if (isEdit) {
        await api.patch(`/admin/addon-services/${editingService.id}`, {
          service_type: form.service_type,
          amount:       form.amount,
          service_date: form.service_date,
          notes:        form.notes,
        });
        toast.success("Service updated", ts);
      } else {
        await api.post(`/admin/customers/${customerId}/addon-services`, {
          ...form,
          vehicle_id: vehicle?.id,
        });
        toast.success("Service added", ts);
      }
      onSaved(); // triggers fetchDetail → re-renders vehicle cards instantly
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to save");
    } finally { setSaving(false); }
  };

  const inp =
    "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm " +
    "focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div style={{ height: 4, background: "linear-gradient(90deg,#00d4ff,#0066ff)" }} />
        <div className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                {isEdit
                  ? <><Pencil className="w-4 h-4 text-blue-600" /> Edit Service</>
                  : <><Plus   className="w-4 h-4 text-blue-600" /> Add Service</>}
              </h3>
              {vehicle && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Vehicle: <span className="font-semibold text-blue-600">{vehicle.vehicle_number}</span>
                  {vehicle.vehicle_model ? ` · ${vehicle.vehicle_model}` : ""}
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Service Name</label>
              <select value={form.service_type} onChange={e => set("service_type", e.target.value)} className={inp}>
                {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Price (₹)</label>
              <input
                type="number" min="0" value={form.amount}
                onChange={e => set("amount", e.target.value)}
                placeholder="e.g. 500" className={inp}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Service Date</label>
              <input type="date" value={form.service_date}
                onChange={e => set("service_date", e.target.value)} className={inp} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Notes</label>
              <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
                rows={2} placeholder="Optional…" className={`${inp} resize-none`} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-5">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Update" : "Save Service"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  Vehicle Billing Summary                                            */
/*  Primary section — shows plan + service history inline per vehicle  */
/* ════════════════════════════════════════════════════════════════════ */
function VehicleBillingSummary({ vehicleBilling = [], addonServices = [], customerId, onRefresh }) {
  // Group addon services by vehicle_id (string key for safety)
  const byVehicle = addonServices.reduce((acc, svc) => {
    const key = String(svc.vehicle_id || "");
    if (!acc[key]) acc[key] = [];
    acc[key].push(svc);
    return acc;
  }, {});

  const plansTotal = vehicleBilling.reduce((s, v) => s + Number(v.monthly_price || 0), 0);
  const addonTotal = addonServices.reduce((s, a) => s + Number(a.amount || 0), 0);
  const grandTotal = plansTotal + addonTotal;

  // modal: null | { vehicle, editingService: null | svc }
  const [modal, setModal]       = useState(null);
  const [deletingId, setDelId]  = useState(null);

  const handleDelete = async (svcId) => {
    setDelId(svcId);
    try {
      await api.delete(`/admin/addon-services/${svcId}`);
      toast.success("Service deleted", ts);
      onRefresh();
    } catch { toast.error("Failed to delete"); }
    finally { setDelId(null); }
  };

  if (vehicleBilling.length === 0) {
    return (
      <Section icon={CreditCard} title="Vehicle Billing Summary" iconColor="text-blue-600">
        <p className="text-xs text-slate-400 text-center py-4">No vehicles registered</p>
      </Section>
    );
  }

  return (
    <>
      <Section icon={CreditCard} title="Vehicle Billing Summary" iconColor="text-blue-600">
        <div className="space-y-4">

          {vehicleBilling.map(vh => {
            const services   = byVehicle[String(vh.id)] || [];
            const vhAddonTotal = services.reduce((s, svc) => s + Number(svc.amount || 0), 0);

            return (
              <div key={vh.id} className="border border-slate-200 rounded-2xl overflow-hidden">

                {/* ── Card header (dark) ── */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
                      {vh.vehicle_model || vh.vehicle_type || "Vehicle"}
                    </p>
                    <p className="text-white font-bold text-base font-mono tracking-wider leading-tight">
                      {vh.vehicle_number}
                    </p>
                  </div>
                  <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4 text-white/80" />
                  </div>
                </div>

                {/* ── Card body ── */}
                <div className="p-4 space-y-3">

                  {/* Plan row */}
                  {vh.plan_name ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 mb-0.5">Plan</p>
                        <p className="text-sm font-semibold text-slate-900">{vh.plan_name}</p>
                      </div>
                      <p className="text-base font-bold text-blue-700">
                        ₹{Number(vh.monthly_price || 0).toLocaleString("en-IN")}
                        <span className="text-xs font-normal text-slate-400">/mo</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No active subscription</p>
                  )}

                  {/* Start + Renewal dates */}
                  {(vh.start_date || vh.renewal_date) && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Start Date</p>
                        <p className="text-xs font-semibold text-slate-700">{fmt(vh.start_date)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Renewal Date</p>
                        <p className="text-xs font-semibold text-slate-700">{fmt(vh.renewal_date)}</p>
                      </div>
                    </div>
                  )}

                  {/* ── Additional Services ── */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2 mb-2.5">
                      <Wrench className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                      <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Additional Services
                      </p>
                      {services.length > 0 && (
                        <span className="ml-auto text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">
                          {services.length}
                        </span>
                      )}
                    </div>

                    {services.length === 0 ? (
                      <p className="text-xs text-slate-400 italic text-center py-2 bg-slate-50 rounded-xl">
                        No additional services added yet.
                      </p>
                    ) : (
                      <>
                        <div className="space-y-0">
                          {services.map((svc, idx) => (
                            <div key={svc.id}>
                              <div className="flex items-center justify-between py-1.5 gap-2">
                                {/* Timeline */}
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                                      {svc.service_type}
                                    </p>
                                    <p className="text-[10px] text-slate-400 leading-tight">
                                      {fmt(svc.service_date)}
                                    </p>
                                  </div>
                                </div>

                                {/* Amount + actions */}
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  <span className="text-xs font-bold text-slate-900">
                                    ₹{Number(svc.amount || 0).toLocaleString("en-IN")}
                                  </span>
                                  <button
                                    onClick={() => setModal({ vehicle: vh, editingService: svc })}
                                    className="p-1 hover:bg-blue-50 rounded-lg transition"
                                    title="Edit service">
                                    <Pencil className="w-3 h-3 text-slate-400 hover:text-blue-600" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(svc.id)}
                                    disabled={deletingId === svc.id}
                                    className="p-1 hover:bg-red-50 rounded-lg transition"
                                    title="Delete service">
                                    {deletingId === svc.id
                                      ? <Loader2 className="w-3 h-3 animate-spin text-red-400" />
                                      : <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-500" />}
                                  </button>
                                </div>
                              </div>
                              {idx < services.length - 1 && (
                                <div className="border-b border-slate-100 ml-3" />
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add-On total for this vehicle */}
                        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-xs text-slate-500">Total Add-On</span>
                          <span className="text-xs font-bold text-purple-700">
                            ₹{vhAddonTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Add Service button */}
                  <button
                    onClick={() => setModal({ vehicle: vh, editingService: null })}
                    className="w-full py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Service
                  </button>
                </div>
              </div>
            );
          })}

          {/* Billing Breakdown / Grand Total */}
          <div className="pt-3 border-t border-slate-200 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Vehicle Plans Total</span>
              <span className="font-semibold text-slate-700">₹{plansTotal.toLocaleString("en-IN")}/month</span>
            </div>
            {addonTotal > 0 && (
              <div className="flex justify-between items-center text-xs text-purple-600">
                <span>Add-On Services Total</span>
                <span className="font-semibold">₹{addonTotal.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900">Grand Total</span>
              <span className="text-base font-bold text-blue-700">
                ₹{grandTotal.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-slate-500">/month</span>
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* Service Modal (add / edit) */}
      <AnimatePresence>
        {modal && (
          <ServiceModal
            customerId={customerId}
            vehicle={modal.vehicle}
            editingService={modal.editingService}
            onClose={() => setModal(null)}
            onSaved={() => { setModal(null); onRefresh(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  Customer Detail Slide-Over Panel                                   */
/* ════════════════════════════════════════════════════════════════════ */
function CustomerDetail({ customerId, onClose, onRefresh }) {
  const [data,        setData]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [editModal,   setEditModal]   = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [form,        setForm]        = useState({});

  const fetchDetail = () => {
    setLoading(true);
    api.get(`/admin/customers/${customerId}/details`)
      .then(r => setData(r.data))
      .catch(() => toast.error("Failed to load customer"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchDetail(); }, [customerId]);

  const openEdit = (type, item) => {
    setEditModal({ type });
    if      (type === "profile") setForm({ full_name: item.full_name || "", phone: item.phone || "", email: item.email || "", address: item.address || "", status: item.status || "active" });
    else if (type === "wash")    setForm({ wash_date: item.wash_date?.split("T")[0] || "", status: item.status || "", washer_note: item.washer_note || "", wash_duration_minutes: item.wash_duration_minutes || "", id: item.id });
    else if (type === "vehicle") setForm({ vehicle_number: item.vehicle_number || "", vehicle_type: item.vehicle_type || "", vehicle_model: item.vehicle_model || "", id: item.id });
    else if (type === "stats")   setForm({ total_washes: item.total_washes || 0, this_month: item.this_month || 0, recent_wash: item.recent_wash ? new Date(item.recent_wash).toISOString().split("T")[0] : "", active_vehicles: item.active_vehicles || 0, days_left: item.days_left || 0, active_subscriptions: item.active_subscriptions || 0 });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const t = editModal.type;
      if      (t === "profile") await api.patch(`/admin/customers/${customerId}`, form);
      else if (t === "wash")    await api.patch(`/admin/wash-records/${form.id}`, form);
      else if (t === "vehicle") await api.patch(`/admin/vehicles/${form.id}`, form);
      else if (t === "stats")   await api.patch(`/admin/customers/${customerId}/stats`, form);
      toast.success("Updated", ts);
      setEditModal(null);
      fetchDetail();
      onRefresh?.();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const { type, id } = deleteModal;
      if      (type === "wash")     await api.delete(`/admin/wash-records/${id}`);
      else if (type === "vehicle")  await api.delete(`/admin/vehicles/${id}`);
      else if (type === "customer") {
        await api.delete(`/admin/customers/${customerId}`);
        toast.success("Customer deleted", ts);
        onClose(); onRefresh?.(); return;
      }
      toast.success("Deleted", ts);
      setDeleteModal(null);
      fetchDetail();
      onRefresh?.();
    } catch { toast.error("Failed to delete"); }
    finally { setSaving(false); }
  };

  const inp = "w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none";
  const renderF = (label, name, type = "text") => (
    <div key={name}>
      <label className="text-xs text-slate-500 mb-1 block">{label}</label>
      {type === "select-status" ? (
        <select value={form[name] || ""} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} className={inp}>
          {["active","suspended","pending","cancelled","completed","paused"].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === "select-vehicle-type" ? (
        <select value={form[name] || ""} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} className={inp}>
          {["micro","sedan","mini_suv","suv"].map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[name] || ""} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} className={inp} />
      )}
    </div>
  );

  /* Loading skeleton */
  if (loading) return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }}
      className="fixed right-0 top-0 h-full w-full sm:w-[540px] bg-slate-50 shadow-2xl z-50 border-l overflow-y-auto">
      <div className="p-6 space-y-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
      </div>
    </motion.div>
  );

  if (!data) return null;
  const {
    profile: p, stats: s,
    vehicles: v = [],
    recent_wash_records: wr = [],
    vehicle_billing  = [],
    addon_services   = [],   // ← fed to VehicleBillingSummary
  } = data;

  return (
    <>
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[540px] bg-slate-50 shadow-2xl z-50 border-l flex flex-col">

        {/* Sticky header */}
        <div className="bg-white border-b border-slate-200 px-5 pt-5 pb-4 flex-shrink-0">
          <div style={{ height: 3, background: "linear-gradient(90deg,#00d4ff,#0066ff)", borderRadius: 2, marginBottom: 14 }} />
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 truncate">{p.full_name || p.name}</h2>
              <p className="text-sm text-slate-500 truncate">{p.email}</p>
              {p.address && <p className="text-sm text-slate-400 truncate mt-0.5">📍 {p.address}</p>}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <StatusBadge status={p.status} />
                {p.phone && <span className="text-xs text-slate-400">📞 +91 {p.phone}</span>}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => openEdit("profile", p)} className="p-2 hover:bg-slate-100 rounded-xl" title="Edit">
                <Pencil className="w-4 h-4 text-slate-500" />
              </button>
              <button onClick={() => setDeleteModal({ type: "customer" })} className="p-2 hover:bg-red-50 rounded-xl" title="Delete">
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
          {/* Quick contact actions */}
          <div className="flex gap-2 mt-3">
            {p.phone && <a href={`tel:+91${p.phone}`} className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold no-underline bg-green-50 text-green-700 hover:bg-green-100 transition">📞 Call</a>}
            {p.email && <a href={`mailto:${p.email}`} className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold no-underline bg-blue-50 text-blue-700 hover:bg-blue-100 transition">✉️ Email</a>}
            {p.phone && <a href={`https://wa.me/91${p.phone}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-1.5 rounded-lg text-xs font-semibold no-underline bg-green-50 text-green-700 hover:bg-green-100 transition">💬 WA</a>}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* 1. Stats */}
          <Section icon={TrendingUp} title="Stats Overview" iconColor="text-indigo-600"
            action={<button onClick={() => openEdit("stats", s)} className="p-1 hover:bg-slate-100 rounded"><Pencil className="w-3 h-3 text-slate-400" /></button>}>
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "Total Washes",  v: s.total_washes,        icon: CheckCircle2, g: "from-green-400 to-emerald-500"  },
                { l: "This Month",    v: s.this_month,           icon: Calendar,     g: "from-blue-400 to-cyan-500"      },
                { l: "Days Left",     v: s.days_left,            icon: Clock,        g: "from-orange-400 to-amber-500"   },
                { l: "Vehicles",      v: s.active_vehicles,      icon: Car,          g: "from-purple-400 to-violet-500"  },
                { l: "Active Subs",   v: s.active_subscriptions, icon: FileText,     g: "from-pink-400 to-rose-500"      },
                { l: "Recent Wash",   v: s.recent_wash
                    ? new Date(s.recent_wash).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                    : "—",                                        icon: CheckCircle2, g: "from-cyan-400 to-teal-500"      },
              ].map((c, i) => {
                const I = c.icon;
                return (
                  <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.g} flex items-center justify-center mx-auto mb-1.5`}>
                      <I className="w-3.5 h-3.5 text-white" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">{c.v ?? 0}</p>
                    <p className="text-[10px] text-slate-500">{c.l}</p>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* 2. Vehicle Billing Summary — inline service history, real-time */}
          <VehicleBillingSummary
            vehicleBilling={vehicle_billing}
            addonServices={addon_services}
            customerId={customerId}
            onRefresh={fetchDetail}
          />

          {/* 3. Recent Wash Records */}
          <Section icon={CheckCircle2} title="Recent Wash Records" iconColor="text-green-600">
            {wr.length === 0 ? (
              <p className="text-xs text-slate-400">No wash records yet</p>
            ) : (
              <div className="space-y-2">
                {wr.map(w => (
                  <div key={w.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">
                        {w.wash_date ? new Date(w.wash_date).toLocaleDateString() : ""} · {w.vehicle_number || "—"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        {w.washer_name || "—"}{w.wash_duration_minutes ? ` · ${w.wash_duration_minutes}min` : ""}
                        <StatusBadge status={w.status} />
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit("wash", w)} className="p-1.5 hover:bg-slate-200 rounded-lg"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                      <button onClick={() => setDeleteModal({ type: "wash", id: w.id })} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

        </div>
      </motion.div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            onClick={() => setEditModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div style={{ height: 4, background: "linear-gradient(90deg,#00d4ff,#0066ff)" }} />
              <div className="p-5">
                <div className="flex justify-between mb-4">
                  <h3 className="font-bold capitalize">Edit {editModal.type}</h3>
                  <button onClick={() => setEditModal(null)} className="p-1 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {editModal.type === "profile"  && <>{renderF("Full Name","full_name")}{renderF("Email","email","email")}{renderF("Phone","phone","tel")}{renderF("Address","address")}{renderF("Status","status","select-status")}</>}
                  {editModal.type === "wash"      && <>{renderF("Wash Date","wash_date","date")}{renderF("Status","status","select-status")}{renderF("Note","washer_note")}{renderF("Duration (min)","wash_duration_minutes","number")}</>}
                  {editModal.type === "vehicle"   && <>{renderF("Vehicle Number","vehicle_number")}{renderF("Vehicle Model","vehicle_model")}{renderF("Type","vehicle_type","select-vehicle-type")}</>}
                  {editModal.type === "stats"     && <>{renderF("Total Washes","total_washes","number")}{renderF("This Month","this_month","number")}{renderF("Recent Wash","recent_wash","date")}{renderF("Active Vehicles","active_vehicles","number")}{renderF("Days Left","days_left","number")}{renderF("Active Subs","active_subscriptions","number")}</>}
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-slate-50">Cancel</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}{saving ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete Confirm ── */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            onClick={() => setDeleteModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-center">Confirm Delete</h3>
              <p className="text-sm text-slate-600 mb-5 text-center">
                This cannot be undone.
                {deleteModal.type === "customer" ? " All customer data will be permanently removed." : ""}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button onClick={handleDelete} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}{saving ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════ */
/*  Main CustomersTable                                                */
/* ════════════════════════════════════════════════════════════════════ */
export default function CustomersTable() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const fileInputRef = useRef(null);

  const fetchCustomers = () => {
    setLoading(true);
    api.get(`/admin/customers?search=${search}`)
      .then(res => setCustomers(res.data.customers || []))
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchCustomers(); }, [search]);

  const now   = new Date();
  const stats = {
    total:        customers.length,
    active:       customers.filter(c => (c.status || "active") === "active").length,
    suspended:    customers.filter(c => c.status === "suspended").length,
    newThisMonth: customers.filter(c => {
      if (!c.created_at) return false;
      const d = new Date(c.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  };

  const statCards = [
    { label: "Total Customers", value: stats.total,        icon: Users,     gradient: "from-cyan-500 to-blue-600"   },
    { label: "Active",          value: stats.active,       icon: UserCheck, gradient: "from-green-500 to-emerald-600" },
    { label: "Suspended",       value: stats.suspended,    icon: UserX,     gradient: "from-red-500 to-rose-600"    },
    { label: "New This Month",  value: stats.newThisMonth, icon: UserPlus,  gradient: "from-amber-500 to-orange-600" },
  ];

  const handleExport = () => {
    const headers = "Name,Email,Phone,Status,Joined\n";
    const csv = customers.map(c =>
      `"${c.full_name || c.name}","${c.email}","${c.phone || ""}","${c.status || "active"}","${c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}"`
    ).join("\n");
    const blob = new Blob([headers + csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `customers_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported", ts);
  };

  const handleFileSelect = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async results => {
        const valid = results.data
          .filter(r => r.name && r.email)
          .map(r => ({ ...r, role: "customer" }));
        if (!valid.length) { toast.error("No valid rows"); return; }
        try {
          const res = await api.post("/admin/users/import", { users: valid });
          toast.success(`${res.data.imported} customers imported`, ts);
          fetchCustomers();
        } catch { toast.error("Import failed"); }
      },
    });
    e.target.value = "";
  };

  return (
    <motion.div {...fadeIn}>
      <Toaster position="top-right" />
      <div style={{ height: 3, background: "linear-gradient(90deg,#00d4ff,#0066ff)", borderRadius: 2, marginBottom: 16 }} />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Customers</h1>
        <p className="text-gray-500 text-sm">All registered customers</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.label} {...fadeIn} transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3"
              whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
              <div className={`w-10 h-10 bg-gradient-to-r ${c.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900">{c.value}</p>
                <p className="text-xs text-slate-500">{c.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search + actions */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
        <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 transition">
          <Upload className="w-4 h-4" /> Import
        </button>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg transition">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Name","Email","Phone","Address","Status","Joined"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading
              ? [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
                ))
              : customers.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-400 font-medium">No customers found</p>
                  </td>
                </tr>
              )
              : customers.map((c, i) => (
                  <tr key={c.id} onClick={() => setSelectedId(c.id)}
                    className={`hover:bg-cyan-50/30 cursor-pointer transition ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                    <td className="px-5 py-3 font-medium text-slate-900">{c.full_name || c.name}</td>
                    <td className="px-5 py-3 text-slate-600">{c.email}</td>
                    <td className="px-5 py-3 text-slate-600">{c.phone || "—"}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs max-w-[160px] truncate">{c.address || "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={c.status || "active"} /></td>
                    <td className="px-5 py-3 text-slate-400 text-xs">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedId && (
          <CustomerDetail
            customerId={selectedId}
            onClose={() => setSelectedId(null)}
            onRefresh={fetchCustomers}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}