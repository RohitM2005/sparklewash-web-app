// controllers/adminUsers.controller.js
import pool from "../config/db.js";
import { hashPassword } from "../utils/hash.js";

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

    query += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await pool.query(query, params);
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
      "SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE user_id = ? AND status IN ('success','paid','captured')",
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

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, phone, role, status, address } = req.body;
    const fields = [];
    const params = [];

    if (full_name) { fields.push("full_name = ?, name = ?"); params.push(full_name, full_name); }
    if (email) { fields.push("email = ?"); params.push(email); }
    if (phone !== undefined) { fields.push("phone = ?"); params.push(phone); }
    if (role && ["admin","customer","washer"].includes(role)) { fields.push("role = ?"); params.push(role); }
    if (status && ["active","suspended"].includes(status)) { fields.push("status = ?"); params.push(status); }
    if (address !== undefined) { fields.push("address = ?"); params.push(address); }

    if (fields.length === 0) return res.status(400).json({ message: "No fields to update" });

    params.push(id);
    await pool.execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
    res.json({ success: true, message: "User updated" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Email already exists" });
    console.error("Update user error:", error);
    res.status(500).json({ message: "Failed to update user", error: error.message });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

// Import users from CSV
export const importUsers = async (req, res) => {
  try {
    const { users } = req.body;
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "No users to import" });
    }

    let imported = 0;
    let errors = [];
    const defaultPassword = await hashPassword("SparkleWash@123");

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      if (!u.name || !u.email) {
        errors.push(`Row ${i + 1}: name and email required`);
        continue;
      }
      const role = ["admin","customer","washer"].includes(u.role) ? u.role : "customer";
      const status = ["active","suspended"].includes(u.status) ? u.status : "active";

      try {
        await pool.execute(
          `INSERT INTO users (name, full_name, email, phone, password, role, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [u.name, u.name, u.email, u.phone || null, defaultPassword, role, status]
        );
        imported++;
      } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
          errors.push(`Row ${i + 1}: email ${u.email} already exists`);
        } else {
          errors.push(`Row ${i + 1}: ${err.message}`);
        }
      }
    }

    res.json({ success: true, imported, errors, message: `${imported} users imported` });
  } catch (error) {
    console.error("Import users error:", error);
    res.status(500).json({ message: "Failed to import users", error: error.message });
  }
};

// Get customers (role=customer) with vehicle count + subscription status
export const getCustomers = async (req, res) => {
  try {
    const search = req.query.search || "";
    let query = `
      SELECT u.id, u.name, u.full_name, u.email, u.phone, u.address, u.status, u.created_at,
             COUNT(DISTINCT v.id) as vehicle_count,
             MAX(s.status) as subscription_status
      FROM users u
      LEFT JOIN vehicles v ON v.user_id = u.id
      LEFT JOIN subscriptions s ON s.user_id = u.id
      WHERE u.role = 'customer'
    `;
    const params = [];
    if (search) {
      query += " AND (u.name LIKE ? OR u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    query += " GROUP BY u.id ORDER BY u.created_at DESC";

    const [rows] = await pool.execute(query, params);
    res.json({ success: true, customers: rows });
  } catch (error) {
    console.error("Get customers error:", error);
    res.status(500).json({ message: "Failed to load customers", error: error.message });
  }
};
