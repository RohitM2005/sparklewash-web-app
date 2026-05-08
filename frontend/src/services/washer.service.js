// frontend/src/services/washer.service.js
// API service layer for all washer panel endpoints.
import api from "./api";

export const getWasherDashboard = async () => {
  const res = await api.get("/washer/dashboard");
  return res.data;
};

export const getTodayVehicles = async () => {
  const res = await api.get("/washer/vehicles/today");
  return res.data;
};

export const startWash = async (recordId) => {
  const res = await api.patch(`/washer/wash/${recordId}/start`);
  return res.data;
};

export const completeWash = async (recordId, data) => {
  const res = await api.patch(`/washer/wash/${recordId}/complete`, data);
  return res.data;
};

export const skipWash = async (recordId, reason) => {
  const res = await api.patch(`/washer/wash/${recordId}/skip`, { reason });
  return res.data;
};

export const reportIssue = async (recordId, data) => {
  const res = await api.post(`/washer/wash/${recordId}/issue`, data);
  return res.data;
};

export const getCompletedWashes = async () => {
  const res = await api.get("/washer/wash/completed");
  return res.data;
};

export const getWasherProfile = async () => {
  const res = await api.get("/washer/profile");
  return res.data;
};

export const changeWasherPassword = async (data) => {
  const res = await api.patch("/washer/profile/change-password", data);
  return res.data;
};

export const uploadWashProof = async (file, type, recordId, onProgress) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("type", type);
  if (recordId) formData.append("wash_record_id", recordId);

  const res = await api.post("/upload/wash-proof", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });
  return res.data;
};
