// One-time script to re-hash the admin password in the database.
// Run with: node scripts/fix-admin-password.js

import bcrypt from "bcryptjs";
import pool from "../config/db.js";

const ADMIN_EMAIL = "ajayparale9@gmail.com";
const PLAIN_PASSWORD = "Admin@123";

const fixAdminPassword = async () => {
  try {
    // 1. Check current stored password
    const [rows] = await pool.execute(
      "SELECT id, email, password, role FROM users WHERE email = ?",
      [ADMIN_EMAIL]
    );

    if (!rows.length) {
      console.error("❌ No user found with email:", ADMIN_EMAIL);
      process.exit(1);
    }

    const user = rows[0];
    console.log("📋 Found user:", {
      id: user.id,
      email: user.email,
      role: user.role,
      passwordPrefix: user.password?.substring(0, 10),
      isBcryptHash: user.password?.startsWith("$2"),
    });

    // 2. If already hashed, verify it works
    if (user.password?.startsWith("$2")) {
      const alreadyMatch = await bcrypt.compare(PLAIN_PASSWORD, user.password);
      if (alreadyMatch) {
        console.log("✅ Password is already correctly hashed and matches. No fix needed.");
        process.exit(0);
      }
      console.log("⚠️  Password is hashed but does NOT match. Re-hashing...");
    } else {
      console.log("⚠️  Password is stored as plain text. Hashing now...");
    }

    // 3. Hash the password
    const hashed = await bcrypt.hash(PLAIN_PASSWORD, 10);

    // 4. Update in DB
    const [result] = await pool.execute(
      "UPDATE users SET password = ? WHERE email = ?",
      [hashed, ADMIN_EMAIL]
    );

    if (result.affectedRows === 0) {
      console.error("❌ Update failed — no rows affected");
      process.exit(1);
    }

    // 5. Verify the fix
    const verifyMatch = await bcrypt.compare(PLAIN_PASSWORD, hashed);
    console.log("✅ Admin password updated successfully!");
    console.log("🔑 Verification:", verifyMatch ? "PASS" : "FAIL");

    // 6. Ensure role is 'admin'
    if (user.role !== "admin") {
      await pool.execute(
        "UPDATE users SET role = 'admin' WHERE email = ?",
        [ADMIN_EMAIL]
      );
      console.log("👑 Role updated to 'admin'");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
};

fixAdminPassword();
