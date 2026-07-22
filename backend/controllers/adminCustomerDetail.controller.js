// controllers/adminCustomerDetail.controller.js
// Admin customer detail: full profile, stats, subscription, vehicles, wash records
// Plus CRUD for all customer resources (edit/delete wash records, subscriptions, vehicles, profile)

import pool from "../config/db.js";

async function logActivity(adminId, action) {
  try {
    await pool.execute("INSERT INTO activity_log (admin_id, action) VALUES (?, ?)", [adminId || null, action]);
  } catch (err) {
    console.error("Log activity error:", err.message);
  }
}

/* ─── GET customer full details ─── */
export const getCustomerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Profile
    const [[profile]] = await pool.execute(
      "SELECT id, name, full_name, email, phone, address, status, created_at, manual_total_washes, manual_this_month, manual_recent_wash, manual_active_vehicles, manual_days_left, manual_active_subscriptions FROM users WHERE id = ? AND role = 'customer'",
      [id]
    );
    if (!profile) return res.status(404).json({ message: "Customer not found" });

    // Stats
    const [[{ total_washes }]] = await pool.execute(
      "SELECT COUNT(*) as total_washes FROM wash_records WHERE user_id = ? AND status = 'completed'",
      [id]
    );
    const [[{ this_month }]] = await pool.execute(
      "SELECT COUNT(*) as this_month FROM wash_records WHERE user_id = ? AND status = 'completed' AND MONTH(wash_date) = MONTH(CURDATE()) AND YEAR(wash_date) = YEAR(CURDATE())",
      [id]
    );
    const [[recentWashRow]] = await pool.execute(
      "SELECT MAX(wash_date) as recent_wash FROM wash_records WHERE user_id = ? AND status = 'completed'",
      [id]
    );
    const [[{ active_vehicles }]] = await pool.execute(
      "SELECT COUNT(*) as active_vehicles FROM vehicles WHERE user_id = ?",
      [id]
    );
    const [[daysLeftRow]] = await pool.execute(
      "SELECT DATEDIFF(renewal_date, CURDATE()) as days_left FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY renewal_date DESC LIMIT 1",
      [id]
    );
    const [[{ active_subscriptions }]] = await pool.execute(
      "SELECT COUNT(*) as active_subscriptions FROM subscriptions WHERE user_id = ? AND status = 'active'",
      [id]
    );

    // Active subscription detail
    const [subscriptions] = await pool.execute(
      `SELECT s.id, s.plan_name, s.monthly_price, s.status, s.renewal_date, s.preferred_time, s.washer_id, s.start_date,
              w.full_name as washer_name
       FROM subscriptions s
       LEFT JOIN users w ON s.washer_id = w.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
      [id]
    );

    // Vehicles
    const [vehicles] = await pool.execute(
      "SELECT id, vehicle_number, vehicle_type, vehicle_model FROM vehicles WHERE user_id = ?",
      [id]
    );

    // Recent wash records (last 10)
    const [recent_wash_records] = await pool.execute(
      `SELECT wr.id, wr.wash_date, wr.status, wr.wash_duration_minutes, wr.washer_note,
              v.vehicle_number,
              w.full_name as washer_name
       FROM wash_records wr
       LEFT JOIN vehicles v ON wr.vehicle_id = v.id
       LEFT JOIN users w ON wr.washer_id = w.id
       WHERE wr.user_id = ?
       ORDER BY wr.wash_date DESC LIMIT 10`,
      [id]
    );

    // Vehicle billing — vehicles with their active subscription price
    const [vehicle_billing] = await pool.execute(
      `SELECT v.id, v.vehicle_number, v.vehicle_model, v.vehicle_type,
              s.id as sub_id, s.plan_name, s.monthly_price, s.status as sub_status,
              DATE_FORMAT(s.renewal_date, '%Y-%m-%d') as renewal_date,
              DATE_FORMAT(s.start_date, '%Y-%m-%d') as start_date
       FROM vehicles v
       LEFT JOIN subscriptions s ON s.vehicle_id = v.id AND s.user_id = v.user_id AND s.status = 'active'
       WHERE v.user_id = ?
       ORDER BY v.created_at ASC`,
      [id]
    );

    // Add-on services (all, ordered by scheduled_date then service_date)
    const [addon_services] = await pool.execute(
      `SELECT a.id, a.vehicle_id, a.service_type, a.amount,
              DATE_FORMAT(a.service_date, '%Y-%m-%d') as service_date,
              DATE_FORMAT(a.scheduled_date, '%Y-%m-%d') as scheduled_date,
              a.status, a.notes, a.created_at,
              v.vehicle_number, v.vehicle_model,
              u.full_name as created_by_name
       FROM addon_services a
       LEFT JOIN vehicles v ON a.vehicle_id = v.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.user_id = ?
       ORDER BY COALESCE(a.scheduled_date, a.service_date, a.created_at) ASC`,
      [id]
    );

    res.json({
      success: true,
      profile,
      stats: {
        total_washes: profile.manual_total_washes !== null ? profile.manual_total_washes : total_washes,
        this_month: profile.manual_this_month !== null ? profile.manual_this_month : this_month,
        recent_wash: profile.manual_recent_wash !== null ? profile.manual_recent_wash : (recentWashRow?.recent_wash || null),
        active_vehicles: profile.manual_active_vehicles !== null ? profile.manual_active_vehicles : active_vehicles,
        days_left: profile.manual_days_left !== null ? profile.manual_days_left : (daysLeftRow?.days_left > 0 ? daysLeftRow.days_left : 0),
        active_subscriptions: profile.manual_active_subscriptions !== null ? profile.manual_active_subscriptions : active_subscriptions,
      },
      subscription: subscriptions[0] || null,
      subscriptions,
      vehicles,
      recent_wash_records,
      vehicle_billing,
      addon_services,
    });
  } catch (error) {
    console.error("Get customer details error:", error);
    res.status(500).json({ message: "Failed to load customer details", error: error.message });
  }
};

/* ─── Edit Stats ─── */
export const updateCustomerStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { total_washes, this_month, recent_wash, active_vehicles, days_left, active_subscriptions } = req.body;
    await pool.execute(
      `UPDATE users SET 
        manual_total_washes = ?, manual_this_month = ?, manual_recent_wash = ?, 
        manual_active_vehicles = ?, manual_days_left = ?, manual_active_subscriptions = ?
       WHERE id = ?`,
      [
        total_washes === "" ? null : total_washes,
        this_month === "" ? null : this_month,
        recent_wash === "" ? null : recent_wash,
        active_vehicles === "" ? null : active_vehicles,
        days_left === "" ? null : days_left,
        active_subscriptions === "" ? null : active_subscriptions,
        id
      ]
    );
    await logActivity(req.user?.id, `Edited manual stats for customer #${id}`);
    res.json({ success: true, message: "Stats updated" });
  } catch (error) {
    console.error("Update stats error:", error);
    res.status(500).json({ message: "Failed to update stats", error: error.message });
  }
};


