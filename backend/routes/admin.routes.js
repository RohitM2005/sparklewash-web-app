// backend/routes/admin.routes.js
// All admin panel routes consolidated here.

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

import {
  getAdminStats,
  getAllPayments,
  getAllWashers,
  createWasher,
  toggleWasherStatus,
  getAllWashRecords,
  getAllVehicles,
} from "../controllers/admin.controller.js";

import {
  getAllSubscriptions,
  assignWasher,
  getActiveWashers,
} from "../controllers/adminSubscription.controller.js";

import {
  getUsers,
  toggleUserStatus,
  getUserDetails,
  exportUsers,
} from "../controllers/adminUsers.controller.js";

const router = express.Router();
const admin = [protect, authorizeRoles("admin")];

// Stats
router.get("/stats", ...admin, getAdminStats);

// Users
router.get("/users", ...admin, getUsers);
router.patch("/users/:id/status", ...admin, toggleUserStatus);
router.get("/users/export", ...admin, exportUsers);
router.get("/users/:id/details", ...admin, getUserDetails);

// Subscriptions
router.get("/subscriptions", ...admin, getAllSubscriptions);
router.patch("/subscriptions/:id/assign-washer", ...admin, assignWasher);
router.get("/subscriptions/washers", ...admin, getActiveWashers);

// Payments
router.get("/payments", ...admin, getAllPayments);

// Washers
router.get("/washers", ...admin, getAllWashers);
router.post("/washers", ...admin, createWasher);
router.patch("/washers/:id/status", ...admin, toggleWasherStatus);

// Vehicles
router.get("/vehicles", ...admin, getAllVehicles);

// Wash records
router.get("/wash-records", ...admin, getAllWashRecords);

export default router;