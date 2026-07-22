// controllers/adminSubscription.controller.js
import pool from "../config/db.js";

export const getAllSubscriptions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateWhere = "";
    const params = [];
    if (startDate && endDate) {
      dateWhere = " AND DATE(s.created_at) BETWEEN ? AND ?";
      params.push(startDate, endDate);
    } else if (startDate) {
      dateWhere = " AND DATE(s.created_at) >= ?";
      params.push(startDate);
    } else if (endDate) {
      dateWhere = " AND DATE(s.created_at) <= ?";
      params.push(endDate);
    }

    const [rows] = await pool.execute(
      `SELECT s.*, 
              v.vehicle_number, v.vehicle_type, v.vehicle_model,
              u.name as customer_name, u.full_name as customer_full_name, u.email as customer_email, u.phone as customer_phone,
              w.name as washer_name, w.full_name as washer_full_name
       FROM subscriptions s
       LEFT JOIN vehicles v ON s.vehicle_id = v.id
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN users w ON s.washer_id = w.id
       WHERE 1=1${dateWhere}
       ORDER BY s.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (error) {
    console.error("Get subscriptions error:", error);
    res.status(500).json({ message: "Failed to load subscriptions", error: error.message });
  }
};

export const assignWasher = async (req, res) => {
  try {
    const { id } = req.params; // can be subscription_id, vehicle_id, or "none"
    const { washer_id, vehicle_id: bodyVehicleId } = req.body;

    if (!washer_id) {
      return res.status(400).json({ message: "washer_id is required" });
    }

    const today = new Date().toISOString().slice(0, 10);
    let vehicleId = bodyVehicleId;
    let userId = null;

    const isValidSubId = id && id !== "null" && id !== "undefined" && id !== "none";

    // Try to find via subscription first
    if (isValidSubId) {
      const [[sub]] = await pool.execute(
        "SELECT vehicle_id, user_id FROM subscriptions WHERE id = ?",
        [id]
      );
      if (sub) {
        vehicleId = sub.vehicle_id;
        userId = sub.user_id;
        // Update subscription's washer
        await pool.execute("UPDATE subscriptions SET washer_id = ? WHERE id = ?", [washer_id, id]);
      }
    }

    // If no vehicle found via subscription, use the vehicle_id from body
    if (!vehicleId) {
      return res.status(400).json({ message: "vehicle_id is required" });
    }

    // Get user_id from vehicle if not found via subscription
    if (!userId) {
      const [[vehicle]] = await pool.execute("SELECT user_id FROM vehicles WHERE id = ?", [vehicleId]);
      userId = vehicle?.user_id;
    }

    if (!userId) {
      return res.status(404).json({ message: "Vehicle owner not found" });
    }

    // Create today's wash_record
    await pool.execute(
      `INSERT INTO wash_records (vehicle_id, washer_id, user_id, wash_date, status, subscription_id)
       VALUES (?, ?, ?, ?, 'pending', ?)
       ON DUPLICATE KEY UPDATE washer_id = VALUES(washer_id), status = 'pending'`,
      [vehicleId, washer_id, userId, today, isValidSubId ? id : null]
    );

    // Get washer name for response
    const [[washer]] = await pool.execute(
      "SELECT full_name, name FROM users WHERE id = ?",
      [washer_id]
    );

    console.log(`✅ Assigned washer ${washer?.full_name || washer?.name} to vehicle ${vehicleId} for ${today}`);

    res.json({
      success: true,
      message: "Washer assigned successfully",
      washer_name: washer?.full_name || washer?.name || "Washer",
    });
  } catch (error) {
    console.error("Assign washer error:", error);
    res.status(500).json({ message: "Failed to assign washer", error: error.message });
  }
};

export const getActiveWashers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, full_name, email, phone FROM users WHERE role = 'washer' AND status = 'active' ORDER BY name"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Failed to load washers", error: error.message });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(
      "UPDATE subscriptions SET status = 'cancelled' WHERE id = ?",
      [id]
    );
    res.json({ success: true, message: "Subscription cancelled" });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ message: "Failed to cancel subscription", error: error.message });
  }
};

// Get vehicles to assign — all active subscriptions with today's assignment status
export const getVehiclesToAssign = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // Debug: check raw counts
    const [allVehicles] = await pool.execute("SELECT * FROM vehicles");
    const [allSubs] = await pool.execute("SELECT * FROM subscriptions");
    const [allWashers] = await pool.execute("SELECT id, name, full_name FROM users WHERE role = 'washer'");

    console.log("=== ASSIGN DEBUG ===");
    console.log("Vehicles in DB:", allVehicles.length);
    console.log("Subscriptions in DB:", allSubs.length);
    console.log("Subscription statuses:", allSubs.map(s => s.status));
    console.log("Washers in DB:", allWashers.length);
    if (allVehicles.length > 0) console.log("Sample vehicle:", JSON.stringify(allVehicles[0]));

    // Main query: start from vehicles, LEFT JOIN everything
    const [rows] = await pool.execute(`
      SELECT 
        v.id as vehicle_id, v.vehicle_number, v.vehicle_type, v.vehicle_model,
        v.user_id,
        COALESCE(u.full_name, u.name) as owner_name,
        u.phone as owner_phone, u.address as owner_address,
        s.id as subscription_id,
        COALESCE(s.frequency, s.preferred_time, 'daily') as frequency,
        s.plan_name,
        s.status as subscription_status,
        s.washer_id,
        COALESCE(w.full_name, w.name) as washer_name,
        wr.id as wash_record_id, wr.status as wash_status
      FROM vehicles v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN subscriptions s ON s.vehicle_id = v.id AND s.status != 'cancelled'
      LEFT JOIN users w ON s.washer_id = w.id
      LEFT JOIN wash_records wr ON wr.vehicle_id = v.id AND wr.wash_date = ?
      ORDER BY v.vehicle_number ASC
    `, [today]);

    console.log("Final result count:", rows.length);

    res.json({
      success: true,
      vehicles: rows,
      debug: {
        vehicles_in_db: allVehicles.length,
        subscriptions_in_db: allSubs.length,
        washers_in_db: allWashers.length,
      },
    });
  } catch (error) {
    console.error("Get vehicles to assign error:", error);
    console.error("SQL Error:", error.sqlMessage || error.message);
    res.status(500).json({ message: "Failed to load vehicles", error: error.message, sqlMessage: error.sqlMessage });
  }
};

// Admin verifies a completed wash record
export const verifyWashRecord = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.execute(
      `UPDATE wash_records SET verified = 1, verified_at = NOW() WHERE id = ?`,
      [id]
    );

    // Log admin action
    try {
      await pool.execute(
        `INSERT INTO activity_log (admin_id, action) VALUES (?, ?)`,
        [req.user?.id || null, `Verified wash record #${id}`]
      );
    } catch (logErr) {
      console.error("Log activity error:", logErr.message);
    }

    res.json({ success: true, message: "Wash record verified" });
  } catch (error) {
    console.error("Verify wash record error:", error);
    res.status(500).json({ message: "Failed to verify wash record", error: error.message });
  }
};