/* ─── Edit Customer Profile ─── */
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, email, address, status } = req.body;
    const fields = [];
    const params = [];

    if (full_name) { fields.push("full_name = ?, name = ?"); params.push(full_name, full_name); }
    if (email) { fields.push("email = ?"); params.push(email); }
    if (phone !== undefined) { fields.push("phone = ?"); params.push(phone); }
    if (address !== undefined) { fields.push("address = ?"); params.push(address); }
    if (status && ["active", "suspended"].includes(status)) { fields.push("status = ?"); params.push(status); }

    if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

    params.push(id);
    await pool.execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ? AND role = 'customer'`, params);
    await logActivity(req.user?.id, `Updated customer profile #${id}`);
    res.json({ success: true, message: "Customer updated" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Email already exists" });
    console.error("Update customer error:", error);
    res.status(500).json({ message: "Failed to update customer", error: error.message });
  }
};

/* ─── Delete Customer (cascade) ─── */
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM wash_records WHERE user_id = ?", [id]);
    await pool.execute("DELETE FROM payments WHERE user_id = ?", [id]);
    await pool.execute("DELETE FROM subscriptions WHERE user_id = ?", [id]);
    await pool.execute("DELETE FROM vehicles WHERE user_id = ?", [id]);
    await pool.execute("DELETE FROM notification_preferences WHERE user_id = ?", [id]);
    await pool.execute("DELETE FROM users WHERE id = ? AND role = 'customer'", [id]);
    await logActivity(req.user?.id, `Deleted customer #${id} and all associated data`);
    res.json({ success: true, message: "Customer deleted" });
  } catch (error) {
    console.error("Delete customer error:", error);
    res.status(500).json({ message: "Failed to delete customer", error: error.message });
  }
};

