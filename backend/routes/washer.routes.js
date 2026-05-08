// backend/routes/washer.routes.js
// Complete washer panel API routes — rebuilt from scratch.

import express from "express";
import {
  getWasherDashboard,
  getTodayVehicles,
  startWash,
  completeWash,
  skipWash,
  reportIssue,
  getCompletedWashes,
  getWasherProfile,
  changePassword,
} from "../controllers/washer.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = express.Router();

const auth = [protect, authorizeRoles("washer")];

router.get("/dashboard",                ...auth, getWasherDashboard);
router.get("/vehicles/today",           ...auth, getTodayVehicles);
router.patch("/wash/:recordId/start",   ...auth, startWash);
router.patch("/wash/:recordId/complete",...auth, completeWash);
router.patch("/wash/:recordId/skip",    ...auth, skipWash);
router.post("/wash/:recordId/issue",    ...auth, reportIssue);
router.get("/wash/completed",           ...auth, getCompletedWashes);
router.get("/profile",                  ...auth, getWasherProfile);
router.patch("/profile/change-password",...auth, changePassword);

export default router;