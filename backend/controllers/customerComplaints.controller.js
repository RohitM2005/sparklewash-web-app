import pool from "../config/db.js";

// Helper: Generate complaint code CMP-XXXX
const generateComplaintCode = async () => {
  const [rows] = await pool.execute("SELECT MAX(id) as max_id FROM complaints");
  const nextId = (rows[0]?.max_id || 0) + 1;
  return `CMP-${String(1000 + nextId).padStart(4, "0")}`;
};

// Create a new complaint
export const createComplaint = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, category, priority, vehicle_id } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: "Title, description, and category are required." });
    }

    const validCategories = [
      "Service Quality",
      "Washer Issue",
      "Billing",
      "Vehicle Damage",
      "Late Service",
      "Other"
    ];

    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: "Invalid complaint category." });
    }

    const validPriority = ["Low", "Medium", "High"];
    const compPriority = validPriority.includes(priority) ? priority : "Medium";
    const compVehicleId = vehicle_id ? Number(vehicle_id) : null;

    const complaintCode = await generateComplaintCode();

    const [result] = await pool.execute(
      `INSERT INTO complaints 
       (complaint_code, user_id, vehicle_id, title, description, category, priority, status, admin_read, customer_read)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Open', FALSE, TRUE)`,
      [complaintCode, userId, compVehicleId, title.trim(), description.trim(), category, compPriority]
    );

    const complaintId = result.insertId;

    // Add initial message to conversation thread
    await pool.execute(
      `INSERT INTO complaint_messages (complaint_id, sender_id, sender_role, message)
       VALUES (?, ?, 'customer', ?)`,
      [complaintId, userId, description.trim()]
    );

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      complaint: {
        id: complaintId,
        complaint_code: complaintCode,
        title,
        category,
        priority: compPriority,
        status: "Open",
      },
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({ message: "Failed to submit complaint", error: error.message });
  }
};

// Get all complaints for logged-in customer
export const getCustomerComplaints = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.execute(
      `SELECT c.id, c.complaint_code, c.title, c.description, c.category, c.priority,
              c.status, c.last_reply_at, c.admin_read, c.customer_read, c.created_at, c.updated_at,
              v.vehicle_number, v.vehicle_model,
              (
                SELECT cm.message 
                FROM complaint_messages cm 
                WHERE cm.complaint_id = c.id AND cm.sender_role = 'admin'
                ORDER BY cm.created_at DESC 
                LIMIT 1
              ) as last_admin_reply
       FROM complaints c
       LEFT JOIN vehicles v ON c.vehicle_id = v.id
       WHERE c.user_id = ?
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    res.json({ success: true, complaints: rows });
  } catch (error) {
    console.error("Get customer complaints error:", error);
    res.status(500).json({ message: "Failed to load complaints", error: error.message });
  }
};

// Get details of a single complaint + thread for customer
export const getCustomerComplaintDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const [complaintRows] = await pool.execute(
      `SELECT c.id, c.complaint_code, c.title, c.description, c.category, c.priority,
              c.status, c.last_reply_at, c.created_at, c.updated_at,
              v.vehicle_number, v.vehicle_model, v.vehicle_type
       FROM complaints c
       LEFT JOIN vehicles v ON c.vehicle_id = v.id
       WHERE c.id = ? AND c.user_id = ?`,
      [id, userId]
    );

    if (complaintRows.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Mark as read by customer
    await pool.execute(
      "UPDATE complaints SET customer_read = TRUE WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    // Fetch conversation thread messages
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
      complaint: complaintRows[0],
      messages,
    });
  } catch (error) {
    console.error("Get customer complaint detail error:", error);
    res.status(500).json({ message: "Failed to load complaint details", error: error.message });
  }
};

// Customer reply to complaint
export const replyCustomerComplaint = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required." });
    }

    const [complaints] = await pool.execute(
      "SELECT id, status FROM complaints WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (complaints.length === 0) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // If complaint was resolved or closed, customer reply reopens it to In Progress / Open
    const currentStatus = complaints[0].status;
    let newStatus = currentStatus;
    if (currentStatus === "Closed" || currentStatus === "Resolved") {
      newStatus = "In Progress";
    }

    await pool.execute(
      `INSERT INTO complaint_messages (complaint_id, sender_id, sender_role, message)
       VALUES (?, ?, 'customer', ?)`,
      [id, userId, message.trim()]
    );

    await pool.execute(
      `UPDATE complaints 
       SET last_reply_at = NOW(), admin_read = FALSE, customer_read = TRUE, status = ?
       WHERE id = ?`,
      [newStatus, id]
    );

    res.json({ success: true, message: "Reply sent successfully." });
  } catch (error) {
    console.error("Customer reply error:", error);
    res.status(500).json({ message: "Failed to send reply", error: error.message });
  }
};
