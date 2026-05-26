import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, TrendingUp, Clock, Download, Plus, X, Pencil, Loader2, Trash2 } from "lucide-react";
import api from "../../../services/api";
import toast, { Toaster } from "react-hot-toast";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
const ts = { style: { background: "#1e293b", color: "#fff" } };

function StatusBadge({ status }) {
  const s = status || "pending";
  const colors = {
    paid: "bg-green-50 text-green-700", success: "bg-green-50 text-green-700", captured: "bg-green-50 text-green-700",
    pending: "bg-amber-50 text-amber-700", created: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-600",
  };
  const dots = {
    paid: "bg-green-500", success: "bg-green-500", captured: "bg-green-500",
    pending: "bg-amber-500", created: "bg-amber-500", failed: "bg-red-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[s] || colors.pending}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[s] || dots.pending}`} />{s}
    </span>
  );
}

/* ═══ Create / Edit Bill Modal ═══ */
function BillModal({ mode, editData, onClose, onSuccess }) {
  const isEdit = mode === "edit";
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(editData?.user_id || "");
  const [selectedSub, setSelectedSub] = useState(null);
  const [baseAmount, setBaseAmount] = useState(editData?.base || "");
  const [interiorItems, setInteriorItems] = useState(editData?.interiors || []);
  const [otherItems, setOtherItems] = useState(editData?.others || []);
  const [billNote, setBillNote] = useState(editData?.bill_note || "");
  const [sending, setSending] = useState(false);
  const [loadingSub, setLoadingSub] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      api.get("/admin/customers").then(r => setCustomers(r.data.customers || [])).catch(() => {});
    }
  }, [isEdit]);

  // When editing, load breakdown
  useEffect(() => {
    if (isEdit && editData?.id) {
      api.get(`/admin/billing/${editData.id}/breakdown`).then(r => {
        const items = r.data.data?.items || [];
        const monthly = items.find(i => i.item_type === "monthly");
        setBaseAmount(monthly?.amount || 0);
        setInteriorItems(items.filter(i => i.item_type === "interior").map(i => ({ name: i.item_name, amount: i.amount })));
        setOtherItems(items.filter(i => i.item_type === "other").map(i => ({ name: i.item_name, amount: i.amount })));
        setBillNote(editData.bill_note || "");
      }).catch(() => {});
    }
  }, [isEdit, editData]);

  const handleCustomerSelect = async (customerId) => {
    setSelectedCustomer(customerId);
    if (!customerId) return;
    setLoadingSub(true);
    try {
      const res = await api.get(`/admin/customers/${customerId}/details`);
      const sub = res.data?.subscription;
      if (sub) {
        setSelectedSub(sub);
        setBaseAmount(sub.monthly_price || "");
      } else {
        setSelectedSub(null);
        toast.error("No active subscription found for this customer");
      }
    } catch { toast.error("Failed to load customer details"); }
    finally { setLoadingSub(false); }
  };

  const grandTotal = useMemo(() => {
    const base = Number(baseAmount) || 0;
    const interior = interiorItems.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    const other = otherItems.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    return base + interior + other;
  }, [baseAmount, interiorItems, otherItems]);

  const handleSubmit = async () => {
    if (!isEdit && (!selectedCustomer || !selectedSub)) { toast.error("Select a customer with active subscription"); return; }
    if (!baseAmount || Number(baseAmount) <= 0) { toast.error("Enter base amount"); return; }
    setSending(true);
    try {
      if (isEdit) {
        await api.patch(`/admin/billing/${editData.id}/edit`, {
          base_amount: Number(baseAmount), interior_items: interiorItems, other_items: otherItems, bill_note: billNote,
        });
        toast.success("Bill updated successfully!", ts);
      } else {
        await api.post("/admin/billing/create-and-send", {
          user_id: selectedCustomer, subscription_id: selectedSub.id,
          base_amount: Number(baseAmount), interior_items: interiorItems, other_items: otherItems, bill_note: billNote,
        });
        toast.success("Bill sent to customer!", ts);
      }
      onSuccess?.();
      onClose();
    } catch (e) { toast.error(e.response?.data?.error || "Failed"); }
    finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: "linear-gradient(90deg, #00d4ff, #0066ff)" }} />
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-slate-900">{isEdit ? "✏️ Edit Bill" : "📤 Create & Send Bill"}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>

          {/* Customer Select (create only) */}
          {!isEdit && (
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Select Customer</label>
              <select value={selectedCustomer} onChange={e => handleCustomerSelect(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="">-- Select Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.full_name || c.name} ({c.email})</option>)}
              </select>
              {loadingSub && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Loading subscription...</p>}
              {selectedSub && <p className="text-xs text-green-600 mt-1">✅ {selectedSub.plan_name} — ₹{selectedSub.monthly_price}/mo — Renewal: {selectedSub.renewal_date ? new Date(selectedSub.renewal_date).toLocaleDateString() : "—"}</p>}
            </div>
          )}

          {/* Base Amount */}
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Monthly Base Amount (₹)</label>
            <input type="number" value={baseAmount} onChange={e => setBaseAmount(e.target.value)} placeholder="e.g. 1199"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>

          {/* Interior Items */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Interior Cleaning</label>
              <button onClick={() => setInteriorItems(p => [...p, { name: "Interior Cleaning", amount: 299 }])}
                className="text-xs text-cyan-600 font-medium hover:text-cyan-700 flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
            </div>
            {interiorItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input type="number" value={item.amount} onChange={e => { const n = [...interiorItems]; n[i].amount = e.target.value; setInteriorItems(n); }}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm" placeholder="₹299" />
                <button onClick={() => setInteriorItems(p => p.filter((_, j) => j !== i))} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            ))}
          </div>

          {/* Other Items */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-slate-700">Other Charges</label>
              <button onClick={() => setOtherItems(p => [...p, { name: "", amount: "" }])}
                className="text-xs text-cyan-600 font-medium hover:text-cyan-700 flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
            </div>
            {otherItems.map((item, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <input value={item.name} onChange={e => { const n = [...otherItems]; n[i].name = e.target.value; setOtherItems(n); }}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm" placeholder="Service name" />
                <input type="number" value={item.amount} onChange={e => { const n = [...otherItems]; n[i].amount = e.target.value; setOtherItems(n); }}
                  className="w-24 px-3 py-2 rounded-lg border border-slate-200 text-sm" placeholder="₹" />
                <button onClick={() => setOtherItems(p => p.filter((_, j) => j !== i))} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Bill Note (optional)</label>
            <textarea value={billNote} onChange={e => setBillNote(e.target.value)} rows={2} placeholder="Any note for the customer..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none" />
          </div>

          {/* Grand Total */}
          <div className="bg-slate-50 rounded-xl p-4 mb-5 flex items-center justify-between">
            <span className="font-semibold text-slate-700">Grand Total</span>
            <span className="text-2xl font-bold text-slate-900">₹{grandTotal}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Cancel</button>
            <button onClick={handleSubmit} disabled={sending}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2">
              {sending && <Loader2 className="w-4 h-4 animate-spin" />}
              {sending ? "Sending..." : isEdit ? "Save Changes" : "📤 Send Bill"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ Main PaymentsTable ═══ */
export default function PaymentsTable() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editPayment, setEditPayment] = useState(null);

  const fetchPayments = () => {
    setLoading(true);
    api.get("/admin/payments")
      .then(res => setPayments(res.data.payments || []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchPayments(); }, []);

  const successful = payments.filter(p => ["paid", "success", "captured"].includes(p.status));
  const pending = payments.filter(p => ["pending", "created"].includes(p.status));
  const totalRevenue = successful.reduce((s, p) => s + Number(p.amount || 0), 0);

  const statCards = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, icon: CreditCard, color: "from-violet-500 to-purple-600" },
    { label: "Successful", value: successful.length, icon: TrendingUp, color: "from-green-500 to-emerald-600" },
    { label: "Pending", value: pending.length, icon: Clock, color: "from-amber-500 to-orange-600" },
  ];

  const handleDeletePayment = async (p) => {
    if (!window.confirm(`Are you sure you want to delete payment/bill #${p.id} for ₹${p.amount}?`)) return;
    try {
      await api.delete(`/admin/payments/${p.id}`);
      toast.success("Payment deleted successfully", ts);
      fetchPayments();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Failed to delete payment");
    }
  };

  const handleExport = () => {
    const headers = "Customer,Plan,Amount,Method,Status,Payment ID,Date\n";
    const csv = payments.map(p =>
      `"${p.customer_name || ''}","${p.plan_name || ''}","${p.amount}","${p.payment_method || ''}","${p.status}","${p.razorpay_payment_id || ''}","${p.paid_at || p.created_at || ''}"`
    ).join("\n");
    const blob = new Blob([headers + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `payments_export_${new Date().toISOString().split("T")[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Payments exported", ts);
  };

  return (
    <motion.div {...fadeIn}>
      <Toaster position="top-right" />
      <div style={{ height: 3, background: "linear-gradient(90deg, #00d4ff, #0066ff)", borderRadius: 2, marginBottom: 16 }} />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Payments & Bills</h1>
          <p className="text-gray-500 text-sm">All payment transactions</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg transition">
            <Plus className="w-4 h-4" /> Create & Send Bill
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 transition">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.label} {...fadeIn} transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4"
              whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.08)" }}>
              <div className={`w-12 h-12 bg-gradient-to-r ${c.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                <p className="text-xs text-slate-500">{c.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["#", "Customer", "Plan", "Amount", "Method", "Status", "Date", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : payments.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-16 text-center">
                <CreditCard className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No payments yet</p>
              </td></tr>
            ) : payments.map((p, i) => (
              <tr key={p.id} className={`hover:bg-cyan-50/30 transition ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                <td className="px-5 py-3 text-slate-400">#{p.id}</td>
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{p.customer_name || "—"}</p>
                  <p className="text-xs text-slate-400">{p.customer_email || ""}</p>
                </td>
                <td className="px-5 py-3 text-slate-600">{p.plan_name || "—"}</td>
                <td className="px-5 py-3 text-slate-900 font-medium">₹{p.amount}</td>
                <td className="px-5 py-3 text-slate-600 capitalize">{p.payment_method || "—"}</td>
                <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-3 text-slate-400 text-xs">
                  {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-3 flex gap-2 items-center">
                  {["pending", "created"].includes(p.status) && (
                    <button onClick={() => setEditPayment(p)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-cyan-300 text-cyan-600 hover:bg-cyan-50 transition">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                  <button onClick={() => handleDeletePayment(p)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && <BillModal mode="create" onClose={() => setShowCreateModal(false)} onSuccess={fetchPayments} />}
        {editPayment && <BillModal mode="edit" editData={editPayment} onClose={() => setEditPayment(null)} onSuccess={fetchPayments} />}
      </AnimatePresence>
    </motion.div>
  );
}