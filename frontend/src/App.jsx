import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";

/* ================= PUBLIC PAGES ================= */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import RefundPolicyPage from "./pages/RefundPolicyPage";

/* ================= USER PAGES ================= */
import Booking from "./pages/Booking";
import BookingConfirmedPage from "./pages/BookingConfirmedPage";

/* ================= DASHBOARD (NESTED) ================= */
import {
  DashboardLayout,
  DashboardOverview,
  WashHistory,
  Vehicles,
  Billing,
  Settings,
} from "./pages/DashboardPages";
import CustomerComplaintsPage from "./pages/CustomerComplaintsPage";

/* ================= ADMIN / WASHER ================= */
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import WasherLogin from "./pages/WasherLogin";

/* ================= ADMIN SUB-PAGES ================= */
import StatsOverview from "./components/Admin/dashboard/StatsOverview";
import UsersPage from "./components/Admin/users/UsersPage";
import CustomersTable from "./components/Admin/customers/CustomersTable";
import PaymentsTable from "./components/Admin/payments/PaymentsTable";
import WashersTable from "./components/Admin/washers/WashersTable";
import VehiclesTable from "./components/Admin/vehicles/VehiclesTable";
import SubscriptionsTable from "./components/Admin/subscriptions/SubscriptionsTable";
import WashLogsTable from "./components/Admin/washlogs/WashLogsTable";
import AssignVehicles from "./components/Admin/washlogs/AssignVehicles";
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
import MaintenanceGuard from "./components/common/MaintenanceGuard";

function App() {
  return (
    <MaintenanceGuard>
      <Layout>
      <Routes>

        {/* ===== DEFAULT ROUTE — redirect to Home ===== */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* ===== PUBLIC ROUTES ===== */}
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
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
          <Route path="complaints" element={<CustomerComplaintsPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ===== BOOKING ===== */}
        <Route
          path="/booking/confirmed"
          element={
            <ProtectedRoute role="user">
              <BookingConfirmedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/*"
          element={
            <ProtectedRoute role="user">
              <Booking />
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
          <Route path="payments" element={<PaymentsTable />} />
          <Route path="washers" element={<WashersTable />} />
          <Route path="vehicles" element={<VehiclesTable />} />
          <Route path="subscriptions" element={<SubscriptionsTable />} />
          <Route path="washlogs" element={<WashLogsTable />} />
          <Route path="washlogs/assign" element={<AssignVehicles />} />
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
          <Route index element={<TodayVehiclesList />} />
          <Route path="vehicles" element={<TodayVehiclesList />} />
          <Route path="vehicles/:recordId/wash" element={<WashProcess />} />
        </Route>

      </Routes>
    </Layout>
    </MaintenanceGuard>
  );
}

export default App;