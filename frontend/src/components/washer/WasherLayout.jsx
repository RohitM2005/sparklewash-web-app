import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car, LogOut, Menu, X, ChevronDown, User, Shield
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const sidebarLinks = [
  { label: "Today's Vehicles", path: "/washer", icon: Car },
];

export default function WasherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setSidebarOpen(false);
    setProfileDropdownOpen(false);
  }, [location]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    try {
      logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("washerToken");
    sessionStorage.clear();
    navigate("/washer/login", { replace: true });
  };

  const washerName = user?.name || user?.full_name || "Washer";
  const washerEmail = user?.email || "washer@sparklewash.com";
  const initial = washerName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-x-hidden">
      
      {/* ===== DESKTOP SIDEBAR (≥ 768px) ===== */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-slate-900 z-50 shadow-xl border-r border-slate-800">
        {/* Logo Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="SparkleWash"
            className="w-9 h-9 object-cover rounded-xl shadow-md"
          />
          <div>
            <span className="text-white font-bold text-base block leading-snug">SparkleWash</span>
            <span className="text-slate-400 text-[10px] uppercase font-semibold tracking-wider">Washer Portal</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {sidebarLinks.map((l) => (
            <NavLink
              key={l.path}
              to={l.path}
              end={false}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 font-semibold border-r-2 border-cyan-500 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`
              }
            >
              <l.icon className="w-5 h-5 flex-shrink-0" />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Washer Info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate leading-tight">{washerName}</p>
              <p className="text-slate-400 text-xs truncate">Washer</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20 transition duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* ===== MOBILE SIDEBAR SLIDE-IN DRAWER (< 768px) ===== */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Slide-in Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 260 }}
              className="fixed top-0 left-0 bottom-0 w-[280px] bg-slate-900 z-50 md:hidden flex flex-col shadow-2xl border-r border-slate-800"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.jpg"
                    alt="SparkleWash"
                    className="w-8 h-8 object-cover rounded-lg"
                  />
                  <div>
                    <span className="text-white font-bold text-base block">SparkleWash</span>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold">Washer Portal</span>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
                {sidebarLinks.map((l) => (
                  <NavLink
                    key={l.path}
                    to={l.path}
                    end={false}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                        isActive
                          ? "bg-cyan-500/10 text-cyan-400 font-semibold border-r-2 border-cyan-500"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`
                    }
                  >
                    <l.icon className="w-5 h-5 flex-shrink-0" />
                    <span>{l.label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-bold truncate">{washerName}</p>
                    <p className="text-slate-400 text-[10px] truncate">{washerEmail}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 text-xs font-semibold border border-red-500/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="flex-1 min-w-0 md:ml-64 flex flex-col min-h-screen">
        
        {/* STICKY TOP HEADER */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            
            {/* Left: Mobile Hamburger & Brand */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition active:scale-95"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 md:hidden">
                <img src="/logo.jpg" alt="SparkleWash" className="w-7 h-7 rounded-lg object-cover" />
                <span className="font-bold text-slate-900 text-sm">SparkleWash</span>
              </div>
            </div>

            {/* Right: Washer Profile & Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                  {initial}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-800 leading-tight">{washerName}</span>
                  <span className="text-[10px] text-slate-500">Washer</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${profileDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{washerName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{washerEmail}</p>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-3 sm:p-6 max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
