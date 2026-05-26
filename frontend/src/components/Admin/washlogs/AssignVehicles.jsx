import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, UserPlus, Check, X, Loader2, Filter } from "lucide-react";
import api from "../../../services/api";

const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

const freqColors = {
  daily: "bg-blue-100 text-blue-700",
  alternate: "bg-purple-100 text-purple-700",
  other: "bg-slate-100 text-slate-600",
};

export default function AssignVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [washers, setWashers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [freqFilter, setFreqFilter] = useState("all");
  const [assigningId, setAssigningId] = useState(null); // subscription_id being assigned
  const [selectedWasher, setSelectedWasher] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, wRes] = await Promise.all([
        api.get("/admin/washlogs/vehicles-to-assign"),
        api.get("/admin/subscriptions/washers"),
      ]);
      console.log("=== ASSIGN VEHICLES DEBUG ===");
      console.log("API response:", vRes.data);
      console.log("Vehicles count:", vRes.data.vehicles?.length);
      console.log("Washers count:", wRes.data?.length);
      setVehicles(vRes.data.vehicles || []);
      setWashers(wRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
      console.error("Response:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = vehicles.filter((v) => {
    const matchSearch =
      !search ||
      v.vehicle_number?.toLowerCase().includes(search.toLowerCase()) ||
      v.owner_name?.toLowerCase().includes(search.toLowerCase());
    const matchFreq = freqFilter === "all" || (v.frequency || "daily") === freqFilter;
    return matchSearch && matchFreq;
  });

  const handleAssign = async (vehicle) => {
    if (!selectedWasher) return;
    setAssigning(true);
    try {
      const subId = vehicle.subscription_id || "none";
      await api.patch(`/admin/subscriptions/${subId}/assign-washer`, {
        washer_id: selectedWasher,
        vehicle_id: vehicle.vehicle_id,
      });
      // Update local state
      setVehicles((prev) =>
        prev.map((v) =>
          v.vehicle_id === vehicle.vehicle_id
            ? {
                ...v,
                washer_id: selectedWasher,
                washer_name: washers.find((w) => w.id === selectedWasher)?.full_name || washers.find((w) => w.id === selectedWasher)?.name || "Assigned",
                wash_status: "pending",
                wash_record_id: true,
              }
            : v
        )
      );
      setAssigningId(null);
      setSelectedWasher(null);
    } catch (err) {
      console.error("Assign error:", err.response?.data);
      alert(err.response?.data?.message || "Assignment failed");
    } finally {
      setAssigning(false);
    }
  };

  const assignedCount = vehicles.filter((v) => v.wash_record_id).length;
  const totalCount = vehicles.length;

  return (
    <motion.div {...fadeIn}>
      <div style={{ height: 3, background: "linear-gradient(90deg, #00d4ff, #0066ff)", borderRadius: 2, marginBottom: 16 }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/admin/washlogs")} className="p-2 rounded-lg hover:bg-slate-100 transition">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Assign Vehicles for Wash</h1>
            <p className="text-gray-500 text-sm">
              {assignedCount}/{totalCount} assigned today
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
            ✅ {assignedCount}
          </span>
          <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
            ❌ {totalCount - assignedCount}
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicles or owner..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        <select
          value={freqFilter}
          onChange={(e) => setFreqFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="all">All Frequencies</option>
          <option value="daily">Daily</option>
          <option value="alternate">Alternate</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Sr.", "Vehicle No.", "Vehicle Name", "Owner", "Frequency", "Status", "Washer", "Action"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={8} className="px-5 py-4">
                    <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <p className="text-slate-400 font-medium">No vehicles found</p>
                </td>
              </tr>
            ) : (
              filtered.map((v, i) => {
                const isAssigned = !!v.wash_record_id;
                const freq = v.frequency || "daily";

                return (
                  <tr key={v.subscription_id} className={`hover:bg-cyan-50/30 transition ${i % 2 === 1 ? "bg-slate-50/40" : ""}`}>
                    <td className="px-5 py-3 text-slate-500 text-xs">{i + 1}</td>
                    <td className="px-5 py-3 font-mono font-bold text-slate-900">{v.vehicle_number}</td>
                    <td className="px-5 py-3 text-slate-600 font-medium">{v.vehicle_model || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="font-medium text-slate-800">{v.owner_name}</span>
                      {v.owner_phone && (
                        <span className="block text-xs text-slate-400">{v.owner_phone}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${freqColors[freq] || freqColors.other}`}>
                        {freq}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {isAssigned ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold">
                          <Check className="w-4 h-4" /> Assigned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold">
                          <X className="w-4 h-4" /> Not Assigned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-sm">{v.washer_name || "—"}</td>
                    <td className="px-5 py-3">
                      {assigningId === v.vehicle_id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedWasher || ""}
                            onChange={(e) => setSelectedWasher(Number(e.target.value))}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 max-w-[160px]"
                          >
                            <option value="">Select Washer</option>
                            {washers.map((w) => (
                              <option key={w.id} value={w.id}>{w.full_name || w.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssign(v)}
                            disabled={!selectedWasher || assigning}
                            className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 disabled:opacity-50 transition"
                          >
                            {assigning ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                          </button>
                          <button
                            onClick={() => { setAssigningId(null); setSelectedWasher(null); }}
                            className="px-2 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs hover:bg-slate-200 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setAssigningId(v.vehicle_id); setSelectedWasher(v.washer_id || null); }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-700 text-xs font-semibold hover:bg-cyan-100 transition border border-cyan-200"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          {isAssigned ? "Reassign" : "Assign"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
