// controllers/washer.controller.js
//
// Washer-specific dashboard data and actions.

import { getUserById } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import pool from "../config/db.js";

export const getWasherDashboard = async (req, res) => {
  try {
    const washerId = req.user.id;
    const today = new Date().toISOString().slice(0, 10);

    // Auto-create today's wash records for all active subscriptions assigned to this washer
    await pool.execute(`
      INSERT IGNORE INTO wash_records
        (subscription_id, vehicle_id, washer_id, user_id, wash_date, status)
      SELECT s.id, s.vehicle_id, s.washer_id, s.user_id, ?, 'pending'
      FROM subscriptions s
      WHERE s.washer_id = ? AND s.status = 'active'
        AND NOT EXISTS (
          SELECT 1 FROM wash_records wr
          WHERE wr.subscription_id = s.id AND wr.wash_date = ?
        )
    `, [today, washerId, today]);

    // Get today's vehicles with wash status
    const [vehicles] = await pool.execute(`
      SELECT wr.id as record_id, wr.status as wash_status,
             wr.started_at, wr.washed_at,
             v.vehicle_number, v.vehicle_type, v.vehicle_model,
             u.full_name as customer_name, u.phone as customer_phone, u.address
      FROM wash_records wr
      JOIN vehicles v ON wr.vehicle_id = v.id
      JOIN users u ON wr.user_id = u.id
      WHERE wr.washer_id = ? AND wr.wash_date = ?
      ORDER BY wr.status ASC, wr.created_at ASC
    `, [washerId, today]);

    // Stats
    const [[{ todayCompleted }]] = await pool.execute(
      "SELECT COUNT(*) as todayCompleted FROM wash_records WHERE washer_id = ? AND wash_date = ? AND status = 'completed'",
      [washerId, today]
    );
    const [[{ todayPending }]] = await pool.execute(
      "SELECT COUNT(*) as todayPending FROM wash_records WHERE washer_id = ? AND wash_date = ? AND status = 'pending'",
      [washerId, today]
    );
    const [[{ totalCompleted }]] = await pool.execute(
      "SELECT COUNT(*) as totalCompleted FROM wash_records WHERE washer_id = ? AND status = 'completed'",
      [washerId]
    );

    res.json({
      vehicles,
      stats: { todayCompleted, todayPending, totalCompleted },
    });
  } catch (error) {
    console.error("Washer dashboard error:", error);
    res.status(500).json({ message: "Failed to load washer dashboard", error: error.message });
  }
};

export const getTodayVehicles = async (req, res) => {
  try {
    const washerId = req.user.id;
    const today = new Date().toISOString().slice(0, 10);

    const [vehicles] = await pool.execute(`
      SELECT wr.id as record_id, wr.status as wash_status,
             wr.started_at, wr.washed_at,
             v.vehicle_number, v.vehicle_type, v.vehicle_model,
             u.full_name as customer_name, u.phone as customer_phone, u.address
      FROM wash_records wr
      JOIN vehicles v ON wr.vehicle_id = v.id
      JOIN users u ON wr.user_id = u.id
      WHERE wr.washer_id = ? AND wr.wash_date = ?
      ORDER BY wr.status ASC
    `, [washerId, today]);

    console.log("=== GET TODAY VEHICLES ===", vehicles);
    res.json({ vehicles });
  } catch (error) {
    console.error("Get today vehicles error:", error);
    res.status(500).json({ message: "Failed to load vehicles", error: error.message });
  }
};

