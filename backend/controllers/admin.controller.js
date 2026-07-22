// controllers/admin.controller.js
// Admin-facing stats, payments, washers, and wash records.

import pool from "../config/db.js";
import { hashPassword } from "../utils/hash.js";

// Dashboard stats — supports optional ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export const getAdminStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const { startDate, endDate } = req.query;

    // Build date clause helpers
    const dateClause = (col) => {
      if (startDate && endDate) return ` AND DATE(${col}) BETWEEN ? AND ?`;
      if (startDate) return ` AND DATE(${col}) >= ?`;
      if (endDate) return ` AND DATE(${col}) <= ?`;
      return "";
    };
    const dateParams = () => {
      if (startDate && endDate) return [startDate, endDate];
      if (startDate) return [startDate];
      if (endDate) return [endDate];
      return [];
    };

    const [[{ totalCustomers }]] = await pool.execute(
      `SELECT COUNT(*) as totalCustomers FROM users WHERE role = 'customer'${dateClause("created_at")}`,
      [...dateParams()]
    );
    const [[{ activeSubscriptions }]] = await pool.execute(
      `SELECT COUNT(*) as activeSubscriptions FROM subscriptions WHERE status = 'active'${dateClause("created_at")}`,
      [...dateParams()]
    );
    const [[{ totalRevenue }]] = await pool.execute(
      `SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM payments WHERE status IN ('success','paid','captured')${dateClause("created_at")}`,
      [...dateParams()]
    );
    const [[{ totalVehicles }]] = await pool.execute(
      `SELECT COUNT(*) as totalVehicles FROM vehicles WHERE 1=1${dateClause("created_at")}`,
      [...dateParams()]
    );
    const [[{ totalWashers }]] = await pool.execute(
      "SELECT COUNT(*) as totalWashers FROM users WHERE role = 'washer'"
    );
    const [[{ todayCompleted }]] = await pool.execute(
      "SELECT COUNT(*) as todayCompleted FROM wash_records WHERE wash_date = ? AND status = 'completed'",
      [today]
    );
    const [[{ todayPending }]] = await pool.execute(
      "SELECT COUNT(*) as todayPending FROM wash_records WHERE wash_date = ? AND status = 'pending'",
      [today]
    );
    const [[{ totalComplaints }]] = await pool.execute(
      `SELECT COUNT(*) as totalComplaints FROM complaints WHERE 1=1${dateClause("created_at")}`,
      [...dateParams()]
    );
    const [[{ openComplaints }]] = await pool.execute(
      `SELECT COUNT(*) as openComplaints FROM complaints WHERE status = 'Open'${dateClause("created_at")}`,
      [...dateParams()]
    );
    const [[{ resolvedComplaints }]] = await pool.execute(
      `SELECT COUNT(*) as resolvedComplaints FROM complaints WHERE status = 'Resolved'${dateClause("created_at")}`,
      [...dateParams()]
    );

    res.json({
      success: true,
      totalCustomers,
      activeSubscriptions,
      totalRevenue,
      totalVehicles,
      totalWashers,
      todayCompleted,
      todayPending,
      totalComplaints,
      openComplaints,
      resolvedComplaints,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Failed to load admin stats", error: error.message });
  }
};

// All payments — supports optional ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export const getAllPayments = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateWhere = "";
    const params = [];
    if (startDate && endDate) {
      dateWhere = " AND DATE(p.created_at) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (startDate) {
      dateWhere = " AND DATE(p.created_at) >= ?";
      params.push(startDate);
    } else if (endDate) {
      dateWhere = " AND DATE(p.created_at) <= ?";
      params.push(endDate);
    }

    const [payments] = await pool.execute(`
      SELECT p.id, p.amount, p.status, p.payment_method,
             p.razorpay_payment_id, p.paid_at, p.created_at,
             u.full_name as customer_name, u.email as customer_email,
             s.plan_name
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN subscriptions s ON p.subscription_id = s.id
      WHERE 1=1${dateWhere}
      ORDER BY p.created_at DESC
    `, params);
    res.json({ success: true, payments });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ message: "Failed to load payments", error: error.message });
  }
};

