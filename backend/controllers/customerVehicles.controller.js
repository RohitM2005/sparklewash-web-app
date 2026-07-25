import pool from "../config/db.js";
import { syncUserData } from "../utils/syncCustomerData.js";

/* GET /api/customer/vehicles */
export const getCustomerVehicles = async (req, res) => {
  try {
    const userId = req.user.id;
    const [vehicles] = await pool.execute(
      `SELECT v.*,
              s.plan_name, s.status AS sub_status,
              s.start_date, s.renewal_date, s.monthly_price
       FROM vehicles v
       LEFT JOIN subscriptions s ON s.vehicle_id = v.id AND s.user_id = v.user_id AND s.status = 'active'
       WHERE v.user_id = ?
       ORDER BY v.created_at DESC`,
      [userId]
    );
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error("Get customer vehicles error:", error);
    res.status(500).json({ message: "Failed to load vehicles", error: error.message });
  }
};

/* POST /api/customer/vehicles */
export const addCustomerVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vehicle_number, vehicle_model, vehicle_type, phone, address } = req.body;

    // Sync any phone/address if passed
    await syncUserData(userId, { phone, address });

    if (!vehicle_number || !vehicle_number.trim()) {
      return res.status(400).json({ success: false, message: "Vehicle number is required" });
    }
    if (!vehicle_model || !vehicle_model.trim()) {
      return res.status(400).json({ success: false, message: "Vehicle model is required" });
    }

    const [result] = await pool.execute(
      "INSERT INTO vehicles (user_id, vehicle_number, vehicle_model, vehicle_type) VALUES (?, ?, ?, ?)",
      [userId, vehicle_number.trim().toUpperCase(), vehicle_model.trim(), vehicle_type || "sedan"]
    );

    res.status(201).json({ success: true, message: "Vehicle added", vehicleId: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Vehicle number already registered" });
    }
    console.error("Add vehicle error:", error);
    res.status(500).json({ message: "Failed to add vehicle", error: error.message });
  }
};

/* PATCH /api/customer/vehicles/:id */
export const updateCustomerVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;
    const { vehicle_number, vehicle_model, vehicle_type } = req.body;

    // Verify ownership
    const [[vehicle]] = await pool.execute(
      "SELECT id FROM vehicles WHERE id = ? AND user_id = ?",
      [vehicleId, userId]
    );
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

    const updates = [];
    const params = [];
    if (vehicle_number) { updates.push("vehicle_number = ?"); params.push(vehicle_number.trim().toUpperCase()); }
    if (vehicle_model) { updates.push("vehicle_model = ?"); params.push(vehicle_model.trim()); }
    if (vehicle_type) { updates.push("vehicle_type = ?"); params.push(vehicle_type); }

    if (updates.length === 0) return res.status(400).json({ message: "No fields to update" });

    params.push(vehicleId, userId);
    await pool.execute(
      `UPDATE vehicles SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
      params
    );

    res.json({ success: true, message: "Vehicle updated" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Vehicle number already exists" });
    }
    console.error("Update vehicle error:", error);
    res.status(500).json({ message: "Failed to update vehicle", error: error.message });
  }
};

/* DELETE /api/customer/vehicles/:id */
export const deleteCustomerVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;

    // Verify ownership
    const [[vehicle]] = await pool.execute(
      "SELECT id FROM vehicles WHERE id = ? AND user_id = ?",
      [vehicleId, userId]
    );
    if (!vehicle) return res.status(404).json({ success: false, message: "Vehicle not found" });

    // Delete related wash records first
    await pool.execute("DELETE FROM wash_records WHERE vehicle_id = ? AND user_id = ?", [vehicleId, userId]);
    // Delete related subscriptions
    await pool.execute("DELETE FROM subscriptions WHERE vehicle_id = ? AND user_id = ?", [vehicleId, userId]);
    // Delete vehicle
    await pool.execute("DELETE FROM vehicles WHERE id = ? AND user_id = ?", [vehicleId, userId]);

    res.json({ success: true, message: "Vehicle removed" });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    res.status(500).json({ message: "Failed to delete vehicle", error: error.message });
  }
};
