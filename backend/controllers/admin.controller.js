// controllers/admin.controller.js
// Admin-facing stats, payments, washers, and wash records.

import pool from "../config/db.js";
import { hashPassword } from "../utils/hash.js";

// Dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [[{ totalCustomers }]] = await pool.execute(
      "SELECT COUNT(*) as totalCustomers FROM users WHERE role = 'customer'"
    );
    const [[{ activeSubscriptions }]] = await pool.execute(
      "SELECT COUNT(*) as activeSubscriptions FROM subscriptions WHERE status = 'active'"
    );
    const [[{ totalRevenue }]] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) as totalRevenue FROM payments WHERE status IN ('success','paid')"
    );
    const [[{ totalVehicles }]] = await pool.execute(
      "SELECT COUNT(*) as totalVehicles FROM vehicles"
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

    res.json({
      success: true,
      totalCustomers,
      activeSubscriptions,
      totalRevenue,
      totalVehicles,
      totalWashers,
      todayCompleted,
      todayPending,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Failed to load admin stats", error: error.message });
  }
};

// All payments
export const getAllPayments = async (req, res) => {
  try {
    const [payments] = await pool.execute(`
      SELECT p.id, p.amount, p.status, p.payment_method,
             p.razorpay_payment_id, p.paid_at, p.created_at,
             u.full_name as customer_name, u.email as customer_email,
             s.plan_name
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN subscriptions s ON p.subscription_id = s.id
      ORDER BY p.created_at DESC
    `);
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

// All wash records
export const getAllWashRecords = async (req, res) => {
  try {
    const { date, status } = req.query;
    let query = `
      SELECT wr.id, wr.wash_date, wr.status,
             wr.before_photo_url, wr.after_photo_url,
             wr.started_at, wr.washed_at, wr.wash_duration_minutes,
             wr.washer_note, wr.issue_type, wr.issue_note,
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

// All vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const [vehicles] = await pool.execute(`
      SELECT v.id, v.vehicle_number, v.vehicle_model, v.vehicle_type, v.created_at,
             u.full_name as owner_name, u.email as owner_email, u.phone as owner_phone,
             s.status as subscription_status, s.plan_name,
             w.full_name as washer_name
      FROM vehicles v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN subscriptions s ON s.vehicle_id = v.id AND s.status = 'active'
      LEFT JOIN users w ON s.washer_id = w.id
      ORDER BY v.created_at DESC
    `);
    res.json({ success: true, vehicles });
  } catch (error) {
    console.error("Get vehicles error:", error);
    res.status(500).json({ message: "Failed to load vehicles", error: error.message });
  }
};