import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, Upload, Eye, ToggleLeft, ToggleRight, X, Users, UserCheck, UserX, UserPlus, Loader2 } from "lucide-react";
import api from "../../../services/api";
import toast, { Toaster } from "react-hot-toast";
import Papa from "papaparse";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

/* ── Status Badge with dot ── */
function StatusBadge({ status }) {
  const s = status || "active";
  const colors = { active: "bg-green-500", suspended: "bg-red-500" };
  const bgColors = { active: "bg-green-50 text-green-700", suspended: "bg-red-50 text-red-600" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${bgColors[s] || bgColors.active}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors[s] || colors.active}`} />
      {s}
    </span>
  );
}

function RoleBadge({ role }) {
  const colors = {
    admin: "bg-violet-50 text-violet-700",
    washer: "bg-blue-50 text-blue-700",
    customer: "bg-slate-100 text-slate-600",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[role] || colors.customer}`}>{role}</span>;
}

/* ── Stat Cards ── */
function UserStatsRow({ stats }) {
  const cards = [
    { label: "Total Users", value: stats.total, icon: Users, gradient: "from-cyan-500 to-blue-600" },
    { label: "Active", value: stats.active, icon: UserCheck, gradient: "from-green-500 to-emerald-600" },
    { label: "Suspended", value: stats.suspended, icon: UserX, gradient: "from-red-500 to-rose-600" },
    { label: "New This Month", value: stats.newThisMonth, icon: UserPlus, gradient: "from-amber-500 to-orange-600" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div key={c.label} {...fadeIn} transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3 cursor-default"
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
  );
}

/* ── User Detail Drawer ── */
function UserDetailDrawer({ user, onClose }) {
  if (!user) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end" onClick={onClose}
        style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}>
        <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
          transition={{ type: "spring", damping: 25 }}
          className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
          {/* Gradient header bar */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #00d4ff, #0066ff)" }} />
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-bold text-slate-900">User Details</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {(user.full_name || user.name || "U").charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user.full_name || user.name}</h3>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
            </div>
            {[
              ["Phone", user.phone || "N/A"],
              ["Role", user.role],
              ["Status", user.status || "active"],
              ["Joined", user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"],
              ["Total Washes", user.wash_count ?? "N/A"],
              ["Total Paid", user.total_paid ? `₹${Number(user.total_paid).toLocaleString()}` : "₹0"],
              ["Assigned Washer", user.washer_name || "None"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-medium text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── CSV Import Preview Modal ── */
function ImportPreviewModal({ data, onClose, onImport, importing }) {
  if (!data || data.length === 0) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div style={{ height: 4, background: "linear-gradient(90deg, #00d4ff, #0066ff)" }} />
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Import Preview</h2>
            <p className="text-sm text-slate-500">{data.length} rows found</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="overflow-auto max-h-[50vh]">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 border-b sticky top-0">
              <tr>
                {["Name", "Email", "Phone", "Role", "Status"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                  <td className="px-4 py-2 text-slate-900">{row.name || "—"}</td>
                  <td className="px-4 py-2 text-slate-600">{row.email || "—"}</td>
                  <td className="px-4 py-2 text-slate-600">{row.phone || "—"}</td>
                  <td className="px-4 py-2"><RoleBadge role={row.role || "customer"} /></td>
                  <td className="px-4 py-2"><StatusBadge status={row.status || "active"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t flex gap-3 justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={onImport} disabled={importing}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium disabled:opacity-50 hover:shadow-lg transition flex items-center gap-2"
            style={{ transform: "scale(1)", transition: "transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
            {importing && <Loader2 className="w-4 h-4 animate-spin" />}
            {importing ? "Importing..." : `Import ${data.length} Users`}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════ */
export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);
  const [importData, setImportData] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);
  const limit = 15;

  const stats = {
    total,
    active: users.filter(u => (u.status || "active") === "active").length,
    suspended: users.filter(u => u.status === "suspended").length,
    newThisMonth: users.filter(u => {
      if (!u.created_at) return false;
      const d = new Date(u.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  };

  const fetchUsers = () => {
    setLoading(true);
    api.get(`/admin/users?search=${search}&page=${page}&limit=${limit}`)
      .then(res => { setUsers(res.data.users || []); setTotal(res.data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [search, page]);

  const handleToggleStatus = async (user) => {
    const newStatus = (user.status || "active") === "active" ? "suspended" : "active";
    try {
      await api.patch(`/admin/users/${user.id}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      setConfirmToggle(null);
      toast.success(`User ${newStatus === "active" ? "activated" : "suspended"}`, { style: { background: "#1e293b", color: "#fff" } });
    } catch { toast.error("Failed to update status"); }
  };

  const handleViewDetails = async (user) => {
    try {
      const res = await api.get(`/admin/users/${user.id}/details`);
      setSelectedUser(res.data);
    } catch { setSelectedUser(user); }
  };

  const handleExport = () => {
    const headers = "Name,Email,Phone,Role,Status,Joined\n";
    const filtered = users.length > 0 ? users : [];
    const csv = filtered.map(u =>
      `"${u.full_name || u.name}","${u.email}","${u.phone || ''}","${u.role}","${u.status || 'active'}","${u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}"`
    ).join("\n");
    const blob = new Blob([headers + csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported", { style: { background: "#1e293b", color: "#fff" } });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const valid = results.data.filter(r => r.name && r.email);
        if (valid.length === 0) { toast.error("No valid rows found (name + email required)"); return; }
        setImportData(valid);
      },
      error: () => toast.error("Failed to parse CSV"),
    });
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!importData) return;
    setImporting(true);
    try {
      const res = await api.post("/admin/users/import", { users: importData });
      toast.success(`${res.data.imported} users imported`, { style: { background: "#1e293b", color: "#fff" } });
      if (res.data.errors?.length) toast.error(`${res.data.errors.length} rows had errors`);
      setImportData(null);
      fetchUsers();
    } catch { toast.error("Import failed"); }
    finally { setImporting(false); }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <motion.div {...fadeIn}>
      <Toaster position="top-right" />
      <div style={{ height: 3, background: "linear-gradient(90deg, #00d4ff, #0066ff)", borderRadius: 2, marginBottom: 16 }} />

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500 text-sm">Manage all registered users</p>
      </div>

      <UserStatsRow stats={stats} />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        </div>
        <input type="file" accept=".csv" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
        <button onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium hover:bg-slate-50 transition">
          <Upload className="w-4 h-4" /> Import CSV
        </button>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg transition"
          style={{ transition: "transform 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Name", "Email", "Phone", "Role", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-16 text-center">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-medium">No users found</p>
                <p className="text-slate-300 text-xs mt-1">Try adjusting your search</p>
              </td></tr>
            ) : users.map((u, i) => (
              <tr key={u.id} className={`hover:bg-cyan-50/30 transition ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                <td className="px-5 py-3 font-medium text-slate-900">{u.full_name || u.name}</td>
                <td className="px-5 py-3 text-slate-600">{u.email}</td>
                <td className="px-5 py-3 text-slate-600">{u.phone || "—"}</td>
                <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-5 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleViewDetails(u)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-cyan-600" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmToggle(u)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-amber-600" title="Toggle Status">
                      {(u.status || "active") === "active" ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">Showing {(page-1)*limit+1}–{Math.min(page*limit, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={page<=1} onClick={() => setPage(p=>p-1)}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-slate-50">Prev</button>
            <button disabled={page>=totalPages} onClick={() => setPage(p=>p+1)}
              className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-slate-50">Next</button>
          </div>
        </div>
      )}

      {/* Confirm Toggle Modal */}
      <AnimatePresence>
        {confirmToggle && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }} onClick={() => setConfirmToggle(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div style={{ height: 4, background: "linear-gradient(90deg, #00d4ff, #0066ff)", borderRadius: "8px 8px 0 0", margin: "-24px -24px 16px -24px" }} />
              <h3 className="text-lg font-bold mb-2">Confirm Status Change</h3>
              <p className="text-sm text-slate-600 mb-6">
                {(confirmToggle.status || "active") === "active"
                  ? `Suspend ${confirmToggle.full_name || confirmToggle.name}? They won't be able to access their account.`
                  : `Reactivate ${confirmToggle.full_name || confirmToggle.name}?`}
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmToggle(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50">Cancel</button>
                <button onClick={() => handleToggleStatus(confirmToggle)}
                  className={`flex-1 py-2.5 rounded-xl text-white text-sm font-medium ${
                    (confirmToggle.status || "active") === "active" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                  }`}>
                  {(confirmToggle.status || "active") === "active" ? "Suspend" : "Activate"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Preview Modal */}
      <AnimatePresence>
        {importData && <ImportPreviewModal data={importData} onClose={() => setImportData(null)} onImport={handleImport} importing={importing} />}
      </AnimatePresence>

      {/* Detail Drawer */}
      {selectedUser && <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </motion.div>
  );
}
