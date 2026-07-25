// controllers/customerHistory.controller.js
import pool from "../config/db.js";

/* GET /api/customer/wash-history — all vehicles (backward compat) */
export const getWashHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `SELECT wr.id, wr.subscription_id, wr.vehicle_id, wr.washer_id, wr.user_id,
              DATE_FORMAT(wr.wash_date, '%Y-%m-%d') as wash_date,
              wr.status, wr.started_at, wr.washed_at, wr.wash_duration_minutes,
              wr.washer_note, wr.issue_type, wr.issue_note, wr.verified, wr.verified_at, wr.created_at,
              v.vehicle_number, v.vehicle_type, v.vehicle_model
       FROM wash_records wr
       JOIN vehicles v ON wr.vehicle_id = v.id
       WHERE wr.user_id = ?
       ORDER BY wr.wash_date DESC, wr.created_at DESC`,
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

    const { startDate, endDate } = req.query;
    let query = `
      SELECT DATE_FORMAT(wr.wash_date, '%Y-%m-%d') as wash_date,
             wr.status, wr.washer_note, wr.issue_type, wr.issue_note,
             wr.wash_duration_minutes, wr.verified, wr.id, wr.started_at, wr.washed_at
      FROM wash_records wr
      WHERE wr.vehicle_id = ?
    `;
    const params = [vehicleId];

    if (startDate && endDate) {
      query += " AND wr.wash_date BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (startDate) {
      query += " AND wr.wash_date >= ?";
      params.push(startDate);
    }

    query += " ORDER BY wr.wash_date DESC";

    const [rows] = await pool.execute(query, params);

    res.json({
      vehicle,
      washHistory: rows,
    });
  } catch (error) {
    console.error("Get wash history by vehicle error (vehicleId:", req.params.vehicleId, "userId:", req.user?.id, "):", error);
    res.status(500).json({ message: "Failed to load wash history", error: error.message });
  }
};
