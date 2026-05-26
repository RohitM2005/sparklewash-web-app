// controllers/customerDashboard.controller.js
import pool from "../config/db.js";

export const getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const [[user]] = await pool.execute(
      "SELECT id, name, full_name, email, phone, manual_total_washes, manual_this_month, manual_recent_wash, manual_active_vehicles, manual_days_left, manual_active_subscriptions FROM users WHERE id = ?",
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

    // Get payments with plan_name
    const [payments] = await pool.execute(
      `SELECT p.id, p.subscription_id, p.amount, p.status, p.payment_method,
              p.razorpay_order_id, p.razorpay_payment_id, p.paid_at, p.created_at,
              s.plan_name
       FROM payments p
       LEFT JOIN subscriptions s ON p.subscription_id = s.id
       WHERE p.user_id = ?
       ORDER BY p.created_at DESC LIMIT 20`,
      [userId]
    );

    // Compute stats
    const computedActiveVehicles = vehicles.length;
    const computedActiveSubscriptions = subscriptions.filter(s => s.status === "active").length;
    let computedDaysLeft = 0;
    if (activeSub && activeSub.renewal_date) {
      const renewal = new Date(activeSub.renewal_date);
      const now = new Date();
      computedDaysLeft = Math.max(0, Math.ceil((renewal - now) / (1000 * 60 * 60 * 24)));
    }

    res.json({
      user: user || {},
      subscription: activeSub,
      allSubscriptions: subscriptions,
      todayWash: todayWash[0] || null,
      washRecords: washHistory,
      washHistory,
      vehicles,
      payments,
      stats: {
        activeVehicles: user?.manual_active_vehicles !== null ? user.manual_active_vehicles : computedActiveVehicles,
        daysLeft: user?.manual_days_left !== null ? user.manual_days_left : computedDaysLeft,
        activeSubscriptions: user?.manual_active_subscriptions !== null ? user.manual_active_subscriptions : computedActiveSubscriptions,
      },
    });
  } catch (error) {
    console.error("Customer dashboard error:", error);
    res.status(500).json({ message: "Failed to load dashboard", error: error.message });
  }
};
