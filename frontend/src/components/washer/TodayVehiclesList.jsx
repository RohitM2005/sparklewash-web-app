import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Loader2, Phone, MapPin, Clock, AlertTriangle,
} from "lucide-react";
import { getTodayVehicles, startWash, reportIssue } from "../../services/washer.service";

const typeEmoji = { sedan: "🚗", suv: "🚙", hatchback: "🚗", micro: "🚗", mini_suv: "🚙", van: "🚐", bike: "🏍️" };

const statusConfig = {
  pending:         { border: "border-l-amber-400",  badge: "bg-amber-100 text-amber-700",  label: "Pending" },
  washing:         { border: "border-l-blue-500",   badge: "bg-blue-100 text-blue-700",    label: "Washing" },
  completed:       { border: "border-l-green-500",  badge: "bg-green-100 text-green-700",  label: "Completed" },
  skipped:         { border: "border-l-slate-400",  badge: "bg-slate-100 text-slate-600",  label: "Skipped" },
  issue_reported:  { border: "border-l-red-500",    badge: "bg-red-100 text-red-700",      label: "Issue" },
  active:          { border: "border-l-amber-400",  badge: "bg-amber-100 text-amber-700",  label: "Pending" },
};

const filters = [
  { id: "all",       label: "All" },
  { id: "pending",   label: "Pending" },
  { id: "washing",   label: "Washing" },
  { id: "completed", label: "Completed" },
  { id: "issues",    label: "Issues" },
];

