// controllers/adminUsers.controller.js
import pool from "../config/db.js";

export const getUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let query = "SELECT id, name, full_name, email, phone, role, status, created_at FROM users";
    let countQuery = "SELECT COUNT(*) as total FROM users";
    const params = [];
    const countParams = [];

    if (search) {
      const where = " WHERE (name LIKE ? OR full_name LIKE ? OR email LIKE ? OR phone LIKE ?)";
      query += where;
      countQuery += where;
      const s = `%${search}%`;
      params.push(s, s, s, s);
      countParams.push(s, s, s, s);
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.execute(query, params);
    const [[{ total }]] = await pool.execute(countQuery, countParams);

    res.json({ users: rows, total, page, limit });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Failed to load users", error: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    await pool.execute("UPDATE users SET status = ? WHERE id = ?", [status, id]);

    res.json({ success: true, message: `User status updated to ${status}` });
  } catch (error) {
    console.error("Toggle user status error:", error);
    res.status(500).json({ message: "Failed to update user status", error: error.message });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [[user]] = await pool.execute(
      "SELECT id, name, full_name, email, phone, role, status, address, created_at FROM users WHERE id = ?",
      [id]
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    // Get wash count
    const [[washStats]] = await pool.execute(
      "SELECT COUNT(*) as wash_count FROM wash_records WHERE user_id = ?",
      [id]
    );

    // Get total paid
    const [[payStats]] = await pool.execute(
      "SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE user_id = ? AND status IN ('success','paid')",
      [id]
    );

    // Get assigned washer name
    const [washerRows] = await pool.execute(
      `SELECT u.name as washer_name FROM subscriptions s
       JOIN users u ON s.washer_id = u.id
       WHERE s.user_id = ? AND s.status = 'active' LIMIT 1`,
      [id]
    );

    res.json({
      ...user,
      wash_count: washStats.wash_count,
      total_paid: payStats.total_paid,
      washer_name: washerRows[0]?.washer_name || null
    });
  } catch (error) {
    console.error("Get user details error:", error);
    res.status(500).json({ message: "Failed to load user details", error: error.message });
  }
};

export const exportUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, full_name, email, phone, role, status, created_at FROM users ORDER BY created_at DESC"
    );

    const headers = "ID,Name,Email,Phone,Role,Status,Created At\n";
    const csv = rows.map(r =>
      `${r.id},"${r.full_name || r.name}","${r.email}","${r.phone || ''}","${r.role}","${r.status || 'active'}","${r.created_at}"`
    ).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=users.csv");
    res.send(headers + csv);
  } catch (error) {
    console.error("Export users error:", error);
    res.status(500).json({ message: "Failed to export users", error: error.message });
  }
};
