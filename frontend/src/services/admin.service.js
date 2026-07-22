import api from "./api";

export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

export const adminLogin = async (credentials) => {
  const response = await api.post("/admin/auth/login", credentials);
  return response.data;
};

export const washerLogin = async (credentials) => {
  const response = await api.post("/washer/auth/login", credentials);
  return response.data;
};