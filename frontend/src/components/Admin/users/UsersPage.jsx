import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, ChevronUp, Download, Eye, ToggleLeft, ToggleRight, X, Users, UserCheck, UserX, UserPlus } from "lucide-react";
import api from "../../../services/api";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

function UserStatsRow({ stats }) {
  const cards = [
    { label: "Total Users", value: stats.total, icon: Users, bg: "bg-blue-50", text: "text-blue-700" },
    { label: "Active", value: stats.active, icon: UserCheck, bg: "bg-green-50", text: "text-green-700" },
    { label: "Suspended", value: stats.suspended, icon: UserX, bg: "bg-red-50", text: "text-red-700" },
    { label: "New This Month", value: stats.newThisMonth, icon: UserPlus, bg: "bg-amber-50", text: "text-amber-700" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div key={c.label} {...fadeIn} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${c.text}`} />
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

function UserDetailDrawer({ user, onClose }) {
  if (!user) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end" onClick={onClose}>
        <motion.div initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
          transition={{ type: "spring", damping: 25 }}
          className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
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

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmToggle, setConfirmToggle] = useState(null);
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
      .then(res => {
        setUsers(res.data.users || []);
        setTotal(res.data.total || 0);
      })
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
    } catch {}
  };

  const handleViewDetails = async (user) => {
    try {
      const res = await api.get(`/admin/users/${user.id}/details`);
      setSelectedUser(res.data);
    } catch {
      setSelectedUser(user);
    }
  };

  const handleExport = () => {
    window.open("http://localhost:5000/api/admin/users/export", "_blank");
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <motion.div {...fadeIn}>
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
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg transition">
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
                <tr key={i}><td colSpan={6} className="px-5 py-4">
                  <div className="h-4 bg-slate-100 rounded animate-pulse" />
                </td></tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No users found</td></tr>
            ) : users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-3 font-medium text-slate-900">{u.full_name || u.name}</td>
                <td className="px-5 py-3 text-slate-600">{u.email}</td>
                <td className="px-5 py-3 text-slate-600">{u.phone || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    u.role === "admin" ? "bg-violet-100 text-violet-700" :
                    u.role === "washer" ? "bg-blue-100 text-blue-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>{u.role}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    (u.status || "active") === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}>{u.status || "active"}</span>
                </td>
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setConfirmToggle(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold mb-2">Confirm Status Change</h3>
              <p className="text-sm text-slate-600 mb-6">
                {(confirmToggle.status || "active") === "active"
                  ? `Suspend ${confirmToggle.full_name || confirmToggle.name}? They won't be able to access their account.`
                  : `Reactivate ${confirmToggle.full_name || confirmToggle.name}?`
                }
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

      {/* Detail Drawer */}
      {selectedUser && <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />}
    </motion.div>
  );
}
