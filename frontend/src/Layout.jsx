import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  LayoutDashboard,
  Shield,
  Menu,
  X,
} from "lucide-react";
import ProfileDropdown from "./components/Navigation/ProfileDropdown";
import { useAuth } from "./hooks/useAuth";

const NavLinks = ({ user }) => (
  <>
    {user ? (
      <>
        {/* Show different navigation based on user role */}
        {user.role === 'customer' && (
          <>
            <Link
              to="/booking"
              className="py-2 hover:text-cyan-600 transition-colors"
            >
              Book Service
            </Link>

            <Link
              to="/dashboard"
              className="flex items-center gap-2 py-2 hover:text-cyan-600 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          </>
        )}

        {/* For admin and washer users, they get their respective dashboards via protected routes */}
        {user.role === 'admin' && (
          <Link
            to="/admin"
            className="flex items-center gap-2 py-2 hover:text-cyan-600 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin Dashboard
          </Link>
        )}

        {user.role === 'washer' && (
          <Link
            to="/washer"
            className="flex items-center gap-2 py-2 hover:text-cyan-600 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4" />
            Washer Dashboard
          </Link>
        )}
      </>
    ) : (
      <>
        {/* Show Admin and Washer only when NOT logged in */}
        <Link
          to="/admin/login"
          className="flex items-center gap-2 py-2 hover:text-cyan-600 transition-colors"
        >
          <Shield className="w-4 h-4" />
          Admin
        </Link>

        <Link
          to="/washer/login"
          className="py-2 hover:text-cyan-600 transition-colors"
        >
          Washer
        </Link>
      </>
    )}
  </>
);

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Hide navbar for role selection page, admin login, and all washer routes
  const hideNavbarPages = ["/", "/admin/login", "/washer/login"];
  const shouldHideNavbar = hideNavbarPages.includes(location.pathname) || location.pathname.startsWith("/washer");

  return (
    <div className="flex flex-col min-h-screen">
      {/* HEADER - Hide on specified pages */}
      {!shouldHideNavbar && (
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            {/* LOGO */}
            <Link to={user ? "/home" : "/"} className="flex items-center gap-3 group">
              <img
                src="/logo.jpg"
                alt="SparkleWash"
                className="h-10 w-auto group-hover:scale-105 transition-transform duration-200"
              />
              <span className="text-lg sm:text-xl font-bold hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
                SparkleWash
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-6 text-slate-700 font-medium">
              <NavLinks user={user} />

              {!user ? (
                <div className="flex items-center gap-4 ml-2">
                  <Link to="/login" className="hover:text-cyan-600 transition-colors px-2 py-2">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-5 py-2 rounded-full shadow hover:shadow-md transition-all duration-200"
                  >
                    Register
                  </Link>
                </div>
              ) : (
                <div className="ml-2 flex items-center">
                  <ProfileDropdown email={user.email} onLogout={handleLogout} />
                </div>
              )}
            </nav>

            {/* MOBILE BUTTON */}
            <div className="md:hidden flex items-center gap-4">
              {user && (
                <div className="flex items-center">
                  <ProfileDropdown email={user.email} onLogout={handleLogout} />
                </div>
              )}
              <button
                className="text-slate-600 hover:text-cyan-600 transition-colors focus:outline-none p-1"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          <div
            className={`md:hidden absolute w-full bg-white border-b shadow-lg transition-all duration-300 ease-in-out ${mobileOpen ? "opacity-100 max-h-96" : "opacity-0 max-h-0 overflow-hidden"
              }`}
          >
            <div className="px-6 py-4 flex flex-col gap-4 text-slate-700 font-medium font-medium">
              <NavLinks user={user} />

              {!user && (
                <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-slate-100">
                  <Link to="/login" className="py-2 text-center border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg text-center shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 bg-slate-50/30">
        {children || <Outlet />}
      </main>
    </div>
  );
}
