import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, UserCheck, CreditCard, Truck,
  Car, FileText, ClipboardList, MessageSquareWarning, Settings,
  X, Droplets, ChevronLeft
} from "lucide-react";
import api from "../../../services/api";

const menuItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { id: "users", label: "User Management", icon: Users, path: "/admin/users" },
  { id: "customers", label: "Customers", icon: UserCheck, path: "/admin/customers" },
  { id: "payments", label: "Payments & Bills", icon: CreditCard, path: "/admin/payments" },
  { id: "washers", label: "Washer Management", icon: Truck, path: "/admin/washers" },
  { id: "vehicles", label: "Vehicles", icon: Car, path: "/admin/vehicles" },
  { id: "subscriptions", label: "Subscriptions", icon: FileText, path: "/admin/subscriptions" },
  { id: "washlogs", label: "Wash Logs", icon: ClipboardList, path: "/admin/washlogs" },
  { id: "complaints", label: "Complaints", icon: MessageSquareWarning, path: "/admin/complaints" },
  { id: "system", label: "System Settings", icon: Settings, path: "/admin/system" },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadComplaints, setUnreadComplaints] = useState(0);

  useEffect(() => {
    api.get("/admin/complaints/unread-count")
      .then(res => setUnreadComplaints(res.data.count || 0))
      .catch(() => {});
  }, [location.pathname]);

  const isActive = (item) => {
    if (item.path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(item.path);
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 h-screen w-72 bg-slate-900
        transition-transform duration-300 flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">SparkleWash</h2>
              <p className="text-[10px] text-slate-400">Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 rounded-md hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);

            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm transition-all relative
                  ${active
                    ? "bg-cyan-500/10 text-cyan-400 font-medium border-r-2 border-cyan-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span className="flex-1">{item.label}</span>

                {/* Unread complaints badge */}
                {item.id === "complaints" && unreadComplaints > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {unreadComplaints}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-800 text-[11px] text-slate-500">
          © 2025 SparkleWash Admin
        </div>
      </aside>
    </>
  );
}