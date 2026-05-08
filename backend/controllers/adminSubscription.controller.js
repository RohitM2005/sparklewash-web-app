// controllers/adminSubscription.controller.js
import pool from "../config/db.js";

export const getAllSubscriptions = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT s.*, 
              v.vehicle_number, v.vehicle_type, v.vehicle_model,
              u.name as customer_name, u.full_name as customer_full_name, u.email as customer_email, u.phone as customer_phone,
              w.name as washer_name, w.full_name as washer_full_name
       FROM subscriptions s
       LEFT JOIN vehicles v ON s.vehicle_id = v.id
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN users w ON s.washer_id = w.id
       ORDER BY s.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error("Get subscriptions error:", error);
    res.status(500).json({ message: "Failed to load subscriptions", error: error.message });
  }
};

export const assignWasher = async (req, res) => {
  try {
    const { id } = req.params;
    const { washer_id } = req.body;

    if (!washer_id) {
      return res.status(400).json({ message: "washer_id is required" });
    }

    // Update subscription with assigned washer
    await pool.execute(
      "UPDATE subscriptions SET washer_id = ? WHERE id = ?",
      [washer_id, id]
    );

    res.json({ success: true, message: "Washer assigned successfully" });
  } catch (error) {
    console.error("Assign washer error:", error);
    res.status(500).json({ message: "Failed to assign washer", error: error.message });
  }
};

export const getActiveWashers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, full_name, email, phone FROM users WHERE role = 'washer' AND status = 'active' ORDER BY name"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to load washers", error: error.message });
  }
};