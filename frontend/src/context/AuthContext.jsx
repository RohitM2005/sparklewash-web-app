/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import { loginUser, getCurrentUser } from "../services/auth.service";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      // No token stored — skip the /me call to avoid an unnecessary 401
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getCurrentUser();
        setUser(data);
      } catch (error) {
        console.log("Session expired or invalid:", error);
        // Token is invalid/expired — clear it so login works cleanly next time
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials, role = null) => {
    let data;

    // Use appropriate login service based on role
    if (role === 'admin') {
      const { adminLogin } = await import("../services/admin.service");
      data = await adminLogin(credentials);
    } else if (role === 'washer') {
      const { washerLogin } = await import("../services/admin.service");
      data = await washerLogin(credentials);
    } else {
      data = await loginUser(credentials);
    }

    // Robust token extraction — handle { success, token, user } and { token, user }
    const token = data?.token;
    const userData = data?.user;

    if (!token) {
      throw new Error(data?.message || 'Login failed — no token received');
    }

    localStorage.setItem("token", token);
    localStorage.setItem("role", userData?.role || role || "customer");
    setUser(userData || { role: role || "customer" });
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}