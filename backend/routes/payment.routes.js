// backend/routes/payment.routes.js

import express from "express";
import {
  createOrder,
  verifyPayment,
} from "../controllers/razorpay.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/create-order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

export default router;