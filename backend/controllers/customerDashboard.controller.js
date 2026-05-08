// controllers/customerDashboard.controller.js
import pool from "../config/db.js";

export const getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const [[user]] = await pool.execute(
      "SELECT id, name, full_name, email, phone FROM users WHERE id = ?",
      [userId]
    );

    // Get active subscription with vehicle and washer info
    const [subscriptions] = await pool.execute(
      `SELECT s.*, 
              v.vehicle_number, v.vehicle_type, v.vehicle_model,
              w.name as washer_name, w.full_name as washer_full_name
       FROM subscriptions s
       LEFT JOIN vehicles v ON s.vehicle_id = v.id
       LEFT JOIN users w ON s.washer_id = w.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [userId]
    );

    const activeSub = subscriptions.find(s => s.status === "active") || subscriptions[0] || null;

    // Get today's wash status
    const today = new Date().toISOString().split("T")[0];
    const [todayWash] = await pool.execute(
      `SELECT wr.*, v.vehicle_number
       FROM wash_records wr
       LEFT JOIN vehicles v ON wr.vehicle_id = v.id
       WHERE wr.user_id = ? AND wr.wash_date = ?
       ORDER BY wr.created_at DESC LIMIT 1`,
      [userId, today]
    );

    // Get wash history (last 30)
    const [washHistory] = await pool.execute(
      `SELECT wr.*, v.vehicle_number, v.vehicle_type
       FROM wash_records wr
       LEFT JOIN vehicles v ON wr.vehicle_id = v.id
       WHERE wr.user_id = ?
       ORDER BY wr.wash_date DESC LIMIT 30`,
      [userId]
    );

    // Get vehicles
    const [vehicles] = await pool.execute(
      "SELECT * FROM vehicles WHERE user_id = ?",
      [userId]
    );

    // Get payments
    const [payments] = await pool.execute(
      `SELECT id, subscription_id, amount, status, payment_method,
              razorpay_order_id, razorpay_payment_id, paid_at, created_at
       FROM payments
       WHERE user_id = ?
       ORDER BY created_at DESC LIMIT 20`,
      [userId]
    );

    res.json({
      user: user || {},
      subscription: activeSub,
      allSubscriptions: subscriptions,
      todayWash: todayWash[0] || null,
      washHistory,
      vehicles,
      payments,
    });
  } catch (error) {
    console.error("Customer dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard", error: error.message });
  }
};
