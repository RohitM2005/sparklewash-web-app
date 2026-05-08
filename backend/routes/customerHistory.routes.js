// routes/customerHistory.routes.js
import express from "express";
import { getWashHistory } from "../controllers/customerHistory.controller.js";
import { getCustomerDashboard } from "../controllers/customerDashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/dashboard", protect, getCustomerDashboard);
router.get("/wash-history", protect, getWashHistory);

export default router;
