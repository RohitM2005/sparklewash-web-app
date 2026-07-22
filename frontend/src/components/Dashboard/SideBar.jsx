import React, { useEffect } from "react";
import {
  LayoutDashboard, Calendar, Car, CreditCard,
  MessageSquareWarning, Settings, LogOut, X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard", end: true },
  { icon: Calendar, label: "Wash History", path: "/dashboard/wash-history" },
  { icon: Car, label: "My Vehicles", path: "/dashboard/my-vehicles" },
  { icon: CreditCard, label: "Billing", path: "/dashboard/billing" },
  { icon: MessageSquareWarning, label: "Complaints", path: "/dashboard/complaints" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

export default function Sidebar({ isOpen, onClose, user }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen
          w-[85%] max-w-[280px] sm:max-w-[300px] lg:w-72
          bg-white border-r border-slate-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex flex-col h-full">

          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <img
                src="/logo.jpg"
                alt="SparkleWash"
                className="h-9 w-9 object-cover flex-shrink-0"
                style={{ borderRadius: "10px" }}
              />
              <span className="text-base sm:text-lg font-bold text-slate-900">SparkleWash</span>
            </div>
            <button onClick={onClose} className="lg:hidden p-2 rounded-md hover:bg-slate-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-slate-900 truncate text-sm">
                  {user?.full_name || "User"}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                end={item.end || false}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 font-medium shadow-sm"
                      : "text-slate-600 hover:bg-slate-50"
                  }`
                }
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* No Help & Support — only Logout */}
          <div className="p-3 sm:p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              Logout
            </button>
          </div>

        </div>
      </aside>
    </>
  );
}