// All washers
export const getAllWashers = async (req, res) => {
  try {
    const [washers] = await pool.execute(`
      SELECT u.id, u.full_name, u.email, u.phone, u.address as area,
             u.status, u.created_at,
             COUNT(DISTINCT s.id) as assigned_vehicles,
             SUM(CASE WHEN wr.status = 'completed' AND wr.wash_date = CURDATE() THEN 1 ELSE 0 END) as today_completed
      FROM users u
      LEFT JOIN subscriptions s ON s.washer_id = u.id AND s.status = 'active'
      LEFT JOIN wash_records wr ON wr.washer_id = u.id
      WHERE u.role = 'washer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, washers });
  } catch (error) {
    console.error("Get washers error:", error);
    res.status(500).json({ message: "Failed to load washers", error: error.message });
  }
};

// Create washer
export const createWasher = async (req, res) => {
  try {
    const { full_name, email, phone, password, area } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const hashed = await hashPassword(password);
    const [result] = await pool.execute(
      `INSERT INTO users (name, full_name, email, phone, password, role, address, status)
       VALUES (?, ?, ?, ?, ?, 'washer', ?, 'active')`,
      [full_name, full_name, email, phone || null, hashed, area || null]
    );

    res.json({ success: true, washer_id: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error("Create washer error:", error);
    res.status(500).json({ message: "Failed to create washer", error: error.message });
  }
};

// Toggle washer status
export const toggleWasherStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await pool.execute("UPDATE users SET status = ? WHERE id = ? AND role = 'washer'", [status, id]);
    res.json({ success: true, message: `Washer status updated to ${status}` });
  } catch (error) {
    console.error("Toggle washer status error:", error);
    res.status(500).json({ message: "Failed to update washer status", error: error.message });
  }
};

// Update washer
export const updateWasher = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, address, status } = req.body;
    const fields = [];
    const params = [];

    if (full_name) { fields.push("full_name = ?, name = ?"); params.push(full_name, full_name); }
    if (email) { fields.push("email = ?"); params.push(email); }
    if (phone !== undefined) { fields.push("phone = ?"); params.push(phone); }
    if (address !== undefined) { fields.push("address = ?"); params.push(address); }
    if (status && ["active", "suspended"].includes(status)) { fields.push("status = ?"); params.push(status); }

    if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

    params.push(id);
    await pool.execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ? AND role = 'washer'`, params);
    res.json({ success: true, message: "Washer updated" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Email already exists" });
    console.error("Update washer error:", error);
    res.status(500).json({ message: "Failed to update washer", error: error.message });
  }
};

// Delete washer
export const deleteWasher = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM users WHERE id = ? AND role = 'washer'", [id]);
    res.json({ success: true, message: "Washer deleted" });
  } catch (error) {
    console.error("Delete washer error:", error);
    res.status(500).json({ message: "Failed to delete washer", error: error.message });
  }
};

// All wash records
export const getAllWashRecords = async (req, res) => {
  try {
    const { date, status } = req.query;
    let query = `
      SELECT wr.id, wr.wash_date, wr.status,
             wr.started_at, wr.washed_at, wr.wash_duration_minutes,
             wr.washer_note, wr.issue_type, wr.issue_note,
             wr.verified, wr.verified_at,
             u.full_name as customer_name,
             v.vehicle_number, v.vehicle_type,
             w.full_name as washer_name
      FROM wash_records wr
      LEFT JOIN users u ON wr.user_id = u.id
      LEFT JOIN vehicles v ON wr.vehicle_id = v.id
      LEFT JOIN users w ON wr.washer_id = w.id
      WHERE 1=1
    `;
    const params = [];
    if (date) { query += " AND wr.wash_date = ?"; params.push(date); }
    if (status) { query += " AND wr.status = ?"; params.push(status); }
    query += " ORDER BY wr.wash_date DESC, wr.created_at DESC LIMIT 200";

    const [records] = await pool.execute(query, params);
    res.json({ success: true, records });
  } catch (error) {
    console.error("Get wash records error:", error);
    res.status(500).json({ message: "Failed to load wash records", error: error.message });
  }
};

// All vehicles — supports optional ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export const getAllVehicles = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateWhere = "";
    const params = [];
    if (startDate && endDate) {
      dateWhere = " AND DATE(v.created_at) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (startDate) {
      dateWhere = " AND DATE(v.created_at) >= ?";
      params.push(startDate);
    } else if (endDate) {
      dateWhere = " AND DATE(v.created_at) <= ?";
      params.push(endDate);
    }

    const [vehicles] = await pool.execute(`
      SELECT v.id, v.vehicle_number, v.vehicle_model, v.vehicle_type, v.created_at,
             u.full_name as owner_name, u.email as owner_email, u.phone as owner_phone,
             s.status as subscription_status, s.plan_name,
             w.full_name as washer_name
      FROM vehicles v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN subscriptions s ON s.vehicle_id = v.id AND s.status = 'active'
      LEFT JOIN users w ON s.washer_id = w.id
      WHERE 1=1${dateWhere}
      ORDER BY v.created_at DESC
    `, params);
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error("Get vehicles error:", error);
    res.status(500).json({ message: "Failed to load vehicles", error: error.message });
  }
};

// Update vehicle
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_number, vehicle_model, vehicle_type } = req.body;
    const fields = [];
    const params = [];

    if (vehicle_number) { fields.push("vehicle_number = ?"); params.push(vehicle_number); }
    if (vehicle_model !== undefined) { fields.push("vehicle_model = ?"); params.push(vehicle_model); }
    if (vehicle_type) { fields.push("vehicle_type = ?"); params.push(vehicle_type); }

    if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

    params.push(id);
    await pool.execute(`UPDATE vehicles SET ${fields.join(", ")} WHERE id = ?`, params);
    res.json({ success: true, message: "Vehicle updated" });
  } catch (error) {
    console.error("Update vehicle error:", error);
    res.status(500).json({ message: "Failed to update vehicle", error: error.message });
  }
};

// Delete vehicle
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM vehicles WHERE id = ?", [id]);
    res.json({ success: true, message: "Vehicle deleted" });
  } catch (error) {
    console.error("Delete vehicle error:", error);
    res.status(500).json({ message: "Failed to delete vehicle", error: error.message });
  }
};

// Delete payment
export const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete associated billing_items first (foreign key Cascade safety)
    await pool.execute("DELETE FROM billing_items WHERE payment_id = ?", [id]);

    // Delete payment record
    const [result] = await pool.execute("DELETE FROM payments WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Log admin activity
    await pool.execute("INSERT INTO activity_log (admin_id, action) VALUES (?, ?)", [
      req.user?.id || null,
      `Deleted payment/bill #${id}`
    ]);

    res.json({ success: true, message: "Payment deleted successfully" });
  } catch (error) {
    console.error("Delete payment error:", error);
    res.status(500).json({ message: "Failed to delete payment", error: error.message });
  }
};