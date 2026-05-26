import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, Moon, Sun } from "lucide-react";

export default function ProfileDropdown({ email, onLogout }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(
      localStorage.getItem("darkMode") === "true"
    );
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const firstLetter = email ? email.charAt(0).toUpperCase() : "U";

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Apply saved dark mode on mount
    useEffect(() => {
      const saved = localStorage.getItem("darkMode") === "true";
      document.documentElement.setAttribute("data-theme", saved ? "dark" : "light");
    }, []);

    const toggleDarkMode = () => {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      localStorage.setItem("darkMode", String(newMode));
      document.documentElement.setAttribute("data-theme", newMode ? "dark" : "light");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center font-semibold text-lg hover:bg-cyan-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                aria-label="User menu"
                aria-expanded={isOpen}
            >
                {firstLetter}
            </button>

            {isOpen && (
                <div
                  className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-50"
                  style={{ animation: "fadeIn 0.15s ease-out" }}
                >
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                            {email}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                            User Account
                        </p>
                    </div>

                    {/* Dark Mode Toggle */}
                    <div
                      className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={toggleDarkMode}
                    >
                      <div className="flex items-center gap-2.5">
                        {isDarkMode ? <Moon className="w-4 h-4 text-slate-600" /> : <Sun className="w-4 h-4 text-slate-600" />}
                        <span className="text-sm text-slate-700">Dark Mode</span>
                      </div>
                      <div
                        className="relative w-10 h-[22px] rounded-full transition-colors duration-300"
                        style={{ background: isDarkMode ? "#0066ff" : "#d1d5db" }}
                      >
                        <div
                          className="absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all duration-300"
                          style={{ left: isDarkMode ? "20px" : "2px" }}
                        />
                      </div>
                    </div>

                    {/* Settings */}
                    <button
                      onClick={() => { setIsOpen(false); navigate("/dashboard/settings"); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      Settings
                    </button>

                    {/* Logout */}
                    <div className="border-t border-slate-100 mt-1">
                      <button
                        onClick={() => { setIsOpen(false); onLogout(); }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                </div>
            )}
        </div>
    );
}
