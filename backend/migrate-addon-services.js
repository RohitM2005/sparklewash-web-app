// migrate-addon-services.js
// Run with: node migrate-addon-services.js
import pool from "./config/db.js";

async function run() {
  try {
    console.log("Creating addon_services table...");
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS addon_services (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        vehicle_id INT,
        service_type VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        service_date DATE,
        scheduled_date DATE,
        status ENUM('scheduled','upcoming','pending_payment','paid','cancelled','completed') DEFAULT 'scheduled',
        notes TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
    console.log("✅ addon_services table created successfully.");
  } catch (e) {
    if (e.code === "ER_TABLE_EXISTS_ERROR" || e.message.includes("already exists")) {
      console.log("✅ Table already exists.");
    } else {
      console.error("❌ Error:", e.message);
    }
  }
  process.exit(0);
}
run();
