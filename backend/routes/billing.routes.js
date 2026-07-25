// routes/billing.routes.js
// Admin billing + Customer billing + Booking confirm routes

import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import {
  createAndSendBill,
  editBill,
  getBillBreakdown,
  getUnpaidBills,
  payBill,
  verifyBillPayment,
  getInvoiceDetails,
  confirmBooking,
} from "../controllers/billing.controller.js";

const router = express.Router();
const admin = [protect, authorizeRoles("admin")];

// ─── Admin Billing ───
router.post("/admin/billing/create-and-send", ...admin, createAndSendBill);
router.patch("/admin/billing/:payment_id/edit", ...admin, editBill);
router.get("/admin/billing/:payment_id/breakdown", ...admin, getBillBreakdown);

// ─── Customer Billing ───
router.get("/customer/billing/unpaid", protect, getUnpaidBills);
router.post("/customer/billing/pay", protect, payBill);
router.post("/customer/billing/verify", protect, verifyBillPayment);
router.get("/customer/billing/invoice/:payment_id", protect, getInvoiceDetails);

// ─── Booking Confirm (no Razorpay) ───
router.post("/booking/confirm", protect, confirmBooking);

export default router;
