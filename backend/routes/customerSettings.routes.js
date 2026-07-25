// routes/customerSettings.routes.js
import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getProfile,
  updateProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../controllers/customerSettings.controller.js";
import {
  getCustomerVehicles,
  addCustomerVehicle,
  updateCustomerVehicle,
  deleteCustomerVehicle,
} from "../controllers/customerVehicles.controller.js";

const router = express.Router();

// Profile
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);

// Notification Preferences
router.get("/notification-preferences", protect, getNotificationPreferences);
router.patch("/notification-preferences", protect, updateNotificationPreferences);

// Vehicles
router.get("/vehicles", protect, getCustomerVehicles);
router.post("/vehicles", protect, addCustomerVehicle);
router.patch("/vehicles/:id", protect, updateCustomerVehicle);
router.delete("/vehicles/:id", protect, deleteCustomerVehicle);

export default router;

