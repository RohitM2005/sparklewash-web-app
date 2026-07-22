import pool from "../config/db.js";

// Public endpoint to get system settings (maintenance mode & pricing)
export const getPublicSettings = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT setting_key, setting_value FROM settings");
    const settingsObj = {};
    rows.forEach((r) => {
      settingsObj[r.setting_key] = r.setting_value;
    });

    const maintenance_mode = settingsObj.maintenance_mode === "true" ? "true" : "false";

    const pricing = {
      price_micro_daily: Number(settingsObj.price_micro_daily) || 999,
      price_sedan_daily: Number(settingsObj.price_sedan_daily) || 1199,
      price_mini_suv_daily: Number(settingsObj.price_mini_suv_daily) || 1199,
      price_suv_daily: Number(settingsObj.price_suv_daily) || 1399,
      price_interior_cleaning: Number(settingsObj.price_interior_cleaning) || 300,
    };

    res.json({
      success: true,
      maintenance_mode,
      pricing,
      settings: settingsObj,
    });
  } catch (error) {
    console.error("Get public settings error:", error);
    res.status(500).json({
      success: false,
      maintenance_mode: "false",
      pricing: {
        price_micro_daily: 999,
        price_sedan_daily: 1199,
        price_mini_suv_daily: 1199,
        price_suv_daily: 1399,
        price_interior_cleaning: 300,
      },
    });
  }
};
