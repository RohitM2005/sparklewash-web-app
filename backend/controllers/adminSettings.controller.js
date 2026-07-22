// controllers/adminSettings.controller.js
import pool from "../config/db.js";

async function getSettingsByPrefix(prefix) {
  const [rows] = await pool.execute(
    "SELECT setting_key, setting_value FROM settings WHERE setting_key LIKE ?",
    [`${prefix}%`]
  );
  const obj = {};
  rows.forEach((r) => (obj[r.setting_key] = r.setting_value));
  return obj;
}

async function upsertSettings(data) {
  for (const [key, value] of Object.entries(data)) {
    await pool.execute(
      `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, String(value)]
    );
  }
}

async function logActivity(adminId, action) {
  try {
    await pool.execute("INSERT INTO activity_log (admin_id, action) VALUES (?, ?)", [adminId || null, action]);
  } catch (err) {
    console.error("Log activity error:", err.message);
  }
}

export const getPreferences = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT setting_key, setting_value FROM settings");
    const obj = {};
    rows.forEach((r) => (obj[r.setting_key] = r.setting_value));
    res.json({ success: true, settings: obj });
  } catch (error) {
    res.status(500).json({ message: "Failed to load preferences", error: error.message });
  }
};

export const savePreferences = async (req, res) => {
  try {
    const allowed = ["maintenance_mode","morning_slot_enabled","evening_slot_enabled","service_areas"];
    const data = {};
    for (const key of allowed) { if (req.body[key] !== undefined) data[key] = req.body[key]; }
    await upsertSettings(data);
    await logActivity(req.user?.id, "Updated system preferences");
    res.json({ success: true, message: "Settings saved" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save preferences", error: error.message });
  }
};

export const getPricing = async (req, res) => {
  try {
    const pricing = await getSettingsByPrefix("price_");
    res.json({ success: true, settings: pricing });
  } catch (error) {
    res.status(500).json({ message: "Failed to load pricing", error: error.message });
  }
};

export const savePricing = async (req, res) => {
  try {
    const allowed = ["price_micro_daily","price_sedan_daily","price_mini_suv_daily","price_suv_daily","price_interior_cleaning"];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        const val = Number(req.body[key]);
        if (isNaN(val) || val < 0) return res.status(400).json({ message: `Invalid value for ${key}` });
        data[key] = String(val);
      }
    }
    await upsertSettings(data);
    await logActivity(req.user?.id, "Updated pricing settings");
    res.json({ success: true, message: "Pricing updated successfully and applied system-wide." });
  } catch (error) {
    res.status(500).json({ message: "Failed to save pricing", error: error.message });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const templates = await getSettingsByPrefix("notif_");
    res.json({ success: true, settings: templates });
  } catch (error) {
    res.status(500).json({ message: "Failed to load templates", error: error.message });
  }
};

export const saveTemplates = async (req, res) => {
  try {
    const allowed = ["notif_welcome","notif_wash_complete","notif_payment_receipt"];
    const data = {};
    for (const key of allowed) { if (req.body[key] !== undefined) data[key] = req.body[key]; }
    await upsertSettings(data);
    await logActivity(req.user?.id, "Updated notification templates");
    res.json({ success: true, message: "Templates saved" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save templates", error: error.message });
  }
};

export const getActivityLog = async (req, res) => {
  try {
    const { date } = req.query;
    let query = `SELECT al.id, al.action, al.created_at, u.full_name as admin_name
      FROM activity_log al LEFT JOIN users u ON al.admin_id = u.id`;
    const params = [];
    if (date) { query += " WHERE DATE(al.created_at) = ?"; params.push(date); }
    query += " ORDER BY al.created_at DESC LIMIT 50";
    const [rows] = await pool.execute(query, params);
    res.json({ success: true, logs: rows });
  } catch (error) {
    res.status(500).json({ message: "Failed to load activity log", error: error.message });
  }
};

export const getAllSettings = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT setting_key, setting_value FROM settings");
    const obj = {};
    rows.forEach((r) => (obj[r.setting_key] = r.setting_value));
    res.json(obj);
  } catch (error) {
    res.status(500).json({ message: "Failed to load settings", error: error.message });
  }
};

export const saveAllSettings = async (req, res) => {
  try {
    await upsertSettings(req.body);
    res.json({ success: true, message: "Settings saved" });
  } catch (error) {
    res.status(500).json({ message: "Failed to save settings", error: error.message });
  }
};
