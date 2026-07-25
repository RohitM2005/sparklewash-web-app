import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, User, CreditCard, TrendingUp, Clock, Download, Plus, X, Pencil, Loader2, Trash2, Receipt } from "lucide-react";
import api from "../../../services/api";
import toast, { Toaster } from "react-hot-toast";
import InvoiceModal from "../../Billing/InvoiceModal";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [washerCharges, setWasherCharges] = useState("");
  const [billNote, setBillNote] = useState(editData?.bill_note || "");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      api.get("/admin/customers")
        .then(r => setCustomers(r.data.customers || []))
        .catch(() => {});
    }
  }, [isEdit]);

  const handleSelectCustomer = async (c) => {
    setSelectedCustomer(c);
    setSearchQuery("");
    setDropdownOpen(false);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/admin/customers/${c.id}/details`);
      setCustomerDetails(res.data);
    } catch {
      toast.error("Failed to load customer billing details");
      setCustomerDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers.slice(0, 10);
    const q = searchQuery.toLowerCase();
    return customers.filter(c => {
      const nameMatch = (c.full_name || c.name || "").toLowerCase().includes(q);
      const emailMatch = (c.email || "").toLowerCase().includes(q);
      const phoneMatch = (c.phone || "").toLowerCase().includes(q);
      const vehicleMatch = (c.vehicle_numbers || "").toLowerCase().includes(q);
      return nameMatch || emailMatch || phoneMatch || vehicleMatch;
    });
  }, [customers, searchQuery]);

  const vehicleBilling = customerDetails?.vehicle_billing || [];
  const addonServices  = customerDetails?.addon_services || [];

  const plansTotal = useMemo(() => {
    return vehicleBilling.reduce((sum, v) => sum + Number(v.monthly_price || 0), 0);
  }, [vehicleBilling]);

  const addonTotal = useMemo(() => {
    return addonServices.reduce((sum, a) => sum + Number(a.amount || 0), 0);
  }, [addonServices]);

  const grandTotal = plansTotal + addonTotal;
  const washerAmount = Number(washerCharges) || 0;
  const finalBillAmount = grandTotal + washerAmount;

  const handleSubmit = async () => {
    if (!isEdit && !selectedCustomer) {
      return toast.error("Please search and select a customer");
    }
    if (!isEdit && !customerDetails) {
      return toast.error("Customer billing data not loaded");
    }

    setSending(true);
    try {
      if (isEdit) {
        await api.patch(`/admin/billing/${editData.id}/edit`, {
          base_amount: plansTotal || Number(editData.base || 0),
          bill_note: billNote,
        });
        toast.success("Bill updated successfully!", ts);
      } else {
        const activeSub = customerDetails?.subscription || vehicleBilling.find(v => v.sub_id)?.sub_id;
        const subId = typeof activeSub === 'object' ? activeSub.id : activeSub || null;

        const interiorItems = addonServices.map(a => ({
          name: a.service_type || "Add-On Service",
          amount: Number(a.amount || 0),
        }));

        const otherItems = washerAmount > 0
          ? [{ name: "Washer Charges", amount: washerAmount }]
          : [];

        await api.post("/admin/billing/create-and-send", {
          user_id: selectedCustomer.id,
          subscription_id: subId,
          base_amount: plansTotal,
          interior_items: interiorItems,
          other_items: otherItems,
          bill_note: billNote,
        });
        toast.success("Bill sent to customer!", ts);
      }
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.error || e.response?.data?.message || "Failed to send bill");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-[95vw] sm:w-full max-w-lg shadow-2xl overflow-hidden max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: "linear-gradient(90deg, #00d4ff, #0066ff)" }} />
        
        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              {isEdit ? "✏️ Edit Bill" : "📤 Create & Send Bill"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Automated calculation from Customer Billing Summary</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1" style={{ WebkitOverflowScrolling: "touch" }}>
          
          {/* 1. Searchable Customer Select (Create Mode) */}
          {!isEdit && (
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5 block">
                Select Customer
              </label>

              {selectedCustomer ? (
                /* Selected Customer Badge */
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {selectedCustomer.full_name || selectedCustomer.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {selectedCustomer.email} {selectedCustomer.phone ? `· ${selectedCustomer.phone}` : ""}
                      </p>
                      {selectedCustomer.vehicle_numbers && (
                        <p className="text-[11px] text-cyan-700 font-mono font-medium mt-0.5 truncate">
                          {selectedCustomer.vehicle_numbers}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { setSelectedCustomer(null); setCustomerDetails(null); }}
                    className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 px-2.5 py-1 bg-white rounded-lg border border-cyan-200 flex-shrink-0 ml-2 shadow-xs"
                  >
                    Change
                  </button>
                </div>
              ) : (
                /* Search Input + Unclipped Results List */
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => { setSearchQuery(e.target.value); setDropdownOpen(true); }}
                      onFocus={() => setDropdownOpen(true)}
                      placeholder="Search by name, email, phone, or vehicle number…"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white shadow-sm"
                    />
                  </div>

                  {/* Results List — Inline Layout (Never Clipped) */}
                  {dropdownOpen && (
                    <div
                      className="bg-slate-50 border border-slate-200 rounded-xl p-1 max-h-64 sm:max-h-72 overflow-y-auto divide-y divide-slate-200/60 shadow-inner"
                      style={{ WebkitOverflowScrolling: "touch" }}
                    >
                      {filteredCustomers.length === 0 ? (
                        <p className="p-3 text-xs text-slate-400 text-center">No matching customers found</p>
                      ) : (
                        filteredCustomers.map(c => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectCustomer(c)}
                            className="p-2.5 sm:p-3 hover:bg-cyan-50/80 bg-white rounded-lg cursor-pointer transition flex items-center justify-between gap-2 my-0.5"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">
                                {c.full_name || c.name}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {c.email} {c.phone ? `· 📞 ${c.phone}` : ""}
                              </p>
                            </div>
                            {c.vehicle_numbers && (
                              <span className="text-[10px] font-mono bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md flex-shrink-0 border border-cyan-100">
                                {c.vehicle_numbers}
                              </span>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Loading Customer Details */}
          {loadingDetails && (
            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
              <span>Fetching customer billing data…</span>
            </div>
          )}

          {/* 2. Bill Summary & Optional Washer Charges */}
          {(!loadingDetails && (selectedCustomer || isEdit)) && (
            <div className="space-y-4">
              
              {/* Optional Washer Charges Field */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 block">
                  Washer Charges (₹) <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={washerCharges}
                  onChange={e => setWasherCharges(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              {/* Bill Note */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 block">
                  Bill Note <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  value={billNote}
                  onChange={e => setBillNote(e.target.value)}
                  rows={2}
                  placeholder="Any note for customer..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
                />
              </div>

              {/* 3. Bill Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 border-b border-slate-200 pb-1.5">
                  Bill Summary
                </p>

                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Vehicle Plans Total</span>
                  <span className="font-semibold text-slate-900">₹{plansTotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span>Add-On Services Total</span>
                  <span className="font-semibold text-purple-700">₹{addonTotal.toLocaleString("en-IN")}</span>
                </div>

                {washerAmount > 0 && (
                  <div className="flex justify-between items-center text-xs text-blue-600">
                    <span>Washer Charges</span>
                    <span className="font-semibold">+₹{washerAmount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Final Bill Amount</span>
                  <span className="text-lg font-bold text-blue-700">
                    ₹{finalBillAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 pt-3 border-t border-slate-100 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={sending || (!isEdit && (!selectedCustomer || loadingDetails))}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition shadow-md hover:opacity-95"
          >
            {sending && <Loader2 className="w-4 h-4 animate-spin" />}
            {sending ? "Sending..." : isEdit ? "Save Changes" : "📤 Send Bill"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══ Edit Payment Modal ═══ */
function EditPaymentModal({ payment, onClose, onSuccess }) {
  const [amount, setAmount] = useState(payment?.amount !== undefined && payment?.amount !== null ? String(payment.amount) : "");
  const [planName, setPlanName] = useState(payment?.plan_name || "Daily Wash");
  const [status, setStatus] = useState(payment?.status || "pending");
  const [paymentMethod, setPaymentMethod] = useState(payment?.payment_method || "razorpay");
  const [billNote, setBillNote] = useState(payment?.bill_note || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (payment) {
      setAmount(payment.amount !== undefined && payment.amount !== null ? String(payment.amount) : "");
      setPlanName(payment.plan_name || "Daily Wash");
      setStatus(payment.status || "pending");
      setPaymentMethod(payment.payment_method || "razorpay");
      setBillNote(payment.bill_note || "");
    }
  }, [payment]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      return toast.error("Please enter a valid payment amount greater than ₹0");
    }

    setSaving(true);
    try {
      await api.patch(`/admin/billing/${payment.id}/edit`, {
        amount: numAmount,
        base_amount: numAmount,
        plan_name: planName,
        status: status,
        payment_method: paymentMethod,
        bill_note: billNote,
      });

      toast.success("Payment updated successfully!", ts);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || "Failed to update payment");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="bg-white rounded-2xl w-[95vw] sm:w-full max-w-md shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: "linear-gradient(90deg, #00d4ff, #0066ff)" }} />
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              ✏️ Edit Payment #{payment?.id}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <span className="font-semibold text-slate-700">{payment?.customer_name || payment?.customer_email || "Customer"}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"><X className="w-5 h-5" /></button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[78vh]">
          
          {/* Amount Field */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 block">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 1299"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          {/* Plan Name Field */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 block">
              Plan Name
            </label>
            <input
              type="text"
              value={planName}
              onChange={e => setPlanName(e.target.value)}
              placeholder="e.g. Daily Wash"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 block">
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="captured">Captured</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 block">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white"
            >
              <option value="razorpay">Razorpay</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
            </select>
          </div>

          {/* Bill Note */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1 block">
              Bill Note / Remarks <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              value={billNote}
              onChange={e => setBillNote(e.target.value)}
              rows={2}
              placeholder="Add note for customer..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2 transition shadow-md hover:opacity-95"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
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
  const [viewInvoiceId, setViewInvoiceId] = useState(null);

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
            ) : payments.map((p, i) => {
              const isPaid = ["paid", "captured", "success"].includes((p.status || "").toLowerCase());
              return (
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
                    {isPaid && (
                      <button onClick={() => setViewInvoiceId(p.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 transition">
                        <Receipt className="w-3.5 h-3.5" /> Invoice
                      </button>
                    )}
                    <button onClick={() => setEditPayment(p)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-cyan-300 text-cyan-600 hover:bg-cyan-50 transition">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDeletePayment(p)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-50 transition">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && <BillModal mode="create" onClose={() => setShowCreateModal(false)} onSuccess={fetchPayments} />}
        {editPayment && <EditPaymentModal payment={editPayment} onClose={() => setEditPayment(null)} onSuccess={fetchPayments} />}
        {viewInvoiceId && <InvoiceModal paymentId={viewInvoiceId} onClose={() => setViewInvoiceId(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}