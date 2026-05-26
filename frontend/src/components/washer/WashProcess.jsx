import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Check, Loader2, Clock,
} from "lucide-react";
import { getTodayVehicles, completeWash } from "../../services/washer.service";

const CHECKLIST_ITEMS = [
  "Exterior Wash",
  "Tyre Cleaning",
  "Glass Cleaning",
  "Interior",
];

export default function WashProcess() {
  const { recordId } = useParams();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(2); // Start at step 2 (washing) since wash was already started
  const [checklist, setChecklist] = useState({});
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getTodayVehicles();
        const v = (res.vehicles || []).find(
          (x) => String(x.record_id) === String(recordId)
        );
        if (v) {
          setVehicle(v);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [recordId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await completeWash(recordId, {
        washer_note: note || null,
        checklist: Object.keys(checklist).filter((k) => checklist[k]),
      });
      setShowConfetti(true);
      setTimeout(() => navigate("/washer/vehicles"), 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete wash");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
        <span className="ml-2 text-slate-500">Loading...</span>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 text-lg">Vehicle not found</p>
        <button onClick={() => navigate("/washer/vehicles")} className="mt-4 text-cyan-600 font-medium">
          ← Back to vehicles
        </button>
      </div>
    );
  }

  if (showConfetti) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="text-6xl animate-bounce">🎉</div>
        <h2 className="text-2xl font-bold text-green-600">Wash Completed!</h2>
        <p className="text-slate-500">Redirecting back...</p>
      </div>
    );
  }

  const customerName = vehicle.customer_name || "Customer";

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/washer/vehicles")} className="p-2 rounded-lg hover:bg-slate-100 transition">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">{customerName}</h1>
          <p className="font-mono font-bold text-base tracking-wider text-slate-600">{vehicle.vehicle_number}</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {[2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-400"
            }`}>
              {step > s ? <Check className="w-4 h-4" /> : s - 1}
            </div>
            {s < 4 && <div className={`flex-1 h-1 rounded ${step > s ? "bg-cyan-500" : "bg-slate-100"}`} />}
          </div>
        ))}
      </div>

      {/* STEP 2: Washing with Timer + Checklist */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Timer */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-cyan-100 border-4 border-cyan-300 flex items-center justify-center mb-3 animate-pulse">
              <Clock className="w-8 h-8 text-cyan-600" />
            </div>
            <p className="text-lg font-bold text-blue-700">Washing in progress</p>
            {vehicle.started_at && (
              <p className="text-2xl font-mono font-bold text-blue-600 mt-2">
                <ElapsedTimer from={vehicle.started_at} />
              </p>
            )}
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Wash Checklist</p>
            <div className="space-y-2">
              {CHECKLIST_ITEMS.map((item) => (
                <label key={item} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-slate-50 cursor-pointer" style={{ minHeight: 48 }}>
                  <input
                    type="checkbox"
                    checked={!!checklist[item]}
                    onChange={(e) => setChecklist((c) => ({ ...c, [item]: e.target.checked }))}
                    className="w-5 h-5 rounded text-cyan-500 focus:ring-cyan-400"
                  />
                  <span className="text-base text-slate-700">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            className="w-full py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 active:scale-[0.98] transition"
            style={{ minHeight: 56 }}
          >
            Continue → Note
          </button>
        </div>
      )}

      {/* STEP 3: Add Note */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Any Notes? (optional)</h2>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 200))}
            placeholder="e.g. Car was very dusty, extra time taken"
            rows={4}
            className="w-full border border-slate-200 rounded-xl p-4 text-base focus:outline-none focus:ring-2 focus:ring-cyan-300 resize-none"
          />
          <p className="text-xs text-slate-400 text-right">{note.length}/200</p>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-medium" style={{ minHeight: 48 }}>
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 text-base transition"
              style={{ minHeight: 48 }}
            >
              Continue → Review
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Confirm & Submit */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Review & Submit</h2>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Customer</span>
              <span className="font-medium text-slate-800">{customerName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Vehicle</span>
              <span className="font-mono font-bold text-slate-800">{vehicle.vehicle_number}</span>
            </div>
            {vehicle.started_at && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Duration</span>
                <span className="font-medium text-slate-800">
                  <ElapsedTimer from={vehicle.started_at} /> min
                </span>
              </div>
            )}
            {Object.keys(checklist).filter(k => checklist[k]).length > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Checklist</span>
                <span className="font-medium text-slate-800">
                  {Object.keys(checklist).filter(k => checklist[k]).join(", ")}
                </span>
              </div>
            )}
            {note && (
              <div className="text-sm">
                <span className="text-slate-500">Note:</span>
                <p className="text-slate-700 mt-1">{note}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-medium" style={{ minHeight: 48 }}>
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 py-4 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-green-500 to-emerald-600 disabled:bg-slate-300 transition active:scale-[0.98]"
              style={{ minHeight: 56 }}
            >
              {submitting ? "Submitting..." : "🎉 Submit & Complete"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* Elapsed Timer */
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
