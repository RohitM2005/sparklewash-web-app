import pool from "./config/db.js";

async function run() {
  try {
    console.log("Adding manual columns to users table...");
    await pool.execute(`
      ALTER TABLE users 
      ADD COLUMN manual_total_washes INT DEFAULT NULL,
      ADD COLUMN manual_this_month INT DEFAULT NULL,
      ADD COLUMN manual_recent_wash DATE DEFAULT NULL,
      ADD COLUMN manual_active_vehicles INT DEFAULT NULL,
      ADD COLUMN manual_days_left INT DEFAULT NULL,
      ADD COLUMN manual_active_subscriptions INT DEFAULT NULL
    `);
    console.log("Columns added successfully.");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist.");
    } else {
      console.error(e);
    }
  }

  try {
    console.log("Dropping reset_code and reset_expires...");
    await pool.execute(`ALTER TABLE users DROP COLUMN reset_code, DROP COLUMN reset_expires`);
    console.log("Dropped successfully.");
  } catch(e) {
    console.error(e);
  }

  process.exit(0);
}
run();
