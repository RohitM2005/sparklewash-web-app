// controllers/adminAddonServices.controller.js
// CRUD for customer add-on services (admin-managed)

import pool from "../config/db.js";

async function logActivity(adminId, action) {
  try {
    await pool.execute("INSERT INTO activity_log (admin_id, action) VALUES (?, ?)", [adminId || null, action]);
  } catch (err) {
    console.error("Log activity error:", err.message);
  }
}

/* ── GET all addon services for a customer ── */
export const getAddonServices = async (req, res) => {
  try {
    const { customerId } = req.params;
    const [rows] = await pool.execute(
      `SELECT a.id, a.vehicle_id, a.service_type, a.amount,
              DATE_FORMAT(a.service_date, '%Y-%m-%d') as service_date,
              DATE_FORMAT(a.scheduled_date, '%Y-%m-%d') as scheduled_date,
              a.status, a.notes, a.created_at,
              v.vehicle_number, v.vehicle_model, v.vehicle_type,
              u.full_name as created_by_name
       FROM addon_services a
       LEFT JOIN vehicles v ON a.vehicle_id = v.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.user_id = ?
       ORDER BY COALESCE(a.scheduled_date, a.service_date, a.created_at) ASC`,
      [customerId]
    );
    res.json({ success: true, services: rows });
  } catch (error) {
    console.error("Get addon services error:", error);
    res.status(500).json({ message: "Failed to load addon services", error: error.message });
  }
};

/* ── CREATE addon service ── */
export const createAddonService = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { vehicle_id, service_type, amount, service_date, scheduled_date, notes, status } = req.body;

    if (!service_type) return res.status(400).json({ message: "service_type is required" });
    if (!amount || isNaN(Number(amount))) return res.status(400).json({ message: "valid amount is required" });

    const [result] = await pool.execute(
      `INSERT INTO addon_services
         (user_id, vehicle_id, service_type, amount, service_date, scheduled_date, status, notes, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        vehicle_id || null,
        service_type,
        Number(amount),
        service_date || null,
        scheduled_date || null,
        status || "scheduled",
        notes || null,
        req.user?.id || null,
      ]
    );

    await logActivity(req.user?.id, `Added addon service '${service_type}' for customer #${customerId}`);
    res.json({ success: true, id: result.insertId, message: "Addon service created" });
  } catch (error) {
    console.error("Create addon service error:", error);
    res.status(500).json({ message: "Failed to create addon service", error: error.message });
  }
};

/* ── UPDATE addon service ── */
export const updateAddonService = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_type, amount, service_date, scheduled_date, status, notes, vehicle_id } = req.body;

    const fields = [];
    const params = [];
    if (service_type !== undefined)   { fields.push("service_type = ?");   params.push(service_type); }
    if (amount !== undefined)         { fields.push("amount = ?");          params.push(Number(amount)); }
    if (service_date !== undefined)   { fields.push("service_date = ?");    params.push(service_date || null); }
    if (scheduled_date !== undefined) { fields.push("scheduled_date = ?");  params.push(scheduled_date || null); }
    if (status !== undefined)         { fields.push("status = ?");          params.push(status); }
    if (notes !== undefined)          { fields.push("notes = ?");           params.push(notes || null); }
    if (vehicle_id !== undefined)     { fields.push("vehicle_id = ?");      params.push(vehicle_id || null); }

    if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

    params.push(id);
    await pool.execute(`UPDATE addon_services SET ${fields.join(", ")} WHERE id = ?`, params);
    await logActivity(req.user?.id, `Updated addon service #${id}`);
    res.json({ success: true, message: "Addon service updated" });
  } catch (error) {
    console.error("Update addon service error:", error);
    res.status(500).json({ message: "Failed to update addon service", error: error.message });
  }
};

/* ── DELETE addon service ── */
export const deleteAddonService = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute("DELETE FROM addon_services WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: "Service not found" });
    await logActivity(req.user?.id, `Deleted addon service #${id}`);
    res.json({ success: true, message: "Addon service deleted" });
  } catch (error) {
    console.error("Delete addon service error:", error);
    res.status(500).json({ message: "Failed to delete addon service", error: error.message });
  }
};
