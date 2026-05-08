import AdminLayout from "../components/Admin/layout/AdminLayout";

// This page now just exports AdminLayout as the wrapper.
// All admin sub-pages are rendered via <Outlet /> in AdminLayout.
export default function AdminDashboard() {
  return <AdminLayout />;
}