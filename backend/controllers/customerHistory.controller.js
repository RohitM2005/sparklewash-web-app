// controllers/customerHistory.controller.js
import pool from "../config/db.js";

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
