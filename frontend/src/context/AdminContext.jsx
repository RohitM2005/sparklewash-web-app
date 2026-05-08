/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";

export const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [adminStats, setAdminStats] = useState(null);

  return (
    <AdminContext.Provider value={{ adminStats, setAdminStats }}>
      {children}
    </AdminContext.Provider>
  );
}