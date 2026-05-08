import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, MapPin, Calendar, Lock, Eye, EyeOff } from "lucide-react";
import { getWasherProfile, changeWasherPassword } from "../../services/washer.service";
import { useAuth } from "../../hooks/useAuth";

export default function WasherProfile() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Password form
  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ current: "", newPwd: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [saving, setSaving] = useState(false);

  // Toggle visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await getWasherProfile();
        setData(res);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handlePwdChange = async (e) => {
    e.preventDefault();
    setPwdMsg(""); setPwdErr("");

    if (!pwdForm.current || !pwdForm.newPwd || !pwdForm.confirm) {
      setPwdErr("All fields are required"); return;
    }
    if (pwdForm.newPwd !== pwdForm.confirm) {
      setPwdErr("New passwords don't match"); return;
    }
    if (pwdForm.newPwd.length < 6) {
      setPwdErr("New password must be at least 6 characters"); return;
    }

    setSaving(true);
    try {
      await changeWasherPassword({
        current_password: pwdForm.current,
        new_password: pwdForm.newPwd,
      });
      setPwdMsg("Password changed successfully ✅");
      setPwdForm({ current: "", newPwd: "", confirm: "" });
      setShowPwd(false);
    } catch (err) {
      setPwdErr(err.response?.data?.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
        <span className="ml-2 text-slate-500 text-lg">Loading...</span>
      </div>
    );
  }

  const washer = data?.washer || user || {};
  const stats = data?.stats || {};
  const name = washer.full_name || washer.name || "Washer";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">{error}</div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-3">
          {initial}
        </div>
        <h2 className="text-xl font-bold text-slate-900">{name}</h2>
        {(washer.area || washer.society) && (
          <span className="inline-block mt-2 bg-cyan-50 text-cyan-700 rounded-full px-3 py-1 text-sm font-medium">
            📍 {washer.society || washer.area}
          </span>
        )}
        <span className="inline-block mt-2 ml-2 bg-green-100 text-green-700 rounded-full px-3 py-1 text-sm font-semibold">
          Active
        </span>
        {washer.phone && (
          <p className="text-sm text-slate-500 mt-2">{washer.phone}</p>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{stats.totalWashes || 0}</p>
          <p className="text-xs text-slate-500 font-medium">Total Washes</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-slate-900">{stats.thisMonth || 0}</p>
          <p className="text-xs text-slate-500 font-medium">This Month</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-cyan-600">{stats.completionRate || 0}%</p>
          <p className="text-xs text-slate-500 font-medium">Rate</p>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Details</h3>

        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">{washer.email || "—"}</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Phone className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">{washer.phone || "—"}</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">{washer.area || washer.society || "—"}</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-slate-600">
            Joined {washer.created_at ? new Date(washer.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"}
          </span>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <button
          onClick={() => setShowPwd(!showPwd)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 w-full"
        >
          <Lock className="w-4 h-4" />
          Change Password
          <span className="ml-auto text-slate-400 text-xs">{showPwd ? "▲" : "▼"}</span>
        </button>

        {showPwd && (
          <form onSubmit={handlePwdChange} className="mt-4 space-y-3">
            {pwdMsg && <div className="bg-green-50 text-green-700 rounded-lg p-2 text-sm text-center">{pwdMsg}</div>}
            {pwdErr && <div className="bg-red-50 text-red-700 rounded-lg p-2 text-sm text-center">{pwdErr}</div>}

            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="Current Password"
                value={pwdForm.current}
                onChange={(e) => setPwdForm({ ...pwdForm, current: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="New Password"
                value={pwdForm.newPwd}
                onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm New Password"
                value={pwdForm.confirm}
                onChange={(e) => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-cyan-300"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 disabled:bg-slate-300 transition"
              style={{ minHeight: 48 }}
            >
              {saving ? "Saving..." : "Save Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
