// controllers/customerSettings.controller.js
// Customer-facing settings: profile, notifications, password, account deletion.

import pool from "../config/db.js";

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
    const nameToSave = (full_name || "").trim();
    if (!nameToSave) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const emailToSave = (email || "").trim();
    if (!emailToSave || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToSave)) {
      return res.status(400).json({ success: false, message: "Valid email is required" });
    }

    const rawPhone = (phone || "").trim();
    const cleanPhone = rawPhone.replace(/^(\+91|91)/, "").replace(/[\s\-]/g, "");
    if (rawPhone && !/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({ success: false, message: "Valid 10-digit Indian phone number is required" });
    }

    const fields = ["full_name = ?", "name = ?", "email = ?"];
    const values = [nameToSave, nameToSave, emailToSave];

    if (phone !== undefined) {
      fields.push("phone = ?");
      values.push(cleanPhone || rawPhone || null);
    }

    if (address !== undefined) {
      fields.push("address = ?");
      values.push(address ? address.trim() : null);
    }

    values.push(userId);
    const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

    console.log("Running query with values:", values);

    const [result] = await pool.execute(query, values);

    console.log("Query result:", result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `No user found with id: ${userId}` });
    }

    // Verify it saved — fetch updated record
    const [[updated]] = await pool.execute(
      "SELECT id, name, full_name, email, phone, address FROM users WHERE id = ?",
      [userId]
    );

    console.log("✅ Updated user record:", updated);

    res.json({ success: true, message: "Profile updated successfully", data: updated, profile: updated });
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