export default function TodayVehiclesList() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [confirmStart, setConfirmStart] = useState(null);
  const [showIssue, setShowIssue] = useState(null);

  const load = async () => {
    try {
      const res = await getTodayVehicles();
      const mappedVehicles = (res.vehicles || []).map(v => ({
        ...v,
        status: v.wash_status || v.status
      }));
      console.log("=== FRONTEND VEHICLES ===", mappedVehicles);
      setVehicles(mappedVehicles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === "all"
    ? vehicles
    : filter === "issues"
      ? vehicles.filter(v => v.status === "issue_reported")
      : vehicles.filter(v => v.status === filter || (filter === "pending" && v.status === "active"));

  const remaining = vehicles.filter(v => v.status === "pending" || v.status === "active" || v.status === "washing").length;

  const handleStart = async (recordId) => {
    try {
      await startWash(recordId);
      setVehicles(prev => prev.map(v =>
        v.record_id === recordId ? { ...v, status: "washing", started_at: new Date().toISOString() } : v
      ));
      setConfirmStart(null);
      navigate(`/washer/vehicles/${recordId}/wash`);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start wash");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
        <span className="ml-2 text-slate-500 text-lg">Loading vehicles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/washer")} className="p-2 rounded-lg hover:bg-slate-100 transition">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 flex-1">Today's Vehicles</h1>
        {remaining > 0 && (
          <span className="bg-amber-100 text-amber-700 rounded-full px-3 py-1 text-sm font-semibold">
            {remaining} remaining
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              filter === f.id
                ? "bg-cyan-500 text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Vehicle Cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-500 text-lg">
            {filter === "all" ? "No vehicles assigned today 🚗" : `No ${filter} vehicles`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((v) => {
            const st = v.status || "pending";
            const cfg = statusConfig[st] || statusConfig.pending;
            const name = v.customer_name || "Customer";
            const vType = v.vehicle_type || v.v_type || "sedan";

            return (
              <div key={v.record_id || v.vehicle_id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden border-l-4 ${cfg.border} ${
                  st === "washing" ? "ring-2 ring-blue-200 ring-offset-1" : ""
                }`}
              >
                <div className="p-4 space-y-3">
                  {/* Row 1: Name + Badge */}
                  <div className="flex items-start justify-between">
                    <p className="font-bold text-lg text-slate-900">{name}</p>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${cfg.badge}`}>{cfg.label}</span>
                  </div>

                  {/* Row 2: Vehicle number */}
                  <p className="font-mono font-bold text-xl tracking-wider text-slate-800">
                    {v.vehicle_number}
                  </p>

                  {/* Row 3: Model + type */}
                  <p className="text-sm text-slate-500">
                    {v.vehicle_model || "Vehicle"} {typeEmoji[vType] || "🚗"}
                  </p>

                  {/* Row 4: Address */}
                  {v.address && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {v.address}
                    </p>
                  )}

                  {/* Row 5: Phone */}
                  {v.customer_phone && (
                    <a href={`tel:${v.customer_phone}`} className="text-xs text-cyan-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {v.customer_phone}
                    </a>
                  )}

                  {/* Actions */}
                  {st === "pending" || st === "active" ? (
                    <div className="space-y-2 pt-1">
                      {confirmStart === v.record_id ? (
                        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 space-y-3">
                          <p className="text-sm font-medium text-cyan-800">Ready to wash <strong>{v.vehicle_number}</strong>?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStart(v.record_id)}
                              className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 text-sm"
                              style={{ minHeight: 48 }}
                            >
                              ✅ Yes, Start Wash
                            </button>
                            <button
                              onClick={() => setConfirmStart(null)}
                              className="px-4 py-3 rounded-xl font-medium text-slate-600 bg-slate-100 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setConfirmStart(v.record_id)}
                            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 text-base active:scale-[0.98] transition"
                            style={{ minHeight: 48 }}
                          >
                            🚿 Start Wash
                          </button>
                          <button
                            onClick={() => setShowIssue(v.record_id)}
                            className="w-full py-3 rounded-xl font-medium text-red-600 border border-red-200 hover:bg-red-50 text-sm transition"
                            style={{ minHeight: 48 }}
                          >
                            ⚠️ Report Issue
                          </button>
                        </>
                      )}
                    </div>
                  ) : st === "washing" ? (
                    <div className="space-y-2 pt-1">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2">
                        <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-blue-700">Washing in progress...</span>
                        {v.started_at && (
                          <span className="ml-auto text-xs text-blue-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <ElapsedTimer from={v.started_at} />
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/washer/vehicles/${v.record_id}/wash`)}
                        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 text-base active:scale-[0.98] transition"
                        style={{ minHeight: 48 }}
                      >
                        ✅ Complete Wash
                      </button>
                    </div>
                  ) : st === "completed" ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-center">
                      <p className="text-sm font-medium text-green-700">
                        ✅ Completed {v.completed_at ? `at ${new Date(v.completed_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}
                      </p>
                    </div>
                  ) : st === "issue_reported" ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                      <p className="text-sm font-medium text-red-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" /> Issue: {v.issue_type?.replace(/_/g, " ") || "Reported"}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Issue Report Modal */}
      {showIssue && (
        <IssueModal
          recordId={showIssue}
          onClose={() => setShowIssue(null)}
          onSubmit={() => { setShowIssue(null); load(); }}
        />
      )}
    </div>
  );
}

/* ===== Elapsed Timer ===== */
function ElapsedTimer({ from }) {
  const [elapsed, setElapsed] = useState("");
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(from).getTime()) / 1000));
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      setElapsed(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [from]);
  return <span>{elapsed}</span>;
}

/* ===== Inline Issue Modal ===== */
function IssueModal({ recordId, onClose, onSubmit }) {
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const issueTypes = [
    { id: "car_not_available", label: "🚗 Car Not Available", emoji: "🚗" },
    { id: "parking_locked",    label: "🔒 Parking Locked",    emoji: "🔒" },
    { id: "rain",              label: "🌧️ Rain Issue",        emoji: "🌧️" },
    { id: "customer_complaint",label: "😤 Customer Complaint",emoji: "😤" },
    { id: "other",             label: "📝 Other Issue",       emoji: "📝" },
  ];

  const handleSubmit = async () => {
    if (!type) return;
    setSubmitting(true);
    try {
      await reportIssue(recordId, { issue_type: type, note });
      onSubmit();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to report issue");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-4 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Report Issue</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
        </div>

        <p className="text-sm text-slate-500">Select the issue type:</p>

        <div className="grid grid-cols-2 gap-3">
          {issueTypes.slice(0, 4).map(it => (
            <button
              key={it.id}
              onClick={() => setType(it.id)}
              className={`p-4 rounded-xl border-2 text-sm font-medium text-center transition ${
                type === it.id
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              style={{ minHeight: 64 }}
            >
              <span className="text-2xl block mb-1">{it.emoji}</span>
              {it.label.replace(it.emoji + " ", "")}
            </button>
          ))}
        </div>
        <button
          onClick={() => setType("other")}
          className={`w-full p-4 rounded-xl border-2 text-sm font-medium text-center transition ${
            type === "other"
              ? "border-red-500 bg-red-50 text-red-700"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          style={{ minHeight: 56 }}
        >
          📝 Other Issue
        </button>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add details... (optional)"
          rows={3}
          className="w-full border border-slate-200 rounded-xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
        />

        <button
          onClick={handleSubmit}
          disabled={!type || submitting}
          className="w-full py-3.5 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-base transition"
          style={{ minHeight: 48 }}
        >
          {submitting ? "Submitting..." : "Submit Issue"}
        </button>
      </div>
    </div>
  );
}
