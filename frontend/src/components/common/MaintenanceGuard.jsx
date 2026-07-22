import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Wrench, Shield, RefreshCw } from "lucide-react";
import { fetchPublicSettings } from "../../services/systemSettingsService";

export default function MaintenanceGuard({ children }) {
  const location = useLocation();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checking, setChecking] = useState(true);

  const checkMaintenance = async () => {
    try {
      const data = await fetchPublicSettings(true);
      setMaintenanceMode(data?.maintenance_mode === "true");
    } catch (err) {
      console.error("Maintenance check error:", err);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkMaintenance();

    // Poll maintenance mode status every 5 seconds
    const interval = setInterval(checkMaintenance, 5000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const isAdminPath = location.pathname.startsWith("/admin");

  // Admin pages always remain accessible even during maintenance mode!
  if (isAdminPath) {
    return <>{children}</>;
  }

  // If maintenance mode is ON and user is trying to access customer pages:
  if (!checking && maintenanceMode) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-4 text-center select-none overflow-y-auto">
        {/* Background Ambient Glow */}
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-lg w-full bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-2xl space-y-6">
          {/* Logo & Icon */}
          <div className="flex flex-col items-center gap-3">
            <img
              src="/logo.jpg"
              alt="SparkleWash"
              className="h-16 w-16 object-cover rounded-2xl shadow-lg ring-2 ring-cyan-500/30"
            />
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mt-2">
              <Wrench className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          {/* Heading & Message */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Under Maintenance
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              SparkleWash is currently under maintenance. Please try again later.
            </p>
          </div>

          {/* Subtext */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-400">
            Our team is performing scheduled system upgrades. Dashboard, bookings, and customer services will be restored automatically once maintenance completes.
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={checkMaintenance}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Check Status
            </button>

            <Link
              to="/admin/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
