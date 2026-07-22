// routes/customerHistory.routes.js
import express from "express";
import { getWashHistory, getWashHistoryByVehicle } from "../controllers/customerHistory.controller.js";
import { getCustomerDashboard } from "../controllers/customerDashboard.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import pool from "../config/db.js";

const router = express.Router();

router.get("/dashboard", protect, getCustomerDashboard);

// All vehicles wash history (backward compat)
router.get("/wash-history", protect, getWashHistory);

// Per-vehicle wash history (new)
router.get("/wash-history/:vehicleId", protect, getWashHistoryByVehicle);

// Customer: addon services per vehicle (for SubscriptionCard billing transparency)
router.get("/vehicles/:vehicleId/addon-services", protect, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.id;
    // Only fetch services for vehicles belonging to this customer
    const [rows] = await pool.execute(
      `SELECT a.id, a.service_type, a.amount,
              DATE_FORMAT(a.service_date, '%Y-%m-%d') as service_date,
              DATE_FORMAT(a.scheduled_date, '%Y-%m-%d') as scheduled_date,
              a.status, a.notes, a.created_at
       FROM addon_services a
       INNER JOIN vehicles v ON a.vehicle_id = v.id AND v.user_id = ?
       WHERE a.vehicle_id = ? AND a.user_id = ?
       ORDER BY COALESCE(a.service_date, a.created_at) DESC`,
      [userId, vehicleId, userId]
    );
    res.json({ success: true, services: rows });
  } catch (error) {
    console.error("Customer addon services error:", error);
    res.status(500).json({ message: "Failed to load services" });
  }
});

export default router;
