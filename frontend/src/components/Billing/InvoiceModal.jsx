import React, { useState, useEffect } from "react";
import { X, Printer, Download, CheckCircle2, Building2, User, Phone, Mail, MapPin, CreditCard, Calendar, ShieldCheck, Loader2 } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function InvoiceModal({ paymentId, onClose }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!paymentId) return;
    setLoading(true);
    setError(null);
    api.get(`/customer/billing/invoice/${paymentId}`)
      .then(res => {
        if (res.data?.success) {
          setInvoice(res.data.invoice);
        } else {
          setError(res.data?.error || "Failed to load invoice");
        }
      })
      .catch(err => {
        setError(err.response?.data?.error || err.message || "Failed to load invoice");
      })
      .finally(() => setLoading(false));
  }, [paymentId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast.success("Printing / Saving invoice as PDF...");
    window.print();
  };

  if (!paymentId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      {/* Printable Container */}
      <div 
        id="printable-invoice"
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200 print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Action Bar (Hidden during print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-semibold tracking-wide">Official Tax Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
              title="Print Invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white transition shadow-sm"
              title="Download PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Invoice Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[82vh] print:max-h-none print:overflow-visible print:p-8">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
              <p className="text-xs font-medium">Generating Tax Invoice...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-500 space-y-2">
              <p className="font-semibold text-sm">Unable to display invoice</p>
              <p className="text-xs text-slate-500">{error}</p>
              <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-100 rounded-xl text-xs font-medium text-slate-700">Close</button>
            </div>
          ) : invoice ? (
            <div className="space-y-6">
              
              {/* Top Branding & Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2.5">
                    <img 
                      src="/logo.jpg" 
                      alt="SparkleWash Logo" 
                      className="w-9 h-9 rounded-xl object-cover shadow-sm border border-slate-100" 
                    />
                    <span className="text-xl font-bold text-slate-900 tracking-tight">SparkleWash</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Smartwash Car Care Services India</p>
                  <p className="text-[11px] text-slate-400">www.sparklewash.in · support@sparklewash.in</p>
                </div>

                <div className="sm:text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="uppercase tracking-wider">{invoice.status}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 font-mono">{invoice.invoice_number}</h2>
                  <p className="text-xs text-slate-500">
                    Paid Date: <strong className="text-slate-700">{invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}</strong>
                  </p>
                </div>
              </div>

              {/* Customer & Payment Meta Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
                
                {/* Billed To */}
                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Billed To Customer</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{invoice.customer?.name}</span>
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{invoice.customer?.email}</span>
                  </p>
                  {invoice.customer?.phone && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>+91 {invoice.customer?.phone}</span>
                    </p>
                  )}
                  {invoice.customer?.address && (
                    <p className="text-xs text-slate-500 flex items-start gap-1.5 mt-1 pt-1 border-t border-slate-200/60">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                      <span>{invoice.customer?.address}</span>
                    </p>
                  )}
                </div>

                {/* Transaction Meta */}
                <div className="space-y-1.5 sm:border-l sm:border-slate-200/80 sm:pl-5">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Transaction Details</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Payment ID:</span>
                    <span className="font-mono font-medium text-slate-900">#{invoice.payment_id}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Payment Method:</span>
                    <span className="font-medium text-slate-900 capitalize">{invoice.payment_method}</span>
                  </div>
                  {invoice.razorpay_payment_id !== "N/A" && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Razorpay Ref:</span>
                      <span className="font-mono text-[11px] text-cyan-700 font-semibold truncate max-w-[140px]" title={invoice.razorpay_payment_id}>
                        {invoice.razorpay_payment_id}
                      </span>
                    </div>
                  )}
                  {invoice.bill_month && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Billing Period:</span>
                      <span className="font-medium text-slate-900">{invoice.bill_month}</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Admin Note if present */}
              {invoice.bill_note && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  📝 <strong className="font-semibold">Note:</strong> {invoice.bill_note}
                </div>
              )}

              {/* Itemized Table */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Service Breakdown</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wide">
                      <tr>
                        <th className="p-3">Service / Vehicle</th>
                        <th className="p-3 text-center">Plan</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      
                      {/* Vehicle Subscriptions */}
                      {invoice.vehicles?.length > 0 ? (
                        invoice.vehicles.map((v, i) => (
                          <tr key={v.id || i} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <p className="font-bold text-slate-900 font-mono tracking-wide">{v.vehicle_number}</p>
                              <p className="text-[11px] text-slate-500">{v.vehicle_model || v.vehicle_type || "Vehicle"}</p>
                              {v.washer_name && <p className="text-[10px] text-cyan-700">Washer: {v.washer_name}</p>}
                            </td>
                            <td className="p-3 text-center text-slate-700 font-medium">{v.plan_name || "Daily Wash"}</td>
                            <td className="p-3 text-right font-bold text-slate-900">₹{Number(v.monthly_price || 0).toLocaleString("en-IN")}</td>
                          </tr>
                        ))
                      ) : (
                        <tr className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <p className="font-bold text-slate-900">Monthly Wash Plan</p>
                          </td>
                          <td className="p-3 text-center text-slate-700 font-medium">Daily Wash</td>
                          <td className="p-3 text-right font-bold text-slate-900">₹{Number(invoice.vehicle_plans_total || 0).toLocaleString("en-IN")}</td>
                        </tr>
                      )}

                      {/* Addon Services */}
                      {invoice.addon_services?.map((addon, i) => (
                        <tr key={addon.id || i} className="bg-purple-50/30">
                          <td className="p-3">
                            <p className="font-bold text-purple-900">{addon.service_type}</p>
                            {addon.vehicle_number && <p className="text-[10px] text-purple-700 font-mono">{addon.vehicle_number} ({addon.vehicle_model})</p>}
                          </td>
                          <td className="p-3 text-center text-purple-700 font-medium text-[11px]">Add-On</td>
                          <td className="p-3 text-right font-bold text-purple-900">₹{Number(addon.amount || 0).toLocaleString("en-IN")}</td>
                        </tr>
                      ))}

                      {/* Washer Fees if present */}
                      {invoice.washer_charge > 0 && (
                        <tr className="bg-blue-50/30">
                          <td className="p-3">
                            <p className="font-bold text-blue-900">Washer Service Fee</p>
                          </td>
                          <td className="p-3 text-center text-blue-700 text-[11px]">Service</td>
                          <td className="p-3 text-right font-bold text-blue-900">+₹{Number(invoice.washer_charge).toLocaleString("en-IN")}</td>
                        </tr>
                      )}

                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary Card */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pt-2">
                <div className="text-xs text-slate-400 space-y-1">
                  <p>• GST / Taxes: <strong className="text-slate-600">₹0.00 (Exempt)</strong></p>
                  <p>• Status: <strong className="text-green-600">Paid in Full</strong></p>
                  <p className="pt-2 text-[10px] text-slate-400">Thank you for choosing SparkleWash!</p>
                </div>

                <div className="w-full sm:w-64 bg-slate-900 text-white rounded-xl p-4 space-y-2 shadow-lg">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-medium text-slate-200">₹{Number(invoice.subtotal).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Taxes / GST:</span>
                    <span className="font-medium text-slate-200">₹0.00</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between items-center">
                    <span className="text-sm font-bold text-cyan-400">Grand Total:</span>
                    <span className="text-lg font-extrabold text-white font-mono">₹{Number(invoice.grand_total).toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
