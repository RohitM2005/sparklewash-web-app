// routes/razorpay.routes.js
import express from "express";
import { createOrder, verifyPayment, handleWebhook } from "../controllers/razorpay.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protected routes
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);

// Webhook — raw body needed for signature verification
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleWebhook
);

export default router;