import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, User, Save, Loader2 } from "lucide-react";
import api from "../../services/api";

export default function Settings() {
  const [profile, setProfile] = useState({ full_name: "", email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/customer/profile");
        const u = res.data.profile || res.data;
        setProfile({
          full_name: u.full_name || u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          address: u.address || "",
        });
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSave = async () => {
    if (!profile.full_name.trim()) {
      setProfileMsg({ type: "error", text: "Full name is required" });
      return;
    }
    if (!profile.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())) {
      setProfileMsg({ type: "error", text: "Valid email address is required" });
      return;
    }
    const cleanPhone = profile.phone ? profile.phone.replace(/^(\+91|91)/, "").replace(/[\s\-]/g, "") : "";
    if (profile.phone && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      setProfileMsg({ type: "error", text: "Valid 10-digit Indian phone number is required" });
      return;
    }

    setSaving(true);
    setProfileMsg(null);
    try {
      await api.patch("/customer/profile", {
        full_name: profile.full_name.trim(),
        email: profile.email.trim(),
        phone: cleanPhone || profile.phone,
        address: profile.address,
      });
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage your profile information
            </p>
          </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-500" />
            <h2 className="font-semibold text-slate-800">Profile Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
              />
            </div>

            {profileMsg && (
              <p className={`text-sm font-medium ${profileMsg.type === "success" ? "text-green-600" : "text-red-600"}`}>
                {profileMsg.text}
              </p>
            )}

            <button
              onClick={handleProfileSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-60 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}