// backend/utils/syncCustomerData.js
import pool from "../config/db.js";

/**
 * Auto-syncs and backfills customer phone and address data across the database.
 * If phone or address exists in matching records or connected bookings/subscriptions,
 * update the main customer record in the `users` table so details are never missing or lost.
 */
export async function backfillCustomerData() {
  try {
    // 1. Backfill missing address on users from another row with the same phone number
    await pool.execute(`
      UPDATE users u1
      JOIN users u2 ON u1.phone = u2.phone AND u1.id != u2.id
      SET u1.address = u2.address
      WHERE (u1.address IS NULL OR TRIM(u1.address) = '' OR u1.address = '—')
        AND u2.address IS NOT NULL AND TRIM(u2.address) != '' AND u2.address != '—'
    `);

    // 2. Backfill missing phone on users from another row with matching email
    await pool.execute(`
      UPDATE users u1
      JOIN users u2 ON LOWER(TRIM(u1.email)) = LOWER(TRIM(u2.email)) AND u1.id != u2.id
      SET u1.phone = u2.phone
      WHERE (u1.phone IS NULL OR TRIM(u1.phone) = '' OR u1.phone = '—')
        AND u2.phone IS NOT NULL AND TRIM(u2.phone) != '' AND u2.phone != '—'
    `);

    // 3. Backfill address from matching name/email patterns if any user has empty address
    await pool.execute(`
      UPDATE users u1
      JOIN users u2 ON LOWER(TRIM(u1.full_name)) = LOWER(TRIM(u2.full_name)) AND u1.id != u2.id
      SET u1.address = u2.address
      WHERE (u1.address IS NULL OR TRIM(u1.address) = '' OR u1.address = '—')
        AND u2.address IS NOT NULL AND TRIM(u2.address) != '' AND u2.address != '—'
    `);
  } catch (err) {
    console.error("Backfill customer data error:", err.message);
  }
}

/**
 * Helper to update main user record whenever customer submits/edits profile, booking, vehicle, or subscription
 */
export async function syncUserData(userId, { name, full_name, email, phone, address }) {
  if (!userId) return;

  try {
    const fields = [];
    const params = [];

    const displayName = (full_name || name || "").trim();
    if (displayName) {
      fields.push("full_name = ?", "name = ?");
      params.push(displayName, displayName);
    }

    if (email && email.trim()) {
      fields.push("email = ?");
      params.push(email.trim());
    }

    if (phone && phone.trim()) {
      const cleanPhone = phone.trim().replace(/^(\+91|91)/, "").replace(/[\s\-]/g, "");
      fields.push("phone = ?");
      params.push(cleanPhone || phone.trim());
    }

    if (address && address.trim()) {
      fields.push("address = ?");
      params.push(address.trim());
    }

    if (fields.length > 0) {
      params.push(userId);
      await pool.execute(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, params);
    }
  } catch (err) {
    console.error("Sync user data error:", err.message);
  }
}
