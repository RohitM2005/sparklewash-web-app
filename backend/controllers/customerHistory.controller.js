// controllers/customerHistory.controller.js
import pool from "../config/db.js";

/* GET /api/customer/wash-history — all vehicles (backward compat) */
export const getWashHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `SELECT wr.*, v.vehicle_number, v.vehicle_type, v.vehicle_model
       FROM wash_records wr
       JOIN vehicles v ON wr.vehicle_id = v.id
       WHERE wr.user_id = ?
       ORDER BY wr.created_at DESC`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get wash history error:", error);
    res.status(500).json({ message: "Failed to load wash history", error: error.message });
  }
};

/* GET /api/customer/wash-history/:vehicleId — per-vehicle wash history */
export const getWashHistoryByVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicleId = parseInt(req.params.vehicleId, 10);

    if (!vehicleId || isNaN(vehicleId)) {
      return res.status(400).json({ message: "Invalid vehicle ID" });
    }

    // Verify the vehicle belongs to this user
    const [[vehicle]] = await pool.execute(
      `SELECT v.*, s.plan_name, s.status AS sub_status, s.renewal_date, s.monthly_price, s.preferred_time
       FROM vehicles v
       LEFT JOIN subscriptions s ON s.vehicle_id = v.id AND s.user_id = v.user_id AND s.status = 'active'
       WHERE v.id = ? AND v.user_id = ?`,
      [vehicleId, userId]
    );

    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    const [rows] = await pool.execute(
      `SELECT wr.wash_date, wr.status, wr.washer_note, wr.wash_duration_minutes,
              wr.photo_url, wr.verified, wr.id
       FROM wash_records wr
       WHERE wr.vehicle_id = ? AND wr.user_id = ?
       ORDER BY wr.wash_date DESC`,
      [vehicleId, userId]
    );

    res.json({
      vehicle,
      washHistory: rows,
    });
  } catch (error) {
    console.error("Get wash history by vehicle error:", error);
    res.status(500).json({ message: "Failed to load wash history", error: error.message });
  }
};
