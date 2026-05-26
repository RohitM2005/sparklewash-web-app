import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home, Car, Clock, User, LogOut, Droplets, Menu, X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const bottomNav = [
  { label: "Vehicles", path: "/washer",   icon: Car },
];

const sidebarLinks = [
  { label: "Vehicles",  path: "/washer",   icon: Car },
];

export default function WasherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/washer/login");
  };

  const washerName = user?.name || user?.full_name || "Washer";
  const initial = washerName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ===== DESKTOP SIDEBAR (≥ 768px) ===== */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-slate-900 z-50">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="SparkleWash"
            className="w-8 h-8 object-cover"
            style={{ borderRadius: '8px' }}
          />
          <span className="text-white font-bold text-lg">SparkleWash</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-1 px-3">
          {sidebarLinks.map((l) => (
            <NavLink
              key={l.path}
              to={l.path}
              end={false}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <l.icon className="w-5 h-5" />
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom washer info */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{washerName}</p>
              <p className="text-slate-400 text-xs">Washer</p>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 transition p-1" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MOBILE SIDEBAR OVERLAY ===== */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 md:hidden flex flex-col">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="SparkleWash"
                  className="w-8 h-8 object-cover"
                  style={{ borderRadius: '8px' }}
                />
                <span className="text-white font-bold text-lg">SparkleWash</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 px-3">
              {sidebarLinks.map((l) => (
                <NavLink
                  key={l.path}
                  to={l.path}
                  end={false}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 border-r-2 border-cyan-500"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <l.icon className="w-5 h-5" />
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 text-sm w-full px-3 py-2 hover:bg-slate-800 rounded-lg transition">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 min-w-0 md:ml-64 pb-20 md:pb-0">
        {/* Sticky header */}
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition">
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-2">
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600 hidden sm:inline">{washerName}</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                {initial}
              </div>
              <button onClick={handleLogout} className="hidden md:flex text-slate-400 hover:text-red-500 transition p-1" title="Logout">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV (< 768px) ===== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 z-50">
        {bottomNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={false}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs font-medium transition ${
                isActive ? "text-cyan-500" : "text-slate-400"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
