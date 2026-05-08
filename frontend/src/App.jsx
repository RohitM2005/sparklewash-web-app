import { Routes, Route } from "react-router-dom";
import Layout from "./Layout";

/* ================= ROLE SELECTION ================= */
import RoleSelection from "./pages/RoleSelection";

/* ================= PUBLIC PAGES ================= */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Services from "./pages/Services";
import SubscriptionPlans from "./pages/SubscriptionPlans";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";

/* ================= USER PAGES ================= */
import Booking from "./pages/Booking";
import Subscription from "./pages/Subscription";

/* ================= DASHBOARD (NESTED) ================= */
import {
  DashboardLayout,
  DashboardOverview,
  WashHistory,
  Vehicles,
  Billing,
  Settings,
} from "./pages/DashboardPages";

/* ================= ADMIN / WASHER ================= */
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import WasherLogin from "./pages/WasherLogin";

/* ================= ADMIN SUB-PAGES ================= */
import StatsOverview from "./components/Admin/dashboard/StatsOverview";
import UsersPage from "./components/Admin/users/UsersPage";
import CustomersTable from "./components/Admin/customers/CustomersTable";
import PaymentStats from "./components/Admin/payments/PaymentStats";
import PaymentsTable from "./components/Admin/payments/PaymentsTable";
import FailedPayments from "./components/Admin/payments/FailedPayments";
import WashersTable from "./components/Admin/washers/WashersTable";
import VehiclesTable from "./components/Admin/vehicles/VehiclesTable";
import SubscriptionsTable from "./components/Admin/subscriptions/SubscriptionsTable";
import SubscriptionAnalytics from "./components/Admin/subscriptions/SubscriptionAnalytics";
import WashLogsTable from "./components/Admin/washlogs/WashLogsTable";
import ComplaintsPage from "./components/Admin/complaints/ComplaintsPage";
import SystemPage from "./components/Admin/system/SystemPage";

/* ================= WASHER SUB-PAGES ================= */
import WasherLayout from "./components/washer/WasherLayout";
import WasherDashboardHome from "./components/washer/WasherDashboard";
import TodayVehiclesList from "./components/washer/TodayVehiclesList";
import WashProcess from "./components/washer/WashProcess";
import CompletedList from "./components/washer/CompletedList";
import WasherProfile from "./components/washer/WasherProfile";

/* ================= ROUTE PROTECTION ================= */
import ProtectedRoute from "./utils/protectedRoute";

function App() {
  return (
    <Layout>
      <Routes>

        {/* ===== ROLE SELECTION (DEFAULT) ===== */}
        <Route path="/" element={<RoleSelection />} />

        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/home" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/plans" element={<SubscriptionPlans />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />

        {/* ===== DASHBOARD (NESTED LAYOUT) ===== */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="user">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="wash-history" element={<WashHistory />} />
          <Route path="my-vehicles" element={<Vehicles />} />
          <Route path="billing" element={<Billing />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ===== BOOKING ===== */}
        <Route path="/booking/*" element={<Booking />} />

        {/* ===== SUBSCRIPTION ===== */}
        <Route
          path="/subscription"
          element={
            <ProtectedRoute role="user">
              <Subscription />
            </ProtectedRoute>
          }
        />

        {/* ===== ADMIN ROUTES ===== */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<StatsOverview />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="customers" element={<CustomersTable />} />
          <Route path="payments" element={
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Payments & Bills</h1>
              <PaymentStats />
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <PaymentsTable />
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <FailedPayments />
              </div>
            </div>
          } />
          <Route path="washers" element={<WashersTable />} />
          <Route path="vehicles" element={<VehiclesTable />} />
          <Route path="subscriptions" element={
            <div className="space-y-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Subscriptions</h1>
              <SubscriptionAnalytics />
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                <SubscriptionsTable />
              </div>
            </div>
          } />
          <Route path="washlogs" element={<WashLogsTable />} />
          <Route path="complaints" element={<ComplaintsPage />} />
          <Route path="system" element={<SystemPage />} />
        </Route>

        {/* ===== WASHER ROUTES ===== */}
        <Route path="/washer/login" element={<WasherLogin />} />
        <Route
          path="/washer"
          element={
            <ProtectedRoute role="washer">
              <WasherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WasherDashboardHome />} />
          <Route path="vehicles" element={<TodayVehiclesList />} />
          <Route path="vehicles/:recordId/wash" element={<WashProcess />} />
          <Route path="completed" element={<CompletedList />} />
          <Route path="history" element={<CompletedList />} />
          <Route path="profile" element={<WasherProfile />} />
        </Route>

      </Routes>
    </Layout>
  );
}

export default App;