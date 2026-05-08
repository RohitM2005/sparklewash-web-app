import { useEffect, useState } from "react";
import api from "../../services/api";

function WasherDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get("/washer/dashboard");
        setAssignments(res.data.assignedVehicles || []);
      } catch (err) {
        console.error("Washer dashboard error:", err);
        setError(
          err.response?.data?.message || "Failed to load washer dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const handleStartWash = async (assignment) => {
    // Placeholder for future API – update status locally for now
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignment.id ? { ...a, status: "in_progress" } : a
      )
    );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-slate-500">Loading washer dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">
        Washer Dashboard
      </h1>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 text-red-700 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {assignments.length === 0 ? (
        <p className="text-slate-500">No vehicles assigned yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignments.map((v) => (
            <div
              key={v.id}
              className="bg-white shadow-md rounded-xl p-4 border border-slate-100"
            >
              <h3 className="font-semibold text-lg">
                {v.vehicle_number}
              </h3>
              <p className="text-sm text-gray-500">
                Status: <span className="font-medium capitalize">{v.status}</span>
              </p>

              <button
                onClick={() => handleStartWash(v)}
                disabled={v.status === "completed" || v.status === "in_progress"}
                className={`mt-4 w-full py-2 rounded-lg text-white transition ${
                  v.status === "completed" || v.status === "in_progress"
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {v.status === "completed"
                  ? "Completed"
                  : v.status === "in_progress"
                  ? "In Progress"
                  : "Start Wash"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default WasherDashboard;
