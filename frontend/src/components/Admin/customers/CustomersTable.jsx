import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Upload, Users, UserCheck, UserX, UserPlus, X, Pencil, Trash2, Loader2, Car, Calendar, CheckCircle2, TrendingUp, FileText } from "lucide-react";
import api from "../../../services/api";
import toast, { Toaster } from "react-hot-toast";
import Papa from "papaparse";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const ts = { style: { background: "#1e293b", color: "#fff" } };

function Badge({ status }) {
  const s = status || "active";
  const bg = { active: "bg-green-50 text-green-700", suspended: "bg-red-50 text-red-600" };
  const dot = { active: "bg-green-500", suspended: "bg-red-500" };
  return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bg[s] || bg.active}`}><span className={`w-1.5 h-1.5 rounded-full ${dot[s] || dot.active}`} />{s}</span>;
}

/* ═══ Customer Detail Slide-Over ═══ */
function CustomerDetail({ customerId, onClose, onRefresh }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null); // { type, item }
  const [deleteModal, setDeleteModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const fetchDetail = () => {
    setLoading(true);
    api.get(`/admin/customers/${customerId}/details`)
      .then(r => setData(r.data))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchDetail(); }, [customerId]);

  const openEdit = (type, item) => {
    setEditModal({ type });
    if (type === "profile") setForm({ full_name: item.full_name || "", phone: item.phone || "", email: item.email || "", address: item.address || "", status: item.status || "active" });
    else if (type === "wash") setForm({ wash_date: item.wash_date?.split("T")[0] || "", status: item.status || "", washer_note: item.washer_note || "", wash_duration_minutes: item.wash_duration_minutes || "", id: item.id });
    else if (type === "subscription") setForm({ plan_name: item.plan_name || "", monthly_price: item.monthly_price || "", renewal_date: item.renewal_date?.split("T")[0] || "", status: item.status || "", preferred_time: item.preferred_time || "", id: item.id });
    else if (type === "vehicle") setForm({ vehicle_number: item.vehicle_number || "", vehicle_type: item.vehicle_type || "", vehicle_model: item.vehicle_model || "", id: item.id });
    else if (type === "stats") setForm({
      total_washes: item.total_washes || 0,
      this_month: item.this_month || 0,
      recent_wash: item.recent_wash ? new Date(item.recent_wash).toISOString().split("T")[0] : "",
      active_vehicles: item.active_vehicles || 0,
      days_left: item.days_left || 0,
      active_subscriptions: item.active_subscriptions || 0,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const t = editModal.type;
      if (t === "profile") await api.patch(`/admin/customers/${customerId}`, form);
      else if (t === "wash") await api.patch(`/admin/wash-records/${form.id}`, form);
      else if (t === "subscription") await api.patch(`/admin/subscriptions/${form.id}`, form);
      else if (t === "vehicle") await api.patch(`/admin/vehicles/${form.id}`, form);
      else if (t === "stats") await api.patch(`/admin/customers/${customerId}/stats`, form);
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
      if (type === "wash") await api.delete(`/admin/wash-records/${id}`);
      else if (type === "subscription") await api.delete(`/admin/subscriptions/${id}`);
      else if (type === "vehicle") await api.delete(`/admin/vehicles/${id}`);
      else if (type === "customer") { await api.delete(`/admin/customers/${customerId}`); toast.success("Customer deleted", ts); onClose(); onRefresh?.(); return; }
      toast.success("Deleted", ts);
      setDeleteModal(null);
      fetchDetail();
      onRefresh?.();
    } catch { toast.error("Failed to delete"); }
    finally { setSaving(false); }
  };

  const renderF = (label, name, type = "text") => (
    <div key={name}>
      <label className="text-xs text-slate-500 mb-1 block">{label}</label>
      {type === "select-status" ? (
        <select value={form[name] || ""} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none">
          <option value="active">Active</option><option value="suspended">Suspended</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option><option value="paused">Paused</option>
        </select>
      ) : type === "select-vehicle-type" ? (
        <select value={form[name] || ""} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none">
          <option value="micro">Hatchback</option><option value="sedan">Sedan</option><option value="mini_suv">Mini SUV</option><option value="suv">SUV</option>
        </select>
      ) : (
        <input type={type} value={form[name] || ""} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
      )}
    </div>
  );

  if (loading) return (
    <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }}
      className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 border-l overflow-y-auto">
      <div className="p-6 space-y-4">{[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}</div>
    </motion.div>
  );

  if (!data) return null;
  const { profile: p, stats: s, subscription: sub, vehicles: v, recent_wash_records: wr } = data;

  return (
    <>
      {/* Backdrop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />

      {/* Panel */}
      <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-white shadow-2xl z-50 border-l overflow-y-auto">
        <div style={{ height: 4, background: "linear-gradient(90deg,#00d4ff,#0066ff)" }} />
        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{p.full_name || p.name}</h2>
              <p className="text-sm text-slate-500">{p.email}</p>
              <p className="text-xs text-slate-400">{p.phone || "—"}</p>
              <Badge status={p.status} />
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit("profile", p)} className="p-2 hover:bg-slate-100 rounded-lg"><Pencil className="w-4 h-4 text-slate-500" /></button>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Contact Card */}
          <div className="rounded-xl p-4 mb-4" style={{ background: "#f0f9ff", border: "1px solid #00d4ff" }}>
            <h4 className="text-sm font-semibold mb-3" style={{ color: "#0066ff" }}>📞 Contact Information</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><span className="text-slate-400 block mb-0.5">Full Name</span><span className="font-semibold text-slate-800">{p.full_name || p.name || "—"}</span></div>
              <div><span className="text-slate-400 block mb-0.5">Phone</span>{p.phone ? <a href={`tel:+91${p.phone}`} className="font-semibold" style={{ color: "#0066ff" }}>+91 {p.phone}</a> : <span className="font-semibold text-slate-800">—</span>}</div>
              <div><span className="text-slate-400 block mb-0.5">Email</span>{p.email ? <a href={`mailto:${p.email}`} className="font-semibold" style={{ color: "#0066ff" }}>{p.email}</a> : <span className="font-semibold text-slate-800">—</span>}</div>
              <div><span className="text-slate-400 block mb-0.5">Address</span><span className="font-semibold text-slate-800">{p.address || "—"}</span></div>
            </div>
            <div className="flex gap-2 mt-3">
              {p.phone && <a href={`tel:+91${p.phone}`} className="px-3 py-1.5 rounded-lg text-xs font-semibold no-underline" style={{ background: "#dcfce7", color: "#16a34a" }}>📞 Call</a>}
              {p.email && <a href={`mailto:${p.email}`} className="px-3 py-1.5 rounded-lg text-xs font-semibold no-underline" style={{ background: "#eff6ff", color: "#1d4ed8" }}>✉️ Email</a>}
              {p.phone && <a href={`https://wa.me/91${p.phone}`} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-semibold no-underline" style={{ background: "#dcfce7", color: "#16a34a" }}>💬 WhatsApp</a>}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-900">Stats Overview</h4>
              <button onClick={() => openEdit("stats", s)} className="p-1 hover:bg-slate-200 rounded"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "Total Washes", v: s.total_washes, icon: CheckCircle2, c: "text-green-600" },
                { l: "This Month", v: s.this_month, icon: Calendar, c: "text-blue-600" },
                { l: "Recent Wash", v: s.recent_wash ? new Date(s.recent_wash).toLocaleDateString() : "—", icon: CheckCircle2, c: "text-cyan-600" },
                { l: "Active Vehicles", v: s.active_vehicles, icon: Car, c: "text-purple-600" },
                { l: "Days Left", v: s.days_left, icon: TrendingUp, c: "text-orange-600" },
                { l: "Active Subs", v: s.active_subscriptions, icon: FileText, c: "text-emerald-600" },
              ].map((card, i) => {
                const I = card.icon;
                return <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                  <I className={`w-4 h-4 mx-auto mb-1 ${card.c}`} />
                  <p className="text-lg font-bold text-slate-900">{card.v ?? 0}</p>
                  <p className="text-[10px] text-slate-500">{card.l}</p>
                </div>;
              })}
            </div>
          </div>

          {/* Subscription */}
          {sub && <div className="bg-slate-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-900">Subscription</h4>
              <div className="flex gap-1">
                <button onClick={() => openEdit("subscription", sub)} className="p-1 hover:bg-slate-200 rounded"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                <button onClick={() => setDeleteModal({ type: "subscription", id: sub.id })} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-400">Plan:</span> <span className="font-medium">{sub.plan_name || "—"}</span></div>
              <div><span className="text-slate-400">Price:</span> <span className="font-medium">₹{sub.monthly_price || 0}</span></div>
              <div><span className="text-slate-400">Status:</span> <Badge status={sub.status} /></div>
              <div><span className="text-slate-400">Renewal:</span> <span className="font-medium">{sub.renewal_date ? new Date(sub.renewal_date).toLocaleDateString() : "—"}</span></div>
              <div><span className="text-slate-400">Washer:</span> <span className="font-medium">{sub.washer_name || "—"}</span></div>
            </div>
          </div>}

          {/* Vehicles */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Vehicles ({v?.length || 0})</h4>
            {v?.map(vh => (
              <div key={vh.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 mb-1.5">
                <div><p className="text-sm font-medium">{vh.vehicle_number}</p><p className="text-xs text-slate-400">{vh.vehicle_model || vh.vehicle_type}</p></div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit("vehicle", vh)} className="p-1 hover:bg-slate-200 rounded"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                  <button onClick={() => setDeleteModal({ type: "vehicle", id: vh.id })} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Wash Records */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">Recent Wash Records</h4>
            {wr?.length === 0 ? <p className="text-xs text-slate-400">No wash records</p> : wr?.map(w => (
              <div key={w.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3 mb-1.5">
                <div>
                  <p className="text-xs font-medium">{w.wash_date ? new Date(w.wash_date).toLocaleDateString() : ""} · {w.vehicle_number || ""}</p>
                  <p className="text-[10px] text-slate-400">{w.washer_name || "—"} · {w.wash_duration_minutes ? `${w.wash_duration_minutes}min` : ""} · <Badge status={w.status} /></p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit("wash", w)} className="p-1 hover:bg-slate-200 rounded"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                  <button onClick={() => setDeleteModal({ type: "wash", id: w.id })} className="p-1 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Delete Customer */}
          <button onClick={() => setDeleteModal({ type: "customer", id: customerId })}
            className="w-full mt-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 border border-red-200 transition">
            Delete Customer
          </button>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={() => setEditModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
              <div style={{ height: 4, background: "linear-gradient(90deg,#00d4ff,#0066ff)" }} />
              <div className="p-5">
                <div className="flex justify-between mb-4"><h3 className="font-bold">Edit {editModal.type}</h3><button onClick={() => setEditModal(null)} className="p-1 hover:bg-slate-100 rounded"><X className="w-4 h-4" /></button></div>
                <div className="space-y-3">
                  {editModal.type === "profile" && <>{renderF("Full Name", "full_name")}{renderF("Email", "email", "email")}{renderF("Phone", "phone", "tel")}{renderF("Address", "address")}{renderF("Status", "status", "select-status")}</>}
                  {editModal.type === "wash" && <>{renderF("Wash Date", "wash_date", "date")}{renderF("Status", "status", "select-status")}{renderF("Note", "washer_note")}{renderF("Duration (min)", "wash_duration_minutes", "number")}</>}
                  {editModal.type === "subscription" && <>{renderF("Plan Name", "plan_name")}{renderF("Monthly Price", "monthly_price", "number")}{renderF("Renewal Date", "renewal_date", "date")}{renderF("Status", "status", "select-status")}{renderF("Preferred Time", "preferred_time")}</>}
                  {editModal.type === "vehicle" && <>{renderF("Vehicle Number", "vehicle_number")}{renderF("Vehicle Model", "vehicle_model")}{renderF("Type", "vehicle_type", "select-vehicle-type")}</>}
                  {editModal.type === "stats" && <>{renderF("Total Washes", "total_washes", "number")}{renderF("This Month", "this_month", "number")}{renderF("Recent Wash", "recent_wash", "date")}{renderF("Active Vehicles", "active_vehicles", "number")}{renderF("Days Left", "days_left", "number")}{renderF("Active Subs", "active_subscriptions", "number")}</>}
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-slate-50">Cancel</button>
                  <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}{saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={() => setDeleteModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
              <p className="text-sm text-slate-600 mb-5">This action cannot be undone.{deleteModal.type === "customer" ? " All associated data will be deleted." : ""}</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal(null)} className="flex-1 py-2.5 rounded-xl border text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button onClick={handleDelete} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 flex items-center justify-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}{saving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ═══ Main CustomersTable ═══ */
export default function CustomersTable() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const now = new Date();
  const stats = {
    total: customers.length,
    active: customers.filter(c => (c.status || "active") === "active").length,
    suspended: customers.filter(c => c.status === "suspended").length,
    newThisMonth: customers.filter(c => { if (!c.created_at) return false; const d = new Date(c.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).length,
  };

  const statCards = [
    { label: "Total Customers", value: stats.total, icon: Users, gradient: "from-cyan-500 to-blue-600" },
    { label: "Active", value: stats.active, icon: UserCheck, gradient: "from-green-500 to-emerald-600" },
    { label: "Suspended", value: stats.suspended, icon: UserX, gradient: "from-red-500 to-rose-600" },
    { label: "New This Month", value: stats.newThisMonth, icon: UserPlus, gradient: "from-amber-500 to-orange-600" },
  ];

  const handleExport = () => {
    const headers = "Name,Email,Phone,Status,Joined\n";
    const csv = customers.map(c => `"${c.full_name || c.name}","${c.email}","${c.phone || ''}","${c.status || 'active'}","${c.created_at ? new Date(c.created_at).toLocaleDateString() : ''}"`).join("\n");
    const blob = new Blob([headers + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `customers_export_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported", ts);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: async (results) => {
        const valid = results.data.filter(r => r.name && r.email).map(r => ({ ...r, role: "customer" }));
        if (valid.length === 0) { toast.error("No valid rows"); return; }
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
      <div style={{ height: 3, background: "linear-gradient(90deg, #00d4ff, #0066ff)", borderRadius: 2, marginBottom: 16 }} />
      <div className="mb-6"><h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Customers</h1><p className="text-gray-500 text-sm">All registered customers</p></div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((c, i) => {
          const Icon = c.icon; return (
            <motion.div key={c.label} {...fadeIn} transition={{ delay: i * 0.08 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3" whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
              <div className={`w-10 h-10 bg-gradient-to-r ${c.gradient} rounded-xl flex items-center justify-center shadow-lg`}><Icon className="w-5 h-5 text-white" /></div>
              <div><p className="text-xl font-bold text-slate-900">{c.value}</p><p className="text-xs text-slate-500">{c.label}</p></div>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
        <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
        <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50"><Upload className="w-4 h-4" /> Import</button>
        <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg transition"><Download className="w-4 h-4" /> Export</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>{["Name", "Email", "Phone", "Address", "Status", "Joined"].map(h => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>)
              : customers.length === 0 ? <tr><td colSpan={6} className="px-5 py-16 text-center"><Users className="w-12 h-12 text-slate-200 mx-auto mb-3"/><p className="text-slate-400 font-medium">No customers found</p></td></tr>
              : customers.map((c, i) => (
              <tr key={c.id} onClick={() => setSelectedId(c.id)} className={`hover:bg-cyan-50/30 cursor-pointer transition ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                <td className="px-5 py-3 font-medium text-slate-900">{c.full_name || c.name}</td>
                <td className="px-5 py-3 text-slate-600">{c.email}</td>
                <td className="px-5 py-3 text-slate-600">{c.phone || "—"}</td>
                <td className="px-5 py-3 text-slate-500 text-xs max-w-[160px] truncate">{c.address || "—"}</td>
                <td className="px-5 py-3"><Badge status={c.status} /></td>
                <td className="px-5 py-3 text-slate-400 text-xs">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedId && <CustomerDetail customerId={selectedId} onClose={() => setSelectedId(null)} onRefresh={fetchCustomers} />}
      </AnimatePresence>
    </motion.div>
  );
}