export const startWash = async (req, res) => {
  try {
    const { recordId } = req.params;
    const washerId = req.user.id;
    console.log("=== START WASH ===", { recordId, washerId });

    const [result] = await pool.execute(
      "UPDATE wash_records SET status = 'washing', started_at = NOW() WHERE id = ? AND washer_id = ?",
      [recordId, washerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Wash record not found" });
    }

    res.json({ success: true, message: "Wash started" });
  } catch (error) {
    console.error("Start wash error:", error);
    res.status(500).json({ success: false, message: "Failed to start wash", error: error.message });
  }
};

export const completeWash = async (req, res) => {
  try {
    const { recordId } = req.params;
    const washerId = req.user.id;
    const { washer_note } = req.body;

    // Calculate duration
    const [records] = await pool.execute(
      "SELECT started_at FROM wash_records WHERE id = ? AND washer_id = ?",
      [recordId, washerId]
    );

    if (!records.length) {
      return res.status(404).json({ success: false, message: "Wash record not found" });
    }

    const duration = records[0].started_at
      ? Math.round((Date.now() - new Date(records[0].started_at).getTime()) / 60000)
      : null;

    const [result] = await pool.execute(
      `UPDATE wash_records SET status = 'completed', washed_at = NOW(),
        washer_note = ?, wash_duration_minutes = ?
       WHERE id = ? AND washer_id = ?`,
      [washer_note || null, duration, recordId, washerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Wash record not found" });
    }

    res.json({ success: true, message: "Wash completed" });
  } catch (error) {
    console.error("Complete wash error:", error);
    res.status(500).json({ success: false, message: "Failed to complete wash", error: error.message });
  }
};

export const skipWash = async (req, res) => {
  try {
    const { recordId } = req.params;
    const washerId = req.user.id;
    const { reason } = req.body;

    const [result] = await pool.execute(
      "UPDATE wash_records SET status = 'skipped', issue_note = ? WHERE id = ? AND washer_id = ?",
      [reason || null, recordId, washerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Wash record not found" });
    }

    res.json({ success: true, message: "Wash skipped" });
  } catch (error) {
    console.error("Skip wash error:", error);
    res.status(500).json({ success: false, message: "Failed to skip wash", error: error.message });
  }
};

export const reportIssue = async (req, res) => {
  try {
    const { recordId } = req.params;
    const { issue_type, issue_note } = req.body;
    const washerId = req.user.id;

    const [result] = await pool.execute(
      "UPDATE wash_records SET status = 'issue_reported', issue_type = ?, issue_note = ? WHERE id = ? AND washer_id = ?",
      [issue_type || null, issue_note || null, recordId, washerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Wash record not found" });
    }

    res.json({ success: true, message: "Issue reported" });
  } catch (error) {
    console.error("Report issue error:", error);
    res.status(500).json({ success: false, message: "Failed to report issue", error: error.message });
  }
};

export const getCompletedWashes = async (req, res) => {
  try {
    const washerId = req.user.id;

    const [rows] = await pool.execute(`
      SELECT wr.*, v.vehicle_number, v.vehicle_type,
             u.full_name as customer_name
      FROM wash_records wr
      LEFT JOIN vehicles v ON wr.vehicle_id = v.id
      LEFT JOIN users u ON wr.user_id = u.id
      WHERE wr.washer_id = ? AND wr.status = 'completed'
      ORDER BY wr.washed_at DESC LIMIT 50
    `, [washerId]);

    res.json({ washes: rows });
  } catch (error) {
    console.error("Get completed washes error:", error);
    res.status(500).json({ message: "Failed to load completed washes", error: error.message });
  }
};

export const getWasherProfile = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const [[stats]] = await pool.execute(
      "SELECT COUNT(*) as total_washes FROM wash_records WHERE washer_id = ? AND status = 'completed'",
      [req.user.id]
    );

    res.json({
      user: {
        id: user.id,
        name: user.full_name || user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        area: user.address,
      },
      stats: {
        totalWashes: stats.total_washes,
      },
    });
  } catch (error) {
    console.error("Get washer profile error:", error);
    res.status(500).json({ success: false, message: "Failed to load profile", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current and new passwords are required" });
    }

    const user = await getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const match = await comparePassword(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const hashed = await hashPassword(newPassword);
    await pool.execute("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({ success: false, message: "Password change failed", error: err.message });
  }
};
