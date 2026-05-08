import api from "./api";

export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

export const adminLogin = async (email, password) => {
  const response = await api.post("/admin/auth/login", { email, password });
  return response.data;
};

export const washerLogin = async (email, password) => {
  const response = await api.post("/washer/auth/login", { email, password });
  return response.data;
};