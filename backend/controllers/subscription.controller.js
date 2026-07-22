// controllers/subscription.controller.js
import pool from "../config/db.js";

export const createSubscription = async (req, res) => {
  try {
    const { vehicle_id, plan_name, monthly_price, preferred_time, services } = req.body;
    const user_id = req.user.id;

    // Validate required fields
    if (!vehicle_id) {
      return res.status(400).json({ success: false, message: "Vehicle is required" });
    }
    if (!monthly_price || monthly_price <= 0) {
      return res.status(400).json({ success: false, message: "Valid price is required" });
    }

    // Safely handle preferred_time — must match ENUM
    const validTimes = ["morning", "evening"];
    const safeTime = validTimes.includes(preferred_time) ? preferred_time : "morning";

    // Safely handle services — store as JSON string
    let servicesJson;
    try {
      servicesJson = JSON.stringify(services || ["daily_wash"]);
    } catch {
      servicesJson = '["daily_wash"]';
    }

    const [result] = await pool.execute(
      `INSERT INTO subscriptions
       (user_id, vehicle_id, plan_name, monthly_price, preferred_time, services, status, start_date, renewal_date)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH))`,
      [
        user_id,
        vehicle_id,
        plan_name || "Daily Wash",
        monthly_price,
        safeTime,
        servicesJson,
      ]
    );

    console.log(`✅ Subscription created: ID=${result.insertId}, user=${user_id}, vehicle=${vehicle_id}, price=${monthly_price}`);

    res.json({
      success: true,
      subscription_id: result.insertId,
      message: "Subscription created successfully",
    });
  } catch (err) {
    console.error("❌ Create subscription error:", err.message);
    console.error("Full error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
      error: err.message,
    });
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