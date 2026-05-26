import pool from "../config/db.js";

async function run() {
  try {
    console.log("Dropping columns reset_code and reset_expires from users table...");
    await pool.query("ALTER TABLE users DROP COLUMN reset_code, DROP COLUMN reset_expires");
    console.log("✅ Columns dropped successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to drop columns:", err.message);
    process.exit(1);
  }
}

run();
