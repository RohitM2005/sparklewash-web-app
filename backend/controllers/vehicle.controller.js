// controllers/vehicle.controller.js
import pool from "../config/db.js";

export const createVehicle = async (req, res) => {
  try {
    const { vehicle_number, vehicle_model, vehicle_type } = req.body;
    const user_id = req.user.id;

    if (!vehicle_number || !vehicle_type) {
      return res.status(400).json({ message: "Vehicle number and type are required" });
    }

    // Check if vehicle already exists for this user
    const [existing] = await pool.execute(
      "SELECT id FROM vehicles WHERE vehicle_number = ? AND user_id = ?",
      [vehicle_number, user_id]
    );

    if (existing.length) {
      return res.json({ vehicle_id: existing[0].id });
    }

    const [result] = await pool.execute(
      "INSERT INTO vehicles (user_id, vehicle_number, vehicle_model, vehicle_type) VALUES (?,?,?,?)",
      [user_id, vehicle_number, vehicle_model || null, vehicle_type]
    );

    res.json({ vehicle_id: result.insertId });
  } catch (err) {
    console.error("Create vehicle error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getVehicles = async (req, res) => {
  try {
    const [vehicles] = await pool.execute(
      "SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};