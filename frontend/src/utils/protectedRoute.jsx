import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  // Not logged in — redirect to appropriate login page
  if (!user) {
    if (role === "admin") return <Navigate to="/admin/login" />;
    if (role === "washer") return <Navigate to="/washer/login" />;
    return <Navigate to="/login" />;
  }

  // If a specific role is required, enforce it using the roles array
  if (role) {
    // "user" means any authenticated user, regardless of role
    if (role === "user") {
      return children;
    }

    const roles = user.roles || (user.role ? [user.role] : []);
    if (!roles.includes(role)) {
      // Authenticated but not allowed — send to home (not /dashboard to avoid loops)
      return <Navigate to="/home" />;
    }
  }

  return children;
}