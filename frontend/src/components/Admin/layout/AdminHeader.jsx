import React from "react";
import { Menu, Bell, LogOut } from "lucide-react";

export default function AdminHeader({
  onMenuClick,
  admin,
  onLogout,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Welcome back, {admin?.name || "Admin"}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}