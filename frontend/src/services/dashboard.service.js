import api from "./api";

/*
  ======================================
  DASHBOARD SERVICE
  ======================================
  Fetch all dashboard related data:
  - User info
  - Active subscription
  - Wash records
  - Notifications
*/

export const getDashboardData = async () => {
  try {
    const response = await api.get("/customer/dashboard");
    return response.data;
  } catch (error) {
    console.error(
      "Dashboard Service Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};