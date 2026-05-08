import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Car } from "lucide-react";
import api from "../../../services/api";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const typeLabels = { micro: "Hatchback", sedan: "Sedan", mini_suv: "Mini SUV", suv: "SUV" };

export default function VehiclesTable() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/vehicles")
      .then(res => setVehicles(res.data.vehicles || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div {...fadeIn}>
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Vehicle Management</h1>
        <p className="text-gray-500 text-sm">All registered customer vehicles</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Vehicle", "Type", "Owner", "Phone", "Washer", "Plan", "Status", "Registered"].map(h => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td></tr>
              ))
            ) : vehicles.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center">
                  <Car className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-400">No vehicles registered yet</p>
                </td>
              </tr>
            ) : vehicles.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 transition">
                <td className="px-5 py-3">
                  <p className="font-medium text-slate-900">{v.vehicle_number}</p>
                  <p className="text-xs text-slate-400">{v.vehicle_model || ""}</p>
                </td>
                <td className="px-5 py-3 text-slate-600">{typeLabels[v.vehicle_type] || v.vehicle_type}</td>
                <td className="px-5 py-3 font-medium text-slate-900">{v.owner_name || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{v.owner_phone || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{v.washer_name || "—"}</td>
                <td className="px-5 py-3 text-slate-600">{v.plan_name || "—"}</td>
                <td className="px-5 py-3">
                  {v.subscription_status ? (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      v.subscription_status === "active" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    }`}>{v.subscription_status}</span>
                  ) : <span className="text-xs text-slate-400">No sub</span>}
                </td>
                <td className="px-5 py-3 text-slate-400 text-xs">
                  {v.created_at ? new Date(v.created_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}