/* ─── Edit Wash Record ─── */
export const updateWashRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { wash_date, status, washer_note, wash_duration_minutes } = req.body;
    const fields = [];
    const params = [];

    if (wash_date) { fields.push("wash_date = ?"); params.push(wash_date); }
    if (status) { fields.push("status = ?"); params.push(status); }
    if (washer_note !== undefined) { fields.push("washer_note = ?"); params.push(washer_note); }
    if (wash_duration_minutes !== undefined) { fields.push("wash_duration_minutes = ?"); params.push(wash_duration_minutes); }


    if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

    params.push(id);
    await pool.execute(`UPDATE wash_records SET ${fields.join(", ")} WHERE id = ?`, params);
    await logActivity(req.user?.id, `Edited wash record #${id}`);
    res.json({ success: true, message: "Wash record updated" });
  } catch (error) {
    console.error("Update wash record error:", error);
    res.status(500).json({ message: "Failed to update wash record", error: error.message });
  }
};

/* ─── Delete Wash Record ─── */
export const deleteWashRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM wash_records WHERE id = ?", [id]);
    await logActivity(req.user?.id, `Deleted wash record #${id}`);
    res.json({ success: true, message: "Wash record deleted" });
  } catch (error) {
    console.error("Delete wash record error:", error);
    res.status(500).json({ message: "Failed to delete wash record", error: error.message });
  }
};

/* ─── Edit Subscription ─── */
export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_name, monthly_price, renewal_date, status, washer_id, preferred_time } = req.body;
    const fields = [];
    const params = [];

    if (plan_name) { fields.push("plan_name = ?"); params.push(plan_name); }
    if (monthly_price !== undefined) { fields.push("monthly_price = ?"); params.push(monthly_price); }
    if (renewal_date) { fields.push("renewal_date = ?"); params.push(renewal_date); }
    if (status) { fields.push("status = ?"); params.push(status); }
    if (washer_id !== undefined) { fields.push("washer_id = ?"); params.push(washer_id); }
    if (preferred_time) { fields.push("preferred_time = ?"); params.push(preferred_time); }

    if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

    params.push(id);
    await pool.execute(`UPDATE subscriptions SET ${fields.join(", ")} WHERE id = ?`, params);
    await logActivity(req.user?.id, `Edited subscription #${id}`);
    res.json({ success: true, message: "Subscription updated" });
  } catch (error) {
    console.error("Update subscription error:", error);
    res.status(500).json({ message: "Failed to update subscription", error: error.message });
  }
};

/* ─── Delete Subscription ─── */
export const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    // Set subscription_id to NULL in related records to prevent database orphan references
    await pool.execute("UPDATE payments SET subscription_id = NULL WHERE subscription_id = ?", [id]);
    await pool.execute("UPDATE wash_records SET subscription_id = NULL WHERE subscription_id = ?", [id]);

    await pool.execute("DELETE FROM subscriptions WHERE id = ?", [id]);
    await logActivity(req.user?.id, `Deleted subscription #${id}`);
    res.json({ success: true, message: "Subscription deleted" });
  } catch (error) {
    console.error("Delete subscription error:", error);
    res.status(500).json({ message: "Failed to delete subscription", error: error.message });
  }
};
