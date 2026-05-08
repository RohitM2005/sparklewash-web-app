// routes/upload.routes.js
import express from "express";
import upload from "../config/multer.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import pool from "../config/db.js";

const router = express.Router();

// Upload wash proof photo (before/after)
// Accepts field name "photo" or "image" for flexibility
router.post("/wash-proof", protect, authorizeRoles("washer"), upload.single("image"), async (req, res) => {
  try {
    const { wash_record_id, type, customerId, date } = req.body; // type: 'before' or 'after'
    const filePath = req.file?.path || req.file?.location;

    if (!filePath) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    // Build a URL-safe path
    const url = "/" + filePath.replace(/\\\\/g, "/");

    // Update wash_records if we have a record ID
    if (wash_record_id) {
      if (type === "before") {
        await pool.execute(
          "UPDATE wash_records SET before_photo_url = ? WHERE id = ?",
          [url, wash_record_id]
        );
      } else {
        await pool.execute(
          "UPDATE wash_records SET after_photo_url = ? WHERE id = ?",
          [url, wash_record_id]
        );
      }
    }

    res.json({ success: true, url, message: "Photo uploaded" });
  } catch (error) {
    console.error("Upload wash proof error:", error);
    res.status(500).json({ success: false, message: "Upload failed", error: error.message });
  }
});

export default router;
