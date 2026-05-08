// backend/routes/subscription.routes.js
import express from "express";
import {
  createSubscription,
  getMySubscription,
} from "../controllers/subscription.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/subscriptions → create new subscription
router.post("/", protect, createSubscription);
// POST /api/subscriptions/activate → backward compat alias
router.post("/activate", protect, createSubscription);
// GET /api/subscriptions → get all my subscriptions
router.get("/", protect, getMySubscription);
// GET /api/subscriptions/my → alias
router.get("/my", protect, getMySubscription);

export default router;