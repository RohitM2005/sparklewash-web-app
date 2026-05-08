import { motion } from "framer-motion";
import { Users, CreditCard, FileText, Car, CheckCircle2, Clock, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../../services/api";

/* ===== Existing components ===== */
import PaymentStats from "../payments/PaymentStats";
import SubscriptionAnalytics from "../subscriptions/SubscriptionAnalytics";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

export default function StatsOverview() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(res => setStats(res.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Customers", value: stats.totalCustomers || 0, icon: Users, color: "from-cyan-500 to-blue-600" },
    { label: "Active Subscriptions", value: stats.activeSubscriptions || 0, icon: FileText, color: "from-emerald-500 to-green-600" },
    { label: "Total Revenue", value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: CreditCard, color: "from-violet-500 to-purple-600" },
    { label: "Vehicles", value: stats.totalVehicles || 0, icon: Car, color: "from-amber-500 to-orange-600" },
    { label: "Washers", value: stats.totalWashers || 0, icon: Truck, color: "from-pink-500 to-rose-600" },
    { label: "Today Completed", value: stats.todayCompleted || 0, icon: CheckCircle2, color: "from-green-500 to-emerald-600" },
    { label: "Today Pending", value: stats.todayPending || 0, icon: Clock, color: "from-yellow-500 to-amber-600" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm">Overview of your business</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              {...fadeIn}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-shadow p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">{card.label}</span>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div {...fadeIn} transition={{ delay: 0.3 }}>
          <PaymentStats />
        </motion.div>
        <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
          <SubscriptionAnalytics />
        </motion.div>
      </div>
    </div>
  );
}
