import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Loader2, Phone, MapPin, Clock, AlertTriangle, CheckCircle2, Car, Sparkles
} from "lucide-react";
import { getTodayVehicles, startWash, reportIssue } from "../../services/washer.service";

const typeEmoji = { sedan: "🚗", suv: "🚙", hatchback: "🚗", micro: "🚗", mini_suv: "🚙", van: "🚐", bike: "🏍️" };

const statusConfig = {
  pending:         { border: "border-l-amber-400",  badge: "bg-amber-100 text-amber-800 border-amber-200",  label: "Pending" },
  washing:         { border: "border-l-blue-500",   badge: "bg-blue-100 text-blue-800 border-blue-200",    label: "Washing" },
  completed:       { border: "border-l-green-500",  badge: "bg-green-100 text-green-800 border-green-200",  label: "Completed" },
  skipped:         { border: "border-l-slate-400",  badge: "bg-slate-100 text-slate-700 border-slate-200",  label: "Skipped" },
  issue_reported:  { border: "border-l-red-500",    badge: "bg-red-100 text-red-800 border-red-200",      label: "Issue" },
  active:          { border: "border-l-amber-400",  badge: "bg-amber-100 text-amber-800 border-amber-200",  label: "Pending" },
};

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
      setVehicles(mappedVehicles);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filter logic
  const filtered = filter === "all"
    ? vehicles
    : filter === "issues"
      ? vehicles.filter(v => v.status === "issue_reported")
      : vehicles.filter(v => v.status === filter || (filter === "pending" && v.status === "active"));

  // Badge counts
  const pendingCount = vehicles.filter(v => v.status === "pending" || v.status === "active").length;
  const washingCount = vehicles.filter(v => v.status === "washing").length;
  const completedCount = vehicles.filter(v => v.status === "completed").length;
  const issuesCount = vehicles.filter(v => v.status === "issue_reported").length;
  const remaining = pendingCount + washingCount;

  const filterTabs = [
    { id: "all",       label: "All",       count: vehicles.length },
    { id: "pending",   label: "Pending",   count: pendingCount },
    { id: "washing",   label: "Washing",   count: washingCount },
    { id: "completed", label: "Completed", count: completedCount },
    { id: "issues",    label: "Issues",    count: issuesCount },
  ];

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
      <div className="flex items-center justify-center py-20 min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <span className="ml-3 text-slate-600 font-semibold text-base">Loading today's vehicles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto w-full px-1 sm:px-0">
      
      {/* Page Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/washer")}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition text-slate-700 active:scale-95 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 leading-tight">Today's Vehicles</h1>
            <p className="text-xs text-slate-500">Assigned wash queue</p>
          </div>
        </div>

        {remaining > 0 && (
          <span className="bg-amber-100 border border-amber-200 text-amber-800 rounded-full px-3 py-1 text-xs sm:text-sm font-bold shadow-sm">
            ⚡ {remaining} remaining
          </span>
        )}
      </div>

      {/* Horizontally Scrollable Filter Tabs */}
      <div className="relative w-full">
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar scroll-smooth">
          {filterTabs.map(f => {
            const isSelected = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 active:scale-95 shadow-sm ${
                  isSelected
                    ? "bg-cyan-500 text-white shadow-cyan-500/20"
                    : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vehicle Cards Stack */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-14 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Car className="w-7 h-7" />
          </div>
          <p className="text-slate-800 font-bold text-base">
            {filter === "all" ? "No vehicles assigned today" : `No ${filter} vehicles`}
          </p>
          <p className="text-slate-400 text-xs mt-1">Check back later or refresh to fetch updated assignments.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filtered.map((v) => {
            const st = v.status || "pending";
            const cfg = statusConfig[st] || statusConfig.pending;
            const name = v.customer_name || "Customer";
            const vType = v.vehicle_type || v.v_type || "sedan";

            return (
              <div
                key={v.record_id || v.vehicle_id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden border-l-4 ${cfg.border} transition-all ${
                  st === "washing" ? "ring-2 ring-blue-200" : ""
                }`}
              >
                <div className="p-4 sm:p-5 space-y-3">
                  
                  {/* Row 1: Name + Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-base sm:text-lg text-slate-900 leading-tight">{name}</p>
                    <span className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-bold border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Row 2: Vehicle Number */}
                  <div>
                    <p className="font-mono font-extrabold text-lg sm:text-xl tracking-wider text-slate-900">
                      {v.vehicle_number}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {v.vehicle_model || "Vehicle"} {typeEmoji[vType] || "🚗"}
                    </p>
                  </div>

                  {/* Address & Phone */}
                  <div className="space-y-1.5 pt-1 text-xs">
                    {v.address && (
                      <p className="text-slate-600 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{v.address}</span>
                      </p>
                    )}

                    {v.customer_phone && (
                      <a
                        href={`tel:${v.customer_phone}`}
                        className="inline-flex items-center gap-1.5 text-cyan-600 hover:text-cyan-700 font-semibold"
                      >
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>+91 {v.customer_phone}</span>
                      </a>
                    )}
                  </div>

                  {/* Touch-Friendly Actions */}
                  {st === "pending" || st === "active" ? (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {confirmStart === v.record_id ? (
                        <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3.5 space-y-3">
                          <p className="text-xs sm:text-sm font-bold text-cyan-900">
                            Ready to wash <strong>{v.vehicle_number}</strong>?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStart(v.record_id)}
                              className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 text-xs sm:text-sm shadow-md active:scale-[0.98] transition flex items-center justify-center gap-1.5 min-h-[48px]"
                            >
                              <span>✅ Yes, Start Wash</span>
                            </button>
                            <button
                              onClick={() => setConfirmStart(null)}
                              className="px-4 py-3 rounded-xl font-semibold text-slate-700 bg-white border border-slate-200 text-xs sm:text-sm min-h-[48px]"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={() => setConfirmStart(v.record_id)}
                            className="flex-1 py-3 sm:py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 text-sm shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2 min-h-[48px]"
                          >
                            <span>🚿 Start Wash</span>
                          </button>
                          <button
                            onClick={() => setShowIssue(v.record_id)}
                            className="py-3 px-4 rounded-xl font-semibold text-red-600 border border-red-200 hover:bg-red-50 text-xs sm:text-sm transition min-h-[48px]"
                          >
                            ⚠️ Report Issue
                          </button>
                        </div>
                      )}
                    </div>
                  ) : st === "washing" ? (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
                          <span className="text-xs font-bold text-blue-700">Washing in progress...</span>
                        </div>
                        {v.started_at && (
                          <span className="text-xs text-blue-600 font-mono font-bold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <ElapsedTimer from={v.started_at} />
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/washer/vehicles/${v.record_id}/wash`)}
                        className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 text-sm shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2 min-h-[48px]"
                      >
                        <span>✅ Complete Wash</span>
                      </button>
                    </div>
                  ) : st === "completed" ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-center">
                      <p className="text-xs font-bold text-green-700 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span>Completed {v.completed_at ? `at ${new Date(v.completed_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}</span>
                      </p>
                    </div>
                  ) : st === "issue_reported" ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                      <p className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <span>Issue: {v.issue_type?.replace(/_/g, " ") || "Reported"}</span>
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

/* ===== Responsive Issue Modal ===== */
function IssueModal({ recordId, onClose, onSubmit }) {
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const issueTypes = [
    { id: "car_not_available", label: "Car Not Available", emoji: "🚗" },
    { id: "parking_locked",    label: "Parking Locked",    emoji: "🔒" },
    { id: "rain",              label: "Rain Issue",        emoji: "🌧️" },
    { id: "customer_complaint",label: "Customer Issue",    emoji: "😤" },
    { id: "other",             label: "Other Issue",       emoji: "📝" },
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
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in slide-in-from-bottom duration-200"
      >
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <h2 className="text-base font-bold text-slate-900">Report Issue</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 text-xl leading-none">&times;</button>
        </div>

        <p className="text-xs text-slate-500">Select the issue category:</p>

        <div className="grid grid-cols-2 gap-2.5">
          {issueTypes.slice(0, 4).map(it => (
            <button
              key={it.id}
              onClick={() => setType(it.id)}
              className={`p-3 rounded-xl border-2 text-xs font-semibold text-center transition flex flex-col items-center justify-center ${
                type === it.id
                  ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
              style={{ minHeight: 60 }}
            >
              <span className="text-xl mb-1">{it.emoji}</span>
              <span>{it.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setType("other")}
          className={`w-full p-3 rounded-xl border-2 text-xs font-semibold text-center transition flex items-center justify-center gap-2 ${
            type === "other"
              ? "border-red-500 bg-red-50 text-red-700 shadow-sm"
              : "border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          style={{ minHeight: 48 }}
        >
          <span>📝</span>
          <span>Other Issue</span>
        </button>

        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add details... (optional)"
          rows={3}
          className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
        />

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold text-slate-600 bg-slate-100 text-xs min-h-[48px]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!type || submitting}
            className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-xs transition shadow-md min-h-[48px]"
          >
            {submitting ? "Submitting..." : "Submit Issue"}
          </button>
        </div>
      </div>
    </div>
  );
}
