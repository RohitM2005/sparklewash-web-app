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
  updateWasher,
  deleteWasher,
  getAllWashRecords,
  getAllVehicles,
  updateVehicle,
  deleteVehicle,
  deletePayment,
} from "../controllers/admin.controller.js";

import {
  getAllSubscriptions,
  assignWasher,
  getActiveWashers,
  cancelSubscription,
  getVehiclesToAssign,
  verifyWashRecord,
} from "../controllers/adminSubscription.controller.js";

import {
  getUsers,
  toggleUserStatus,
  getUserDetails,
  exportUsers,
  updateUser,
  deleteUser,
  importUsers,
  getCustomers,
} from "../controllers/adminUsers.controller.js";

import {
  getCustomerDetails,
  updateCustomer,
  deleteCustomer,
  updateCustomerStats,
  updateWashRecord,
  deleteWashRecord,
  updateSubscription,
  deleteSubscription,
} from "../controllers/adminCustomerDetail.controller.js";

import {
  getPreferences,
  savePreferences,
  getPricing,
  savePricing,
  getTemplates,
  saveTemplates,
  getActivityLog,
  getAllSettings,
  saveAllSettings,
} from "../controllers/adminSettings.controller.js";

import {
  getAddonServices,
  createAddonService,
  updateAddonService,
  deleteAddonService,
} from "../controllers/adminAddonServices.controller.js";

import {
  getAdminComplaints,
  getAdminComplaintStats,
  getUnreadComplaintsCount,
  getAdminComplaintDetails,
  replyAdminComplaint,
  updateComplaintStatus,
} from "../controllers/adminComplaints.controller.js";

const router = express.Router();
const admin = [protect, authorizeRoles("admin")];

// Stats
router.get("/stats", ...admin, getAdminStats);

// Complaints
router.get("/complaints", ...admin, getAdminComplaints);
router.get("/complaints/stats", ...admin, getAdminComplaintStats);
router.get("/complaints/unread-count", ...admin, getUnreadComplaintsCount);
router.get("/complaints/:id", ...admin, getAdminComplaintDetails);
router.post("/complaints/:id/reply", ...admin, replyAdminComplaint);
router.patch("/complaints/:id/status", ...admin, updateComplaintStatus);

// Users
router.get("/users", ...admin, getUsers);
router.get("/users/export", ...admin, exportUsers);
router.get("/users/:id/details", ...admin, getUserDetails);
router.patch("/users/:id/status", ...admin, toggleUserStatus);
router.patch("/users/:id", ...admin, updateUser);
router.delete("/users/:id", ...admin, deleteUser);
router.post("/users/import", ...admin, importUsers);

// Customers
router.get("/customers", ...admin, getCustomers);
router.get("/customers/:id/details", ...admin, getCustomerDetails);
router.patch("/customers/:id", ...admin, updateCustomer);
router.delete("/customers/:id", ...admin, deleteCustomer);
router.patch("/customers/:id/stats", ...admin, updateCustomerStats);

// Admin CRUD on customer resources
router.patch("/wash-records/:id", ...admin, updateWashRecord);
router.delete("/wash-records/:id", ...admin, deleteWashRecord);
router.patch("/subscriptions/:id", ...admin, updateSubscription);
router.delete("/subscriptions/:id", ...admin, deleteSubscription);

// Addon Services
router.get("/customers/:customerId/addon-services", ...admin, getAddonServices);
router.post("/customers/:customerId/addon-services", ...admin, createAddonService);
router.patch("/addon-services/:id", ...admin, updateAddonService);
router.delete("/addon-services/:id", ...admin, deleteAddonService);

// Subscriptions
router.get("/subscriptions", ...admin, getAllSubscriptions);
router.patch("/subscriptions/:id/assign-washer", ...admin, assignWasher);
router.patch("/subscriptions/:id/cancel", ...admin, cancelSubscription);
router.get("/subscriptions/washers", ...admin, getActiveWashers);

// Payments
router.get("/payments", ...admin, getAllPayments);
router.delete("/payments/:id", ...admin, deletePayment);

// Washers
router.get("/washers", ...admin, getAllWashers);
router.post("/washers", ...admin, createWasher);
router.patch("/washers/:id/status", ...admin, toggleWasherStatus);
router.patch("/washers/:id", ...admin, updateWasher);
router.delete("/washers/:id", ...admin, deleteWasher);

// Vehicles
router.get("/vehicles", ...admin, getAllVehicles);
router.patch("/vehicles/:id", ...admin, updateVehicle);
router.delete("/vehicles/:id", ...admin, deleteVehicle);

// Wash records
router.get("/wash-records", ...admin, getAllWashRecords);
router.get("/washlogs", ...admin, getAllWashRecords);
router.get("/washlogs/vehicles-to-assign", ...admin, getVehiclesToAssign);
router.patch("/wash-records/:id/verify", ...admin, verifyWashRecord);

// Settings
router.get("/settings", ...admin, getAllSettings);
router.post("/settings", ...admin, saveAllSettings);
router.get("/settings/preferences", ...admin, getPreferences);
router.put("/settings/preferences", ...admin, savePreferences);
router.get("/settings/pricing", ...admin, getPricing);
router.put("/settings/pricing", ...admin, savePricing);
router.get("/settings/templates", ...admin, getTemplates);
router.put("/settings/templates", ...admin, saveTemplates);

// Activity log
router.get("/activity-log", ...admin, getActivityLog);

export default router;