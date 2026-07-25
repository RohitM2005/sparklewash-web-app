import React, { useState, useEffect, useRef } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Menu,
  X,
} from "lucide-react";
import ProfileDropdown from "./components/Navigation/ProfileDropdown";
import { useAuth } from "./hooks/useAuth";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handleClick = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) &&
          hamburgerRef.current && !hamburgerRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate("/"); };

  const handleBookService = () => {
    navigate(user ? "/booking" : "/login");
  };

  const hideNavbarPages = ["/admin/login", "/washer/login"];
  const shouldHideNavbar =
    hideNavbarPages.includes(location.pathname) ||
    location.pathname.startsWith("/washer") ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/dashboard") ||
    location.pathname.startsWith("/booking");

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHideNavbar && (
        <header
          style={{
            background: "rgba(10, 15, 30, 0.75)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            position: "fixed",
            top: 0,
            width: "100%",
            zIndex: 1000,
            boxShadow: scrolled ? "0 4px 30px rgba(0,0,0,0.3)" : "none",
            transition: "box-shadow 0.3s ease",
          }}
        >
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
            {/* LOGO */}
            <Link to={user ? "/home" : "/"} className="flex items-center gap-2.5 sm:gap-3 group">
              <img
                src="/logo.jpg"
                alt="SparkleWash"
                className="h-8 sm:h-10 w-auto group-hover:scale-105 transition-transform duration-200"
                style={{ borderRadius: "8px" }}
              />
              <span
                className="text-base sm:text-xl font-bold"
                style={{
                  background: "linear-gradient(135deg, #00d4ff, #0066ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                SparkleWash
              </span>
            </Link>

            {/* DESKTOP NAV */}
            <nav className="hidden md:flex items-center gap-3">
              {/* Home link */}
              <Link
                to="/home"
                className="nav-link-hover relative px-4 py-2 text-sm font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.75)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#00d4ff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
              >
                Home
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 transition-all duration-300"
                  style={{ background: "linear-gradient(90deg, #00d4ff, #0066ff)" }}
                />
              </Link>

              {/* Book Service Button — only when logged in */}
              {user && (
                <button
                  onClick={handleBookService}
                  className="flex items-center gap-1.5 text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:scale-[1.03]"
                  style={{
                    background: "linear-gradient(135deg, #00d4ff, #0066ff)",
                    borderRadius: "50px",
                    padding: "8px 20px",
                  }}
                >
                  <CalendarCheck className="w-4 h-4" />
                  Book Service
                </button>
              )}

              {/* Dashboard link for logged-in customers */}
              {user && user.role === "customer" && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#00d4ff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}

              {!user ? (
                <div className="flex items-center gap-3 ml-2">
                  <Link
                    to="/login"
                    className="px-5 py-2 text-sm font-medium rounded-full transition-all duration-200"
                    style={{
                      color: "#00d4ff",
                      border: "1px solid rgba(0, 212, 255, 0.4)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#00d4ff";
                      e.currentTarget.style.background = "rgba(0, 212, 255, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(0, 212, 255, 0.4)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 text-sm font-medium text-white rounded-full transition-all duration-200 hover:shadow-lg"
                    style={{
                      background: "linear-gradient(135deg, #00d4ff, #0066ff)",
                      borderRadius: "50px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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

            {/* MOBILE BUTTON & PROFILE */}
            <div className="md:hidden flex items-center gap-2 sm:gap-3">
              {user && (
                <ProfileDropdown email={user.email} onLogout={handleLogout} />
              )}
              <button
                ref={hamburgerRef}
                className="text-white/80 hover:text-cyan-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors focus:outline-none flex items-center justify-center"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          <div
            ref={mobileMenuRef}
            className={`md:hidden absolute w-full border-b transition-all duration-300 ease-in-out ${
              mobileOpen ? "opacity-100 max-h-[500px]" : "opacity-0 max-h-0 overflow-hidden"
            }`}
            style={{
              background: "rgba(10, 15, 30, 0.95)",
              backdropFilter: "blur(16px)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              <Link
                to="/home"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 py-3 px-3 rounded-lg text-sm font-medium transition-colors"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Home
              </Link>

              {/* Mobile Book Service — only when logged in */}
              {user && (
                <button
                  onClick={() => { setMobileOpen(false); handleBookService(); }}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold text-white my-1 self-start"
                  style={{ background: "linear-gradient(135deg, #00d4ff, #0066ff)" }}
                >
                  <CalendarCheck className="w-4 h-4" />
                  Book Service
                </button>
              )}

              {user && user.role === "customer" && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-3 px-3 rounded-lg text-sm font-medium transition-colors"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
              )}

              {!user && (
                <div className="flex flex-col gap-3 mt-3 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-center rounded-lg text-sm font-medium transition-colors"
                    style={{ color: "#00d4ff", border: "1px solid rgba(0, 212, 255, 0.4)" }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="text-white py-2.5 rounded-full text-center text-sm font-medium"
                    style={{ background: "linear-gradient(135deg, #00d4ff, #0066ff)" }}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <main className={`flex-1 ${!shouldHideNavbar ? "pt-[52px] sm:pt-[64px]" : ""}`}>
        {children || <Outlet />}
      </main>

      <style>{`
        .nav-link-hover:hover span {
          width: 80% !important;
        }
      `}</style>
    </div>
  );
}
