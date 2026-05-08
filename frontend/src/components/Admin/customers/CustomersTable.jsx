import { useState, useEffect } from "react";
import { Search, Eye } from "lucide-react";
import api from "../../../services/api";

export default function CustomersTable() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get(`/admin/users?search=${search}&limit=50`)
      .then(res => setCustomers((res.data.users || []).filter(u => u.role === "customer")))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Customers</h1>
        <p className="text-gray-500 text-sm">All registered customers</p>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Name", "Email", "Phone", "Status", "Joined"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : customers.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-400">No customers found</td></tr>
            ) : customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-3 font-medium text-slate-900">{c.full_name || c.name}</td>
                <td className="px-5 py-3 text-slate-600">{c.email}</td>
                <td className="px-5 py-3 text-slate-600">{c.phone || "—"}</td>
                <td className="px-5 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    (c.status || "active") === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}>{c.status || "active"}</span>
                </td>
                <td className="px-5 py-3 text-slate-400 text-xs">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}