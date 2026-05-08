import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Clock, X } from "lucide-react";
import { getCompletedWashes } from "../../services/washer.service";

export default function CompletedList() {
  const navigate = useNavigate();
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getCompletedWashes();
        setCompleted(res.completed || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
        <span className="ml-2 text-slate-500 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/washer")} className="p-2 rounded-lg hover:bg-slate-100 transition">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 flex-1">Completed Today ✅</h1>
        <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 text-sm font-semibold">
          {completed.length}
        </span>
      </div>

      {completed.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <p className="text-4xl mb-3">🚗</p>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No washes completed yet today</h3>
          <p className="text-slate-500 text-sm">Complete your first wash to see it here 🚗</p>
        </div>
      ) : (
        <div className="space-y-3">
          {completed.map((w) => (
            <div key={w.record_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-slate-900">{w.customer_name}</p>
                  <p className="font-mono font-bold text-lg tracking-wider text-slate-700">{w.vehicle_number}</p>
                </div>
                <div className="text-right">
                  {w.completed_at && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(w.completed_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                  {w.wash_duration_minutes && (
                    <p className="text-xs text-slate-400 mt-0.5">{w.wash_duration_minutes} min</p>
                  )}
                </div>
              </div>

              {/* Photo thumbnails */}
              {(w.before_photo_url || w.after_photo_url) && (
                <div className="flex gap-3">
                  {w.before_photo_url && (
                    <div
                      onClick={() => setLightbox(w.before_photo_url)}
                      className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 hover:ring-cyan-300 transition"
                    >
                      <img src={w.before_photo_url} alt="Before" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {w.after_photo_url && (
                    <div
                      onClick={() => setLightbox(w.after_photo_url)}
                      className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 cursor-pointer hover:ring-2 hover:ring-cyan-300 transition"
                    >
                      <img src={w.after_photo_url} alt="After" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              {w.washer_note && (
                <p className="text-xs text-slate-400 italic">"{w.washer_note}"</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white z-10 p-2">
            <X className="w-6 h-6" />
          </button>
          <img src={lightbox} alt="Photo" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
