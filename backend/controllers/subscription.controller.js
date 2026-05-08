// controllers/subscription.controller.js
import pool from "../config/db.js";

export const createSubscription = async (req, res) => {
  try {
    const { vehicle_id, plan_name, monthly_price, preferred_time, services } = req.body;
    const user_id = req.user.id;

    const [result] = await pool.execute(
      `INSERT INTO subscriptions
       (user_id, vehicle_id, plan_name, monthly_price, preferred_time, services, status, start_date, renewal_date)
       VALUES (?,?,?,?,?,?,'pending',CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH))`,
      [user_id, vehicle_id, plan_name, monthly_price, preferred_time, JSON.stringify(services || [])]
    );

    res.json({ subscription_id: result.insertId });
  } catch (err) {
    console.error("Create subscription error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getMySubscription = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.*, v.vehicle_number, v.vehicle_type, v.vehicle_model
       FROM subscriptions s
       LEFT JOIN vehicles v ON s.vehicle_id = v.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Keep backward compat exports
export const activateSubscription = createSubscription;
export const getSubscription = getMySubscription;