import pool from "../config/db.js";

// Get all complaints with filters for Admin
export const getAdminComplaints = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;

    let sql = `
      SELECT c.id, c.complaint_code, c.title, c.description, c.category, c.priority,
             c.status, c.last_reply_at, c.admin_read, c.created_at, c.updated_at,
             u.id as customer_id, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
             v.id as vehicle_id, v.vehicle_number, v.vehicle_model, v.vehicle_type
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN vehicles v ON c.vehicle_id = v.id
      WHERE 1=1
    `;

    const params = [];

    if (status && status !== "all") {
      sql += " AND c.status = ?";
      params.push(status);
    }

    if (category && category !== "all") {
      sql += " AND c.category = ?";
      params.push(category);
    }

    if (priority && priority !== "all") {
      sql += " AND c.priority = ?";
      params.push(priority);
    }

    if (search && search.trim()) {
      sql += " AND (c.complaint_code LIKE ? OR c.title LIKE ? OR u.full_name LIKE ? OR v.vehicle_number LIKE ?)";
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    sql += " ORDER BY c.updated_at DESC";

    const [complaints] = await pool.execute(sql, params);
    res.json({ success: true, complaints });
  } catch (error) {
    console.error("Get admin complaints error:", error);
    res.status(500).json({ message: "Failed to load complaints", error: error.message });
  }
};

// Get stats summary for complaints
export const getAdminComplaintStats = async (req, res) => {
  try {
    const [[{ total }]] = await pool.execute("SELECT COUNT(*) as total FROM complaints");
    const [[{ open }]] = await pool.execute("SELECT COUNT(*) as open FROM complaints WHERE status = 'Open'");
    const [[{ inProgress }]] = await pool.execute("SELECT COUNT(*) as inProgress FROM complaints WHERE status = 'In Progress'");
    const [[{ resolved }]] = await pool.execute("SELECT COUNT(*) as resolved FROM complaints WHERE status = 'Resolved'");
    const [[{ closed }]] = await pool.execute("SELECT COUNT(*) as closed FROM complaints WHERE status = 'Closed'");

    res.json({
      success: true,
      stats: {
        total: total || 0,
        open: open || 0,
        inProgress: inProgress || 0,
        resolved: resolved || 0,
        closed: closed || 0,
      },
    });
  } catch (error) {
    console.error("Get complaint stats error:", error);
    res.status(500).json({ message: "Failed to load complaint stats", error: error.message });
  }
};

// Get unread complaints count for Admin Sidebar badge
export const getUnreadComplaintsCount = async (req, res) => {
  try {
    const [[{ count }]] = await pool.execute(
      "SELECT COUNT(*) as count FROM complaints WHERE admin_read = FALSE OR status = 'Open'"
    );
    res.json({ success: true, count: count || 0 });
  } catch (error) {
    console.error("Get unread complaints count error:", error);
    res.status(500).json({ message: "Failed to get unread count", error: error.message });
  }
};

// Get single complaint details for Admin
export const getAdminComplaintDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `SELECT c.id, c.complaint_code, c.title, c.description, c.category, c.priority,
              c.status, c.last_reply_at, c.admin_read, c.customer_read, c.created_at, c.updated_at,
              u.id as customer_id, u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone, u.address as customer_address,
              v.id as vehicle_id, v.vehicle_number, v.vehicle_model, v.vehicle_type
       FROM complaints c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN vehicles v ON c.vehicle_id = v.id
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Mark as read by admin
    await pool.execute("UPDATE complaints SET admin_read = TRUE WHERE id = ?", [id]);

    // Fetch message history
    const [messages] = await pool.execute(
      `SELECT cm.id, cm.sender_id, cm.sender_role, cm.message, cm.created_at,
              u.full_name as sender_name
       FROM complaint_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.complaint_id = ?
       ORDER BY cm.created_at ASC`,
      [id]
    );

    res.json({
      success: true,
      complaint: rows[0],
      messages,
    });
  } catch (error) {
    console.error("Get admin complaint detail error:", error);
    res.status(500).json({ message: "Failed to load complaint details", error: error.message });
  }
};

// Admin reply to complaint
export const replyAdminComplaint = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { id } = req.params;
    const { message, status } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    const [complaints] = await pool.execute("SELECT id, status FROM complaints WHERE id = ?", [id]);

    if (complaints.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];
    let updatedStatus = complaints[0].status;

    if (status && validStatuses.includes(status)) {
      updatedStatus = status;
    } else if (updatedStatus === "Open") {
      updatedStatus = "In Progress";
    }

    // Insert admin reply into conversation thread
    await pool.execute(
      `INSERT INTO complaint_messages (complaint_id, sender_id, sender_role, message)
       VALUES (?, ?, 'admin', ?)`,
      [id, adminId, message.trim()]
    );

    // Update complaint record
    await pool.execute(
      `UPDATE complaints 
       SET last_reply_at = NOW(), admin_read = TRUE, customer_read = FALSE, status = ?
       WHERE id = ?`,
      [updatedStatus, id]
    );

    res.json({ success: true, message: "Reply sent successfully.", status: updatedStatus });
  } catch (error) {
    console.error("Admin reply error:", error);
    res.status(500).json({ message: "Failed to send admin reply", error: error.message });
  }
};

// Update complaint status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["Open", "In Progress", "Resolved", "Closed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const [result] = await pool.execute(
      "UPDATE complaints SET status = ?, customer_read = FALSE WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({ success: true, message: `Status updated to ${status}` });
  } catch (error) {
    console.error("Update complaint status error:", error);
    res.status(500).json({ message: "Failed to update complaint status", error: error.message });
  }
};
