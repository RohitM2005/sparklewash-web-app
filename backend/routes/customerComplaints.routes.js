import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createComplaint,
  getCustomerComplaints,
  getCustomerComplaintDetails,
  replyCustomerComplaint,
} from "../controllers/customerComplaints.controller.js";

const router = express.Router();

router.use(protect);

router.post("/complaints", createComplaint);
router.get("/complaints", getCustomerComplaints);
router.get("/complaints/:id", getCustomerComplaintDetails);
router.post("/complaints/:id/reply", replyCustomerComplaint);

export default router;
