import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import {
  Menu, Bell, Car, Calendar, CheckCircle2, TrendingUp,
  History, CreditCard, Receipt, Settings as SettingsIcon,
  User, Shield, Trash2, Plus,
} from "lucide-react";
import { differenceInDays, startOfMonth } from "date-fns";

import Sidebar from "../components/Dashboard/SideBar";
import StatsCard from "../components/Dashboard/StatsCard";
import WashCalendar from "../components/Dashboard/WashCalendar";
import RecentWashes from "../components/Dashboard/RecentWashes";
import SubscriptionCard from "../components/Dashboard/SubscriptionCard";
import RenewSubscriptionBtn from "../components/Dashboard/RenewSubscriptionBtn";
import Loader from "../components/common/Loader";
import { getDashboardData } from "../services/dashboard.service";

/* ============================================ */
/* 1. DASHBOARD LAYOUT                          */
/* ============================================ */

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getDashboardData();
        setUser(data?.user || null);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} />
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3 flex items-center gap-3">
          <button className="p-2 rounded-md hover:bg-slate-100 transition" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-slate-900 text-base">SparkleWash</span>
        </header>
        <main className="flex-1">
          <Outlet context={{ user }} />
        </main>
      </div>
    </div>
  );
}

/* ============================================ */
/* 2. DASHBOARD OVERVIEW                        */
/* ============================================ */

export function DashboardOverview() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white border rounded-2xl shadow p-6 text-center">
          <h1 className="text-lg font-semibold mb-2 text-slate-900">Dashboard unavailable</h1>
          <p className="text-sm text-slate-600 mb-4">{error}</p>
          <a href="/home" className="inline-block px-4 py-2 rounded-md bg-cyan-600 text-white text-sm hover:bg-cyan-700">Go to Home</a>
        </div>
      </div>
    );
  }

  const { user, subscription, washRecords = [] } = dashboardData;
  const completedWashes = washRecords.filter((w) => w.status === "completed").length;
  const daysRemaining = subscription?.end_date
    ? differenceInDays(new Date(subscription.end_date), new Date())
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Welcome back, {user?.full_name?.split(" ")[0]}</p>
        </div>
        <button className="relative p-2 rounded-md border border-slate-200 hover:bg-slate-100 transition">
          <Bell className="w-5 h-5" />
          {dashboardData?.notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {dashboardData.notifications}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatsCard title="Total Washes" value={completedWashes || 0} subtitle="All time" icon={CheckCircle2} color="cyan" delay={0} />
        <StatsCard title="This Month" value={completedWashes || 0} subtitle="Completed" icon={Calendar} color="green" delay={0.05} />
        <StatsCard title="Active Vehicles" value={subscription ? 1 : 0} subtitle="Subscribed" icon={Car} color="purple" delay={0.1} />
        <StatsCard title="Days Left" value={daysRemaining > 0 ? daysRemaining : 0} subtitle="Until renewal" icon={TrendingUp} color="orange" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <SubscriptionCard subscription={subscription} />
          <WashCalendar washRecords={washRecords} currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
        </div>
        <div>
          <RecentWashes washes={washRecords} />
        </div>
      </div>
    </div>
  );
}

/* ============================================ */
/* 3. WASH HISTORY                              */
/* ============================================ */

export function WashHistory() {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
  const [washRecords, setWashRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setWashRecords(data?.washRecords || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load wash history");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <History className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Wash History</h1>
            <p className="text-sm text-slate-500 mt-0.5">Your completed and scheduled washes</p>
          </div>
        </div>

        {error ? (
          <div className="bg-white border border-red-100 rounded-2xl p-6 text-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <WashCalendar washRecords={washRecords} currentMonth={currentMonth} onMonthChange={setCurrentMonth} />
            </div>
            <div>
              <RecentWashes washes={washRecords} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================ */
/* 4. VEHICLES                                  */
/* ============================================ */

export function Vehicles() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">My Vehicles</h1>
              <p className="text-sm text-slate-500 mt-0.5">Manage your registered vehicles</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 transition self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-10 sm:p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 mb-2">No vehicles added yet</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">Add your vehicle to start booking car wash services.</p>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:opacity-90 transition mx-auto">
            <Plus className="w-4 h-4" /> Add Your First Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================ */
/* 5. BILLING                                   */
/* ============================================ */

export function Billing() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardData();
        setSubscription(data?.subscription || null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load billing data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Billing</h1>
            <p className="text-sm text-slate-500 mt-0.5">Payments, invoices, and subscription billing details</p>
          </div>
        </div>

        {error ? (
          <div className="bg-white border border-red-100 rounded-2xl p-6 text-center">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : subscription ? (
          <RenewSubscriptionBtn subscription={subscription} onRenew={(updated) => setSubscription(updated)} />
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">No billing history</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">Subscribe to a plan to see your billing details here.</p>
            <a href="/subscription" className="inline-block px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition">View Plans</a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================ */
/* 6. SETTINGS                                  */
/* ============================================ */

const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
];

export function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Settings</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage your account preferences</p>
          </div>
        </div>

        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
          {settingsTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap flex-1 justify-center ${activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">

          {activeTab === "profile" && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900">Profile Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Your full name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
                  <input type="tel" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="your@email.com" />
                </div>
              </div>
              <button className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition">
                Save Changes
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900 mb-4">Notification Preferences</h3>
              {[
                { label: "Wash reminders", desc: "Get notified before your scheduled wash" },
                { label: "Subscription alerts", desc: "Renewal and expiry notifications" },
                { label: "Promotions", desc: "Offers and discounts from SparkleWash" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:bg-cyan-500 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-4" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Security Settings</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Current Password</label>
                <input type="password" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                <input type="password" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm New Password</label>
                <input type="password" className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="••••••••" />
              </div>
              <button className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 transition">
                Update Password
              </button>
              <div className="pt-4 border-t border-slate-200">
                <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2 text-sm">
                  <Trash2 className="w-4 h-4" /> Danger Zone
                </h4>
                <p className="text-sm text-slate-500 mb-3">Permanently delete your account and all associated data.</p>
                <button className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition">
                  Delete Account
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}