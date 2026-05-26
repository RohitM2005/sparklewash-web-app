// controllers/customerSettings.controller.js
// Customer-facing settings: profile, notifications, password, account deletion.

import pool from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/hash.js";

/* ─── Profile ─── */

export const getProfile = async (req, res) => {
  try {
    console.log("GET /customer/profile — user ID:", req.user.id);

    const [[user]] = await pool.execute(
      "SELECT id, name, full_name, email, phone, address FROM users WHERE id = ?",
      [req.user.id]
    );

    console.log("Profile fetched:", user);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, profile: user });
  } catch (error) {
    console.error("Get profile FULL ERROR:", error);
    res.status(500).json({ message: "Failed to load profile", error: error.message, sqlMessage: error.sqlMessage || null });
  }
};

export const updateProfile = async (req, res) => {
  try {
    console.log("PATCH /customer/profile — Request body received:", req.body);
    console.log("User ID from token:", req.user.id);

    const { full_name, phone, email, address } = req.body;
    const userId = req.user.id;

    // Validation
    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }
    if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/^(\+91|91)/, "").replace(/[\s\-]/g, ""))) {
      return res.status(400).json({ success: false, message: "Valid Indian phone number is required" });
    }

    // Use exact column names from users table
    const query = `
      UPDATE users
      SET
        full_name = ?,
        name = ?,
        phone = ?,
        email = ?,
        address = ?,
        updated_at = NOW()
      WHERE id = ?
    `;
    const values = [full_name.trim(), full_name.trim(), phone || null, email, address || null, userId];

    console.log("Running query with values:", values);

    const [result] = await pool.execute(query, values);

    console.log("Query result:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `No user found with id: ${userId}` });
    }

    // Verify it saved — fetch updated record
    const [[updated]] = await pool.execute(
      "SELECT id, name, full_name, email, phone, address, updated_at FROM users WHERE id = ?",
      [userId]
    );

    console.log("✅ Updated user record:", updated);

    res.json({ success: true, message: "Profile updated successfully", data: updated });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    console.error("Profile update FULL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
      sqlMessage: error.sqlMessage || null,
      sqlState: error.sqlState || null,
    });
  }
};

/* ─── Notification Preferences ─── */

export const getNotificationPreferences = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT setting_key, setting_value FROM notification_preferences WHERE user_id = ?",
      [req.user.id]
    );
    const prefs = {
      wash_reminders: true,
      subscription_alerts: true,
      promotions: true,
    };
    rows.forEach((r) => {
      prefs[r.setting_key] = r.setting_value === "true";
    });
    res.json({ success: true, preferences: prefs });
  } catch (error) {
    console.error("Get notification prefs error:", error);
    res.status(500).json({ message: "Failed to load notification preferences", error: error.message });
  }
};

export const updateNotificationPreferences = async (req, res) => {
  try {
    const allowed = ["wash_reminders", "subscription_alerts", "promotions"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        const val = req.body[key] ? "true" : "false";
        await pool.execute(
          `INSERT INTO notification_preferences (user_id, setting_key, setting_value)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [req.user.id, key, val]
        );
      }
    }
    res.json({ success: true, message: "Preferences saved" });
  } catch (error) {
    console.error("Update notification prefs error:", error);
    res.status(500).json({ message: "Failed to save preferences", error: error.message });
  }
};

/* ─── Change Password ─── */

export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: "Current and new passwords are required" });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters" });
    }

    const [rows] = await pool.execute("SELECT password FROM users WHERE id = ?", [req.user.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "User not found" });

    const match = await comparePassword(current_password, rows[0].password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    const hashed = await hashPassword(new_password);
    await pool.execute("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);

    res.json({ success: true, message: "Password updated" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Password change failed", error: error.message });
  }
};

/* ─── Delete Account (cascade) ─── */

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Cascade delete in correct FK order
    await pool.execute("DELETE FROM wash_records WHERE user_id = ?", [userId]);
    await pool.execute("DELETE FROM payments WHERE user_id = ?", [userId]);
    await pool.execute("DELETE FROM subscriptions WHERE user_id = ?", [userId]);
    await pool.execute("DELETE FROM vehicles WHERE user_id = ?", [userId]);
    await pool.execute("DELETE FROM notification_preferences WHERE user_id = ?", [userId]);
    await pool.execute("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ success: true, message: "Account deleted" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Failed to delete account", error: error.message });
  }
};
