import { useState, useEffect } from "react";
import { BarChart3 } from "lucide-react";
import api from "../../../services/api";

export default function SubscriptionAnalytics() {
  const [data, setData] = useState({ total: 0, active: 0, pending: 0, cancelled: 0 });

  useEffect(() => {
    api.get("/admin/subscriptions")
      .then(res => {
        const subs = res.data || [];
        setData({
          total: subs.length,
          active: subs.filter(s => s.status === "active").length,
          pending: subs.filter(s => s.status === "pending").length,
          cancelled: subs.filter(s => s.status === "cancelled").length,
        });
      })
      .catch(() => {});
  }, []);

  const bars = [
    { label: "Active", value: data.active, color: "bg-green-500" },
    { label: "Pending", value: data.pending, color: "bg-amber-500" },
    { label: "Cancelled", value: data.cancelled, color: "bg-red-400" },
  ];

  const max = Math.max(...bars.map(b => b.value), 1);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-cyan-500" /> Subscription Analytics
      </h2>
      <p className="text-sm text-slate-500 mb-4">{data.total} total subscriptions</p>
      <div className="space-y-3">
        {bars.map(b => (
          <div key={b.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">{b.label}</span>
              <span className="font-medium text-slate-900">{b.value}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full ${b.color} rounded-full transition-all duration-500`}
                style={{ width: `${(b.value / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}